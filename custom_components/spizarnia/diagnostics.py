"""Diagnostics for Spiżarnia (counts and settings only — no product names)."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .store import StoreManager


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return non-PII diagnostics for a config entry."""
    manager: StoreManager | None = hass.data.get(DOMAIN, {}).get("manager")
    if manager is None:
        return {"loaded": False}
    stats = manager.stats()
    return {
        "loaded": True,
        "options": dict(entry.options),
        "counts": {
            "rooms": len(manager.rooms),
            "shelves": len(manager.shelves),
            "products": len(manager.products),
            "items": len(manager.items),
            "history": len(manager.history),
        },
        "stats": {
            "expired": stats["expired"],
            "expiring_soon": stats["expiring_soon"],
            "low_stock": stats["low_stock"],
            "total_items": stats["total_items"],
            "total_quantity": stats["total_quantity"],
        },
        "products_by_category": stats["by_category"],
    }
