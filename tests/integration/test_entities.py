"""Sensors, services and scheduler behaviour."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from custom_components.spizarnia.const import (
    DOMAIN,
    EVENT_ITEM_EXPIRED,
)


def _future(days: int) -> str:
    return (datetime.now(timezone.utc).date() + timedelta(days=days)).isoformat()


async def test_sensors_reflect_state(hass, init_integration):
    manager = hass.data[DOMAIN]["manager"]
    shelf = next(iter(manager.shelves.values()))
    product = next(iter(manager.products.values()))
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(-2),
    )
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(400),
    )
    await hass.async_block_till_done()

    expired = hass.states.get("sensor.spizarnia_expired")
    total = hass.states.get("sensor.spizarnia_items")
    assert expired is not None
    assert int(expired.state) == 1
    assert int(total.state) == 2


async def test_add_and_consume_services(hass, init_integration):
    manager = hass.data[DOMAIN]["manager"]
    product = next(iter(manager.products.values()))

    await hass.services.async_call(
        DOMAIN,
        "add_item",
        {"product": product.name, "quantity": 4},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert manager.total_quantity(product.id) == 4

    await hass.services.async_call(
        DOMAIN,
        "consume",
        {"product": product.name, "quantity": 1},
        blocking=True,
    )
    await hass.async_block_till_done()
    assert manager.total_quantity(product.id) == 3


async def test_scheduler_fires_expired_event_once(hass, init_integration):
    manager = hass.data[DOMAIN]["manager"]
    scheduler = hass.data[DOMAIN]["scheduler"]
    shelf = next(iter(manager.shelves.values()))
    product = next(iter(manager.products.values()))
    manager.add_item(
        product_id=product.id,
        shelf_id=shelf.id,
        quantity=1,
        unit="szt",
        best_before=_future(-1),
    )

    events = []
    hass.bus.async_listen(EVENT_ITEM_EXPIRED, lambda e: events.append(e))

    await scheduler.async_tick()
    await hass.async_block_till_done()
    assert len(events) == 1

    # Running the tick again does not re-fire (notified flag).
    await scheduler.async_tick()
    await hass.async_block_till_done()
    assert len(events) == 1
