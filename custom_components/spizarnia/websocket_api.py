"""WebSocket API commands for the Spiżarnia panel.

All commands are prefixed ``spizarnia/``. They require an authenticated user
(HA standard) but not admin. Every command validates its payload with voluptuous.
"""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC
from functools import wraps
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .store import ConflictError, NotFoundError, StoreManager, compute_status

WS_TYPE = "type"


def _manager(hass: HomeAssistant) -> StoreManager | None:
    data = hass.data.get(DOMAIN)
    if not data:
        return None
    return data.get("manager")


def _user_name(hass: HomeAssistant, user_id: str | None) -> str | None:
    if not user_id:
        return None
    user = None
    try:
        # best-effort; HA stores users in the auth provider
        for candidate in hass.auth._store._users.values():  # noqa: SLF001
            if candidate.id == user_id:
                user = candidate
                break
    except Exception:  # noqa: BLE001
        return None
    return user.name if user else None


def with_manager(func: Callable) -> Callable:
    """Decorator: resolve the store manager and translate domain errors."""

    @wraps(func)
    @callback
    def wrapper(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        manager = _manager(hass)
        if manager is None:
            connection.send_error(msg["id"], "not_ready", "Spiżarnia not loaded")
            return
        try:
            func(hass, connection, msg, manager)
        except NotFoundError as err:
            connection.send_error(msg["id"], "not_found", str(err))
        except ConflictError as err:
            connection.send_error(msg["id"], "conflict", str(err))
        except vol.Invalid as err:
            connection.send_error(msg["id"], "invalid_input", str(err))
        except ValueError as err:
            connection.send_error(msg["id"], "invalid_input", str(err))

    return wrapper


def _current_user_id(connection: websocket_api.ActiveConnection) -> str | None:
    user = getattr(connection, "user", None)
    return user.id if user else None


# ------------------------------------------------------------------ serializers
def _item_payload(manager: StoreManager, item) -> dict:
    from datetime import datetime

    today = datetime.now(UTC).date()
    status, days_left = compute_status(item, today, manager.expiring_soon_days)
    product = manager.products.get(item.product_id)
    return {
        **item.to_dict(),
        "product": product.to_dict() if product else None,
        "status": status,
        "days_left": days_left,
        "shelf_path": manager.shelf_path(item.shelf_id),
    }


def _product_payload(manager: StoreManager, product) -> dict:
    items = [i for i in manager.items.values() if i.product_id == product.id]
    return {
        **product.to_dict(),
        "total_quantity": round(sum(i.quantity for i in items), 3),
        "item_count": len(items),
    }


def _shelf_preview(manager: StoreManager, shelf_id: str) -> list[dict]:
    preview: list[dict] = []
    for item in manager.list_items(shelf_id=shelf_id):
        product = manager.products.get(item.product_id)
        if not product:
            continue
        preview.append({"emoji": product.emoji, "image": product.image})
        if len(preview) >= 8:
            break
    return preview


def _shelf_counts(manager: StoreManager, shelf_id: str) -> dict:
    from datetime import datetime

    today = datetime.now(UTC).date()
    items = [i for i in manager.items.values() if i.shelf_id == shelf_id]
    expired = expiring = 0
    for item in items:
        status, _ = compute_status(item, today, manager.expiring_soon_days)
        if status == "expired":
            expired += 1
        elif status == "expiring_soon":
            expiring += 1
    return {"item_count": len(items), "expired": expired, "expiring": expiring}


# =========================================================== SUBSCRIBE
@websocket_api.websocket_command({vol.Required(WS_TYPE): "spizarnia/subscribe"})
@callback
def ws_subscribe(hass, connection, msg):
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_ready", "Spiżarnia not loaded")
        return

    @callback
    def forward(collection: str) -> None:
        connection.send_message(
            websocket_api.event_message(
                msg["id"], {"collection": collection, "action": "changed"}
            )
        )

    remove = manager.add_listener(forward)
    connection.subscriptions[msg["id"]] = remove
    connection.send_result(msg["id"])


# =========================================================== OVERVIEW
@websocket_api.websocket_command({vol.Required(WS_TYPE): "spizarnia/overview"})
@with_manager
def ws_overview(hass, connection, msg, manager: StoreManager):
    rooms_out = []
    for room in manager.list_rooms():
        shelves = manager.list_shelves(room.id)
        expired = expiring = item_count = 0
        for shelf in shelves:
            counts = _shelf_counts(manager, shelf.id)
            item_count += counts["item_count"]
            expired += counts["expired"]
            expiring += counts["expiring"]
        rooms_out.append(
            {
                **room.to_dict(),
                "shelf_count": len(shelves),
                "item_count": item_count,
                "expired": expired,
                "expiring": expiring,
            }
        )
    recent, _ = manager.list_history(limit=5)
    connection.send_result(
        msg["id"],
        {
            "rooms": rooms_out,
            "stats": manager.stats(),
            "recent_history": [e.to_dict() for e in recent],
        },
    )


# =========================================================== ROOMS
@websocket_api.websocket_command({vol.Required(WS_TYPE): "spizarnia/rooms/list"})
@with_manager
def ws_rooms_list(hass, connection, msg, manager: StoreManager):
    connection.send_result(
        msg["id"], {"rooms": [r.to_dict() for r in manager.list_rooms()]}
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/rooms/create",
        vol.Required("name"): str,
        vol.Optional("icon"): str,
    }
)
@with_manager
def ws_rooms_create(hass, connection, msg, manager: StoreManager):
    room = manager.create_room(msg["name"], msg.get("icon", "mdi:cupboard"))
    connection.send_result(msg["id"], {"room": room.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/rooms/update",
        vol.Required("room_id"): str,
        vol.Optional("name"): str,
        vol.Optional("icon"): str,
    }
)
@with_manager
def ws_rooms_update(hass, connection, msg, manager: StoreManager):
    room = manager.update_room(
        msg["room_id"], name=msg.get("name"), icon=msg.get("icon")
    )
    connection.send_result(msg["id"], {"room": room.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/rooms/delete",
        vol.Required("room_id"): str,
        vol.Optional("dry_run", default=False): bool,
    }
)
@with_manager
def ws_rooms_delete(hass, connection, msg, manager: StoreManager):
    result = manager.delete_room(msg["room_id"], dry_run=msg["dry_run"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/rooms/reorder",
        vol.Required("room_ids"): [str],
    }
)
@with_manager
def ws_rooms_reorder(hass, connection, msg, manager: StoreManager):
    manager.reorder_rooms(msg["room_ids"])
    connection.send_result(msg["id"], {})


# =========================================================== SHELVES
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/shelves/list",
        vol.Optional("room_id"): str,
    }
)
@with_manager
def ws_shelves_list(hass, connection, msg, manager: StoreManager):
    shelves = []
    for shelf in manager.list_shelves(msg.get("room_id")):
        shelves.append(
            {
                **shelf.to_dict(),
                **_shelf_counts(manager, shelf.id),
                "preview": _shelf_preview(manager, shelf.id),
            }
        )
    connection.send_result(msg["id"], {"shelves": shelves})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/shelves/create",
        vol.Required("room_id"): str,
        vol.Required("name"): str,
        vol.Optional("notes"): str,
    }
)
@with_manager
def ws_shelves_create(hass, connection, msg, manager: StoreManager):
    shelf = manager.create_shelf(msg["room_id"], msg["name"], msg.get("notes", ""))
    connection.send_result(msg["id"], {"shelf": shelf.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/shelves/update",
        vol.Required("shelf_id"): str,
        vol.Optional("name"): str,
        vol.Optional("notes"): str,
        vol.Optional("room_id"): str,
    }
)
@with_manager
def ws_shelves_update(hass, connection, msg, manager: StoreManager):
    shelf = manager.update_shelf(
        msg["shelf_id"],
        name=msg.get("name"),
        notes=msg.get("notes"),
        room_id=msg.get("room_id"),
    )
    connection.send_result(msg["id"], {"shelf": shelf.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/shelves/delete",
        vol.Required("shelf_id"): str,
        vol.Optional("dry_run", default=False): bool,
    }
)
@with_manager
def ws_shelves_delete(hass, connection, msg, manager: StoreManager):
    result = manager.delete_shelf(msg["shelf_id"], dry_run=msg["dry_run"])
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/shelves/reorder",
        vol.Required("shelf_ids"): [str],
    }
)
@with_manager
def ws_shelves_reorder(hass, connection, msg, manager: StoreManager):
    manager.reorder_shelves(msg["shelf_ids"])
    connection.send_result(msg["id"], {})


# =========================================================== PRODUCTS
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/products/list",
        vol.Optional("query"): str,
        vol.Optional("category"): str,
        vol.Optional("limit"): int,
        vol.Optional("offset"): int,
    }
)
@with_manager
def ws_products_list(hass, connection, msg, manager: StoreManager):
    products = manager.list_products(msg.get("query"), msg.get("category"))
    offset = msg.get("offset", 0)
    limit = msg.get("limit")
    total = len(products)
    if limit is not None:
        products = products[offset : offset + limit]
    elif offset:
        products = products[offset:]
    connection.send_result(
        msg["id"],
        {
            "products": [_product_payload(manager, p) for p in products],
            "total": total,
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/products/create",
        vol.Required("name"): str,
        vol.Required("category"): str,
        vol.Optional("emoji"): str,
        vol.Optional("default_unit"): str,
        vol.Optional("barcodes"): [str],
        vol.Optional("default_shelf_life_days"): vol.Any(int, None),
        vol.Optional("min_stock"): vol.Any(float, int, None),
        vol.Optional("notes"): str,
    }
)
@with_manager
def ws_products_create(hass, connection, msg, manager: StoreManager):
    fields = {k: v for k, v in msg.items() if k not in (WS_TYPE, "id")}
    product = manager.create_product(**fields)
    connection.send_result(msg["id"], {"product": product.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/products/update",
        vol.Required("product_id"): str,
        vol.Optional("name"): str,
        vol.Optional("category"): str,
        vol.Optional("emoji"): str,
        vol.Optional("image"): vol.Any(str, None),
        vol.Optional("default_unit"): str,
        vol.Optional("barcodes"): [str],
        vol.Optional("default_shelf_life_days"): vol.Any(int, None),
        vol.Optional("min_stock"): vol.Any(float, int, None),
        vol.Optional("notes"): str,
    }
)
@with_manager
def ws_products_update(hass, connection, msg, manager: StoreManager):
    product_id = msg["product_id"]
    fields = {k: v for k, v in msg.items() if k not in (WS_TYPE, "id", "product_id")}
    product = manager.update_product(product_id, **fields)
    connection.send_result(msg["id"], {"product": product.to_dict()})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/products/delete",
        vol.Required("product_id"): str,
    }
)
@with_manager
def ws_products_delete(hass, connection, msg, manager: StoreManager):
    manager.delete_product(msg["product_id"])
    connection.send_result(msg["id"], {})


# =========================================================== ITEMS
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/list",
        vol.Optional("shelf_id"): str,
        vol.Optional("room_id"): str,
        vol.Optional("product_id"): str,
        vol.Optional("status"): str,
    }
)
@with_manager
def ws_items_list(hass, connection, msg, manager: StoreManager):
    items = manager.list_items(
        shelf_id=msg.get("shelf_id"),
        room_id=msg.get("room_id"),
        product_id=msg.get("product_id"),
        status=msg.get("status"),
    )
    connection.send_result(
        msg["id"], {"items": [_item_payload(manager, i) for i in items]}
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/add",
        vol.Required("product_id"): str,
        vol.Required("shelf_id"): str,
        vol.Required("quantity"): vol.Any(float, int),
        vol.Optional("unit"): str,
        vol.Optional("best_before"): vol.Any(str, None),
        vol.Optional("best_before_precision"): str,
        vol.Optional("production_date"): vol.Any(str, None),
        vol.Optional("opened"): bool,
        vol.Optional("notes"): str,
    }
)
@with_manager
def ws_items_add(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    item = manager.add_item(
        product_id=msg["product_id"],
        shelf_id=msg["shelf_id"],
        quantity=float(msg["quantity"]),
        unit=msg.get("unit"),
        best_before=msg.get("best_before"),
        best_before_precision=msg.get("best_before_precision", "day"),
        production_date=msg.get("production_date"),
        opened=msg.get("opened", False),
        notes=msg.get("notes", ""),
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(msg["id"], {"item": _item_payload(manager, item)})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/update",
        vol.Required("item_id"): str,
        vol.Optional("quantity"): vol.Any(float, int, None),
        vol.Optional("unit"): str,
        vol.Optional("shelf_id"): str,
        vol.Optional("best_before"): vol.Any(str, None),
        vol.Optional("best_before_precision"): str,
        vol.Optional("production_date"): vol.Any(str, None),
        vol.Optional("opened"): bool,
        vol.Optional("notes"): str,
    }
)
@with_manager
def ws_items_update(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    fields = {k: v for k, v in msg.items() if k not in (WS_TYPE, "id", "item_id")}
    item = manager.update_item(
        msg["item_id"],
        user_id=user_id,
        user_name=_user_name(hass, user_id),
        **fields,
    )
    connection.send_result(
        msg["id"], {"item": _item_payload(manager, item) if item else None}
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/consume",
        vol.Required("item_id"): str,
        vol.Required("quantity"): vol.Any(float, int),
    }
)
@with_manager
def ws_items_consume(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    item = manager.consume(
        msg["item_id"],
        float(msg["quantity"]),
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(
        msg["id"], {"item": _item_payload(manager, item) if item else None}
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/consume_fefo",
        vol.Required("product_id"): str,
        vol.Required("quantity"): vol.Any(float, int),
    }
)
@with_manager
def ws_items_consume_fefo(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    operations = manager.consume_fefo(
        msg["product_id"],
        float(msg["quantity"]),
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(msg["id"], {"operations": operations})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/move",
        vol.Required("item_id"): str,
        vol.Required("shelf_id"): str,
    }
)
@with_manager
def ws_items_move(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    item = manager.move_item(
        msg["item_id"],
        msg["shelf_id"],
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(msg["id"], {"item": _item_payload(manager, item)})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/set_opened",
        vol.Required("item_id"): str,
        vol.Required("opened"): bool,
    }
)
@with_manager
def ws_items_set_opened(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    item = manager.set_opened(
        msg["item_id"],
        msg["opened"],
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(msg["id"], {"item": _item_payload(manager, item)})


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/items/delete",
        vol.Required("item_id"): str,
        vol.Optional("reason"): str,
    }
)
@with_manager
def ws_items_delete(hass, connection, msg, manager: StoreManager):
    user_id = _current_user_id(connection)
    manager.delete_item(
        msg["item_id"],
        reason=msg.get("reason"),
        user_id=user_id,
        user_name=_user_name(hass, user_id),
    )
    connection.send_result(msg["id"], {})


# =========================================================== HISTORY
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/history/list",
        vol.Optional("limit", default=50): int,
        vol.Optional("offset", default=0): int,
        vol.Optional("type"): str,
        vol.Optional("product_id"): str,
        vol.Optional("room_id"): str,
    }
)
@with_manager
def ws_history_list(hass, connection, msg, manager: StoreManager):
    entries, total = manager.list_history(
        limit=msg["limit"],
        offset=msg["offset"],
        type=msg.get("type"),
        product_id=msg.get("product_id"),
        room_id=msg.get("room_id"),
    )
    connection.send_result(
        msg["id"], {"entries": [e.to_dict() for e in entries], "total": total}
    )


# =========================================================== SEARCH
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/search",
        vol.Required("query"): str,
    }
)
@with_manager
def ws_search(hass, connection, msg, manager: StoreManager):
    query = msg["query"].strip().lower()
    products = manager.list_products(query=query)
    matched_ids = {p.id for p in products}
    items = [
        _item_payload(manager, i)
        for i in manager.list_items()
        if i.product_id in matched_ids
    ]
    connection.send_result(
        msg["id"],
        {
            "products": [_product_payload(manager, p) for p in products],
            "items": items,
        },
    )


# =========================================================== SETTINGS
@websocket_api.websocket_command({vol.Required(WS_TYPE): "spizarnia/settings/get"})
@with_manager
def ws_settings_get(hass, connection, msg, manager: StoreManager):
    entry = hass.data[DOMAIN]["entry"]
    from .const import (
        DEFAULT_EXPIRING_SOON_DAYS,
        DEFAULT_HISTORY_RETENTION_DAYS,
        DEFAULT_OFF_ENABLED,
        DEFAULT_OFF_LOCALE,
        OPT_EXPIRING_SOON_DAYS,
        OPT_HISTORY_RETENTION_DAYS,
        OPT_OFF_ENABLED,
        OPT_OFF_LOCALE,
    )

    opts = entry.options
    connection.send_result(
        msg["id"],
        {
            "settings": {
                OPT_EXPIRING_SOON_DAYS: opts.get(
                    OPT_EXPIRING_SOON_DAYS, DEFAULT_EXPIRING_SOON_DAYS
                ),
                OPT_OFF_ENABLED: opts.get(OPT_OFF_ENABLED, DEFAULT_OFF_ENABLED),
                OPT_OFF_LOCALE: opts.get(OPT_OFF_LOCALE, DEFAULT_OFF_LOCALE),
                OPT_HISTORY_RETENTION_DAYS: opts.get(
                    OPT_HISTORY_RETENTION_DAYS, DEFAULT_HISTORY_RETENTION_DAYS
                ),
            }
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/settings/update",
        vol.Optional("expiring_soon_days"): int,
        vol.Optional("off_enabled"): bool,
        vol.Optional("off_locale"): str,
        vol.Optional("history_retention_days"): int,
    }
)
@with_manager
def ws_settings_update(hass, connection, msg, manager: StoreManager):
    entry = hass.data[DOMAIN]["entry"]
    updates = {k: v for k, v in msg.items() if k not in (WS_TYPE, "id")}
    new_options = {**entry.options, **updates}
    hass.config_entries.async_update_entry(entry, options=new_options)
    manager._notify("settings")  # noqa: SLF001
    connection.send_result(msg["id"], {})


# =========================================================== EXPORT
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/export",
        vol.Optional("format", default="json"): str,
    }
)
@with_manager
def ws_export(hass, connection, msg, manager: StoreManager):
    connection.send_result(
        msg["id"],
        {
            "format": "json",
            "data": {
                "rooms": [r.to_dict() for r in manager.rooms.values()],
                "shelves": [s.to_dict() for s in manager.shelves.values()],
                "products": [p.to_dict() for p in manager.products.values()],
                "items": [i.to_dict() for i in manager.items.values()],
            },
        },
    )


# =========================================================== BARCODE
@websocket_api.websocket_command(
    {
        vol.Required(WS_TYPE): "spizarnia/barcode/lookup",
        vol.Required("code"): str,
    }
)
@websocket_api.async_response
async def ws_barcode_lookup(hass, connection, msg):
    manager = _manager(hass)
    if manager is None:
        connection.send_error(msg["id"], "not_ready", "Spiżarnia not loaded")
        return
    code = msg["code"].strip()
    local = manager.find_by_barcode(code)
    if local:
        connection.send_result(
            msg["id"], {"match": "local", "product": local.to_dict()}
        )
        return

    off_client = hass.data[DOMAIN].get("off_client")
    if off_client is None or not off_client.enabled:
        connection.send_result(msg["id"], {"match": "none", "code": code})
        return

    suggestion = await off_client.lookup(code)
    if suggestion is None:
        connection.send_result(
            msg["id"],
            {"match": "none", "code": code, "off_error": off_client.last_error},
        )
        return
    connection.send_result(msg["id"], {"match": "off", "suggestion": suggestion})


def async_register_commands(hass: HomeAssistant) -> None:
    """Register all Spiżarnia WebSocket commands."""
    for command in (
        ws_subscribe,
        ws_overview,
        ws_rooms_list,
        ws_rooms_create,
        ws_rooms_update,
        ws_rooms_delete,
        ws_rooms_reorder,
        ws_shelves_list,
        ws_shelves_create,
        ws_shelves_update,
        ws_shelves_delete,
        ws_shelves_reorder,
        ws_products_list,
        ws_products_create,
        ws_products_update,
        ws_products_delete,
        ws_items_list,
        ws_items_add,
        ws_items_update,
        ws_items_consume,
        ws_items_consume_fefo,
        ws_items_move,
        ws_items_set_opened,
        ws_items_delete,
        ws_history_list,
        ws_search,
        ws_settings_get,
        ws_settings_update,
        ws_export,
        ws_barcode_lookup,
    ):
        websocket_api.async_register_command(hass, command)
