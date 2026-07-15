"""The Spiżarnia integration."""

from __future__ import annotations

import json
import logging
import os

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant

from .const import (
    DEFAULT_EXPIRING_SOON_DAYS,
    DEFAULT_HISTORY_RETENTION_DAYS,
    DEFAULT_OFF_ENABLED,
    DEFAULT_OFF_LOCALE,
    DOMAIN,
    OPT_EXPIRING_SOON_DAYS,
    OPT_HISTORY_RETENTION_DAYS,
    OPT_OFF_ENABLED,
    OPT_OFF_LOCALE,
)
from .off_client import OFFClient
from .panel import async_register_panel, async_remove_panel, images_path
from .scheduler import Scheduler
from .services import async_setup_services, async_unload_services
from .store import StoreManager
from .websocket_api import async_register_commands

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]


def _load_seed_catalog() -> list[dict]:
    path = os.path.join(os.path.dirname(__file__), "data", "products_pl.json")
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh).get("products", [])
    except (OSError, ValueError) as err:
        _LOGGER.warning("Could not load seed catalog: %s", err)
        return []


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Spiżarnia from a config entry."""
    version = _integration_version(hass)
    expiring = entry.options.get(OPT_EXPIRING_SOON_DAYS, DEFAULT_EXPIRING_SOON_DAYS)

    manager = StoreManager(hass, int(expiring))
    manager.history_retention_days = int(
        entry.options.get(OPT_HISTORY_RETENTION_DAYS, DEFAULT_HISTORY_RETENTION_DAYS)
    )
    await manager.async_load()

    # First-run seeding: predefined catalog + example room/shelf.
    if manager.is_empty():
        seed = await hass.async_add_executor_job(_load_seed_catalog)
        count = manager.seed_catalog(seed)
        room = manager.create_room("Spiżarnia")
        manager.create_shelf(room.id, "Półka 1")
        _LOGGER.info("Spiżarnia seeded with %s catalog products", count)

    off_client = OFFClient(
        hass,
        version,
        enabled=entry.options.get(OPT_OFF_ENABLED, DEFAULT_OFF_ENABLED),
        locale=entry.options.get(OPT_OFF_LOCALE, DEFAULT_OFF_LOCALE),
        images_path=images_path(hass),
    )

    scheduler = Scheduler(hass, manager)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN] = {
        "manager": manager,
        "off_client": off_client,
        "scheduler": scheduler,
        "entry": entry,
        "version": version,
    }

    async_register_commands(hass)
    await async_register_panel(hass, version)
    async_setup_services(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    scheduler.start()
    entry.async_on_unload(entry.add_update_listener(_async_update_options))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    data = hass.data.get(DOMAIN, {})
    scheduler: Scheduler | None = data.get("scheduler")
    manager: StoreManager | None = data.get("manager")
    if scheduler:
        scheduler.stop()
    if manager:
        await manager.async_save_now()
    async_remove_panel(hass)
    async_unload_services(hass)
    hass.data.pop(DOMAIN, None)
    return unload_ok


async def _async_update_options(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Apply option changes without a restart."""
    data = hass.data.get(DOMAIN, {})
    manager: StoreManager | None = data.get("manager")
    off_client: OFFClient | None = data.get("off_client")
    scheduler: Scheduler | None = data.get("scheduler")
    if not manager:
        return

    new_threshold = int(
        entry.options.get(OPT_EXPIRING_SOON_DAYS, DEFAULT_EXPIRING_SOON_DAYS)
    )
    threshold_changed = new_threshold != manager.expiring_soon_days
    manager.expiring_soon_days = new_threshold
    manager.history_retention_days = int(
        entry.options.get(OPT_HISTORY_RETENTION_DAYS, DEFAULT_HISTORY_RETENTION_DAYS)
    )
    if off_client:
        off_client.update_options(
            enabled=entry.options.get(OPT_OFF_ENABLED, DEFAULT_OFF_ENABLED),
            locale=entry.options.get(OPT_OFF_LOCALE, DEFAULT_OFF_LOCALE),
        )
    if threshold_changed and scheduler:
        scheduler.reset_expiring_flags()
        await scheduler.async_tick()
    manager._notify("settings")  # noqa: SLF001


def _integration_version(hass: HomeAssistant) -> str:
    try:
        integration = hass.data["integrations"][DOMAIN]
        return integration.version or "0.0.0"
    except (KeyError, AttributeError):
        path = os.path.join(os.path.dirname(__file__), "manifest.json")
        try:
            with open(path, encoding="utf-8") as fh:
                return json.load(fh).get("version", "0.0.0")
        except (OSError, ValueError):
            return "0.0.0"
