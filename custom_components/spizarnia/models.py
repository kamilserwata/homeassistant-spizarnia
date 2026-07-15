"""Data models for the Spiżarnia integration.

Plain dataclasses with (de)serialization helpers. All ids are ``uuid4().hex``,
all timestamps are ISO 8601 UTC, all dates (no time) are ``YYYY-MM-DD``.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import UTC, datetime
from uuid import uuid4

from .const import (
    DEFAULT_CATEGORY,
    DEFAULT_UNIT,
    PRECISION_DAY,
    SOURCE_USER,
)


def new_id() -> str:
    """Return a fresh hex uuid4 id."""
    return uuid4().hex


def utcnow_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(UTC).isoformat()


@dataclass
class Room:
    """A physical room holding shelves."""

    name: str
    id: str = field(default_factory=new_id)
    icon: str = "mdi:cupboard"
    order: int = 0
    created_at: str = field(default_factory=utcnow_iso)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> Room:
        return cls(
            id=data.get("id") or new_id(),
            name=data["name"],
            icon=data.get("icon", "mdi:cupboard"),
            order=int(data.get("order", 0)),
            created_at=data.get("created_at") or utcnow_iso(),
        )


@dataclass
class Shelf:
    """A shelf within a room."""

    room_id: str
    name: str
    id: str = field(default_factory=new_id)
    order: int = 0
    notes: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> Shelf:
        return cls(
            id=data.get("id") or new_id(),
            room_id=data["room_id"],
            name=data["name"],
            order=int(data.get("order", 0)),
            notes=data.get("notes", ""),
        )


@dataclass
class ProductDefinition:
    """A catalog entry describing a product (not a physical batch)."""

    name: str
    category: str = DEFAULT_CATEGORY
    id: str = field(default_factory=new_id)
    emoji: str = ""
    image: str | None = None
    default_unit: str = DEFAULT_UNIT
    barcodes: list[str] = field(default_factory=list)
    default_shelf_life_days: int | None = None
    min_stock: float | None = None
    notes: str = ""
    source: str = SOURCE_USER
    created_at: str = field(default_factory=utcnow_iso)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> ProductDefinition:
        return cls(
            id=data.get("id") or new_id(),
            name=data["name"],
            category=data.get("category", DEFAULT_CATEGORY),
            emoji=data.get("emoji", ""),
            image=data.get("image"),
            default_unit=data.get("default_unit", DEFAULT_UNIT),
            barcodes=list(data.get("barcodes", [])),
            default_shelf_life_days=data.get("default_shelf_life_days"),
            min_stock=data.get("min_stock"),
            notes=data.get("notes", ""),
            source=data.get("source", SOURCE_USER),
            created_at=data.get("created_at") or utcnow_iso(),
        )


@dataclass
class Item:
    """A physical batch of a product on a shelf."""

    product_id: str
    shelf_id: str
    quantity: float
    unit: str
    id: str = field(default_factory=new_id)
    best_before: str | None = None
    best_before_precision: str = PRECISION_DAY
    production_date: str | None = None
    opened: bool = False
    notes: str = ""
    added_at: str = field(default_factory=utcnow_iso)
    added_by: str | None = None
    notified_expiring: bool = False
    notified_expired: bool = False

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> Item:
        return cls(
            id=data.get("id") or new_id(),
            product_id=data["product_id"],
            shelf_id=data["shelf_id"],
            quantity=float(data["quantity"]),
            unit=data.get("unit", DEFAULT_UNIT),
            best_before=data.get("best_before"),
            best_before_precision=data.get("best_before_precision", PRECISION_DAY),
            production_date=data.get("production_date"),
            opened=bool(data.get("opened", False)),
            notes=data.get("notes", ""),
            added_at=data.get("added_at") or utcnow_iso(),
            added_by=data.get("added_by"),
            notified_expiring=bool(data.get("notified_expiring", False)),
            notified_expired=bool(data.get("notified_expired", False)),
        )


@dataclass
class HistoryEntry:
    """An append-only record of a mutation, with snapshotted labels."""

    type: str
    product_id: str
    product_name: str
    id: str = field(default_factory=new_id)
    ts: str = field(default_factory=utcnow_iso)
    item_id: str | None = None
    quantity_delta: float | None = None
    unit: str | None = None
    shelf_id: str | None = None
    shelf_path: str | None = None
    user_id: str | None = None
    user_name: str | None = None
    details: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> HistoryEntry:
        return cls(
            id=data.get("id") or new_id(),
            ts=data.get("ts") or utcnow_iso(),
            type=data["type"],
            product_id=data.get("product_id", ""),
            product_name=data.get("product_name", ""),
            item_id=data.get("item_id"),
            quantity_delta=data.get("quantity_delta"),
            unit=data.get("unit"),
            shelf_id=data.get("shelf_id"),
            shelf_path=data.get("shelf_path"),
            user_id=data.get("user_id"),
            user_name=data.get("user_name"),
            details=dict(data.get("details", {})),
        )
