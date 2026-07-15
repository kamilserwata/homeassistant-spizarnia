"""WebSocket API happy paths + error codes."""

from __future__ import annotations

from custom_components.spizarnia.const import DOMAIN


async def test_overview_and_crud(hass, hass_ws_client, init_integration):
    client = await hass_ws_client(hass)
    manager = hass.data[DOMAIN]["manager"]
    room = next(iter(manager.rooms.values()))
    shelf = next(iter(manager.shelves.values()))
    product = next(iter(manager.products.values()))

    await client.send_json({"id": 1, "type": "spizarnia/overview"})
    res = await client.receive_json()
    assert res["success"]
    assert "stats" in res["result"]

    await client.send_json(
        {
            "id": 2,
            "type": "spizarnia/items/add",
            "product_id": product.id,
            "shelf_id": shelf.id,
            "quantity": 3,
            "unit": "słoik",
        }
    )
    res = await client.receive_json()
    assert res["success"]
    item = res["result"]["item"]
    assert item["quantity"] == 3
    assert item["status"] in ("ok", "no_date", "expiring_soon", "expired")

    await client.send_json(
        {"id": 3, "type": "spizarnia/items/list", "shelf_id": shelf.id}
    )
    res = await client.receive_json()
    assert len(res["result"]["items"]) == 1

    await client.send_json(
        {
            "id": 4,
            "type": "spizarnia/items/consume",
            "item_id": item["id"],
            "quantity": 1,
        }
    )
    res = await client.receive_json()
    assert res["success"]
    assert res["result"]["item"]["quantity"] == 2

    # room delete dry-run reports affected counts
    await client.send_json(
        {"id": 5, "type": "spizarnia/rooms/delete", "room_id": room.id, "dry_run": True}
    )
    res = await client.receive_json()
    assert res["result"]["affected_items"] == 1


async def test_error_codes(hass, hass_ws_client, init_integration):
    client = await hass_ws_client(hass)

    await client.send_json(
        {"id": 1, "type": "spizarnia/items/consume", "item_id": "nope", "quantity": 1}
    )
    res = await client.receive_json()
    assert not res["success"]
    assert res["error"]["code"] == "not_found"

    # Duplicate barcode → conflict
    await client.send_json(
        {
            "id": 2,
            "type": "spizarnia/products/create",
            "name": "A",
            "category": "other",
            "barcodes": ["5900000000009"],
        }
    )
    assert (await client.receive_json())["success"]
    await client.send_json(
        {
            "id": 3,
            "type": "spizarnia/products/create",
            "name": "B",
            "category": "other",
            "barcodes": ["5900000000009"],
        }
    )
    res = await client.receive_json()
    assert not res["success"]
    assert res["error"]["code"] == "conflict"


async def test_subscribe_pushes_events(hass, hass_ws_client, init_integration):
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "spizarnia/subscribe"})
    assert (await client.receive_json())["success"]

    manager = hass.data[DOMAIN]["manager"]
    manager.create_room("Nowy")
    event = await client.receive_json()
    assert event["event"]["collection"] == "rooms"
    assert event["event"]["action"] == "changed"
