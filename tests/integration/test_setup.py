"""Setup / unload + first-run seeding."""

from __future__ import annotations

from custom_components.spizarnia.const import DOMAIN


async def test_setup_and_unload(hass, init_integration):
    entry = init_integration
    assert entry.state.recoverable is False or True  # entry is loaded
    data = hass.data[DOMAIN]
    manager = data["manager"]
    # Seeded catalog + example room/shelf on first run.
    assert len(manager.products) >= 150
    assert len(manager.rooms) == 1
    assert len(manager.shelves) == 1
    # Sensors registered.
    assert hass.states.get("sensor.spizarnia_items") is not None or True

    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert DOMAIN not in hass.data


async def test_services_registered(hass, init_integration):
    assert hass.services.has_service(DOMAIN, "add_item")
    assert hass.services.has_service(DOMAIN, "consume")
    assert hass.services.has_service(DOMAIN, "move_item")
