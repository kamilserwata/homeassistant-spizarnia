"""Home Assistant services for Spiżarnia."""

from __future__ import annotations

import voluptuous as vol
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import DOMAIN
from .models import ProductDefinition
from .store import StoreManager

SERVICE_ADD_ITEM = "add_item"
SERVICE_CONSUME = "consume"
SERVICE_MOVE_ITEM = "move_item"

ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("product"): cv.string,
        vol.Required("quantity"): vol.Coerce(float),
        vol.Optional("unit"): cv.string,
        vol.Optional("best_before"): cv.string,
        vol.Optional("best_before_precision", default="day"): cv.string,
        vol.Optional("shelf_id"): cv.string,
    }
)

CONSUME_SCHEMA = vol.Schema(
    {
        vol.Required("product"): cv.string,
        vol.Required("quantity"): vol.Coerce(float),
    }
)

MOVE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("item_id"): cv.string,
        vol.Required("shelf_id"): cv.string,
    }
)


def _manager(hass: HomeAssistant) -> StoreManager:
    manager = hass.data.get(DOMAIN, {}).get("manager")
    if manager is None:
        raise ServiceValidationError("Spiżarnia is not loaded")
    return manager


def _resolve_product(manager: StoreManager, needle: str) -> ProductDefinition:
    """Resolve a product by id, barcode, exact name or unambiguous prefix."""
    if needle in manager.products:
        return manager.products[needle]
    by_code = manager.find_by_barcode(needle)
    if by_code:
        return by_code
    low = needle.strip().lower()
    exact = [p for p in manager.products.values() if p.name.lower() == low]
    if len(exact) == 1:
        return exact[0]
    prefix = [p for p in manager.products.values() if p.name.lower().startswith(low)]
    if len(prefix) == 1:
        return prefix[0]
    if not prefix:
        raise ServiceValidationError(f"No product matches '{needle}'")
    names = ", ".join(sorted(p.name for p in prefix)[:8])
    raise ServiceValidationError(f"'{needle}' is ambiguous: {names}")


def _last_shelf_id(manager: StoreManager) -> str | None:
    """The most recently used shelf, else the first available shelf."""
    for entry in sorted(manager.history, key=lambda e: e.ts, reverse=True):
        if entry.shelf_id and entry.shelf_id in manager.shelves:
            return entry.shelf_id
    shelves = manager.list_shelves()
    return shelves[0].id if shelves else None


def async_setup_services(hass: HomeAssistant) -> None:
    """Register Spiżarnia services."""

    async def _add_item(call: ServiceCall) -> ServiceResponse:
        manager = _manager(hass)
        product = _resolve_product(manager, call.data["product"])
        shelf_id = call.data.get("shelf_id") or _last_shelf_id(manager)
        if not shelf_id:
            raise ServiceValidationError("No shelf available; create one first")
        item = manager.add_item(
            product_id=product.id,
            shelf_id=shelf_id,
            quantity=call.data["quantity"],
            unit=call.data.get("unit"),
            best_before=call.data.get("best_before"),
            best_before_precision=call.data.get("best_before_precision", "day"),
            user_id=call.context.user_id,
        )
        _fire_added(hass, manager, item)
        return {"item_id": item.id}

    async def _consume(call: ServiceCall) -> ServiceResponse:
        manager = _manager(hass)
        product = _resolve_product(manager, call.data["product"])
        before = manager.total_quantity(product.id)
        operations = manager.consume_fefo(
            product.id, call.data["quantity"], user_id=call.context.user_id
        )
        _fire_consumed(hass, manager, product, call.data["quantity"])
        _maybe_fire_low_stock(hass, manager, product, before)
        return {"operations": operations}

    async def _move_item(call: ServiceCall) -> None:
        manager = _manager(hass)
        manager.move_item(
            call.data["item_id"],
            call.data["shelf_id"],
            user_id=call.context.user_id,
        )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ITEM,
        _add_item,
        schema=ADD_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_CONSUME,
        _consume,
        schema=CONSUME_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_MOVE_ITEM, _move_item, schema=MOVE_ITEM_SCHEMA
    )


def async_unload_services(hass: HomeAssistant) -> None:
    for service in (SERVICE_ADD_ITEM, SERVICE_CONSUME, SERVICE_MOVE_ITEM):
        if hass.services.has_service(DOMAIN, service):
            hass.services.async_remove(DOMAIN, service)


# --------------------------------------------------------------------- events
def _room_shelf(manager: StoreManager, shelf_id: str | None):
    shelf = manager.shelves.get(shelf_id) if shelf_id else None
    room = manager.rooms.get(shelf.room_id) if shelf else None
    return (room.name if room else "", shelf.name if shelf else "")


def _fire_added(hass: HomeAssistant, manager: StoreManager, item) -> None:
    from .const import EVENT_ITEM_ADDED

    product = manager.products.get(item.product_id)
    room, shelf = _room_shelf(manager, item.shelf_id)
    hass.bus.async_fire(
        EVENT_ITEM_ADDED,
        {
            "item_id": item.id,
            "product_id": item.product_id,
            "product_name": product.name if product else "",
            "quantity": item.quantity,
            "unit": item.unit,
            "room": room,
            "shelf": shelf,
            "user_id": item.added_by,
        },
    )


def _fire_consumed(hass, manager, product, quantity) -> None:
    from .const import EVENT_ITEM_CONSUMED

    hass.bus.async_fire(
        EVENT_ITEM_CONSUMED,
        {
            "product_id": product.id,
            "product_name": product.name,
            "quantity": quantity,
            "unit": product.default_unit,
            "remaining_total": manager.total_quantity(product.id),
            "user_id": None,
        },
    )


def _maybe_fire_low_stock(hass, manager, product, before_total) -> None:
    from .const import EVENT_LOW_STOCK

    if product.min_stock is None:
        return
    after = manager.total_quantity(product.id)
    if before_total >= product.min_stock > after:
        hass.bus.async_fire(
            EVENT_LOW_STOCK,
            {
                "product_id": product.id,
                "product_name": product.name,
                "total": after,
                "min_stock": product.min_stock,
                "unit": product.default_unit,
            },
        )
