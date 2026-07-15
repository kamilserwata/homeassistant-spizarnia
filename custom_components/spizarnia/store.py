"""Storage layer for the Spiżarnia integration.

``StoreManager`` is the single source of truth. All data mutations go through it.
It keeps data in memory (dicts keyed by id) and persists to two HA stores
(debounced), maintains history, computes freshness statuses / FEFO ordering and
notifies listeners (dispatcher + WS subscribers) after every mutation.
"""

from __future__ import annotations

import calendar
import logging
from collections.abc import Callable, Iterable
from datetime import UTC, date, datetime

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DEFAULT_CATEGORY,
    HISTORY_ADD,
    HISTORY_ADJUST,
    HISTORY_CONSUME,
    HISTORY_DELETE,
    HISTORY_MAX_DAYS,
    HISTORY_MAX_ENTRIES,
    HISTORY_MOVE,
    HISTORY_OPEN,
    PRECISION_NONE,
    SOURCE_PREDEFINED,
    STATUS_EXPIRED,
    STATUS_EXPIRING_SOON,
    STATUS_NO_DATE,
    STATUS_OK,
    STORAGE_KEY_DATA,
    STORAGE_KEY_HISTORY,
    STORAGE_VERSION,
)
from .models import (
    HistoryEntry,
    Item,
    ProductDefinition,
    Room,
    Shelf,
)

_LOGGER = logging.getLogger(__name__)

SAVE_DELAY = 1.0


class ConflictError(Exception):
    """Raised when a mutation conflicts with existing data (e.g. barcode dup)."""

    def __init__(self, message: str, details: dict | None = None) -> None:
        super().__init__(message)
        self.details = details or {}


class NotFoundError(Exception):
    """Raised when a referenced entity does not exist."""


def _last_day_of_month(year: int, month: int) -> int:
    return calendar.monthrange(year, month)[1]


def normalize_best_before(value: str | None, precision: str) -> str | None:
    """Normalize a best-before date to a full ``YYYY-MM-DD`` per precision.

    - ``day``   -> unchanged full date
    - ``month`` -> last day of that month
    - ``year``  -> 31 December of that year
    - ``none``  -> ``None`` (indefinite)
    """
    if precision == PRECISION_NONE or not value:
        return None
    try:
        parts = value.split("-")
        year = int(parts[0])
        month = int(parts[1]) if len(parts) > 1 else 12
        day = int(parts[2]) if len(parts) > 2 else _last_day_of_month(year, month)
    except (ValueError, IndexError):
        return None
    if precision == "year":
        month, day = 12, 31
    elif precision == "month":
        day = _last_day_of_month(year, month)
    return f"{year:04d}-{month:02d}-{day:02d}"


def compute_status(
    item: Item, today: date, expiring_soon_days: int
) -> tuple[str, int | None]:
    """Return ``(status, days_left)`` for an item.

    ``days_left`` is ``None`` for items without an effective date.
    """
    if item.best_before_precision == PRECISION_NONE or not item.best_before:
        return STATUS_NO_DATE, None
    try:
        bb = date.fromisoformat(item.best_before)
    except ValueError:
        return STATUS_NO_DATE, None
    days_left = (bb - today).days
    if days_left < 0:
        return STATUS_EXPIRED, days_left
    if days_left <= expiring_soon_days:
        return STATUS_EXPIRING_SOON, days_left
    return STATUS_OK, days_left


# Sort weight for default list ordering: expired < expiring < ok < no_date
_STATUS_ORDER = {
    STATUS_EXPIRED: 0,
    STATUS_EXPIRING_SOON: 1,
    STATUS_OK: 2,
    STATUS_NO_DATE: 3,
}


class StoreManager:
    """In-memory domain store backed by two HA ``Store`` instances."""

    def __init__(self, hass: HomeAssistant, expiring_soon_days: int) -> None:
        self.hass = hass
        self.expiring_soon_days = expiring_soon_days
        self.history_retention_days = HISTORY_MAX_DAYS

        self._data_store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY_DATA)
        self._history_store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY_HISTORY)

        self.rooms: dict[str, Room] = {}
        self.shelves: dict[str, Shelf] = {}
        self.products: dict[str, ProductDefinition] = {}
        self.items: dict[str, Item] = {}
        self.history: list[HistoryEntry] = []

        self._listeners: list[Callable[[str], None]] = []

    # ------------------------------------------------------------------ load
    async def async_load(self) -> None:
        """Load both stores into memory."""
        data = await self._data_store.async_load() or {}
        self.rooms = {
            r["id"]: Room.from_dict(r) for r in data.get("rooms", []) if r.get("id")
        }
        self.shelves = {
            s["id"]: Shelf.from_dict(s) for s in data.get("shelves", []) if s.get("id")
        }
        self.products = {
            p["id"]: ProductDefinition.from_dict(p)
            for p in data.get("products", [])
            if p.get("id")
        }
        self.items = {
            i["id"]: Item.from_dict(i) for i in data.get("items", []) if i.get("id")
        }
        history = await self._history_store.async_load() or {}
        self.history = [HistoryEntry.from_dict(e) for e in history.get("entries", [])]

    def is_empty(self) -> bool:
        """True when no domain data exists (used to decide catalog seeding)."""
        return not (self.rooms or self.shelves or self.products or self.items)

    # --------------------------------------------------------------- persist
    def _data_to_save(self) -> dict:
        return {
            "rooms": [r.to_dict() for r in self.rooms.values()],
            "shelves": [s.to_dict() for s in self.shelves.values()],
            "products": [p.to_dict() for p in self.products.values()],
            "items": [i.to_dict() for i in self.items.values()],
        }

    def _history_to_save(self) -> dict:
        return {"entries": [e.to_dict() for e in self.history]}

    def _save_data(self) -> None:
        self._data_store.async_delay_save(self._data_to_save, SAVE_DELAY)

    def _save_history(self) -> None:
        self._history_store.async_delay_save(self._history_to_save, SAVE_DELAY)

    async def async_save_now(self) -> None:
        """Flush pending saves immediately (used at unload)."""
        await self._data_store.async_save(self._data_to_save())
        await self._history_store.async_save(self._history_to_save())

    # ------------------------------------------------------------- listeners
    def add_listener(self, cb: Callable[[str], None]) -> Callable[[], None]:
        """Register a callback invoked with the changed collection name."""
        self._listeners.append(cb)

        def _remove() -> None:
            if cb in self._listeners:
                self._listeners.remove(cb)

        return _remove

    def _notify(self, collection: str) -> None:
        for cb in list(self._listeners):
            try:
                cb(collection)
            except Exception:  # noqa: BLE001 - a listener must never break a mutation
                _LOGGER.exception("Spiżarnia listener failed for %s", collection)

    # -------------------------------------------------------------- helpers
    def _today(self) -> date:
        return datetime.now(UTC).date()

    def shelf_path(self, shelf_id: str | None) -> str | None:
        """Human-readable ``Room / Shelf`` path for a shelf id."""
        if not shelf_id:
            return None
        shelf = self.shelves.get(shelf_id)
        if not shelf:
            return None
        room = self.rooms.get(shelf.room_id)
        room_name = room.name if room else "?"
        return f"{room_name} / {shelf.name}"

    # ============================================================ ROOMS
    def list_rooms(self) -> list[Room]:
        return sorted(self.rooms.values(), key=lambda r: (r.order, r.created_at))

    def create_room(self, name: str, icon: str = "mdi:cupboard") -> Room:
        order = max((r.order for r in self.rooms.values()), default=-1) + 1
        room = Room(name=name.strip(), icon=icon, order=order)
        self.rooms[room.id] = room
        self._save_data()
        self._notify("rooms")
        return room

    def update_room(
        self, room_id: str, *, name: str | None = None, icon: str | None = None
    ) -> Room:
        room = self.rooms.get(room_id)
        if not room:
            raise NotFoundError(f"room {room_id}")
        if name is not None:
            room.name = name.strip()
        if icon is not None:
            room.icon = icon
        self._save_data()
        self._notify("rooms")
        return room

    def delete_room(self, room_id: str, dry_run: bool = False) -> dict:
        room = self.rooms.get(room_id)
        if not room:
            raise NotFoundError(f"room {room_id}")
        shelf_ids = [s.id for s in self.shelves.values() if s.room_id == room_id]
        item_ids = [i.id for i in self.items.values() if i.shelf_id in shelf_ids]
        counts = {"affected_shelves": len(shelf_ids), "affected_items": len(item_ids)}
        if dry_run:
            return counts
        for iid in item_ids:
            self.items.pop(iid, None)
        for sid in shelf_ids:
            self.shelves.pop(sid, None)
        self.rooms.pop(room_id, None)
        self._save_data()
        self._notify("items")
        self._notify("shelves")
        self._notify("rooms")
        return counts

    def reorder_rooms(self, room_ids: list[str]) -> None:
        for order, rid in enumerate(room_ids):
            if rid in self.rooms:
                self.rooms[rid].order = order
        self._save_data()
        self._notify("rooms")

    # ============================================================ SHELVES
    def list_shelves(self, room_id: str | None = None) -> list[Shelf]:
        shelves = self.shelves.values()
        if room_id:
            shelves = [s for s in shelves if s.room_id == room_id]
        return sorted(shelves, key=lambda s: (s.order, s.name))

    def create_shelf(self, room_id: str, name: str, notes: str = "") -> Shelf:
        if room_id not in self.rooms:
            raise NotFoundError(f"room {room_id}")
        order = (
            max(
                (s.order for s in self.shelves.values() if s.room_id == room_id),
                default=-1,
            )
            + 1
        )
        shelf = Shelf(room_id=room_id, name=name.strip(), order=order, notes=notes)
        self.shelves[shelf.id] = shelf
        self._save_data()
        self._notify("shelves")
        return shelf

    def update_shelf(
        self,
        shelf_id: str,
        *,
        name: str | None = None,
        notes: str | None = None,
        room_id: str | None = None,
    ) -> Shelf:
        shelf = self.shelves.get(shelf_id)
        if not shelf:
            raise NotFoundError(f"shelf {shelf_id}")
        if name is not None:
            shelf.name = name.strip()
        if notes is not None:
            shelf.notes = notes
        if room_id is not None:
            if room_id not in self.rooms:
                raise NotFoundError(f"room {room_id}")
            shelf.room_id = room_id
        self._save_data()
        self._notify("shelves")
        return shelf

    def delete_shelf(self, shelf_id: str, dry_run: bool = False) -> dict:
        shelf = self.shelves.get(shelf_id)
        if not shelf:
            raise NotFoundError(f"shelf {shelf_id}")
        item_ids = [i.id for i in self.items.values() if i.shelf_id == shelf_id]
        counts = {"affected_items": len(item_ids)}
        if dry_run:
            return counts
        for iid in item_ids:
            self.items.pop(iid, None)
        self.shelves.pop(shelf_id, None)
        self._save_data()
        self._notify("items")
        self._notify("shelves")
        return counts

    def reorder_shelves(self, shelf_ids: list[str]) -> None:
        for order, sid in enumerate(shelf_ids):
            if sid in self.shelves:
                self.shelves[sid].order = order
        self._save_data()
        self._notify("shelves")

    # ============================================================ PRODUCTS
    def list_products(
        self, query: str | None = None, category: str | None = None
    ) -> list[ProductDefinition]:
        products = list(self.products.values())
        if category:
            products = [p for p in products if p.category == category]
        if query:
            q = query.strip().lower()
            products = [p for p in products if q in p.name.lower()]
        return sorted(products, key=lambda p: p.name.lower())

    def find_by_barcode(self, code: str) -> ProductDefinition | None:
        for product in self.products.values():
            if code in product.barcodes:
                return product
        return None

    def _assert_barcodes_free(
        self, barcodes: Iterable[str], *, exclude_product: str | None = None
    ) -> None:
        for code in barcodes:
            existing = self.find_by_barcode(code)
            if existing and existing.id != exclude_product:
                raise ConflictError(
                    f"barcode {code} already assigned",
                    {
                        "barcode": code,
                        "product_id": existing.id,
                        "product_name": existing.name,
                    },
                )

    def create_product(self, **fields) -> ProductDefinition:
        barcodes = list(fields.get("barcodes", []) or [])
        self._assert_barcodes_free(barcodes)
        product = ProductDefinition(
            name=fields["name"].strip(),
            category=fields.get("category", DEFAULT_CATEGORY),
            emoji=fields.get("emoji", ""),
            image=fields.get("image"),
            default_unit=fields.get("default_unit", "szt"),
            barcodes=barcodes,
            default_shelf_life_days=fields.get("default_shelf_life_days"),
            min_stock=fields.get("min_stock"),
            notes=fields.get("notes", ""),
            source=fields.get("source", "user"),
        )
        self.products[product.id] = product
        self._save_data()
        self._notify("products")
        return product

    def update_product(self, product_id: str, **fields) -> ProductDefinition:
        product = self.products.get(product_id)
        if not product:
            raise NotFoundError(f"product {product_id}")
        if "barcodes" in fields and fields["barcodes"] is not None:
            barcodes = list(fields["barcodes"])
            self._assert_barcodes_free(barcodes, exclude_product=product_id)
            product.barcodes = barcodes
        for key in (
            "name",
            "category",
            "emoji",
            "image",
            "default_unit",
            "default_shelf_life_days",
            "min_stock",
            "notes",
        ):
            if key in fields and fields[key] is not None:
                value = fields[key]
                setattr(product, key, value.strip() if key == "name" else value)
        self._save_data()
        self._notify("products")
        return product

    def delete_product(self, product_id: str) -> None:
        product = self.products.get(product_id)
        if not product:
            raise NotFoundError(f"product {product_id}")
        if any(i.product_id == product_id for i in self.items.values()):
            raise ConflictError(
                "product has items", {"product_id": product_id, "name": product.name}
            )
        self.products.pop(product_id, None)
        self._save_data()
        self._notify("products")

    def total_quantity(self, product_id: str) -> float:
        return sum(
            i.quantity for i in self.items.values() if i.product_id == product_id
        )

    # ============================================================ ITEMS
    def list_items(
        self,
        *,
        shelf_id: str | None = None,
        room_id: str | None = None,
        product_id: str | None = None,
        status: str | None = None,
    ) -> list[Item]:
        items = list(self.items.values())
        if shelf_id:
            items = [i for i in items if i.shelf_id == shelf_id]
        if room_id:
            room_shelves = {s.id for s in self.shelves.values() if s.room_id == room_id}
            items = [i for i in items if i.shelf_id in room_shelves]
        if product_id:
            items = [i for i in items if i.product_id == product_id]
        if status:
            today = self._today()
            items = [
                i
                for i in items
                if compute_status(i, today, self.expiring_soon_days)[0] == status
            ]
        return self.sort_items(items)

    def sort_items(self, items: list[Item]) -> list[Item]:
        """Default ordering: expired -> expiring (by date) -> ok -> no_date."""
        today = self._today()

        def key(i: Item):
            status, days = compute_status(i, today, self.expiring_soon_days)
            return (
                _STATUS_ORDER.get(status, 9),
                i.best_before or "9999-99-99",
                i.added_at,
            )

        return sorted(items, key=key)

    def add_item(
        self,
        *,
        product_id: str,
        shelf_id: str,
        quantity: float,
        unit: str | None = None,
        best_before: str | None = None,
        best_before_precision: str = "day",
        production_date: str | None = None,
        opened: bool = False,
        notes: str = "",
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> Item:
        product = self.products.get(product_id)
        if not product:
            raise NotFoundError(f"product {product_id}")
        if shelf_id not in self.shelves:
            raise NotFoundError(f"shelf {shelf_id}")
        if quantity <= 0:
            raise ValueError("quantity must be > 0")
        normalized = normalize_best_before(best_before, best_before_precision)
        item = Item(
            product_id=product_id,
            shelf_id=shelf_id,
            quantity=float(quantity),
            unit=unit or product.default_unit,
            best_before=normalized,
            best_before_precision=best_before_precision,
            production_date=production_date,
            opened=opened,
            notes=notes,
            added_by=user_id,
        )
        self.items[item.id] = item
        self.add_entry(
            HistoryEntry(
                type=HISTORY_ADD,
                product_id=product_id,
                product_name=product.name,
                item_id=item.id,
                quantity_delta=float(quantity),
                unit=item.unit,
                shelf_id=shelf_id,
                shelf_path=self.shelf_path(shelf_id),
                user_id=user_id,
                user_name=user_name,
            )
        )
        self._save_data()
        self._notify("items")
        return item

    def update_item(
        self,
        item_id: str,
        user_id: str | None = None,
        user_name: str | None = None,
        **fields,
    ) -> Item:
        item = self.items.get(item_id)
        if not item:
            raise NotFoundError(f"item {item_id}")
        old_qty = item.quantity
        precision = fields.get("best_before_precision", item.best_before_precision)
        for key in (
            "shelf_id",
            "unit",
            "best_before_precision",
            "production_date",
            "opened",
            "notes",
        ):
            if key in fields and fields[key] is not None:
                setattr(item, key, fields[key])
        if "best_before" in fields:
            item.best_before = normalize_best_before(fields["best_before"], precision)
            # A changed date means the notification flags no longer apply.
            item.notified_expiring = False
            item.notified_expired = False
        if "quantity" in fields and fields["quantity"] is not None:
            new_qty = float(fields["quantity"])
            if new_qty <= 0:
                return self.delete_item(item_id, user_id=user_id, user_name=user_name)
            item.quantity = new_qty
            if new_qty != old_qty:
                product = self.products.get(item.product_id)
                self.add_entry(
                    HistoryEntry(
                        type=HISTORY_ADJUST,
                        product_id=item.product_id,
                        product_name=product.name if product else "",
                        item_id=item.id,
                        quantity_delta=new_qty - old_qty,
                        unit=item.unit,
                        shelf_id=item.shelf_id,
                        shelf_path=self.shelf_path(item.shelf_id),
                        user_id=user_id,
                        user_name=user_name,
                    )
                )
        self._save_data()
        self._notify("items")
        return item

    def consume(
        self,
        item_id: str,
        quantity: float,
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> Item | None:
        item = self.items.get(item_id)
        if not item:
            raise NotFoundError(f"item {item_id}")
        take = min(float(quantity), item.quantity)
        item.quantity -= take
        product = self.products.get(item.product_id)
        removed = item.quantity <= 1e-9
        self.add_entry(
            HistoryEntry(
                type=HISTORY_CONSUME,
                product_id=item.product_id,
                product_name=product.name if product else "",
                item_id=item.id,
                quantity_delta=-take,
                unit=item.unit,
                shelf_id=item.shelf_id,
                shelf_path=self.shelf_path(item.shelf_id),
                user_id=user_id,
                user_name=user_name,
            )
        )
        if removed:
            self.items.pop(item_id, None)
            item = None
        self._save_data()
        self._notify("items")
        return item

    def fefo_order(self, product_id: str) -> list[Item]:
        """Batches of a product ordered for consumption (first-expired-first-out).

        Sort: opened DESC, best_before ASC (nulls last), added_at ASC.
        """
        batches = [i for i in self.items.values() if i.product_id == product_id]

        def key(i: Item):
            return (
                0 if i.opened else 1,
                i.best_before or "9999-99-99",
                i.added_at,
            )

        return sorted(batches, key=key)

    def consume_fefo(
        self,
        product_id: str,
        quantity: float,
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> list[dict]:
        """Consume ``quantity`` across a product's batches following FEFO.

        Returns a list of ``{item_id, taken, remaining}`` operations.
        """
        product = self.products.get(product_id)
        if not product:
            raise NotFoundError(f"product {product_id}")
        remaining = float(quantity)
        operations: list[dict] = []
        for batch in self.fefo_order(product_id):
            if remaining <= 1e-9:
                break
            take = min(remaining, batch.quantity)
            remaining -= take
            result = self.consume(batch.id, take, user_id=user_id, user_name=user_name)
            operations.append(
                {
                    "item_id": batch.id,
                    "taken": take,
                    "remaining": result.quantity if result else 0,
                }
            )
        return operations

    def move_item(
        self,
        item_id: str,
        shelf_id: str,
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> Item:
        item = self.items.get(item_id)
        if not item:
            raise NotFoundError(f"item {item_id}")
        if shelf_id not in self.shelves:
            raise NotFoundError(f"shelf {shelf_id}")
        from_shelf = item.shelf_id
        item.shelf_id = shelf_id
        product = self.products.get(item.product_id)
        self.add_entry(
            HistoryEntry(
                type=HISTORY_MOVE,
                product_id=item.product_id,
                product_name=product.name if product else "",
                item_id=item.id,
                unit=item.unit,
                shelf_id=shelf_id,
                shelf_path=self.shelf_path(shelf_id),
                user_id=user_id,
                user_name=user_name,
                details={
                    "from_shelf": self.shelf_path(from_shelf),
                    "to_shelf": self.shelf_path(shelf_id),
                },
            )
        )
        self._save_data()
        self._notify("items")
        return item

    def set_opened(
        self,
        item_id: str,
        opened: bool,
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> Item:
        item = self.items.get(item_id)
        if not item:
            raise NotFoundError(f"item {item_id}")
        item.opened = opened
        product = self.products.get(item.product_id)
        self.add_entry(
            HistoryEntry(
                type=HISTORY_OPEN,
                product_id=item.product_id,
                product_name=product.name if product else "",
                item_id=item.id,
                unit=item.unit,
                shelf_id=item.shelf_id,
                shelf_path=self.shelf_path(item.shelf_id),
                user_id=user_id,
                user_name=user_name,
                details={"opened": opened},
            )
        )
        self._save_data()
        self._notify("items")
        return item

    def delete_item(
        self,
        item_id: str,
        reason: str | None = None,
        user_id: str | None = None,
        user_name: str | None = None,
    ) -> None:
        item = self.items.get(item_id)
        if not item:
            raise NotFoundError(f"item {item_id}")
        product = self.products.get(item.product_id)
        self.add_entry(
            HistoryEntry(
                type=HISTORY_DELETE,
                product_id=item.product_id,
                product_name=product.name if product else "",
                item_id=item.id,
                quantity_delta=-item.quantity,
                unit=item.unit,
                shelf_id=item.shelf_id,
                shelf_path=self.shelf_path(item.shelf_id),
                user_id=user_id,
                user_name=user_name,
                details={"reason": reason} if reason else {},
            )
        )
        self.items.pop(item_id, None)
        self._save_data()
        self._notify("items")

    # ============================================================ HISTORY
    def add_entry(self, entry: HistoryEntry) -> None:
        self.history.append(entry)
        self._save_history()
        self._notify("history")

    def list_history(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        type: str | None = None,
        product_id: str | None = None,
        room_id: str | None = None,
    ) -> tuple[list[HistoryEntry], int]:
        entries = sorted(self.history, key=lambda e: e.ts, reverse=True)
        if type:
            entries = [e for e in entries if e.type == type]
        if product_id:
            entries = [e for e in entries if e.product_id == product_id]
        if room_id:
            room_shelves = {s.id for s in self.shelves.values() if s.room_id == room_id}
            entries = [e for e in entries if e.shelf_id in room_shelves]
        total = len(entries)
        return entries[offset : offset + limit], total

    def prune_history(self) -> None:
        """Trim history to the retention window (count + age)."""
        entries = sorted(self.history, key=lambda e: e.ts, reverse=True)
        entries = entries[:HISTORY_MAX_ENTRIES]
        cutoff = datetime.now(UTC).timestamp() - self.history_retention_days * 86400
        kept: list[HistoryEntry] = []
        for entry in entries:
            try:
                ts = datetime.fromisoformat(entry.ts).timestamp()
            except ValueError:
                ts = cutoff + 1
            if ts >= cutoff:
                kept.append(entry)
        if len(kept) != len(self.history):
            self.history = kept
            self._save_history()
            self._notify("history")

    # ============================================================ SEED
    def seed_catalog(self, entries: list[dict]) -> int:
        """Import predefined products into an empty catalog. Returns count."""
        count = 0
        for raw in entries:
            product = ProductDefinition(
                name=raw["name_pl"],
                category=raw.get("category", DEFAULT_CATEGORY),
                emoji=raw.get("emoji", ""),
                default_unit=raw.get("default_unit", "szt"),
                default_shelf_life_days=raw.get("default_shelf_life_days"),
                source=SOURCE_PREDEFINED,
            )
            self.products[product.id] = product
            count += 1
        if count:
            self._save_data()
            self._notify("products")
        return count

    # ============================================================ STATS
    def stats(self) -> dict:
        """Aggregate counts used by the overview and sensors."""
        today = self._today()
        expired = expiring = 0
        low_stock_products: set[str] = set()
        total_quantity = 0.0
        by_room: dict[str, int] = {}
        by_category: dict[str, int] = {}
        for item in self.items.values():
            status, _ = compute_status(item, today, self.expiring_soon_days)
            if status == STATUS_EXPIRED:
                expired += 1
            elif status == STATUS_EXPIRING_SOON:
                expiring += 1
            total_quantity += item.quantity
            shelf = self.shelves.get(item.shelf_id)
            if shelf:
                by_room[shelf.room_id] = by_room.get(shelf.room_id, 0) + 1
            product = self.products.get(item.product_id)
            if product:
                by_category[product.category] = by_category.get(product.category, 0) + 1
        for product in self.products.values():
            if product.min_stock is not None:
                if self.total_quantity(product.id) < product.min_stock:
                    low_stock_products.add(product.id)
        return {
            "expired": expired,
            "expiring_soon": expiring,
            "low_stock": len(low_stock_products),
            "low_stock_product_ids": list(low_stock_products),
            "total_items": len(self.items),
            "total_quantity": round(total_quantity, 3),
            "by_room": by_room,
            "by_category": by_category,
        }
