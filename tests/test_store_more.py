"""Additional StoreManager tests to cover edge paths (load, listeners, filters)."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from custom_components.spizarnia.store import (
    ConflictError,
    NotFoundError,
    StoreManager,
)
from tests.conftest import FakeStore


def _future(days: int) -> str:
    return (datetime.now(timezone.utc).date() + timedelta(days=days)).isoformat()


def _rsp(manager):
    room = manager.create_room("R")
    shelf = manager.create_shelf(room.id, "S")
    product = manager.create_product(name="P", category="other")
    return room, shelf, product


# ------------------------------------------------------------------ load/save
def test_async_load_roundtrip(manager):
    manager.create_room("Piwnica")
    saved = manager._data_to_save()
    hist = manager._history_to_save()

    mgr2 = StoreManager.__new__(StoreManager)
    mgr2.expiring_soon_days = 30
    mgr2.history_retention_days = 400
    mgr2._data_store = FakeStore()
    mgr2._history_store = FakeStore()
    mgr2._data_store.data = saved
    mgr2._history_store.data = hist
    mgr2._listeners = []
    asyncio.run(mgr2.async_load())
    assert any(r.name == "Piwnica" for r in mgr2.rooms.values())
    assert not mgr2.is_empty()


def test_async_save_now(manager):
    manager.create_room("R")
    asyncio.run(manager.async_save_now())
    assert manager._data_store.data is not None
    assert manager._history_store.data is not None


# ------------------------------------------------------------------ listeners
def test_listener_notify_and_remove(manager):
    seen: list[str] = []
    remove = manager.add_listener(seen.append)
    manager.create_room("R")
    assert "rooms" in seen
    remove()
    seen.clear()
    manager.create_room("R2")
    assert seen == []


def test_listener_error_does_not_break(manager):
    def bad(_c: str) -> None:
        raise RuntimeError("boom")

    manager.add_listener(bad)
    room = manager.create_room("R")
    assert room.id in manager.rooms


# ------------------------------------------------------------------ shelves
def test_shelf_update_and_reorder(manager):
    room = manager.create_room("R")
    a = manager.create_shelf(room.id, "A")
    b = manager.create_shelf(room.id, "B")
    manager.update_shelf(a.id, name="A2", notes="hi")
    assert manager.shelves[a.id].name == "A2"
    assert manager.shelves[a.id].notes == "hi"
    manager.reorder_shelves([b.id, a.id])
    assert [s.id for s in manager.list_shelves(room.id)] == [b.id, a.id]


def test_shelf_create_bad_room(manager):
    with pytest.raises(NotFoundError):
        manager.create_shelf("nope", "S")


def test_shelf_move_between_rooms(manager):
    r1 = manager.create_room("R1")
    r2 = manager.create_room("R2")
    shelf = manager.create_shelf(r1.id, "S")
    manager.update_shelf(shelf.id, room_id=r2.id)
    assert manager.shelves[shelf.id].room_id == r2.id
    with pytest.raises(NotFoundError):
        manager.update_shelf(shelf.id, room_id="nope")


# ------------------------------------------------------------------ products
def test_product_update_fields_and_barcode_guard(manager):
    p = manager.create_product(name="P", category="other")
    manager.update_product(
        p.id, name="P2", emoji="🍅", min_stock=3, default_shelf_life_days=100
    )
    assert manager.products[p.id].name == "P2"
    assert manager.products[p.id].emoji == "🍅"
    other = manager.create_product(name="Q", category="other", barcodes=["111"])
    with pytest.raises(ConflictError):
        manager.update_product(p.id, barcodes=["111"])
    manager.update_product(other.id, barcodes=["111", "222"])
    assert manager.products[other.id].barcodes == ["111", "222"]


def test_missing_entities_raise(manager):
    with pytest.raises(NotFoundError):
        manager.update_product("nope", name="x")
    with pytest.raises(NotFoundError):
        manager.delete_product("nope")
    with pytest.raises(NotFoundError):
        manager.consume("nope", 1)
    with pytest.raises(NotFoundError):
        manager.move_item("nope", "x")
    with pytest.raises(NotFoundError):
        manager.set_opened("nope", True)
    with pytest.raises(NotFoundError):
        manager.delete_item("nope")
    with pytest.raises(NotFoundError):
        manager.consume_fefo("nope", 1)
    with pytest.raises(NotFoundError):
        manager.update_item("nope", quantity=1)


# ------------------------------------------------------------------ items
def test_add_item_validation(manager):
    _, shelf, product = _rsp(manager)
    with pytest.raises(ValueError):
        manager.add_item(
            product_id=product.id, shelf_id=shelf.id, quantity=0, unit="szt"
        )
    with pytest.raises(NotFoundError):
        manager.add_item(
            product_id="nope", shelf_id=shelf.id, quantity=1, unit="szt"
        )
    with pytest.raises(NotFoundError):
        manager.add_item(
            product_id=product.id, shelf_id="nope", quantity=1, unit="szt"
        )


def test_update_item_fields_and_adjust_history(manager):
    _, shelf, product = _rsp(manager)
    item = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=5, unit="szt"
    )
    manager.update_item(
        item.id,
        unit="słoik",
        notes="n",
        opened=True,
        best_before="2028",
        best_before_precision="year",
    )
    updated = manager.items[item.id]
    assert updated.unit == "słoik"
    assert updated.opened is True
    assert updated.best_before == "2028-12-31"
    manager.update_item(item.id, quantity=8)
    adjusts = [e for e in manager.history if e.type == "adjust"]
    assert adjusts and adjusts[-1].quantity_delta == 3


def test_delete_item_with_reason(manager):
    _, shelf, product = _rsp(manager)
    item = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt"
    )
    manager.delete_item(item.id, reason="expired")
    entry = [e for e in manager.history if e.type == "delete"][-1]
    assert entry.details.get("reason") == "expired"


def test_list_items_room_filter_and_shelf_path(manager):
    room, shelf, product = _rsp(manager)
    manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt"
    )
    assert len(manager.list_items(room_id=room.id)) == 1
    assert len(manager.list_items(room_id="other")) == 0
    assert manager.shelf_path(shelf.id) == "R / S"
    assert manager.shelf_path(None) is None
    assert manager.shelf_path("nope") is None


def test_consume_fefo_cascade_overflow(manager):
    _, shelf, product = _rsp(manager)
    manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=2, unit="szt",
        best_before=_future(10),
    )
    manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=2, unit="szt",
        best_before=_future(100),
    )
    ops = manager.consume_fefo(product.id, 3)
    assert sum(o["taken"] for o in ops) == 3
    assert manager.total_quantity(product.id) == 1


# ------------------------------------------------------------------ history / stats
def test_history_filters(manager):
    room, shelf, product = _rsp(manager)
    p2 = manager.create_product(name="P2", category="other")
    manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt"
    )
    manager.add_item(product_id=p2.id, shelf_id=shelf.id, quantity=1, unit="szt")
    by_type, _ = manager.list_history(type="add")
    assert all(e.type == "add" for e in by_type)
    by_product, _ = manager.list_history(product_id=product.id)
    assert all(e.product_id == product.id for e in by_product)
    by_room, _ = manager.list_history(room_id=room.id)
    assert len(by_room) >= 2
    empty, _ = manager.list_history(room_id="other")
    assert empty == []


def test_sort_items_status_order(manager):
    _, shelf, product = _rsp(manager)
    ok = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt",
        best_before=_future(400),
    )
    expired = manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=1, unit="szt",
        best_before=_future(-5),
    )
    ordered = manager.sort_items(manager.list_items(shelf_id=shelf.id))
    assert ordered[0].id == expired.id
    assert ordered[-1].id == ok.id


def test_stats_by_room_and_category(manager):
    room, shelf, product = _rsp(manager)
    manager.add_item(
        product_id=product.id, shelf_id=shelf.id, quantity=2, unit="szt"
    )
    stats = manager.stats()
    assert stats["by_room"].get(room.id) == 1
    assert stats["by_category"].get("other") == 1
    assert stats["total_quantity"] == 2
