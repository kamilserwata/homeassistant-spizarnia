"""Tests for StoreManager: CRUD, cascades, FEFO, statuses, history."""

from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

import pytest

from custom_components.spizarnia.const import (
    STATUS_EXPIRED,
    STATUS_EXPIRING_SOON,
    STATUS_NO_DATE,
    STATUS_OK,
)
from custom_components.spizarnia.models import Item
from custom_components.spizarnia.store import (
    ConflictError,
    NotFoundError,
    compute_status,
    normalize_best_before,
)


def _future(days: int) -> str:
    return (datetime.now(timezone.utc).date() + timedelta(days=days)).isoformat()


# ------------------------------------------------------------------ rooms
def test_room_crud(manager):
    room = manager.create_room("Piwnica", "mdi:home")
    assert room.id in manager.rooms
    assert manager.list_rooms()[0].name == "Piwnica"

    manager.update_room(room.id, name="Garaż")
    assert manager.rooms[room.id].name == "Garaż"

    with pytest.raises(NotFoundError):
        manager.update_room("nope", name="x")

    manager.delete_room(room.id)
    assert room.id not in manager.rooms


def test_room_reorder(manager):
    a = manager.create_room("A")
    b = manager.create_room("B")
    manager.reorder_rooms([b.id, a.id])
    order = [r.id for r in manager.list_rooms()]
    assert order == [b.id, a.id]


# ------------------------------------------------------------------ shelves
def test_shelf_cascade_delete(manager):
    room = manager.create_room("Piwnica")
    shelf = manager.create_shelf(room.id, "Górna")
    product = manager.create_product(name="Dżem", category="preserves_sweet")
    manager.add_item(product_id=product.id, shelf_id=shelf.id, quantity=3, unit="słoik")

    counts = manager.delete_shelf(shelf.id, dry_run=True)
    assert counts["affected_items"] == 1
    assert shelf.id in manager.shelves  # dry run does not delete

    manager.delete_shelf(shelf.id)
    assert shelf.id not in manager.shelves
    assert not manager.items


def test_room_cascade_delete(manager):
    room = manager.create_room("Piwnica")
    shelf = manager.create_shelf(room.id, "Górna")
    product = manager.create_product(name="Dżem", category="preserves_sweet")
    manager.add_item(product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt")

    counts = manager.delete_room(room.id, dry_run=True)
    assert counts == {"affected_shelves": 1, "affected_items": 1}
    manager.delete_room(room.id)
    assert not manager.shelves and not manager.items


# ------------------------------------------------------------------ products
def test_product_barcode_conflict(manager):
    manager.create_product(name="A", category="other", barcodes=["123"])
    with pytest.raises(ConflictError):
        manager.create_product(name="B", category="other", barcodes=["123"])


def test_product_delete_blocked_with_items(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    manager.add_item(product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt")
    with pytest.raises(ConflictError):
        manager.delete_product(product.id)


def test_find_by_barcode(manager):
    p = manager.create_product(name="P", category="other", barcodes=["5900000000001"])
    assert manager.find_by_barcode("5900000000001").id == p.id
    assert manager.find_by_barcode("nope") is None


def test_product_search(manager):
    manager.create_product(name="Dżem truskawkowy", category="preserves_sweet")
    manager.create_product(name="Ogórki kiszone", category="preserves_savory")
    assert len(manager.list_products(query="dżem")) == 1
    assert len(manager.list_products(category="preserves_savory")) == 1


# ------------------------------------------------------------------ items
def test_consume_partial_and_full(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    item = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=5, unit="szt"
    )
    result = manager.consume(item.id, 2)
    assert result.quantity == 3
    result = manager.consume(item.id, 3)
    assert result is None
    assert item.id not in manager.items


def test_update_item_to_zero_deletes(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    item = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=2, unit="szt"
    )
    assert manager.update_item(item.id, quantity=0) is None
    assert item.id not in manager.items


def test_move_and_set_opened(manager):
    room = manager.create_room("R")
    s1 = manager.create_shelf(room.id, "S1")
    s2 = manager.create_shelf(room.id, "S2")
    product = manager.create_product(name="P", category="other")
    item = manager.add_item(
        product_id=product.id, shelf_id=s1.id, quantity=1, unit="szt"
    )
    manager.move_item(item.id, s2.id)
    assert manager.items[item.id].shelf_id == s2.id
    manager.set_opened(item.id, True)
    assert manager.items[item.id].opened is True


# ------------------------------------------------------------------ FEFO
def test_fefo_order_and_consume(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    # Three batches: fresh, oldest-date, opened.
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=2,
        unit="szt",
        best_before=_future(400),
    )
    older = manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=2,
        unit="szt",
        best_before=_future(30),
    )
    opened = manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(200),
        opened=True,
    )
    order = manager.fefo_order(product.id)
    assert order[0].id == opened.id  # opened first
    assert order[1].id == older.id  # then earliest date

    ops = manager.consume_fefo(product.id, 2)
    # First takes the whole opened batch (1), then 1 from the older batch.
    assert ops[0]["item_id"] == opened.id
    assert ops[0]["taken"] == 1
    assert ops[1]["item_id"] == older.id
    assert ops[1]["taken"] == 1


# ------------------------------------------------------------------ statuses
def test_normalize_best_before():
    assert normalize_best_before("2027-06-15", "day") == "2027-06-15"
    assert normalize_best_before("2027-06", "month") == "2027-06-30"
    assert normalize_best_before("2027-02", "month") == "2027-02-28"
    assert normalize_best_before("2027", "year") == "2027-12-31"
    assert normalize_best_before("2027-06-15", "none") is None
    assert normalize_best_before(None, "day") is None


def test_compute_status():
    today = date(2026, 7, 15)
    mk = lambda bb, prec="day": Item(  # noqa: E731
        product_id="p",
        shelf_id="s",
        quantity=1,
        unit="szt",
        best_before=bb,
        best_before_precision=prec,
    )
    assert compute_status(mk("2026-07-10"), today, 30)[0] == STATUS_EXPIRED
    assert compute_status(mk("2026-07-30"), today, 30)[0] == STATUS_EXPIRING_SOON
    assert compute_status(mk("2027-07-30"), today, 30)[0] == STATUS_OK
    assert compute_status(mk(None, "none"), today, 30)[0] == STATUS_NO_DATE
    status, days = compute_status(mk("2026-07-20"), today, 30)
    assert status == STATUS_EXPIRING_SOON and days == 5


def test_status_filter_list(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(-1),
    )
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(400),
    )
    assert len(manager.list_items(status=STATUS_EXPIRED)) == 1
    assert len(manager.list_items(status=STATUS_OK)) == 1


# ------------------------------------------------------------------ history
def test_history_recorded_and_prune(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    item = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=5, unit="szt"
    )
    manager.consume(item.id, 1)
    entries, total = manager.list_history()
    types = {e.type for e in entries}
    assert "add" in types and "consume" in types
    assert total >= 2

    # Prune drops entries older than retention.
    manager.history_retention_days = 1
    old = manager.history[0]
    old.ts = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    manager.prune_history()
    assert all(
        (datetime.now(timezone.utc) - datetime.fromisoformat(e.ts)).days <= 1
        for e in manager.history
    )


# ------------------------------------------------------------------ seeding
def test_seed_catalog(manager):
    seed = [
        {
            "name_pl": "Dżem",
            "name_en": "Jam",
            "category": "preserves_sweet",
            "emoji": "🍓",
            "default_unit": "słoik",
            "default_shelf_life_days": 365,
        }
    ]
    assert manager.is_empty()
    count = manager.seed_catalog(seed)
    assert count == 1
    assert not manager.is_empty()
    product = next(iter(manager.products.values()))
    assert product.source == "predefined"


# ------------------------------------------------------------------ stats
def test_stats_and_low_stock(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other", min_stock=5)
    manager.add_item(product_id=product.id, shelf_id=shelf.id, quantity=2, unit="szt")
    stats = manager.stats()
    assert stats["total_items"] == 1
    assert stats["low_stock"] == 1  # below min_stock of 5


def test_serialization_roundtrip(manager):
    """The saved dict reloads into equivalent in-memory objects."""
    from custom_components.spizarnia.models import (
        Item,
        ProductDefinition,
        Room,
        Shelf,
    )

    room = manager.create_room("Piwnica")
    shelf = manager.create_shelf(room.id, "Górna")
    product = manager.create_product(name="Dżem", category="preserves_sweet")
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=2,
        unit="słoik",
        best_before="2027-06",
        best_before_precision="month",
    )
    saved = manager._data_to_save()

    rooms = {r["id"]: Room.from_dict(r) for r in saved["rooms"]}
    shelves = {s["id"]: Shelf.from_dict(s) for s in saved["shelves"]}
    products = {p["id"]: ProductDefinition.from_dict(p) for p in saved["products"]}
    items = {i["id"]: Item.from_dict(i) for i in saved["items"]}

    assert rooms[room.id].name == "Piwnica"
    assert shelves[shelf.id].room_id == room.id
    assert products[product.id].category == "preserves_sweet"
    # Month precision normalized to the last day of the month.
    assert next(iter(items.values())).best_before == "2027-06-30"
