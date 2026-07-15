"""Sensor platform: 4 push-updated sensors on one Spiżarnia device."""

from __future__ import annotations

from datetime import UTC, datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    PANEL_TITLE,
    SIGNAL_DATA_CHANGED,
    STATUS_EXPIRED,
    STATUS_EXPIRING_SOON,
)
from .store import StoreManager, compute_status

# Detailed attribute lists are noisy for the recorder — keep them out of history.
_UNRECORDED = frozenset({"items", "products", "by_room", "by_category"})
MAX_ATTR_ITEMS = 30


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Spiżarnia sensors."""
    manager: StoreManager = hass.data[DOMAIN]["manager"]
    device = DeviceInfo(
        identifiers={(DOMAIN, entry.entry_id)},
        name=PANEL_TITLE,
        manufacturer="Spiżarnia",
        model="Pantry",
    )
    async_add_entities(
        [
            ExpiredSensor(manager, entry, device),
            ExpiringSoonSensor(manager, entry, device),
            LowStockSensor(manager, entry, device),
            TotalItemsSensor(manager, entry, device),
        ]
    )


class _BaseSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    _unrecorded_attributes = _UNRECORDED

    def __init__(
        self, manager: StoreManager, entry: ConfigEntry, device: DeviceInfo
    ) -> None:
        self._manager = manager
        self._entry = entry
        self._attr_device_info = device
        self._attr_unique_id = f"{entry.entry_id}_{self._key}"
        self._attr_translation_key = self._key

    async def async_added_to_hass(self) -> None:
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_DATA_CHANGED, self._handle_change
            )
        )
        # Also refresh whenever the store notifies (mutations).
        self.async_on_remove(self._manager.add_listener(self._handle_collection))

    @callback
    def _handle_change(self) -> None:
        self.async_write_ha_state()

    @callback
    def _handle_collection(self, _collection: str) -> None:
        self.async_write_ha_state()

    def _today(self):
        return datetime.now(UTC).date()

    def _location(self, shelf_id: str | None) -> str:
        return self._manager.shelf_path(shelf_id) or ""


class ExpiredSensor(_BaseSensor):
    _key = "expired"
    _attr_icon = "mdi:food-off"

    @property
    def native_value(self) -> int:
        return self._manager.stats()["expired"]

    @property
    def extra_state_attributes(self) -> dict:
        today = self._today()
        items = []
        for item in self._manager.list_items():
            status, _ = compute_status(item, today, self._manager.expiring_soon_days)
            if status != STATUS_EXPIRED:
                continue
            product = self._manager.products.get(item.product_id)
            items.append(
                {
                    "product": product.name if product else "",
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "best_before": item.best_before,
                    "location": self._location(item.shelf_id),
                }
            )
            if len(items) >= MAX_ATTR_ITEMS:
                break
        return {"items": items}


class ExpiringSoonSensor(_BaseSensor):
    _key = "expiring_soon"
    _attr_icon = "mdi:clock-alert-outline"

    @property
    def native_value(self) -> int:
        return self._manager.stats()["expiring_soon"]

    @property
    def extra_state_attributes(self) -> dict:
        today = self._today()
        threshold = self._manager.expiring_soon_days
        items = []
        for item in self._manager.list_items():
            status, days_left = compute_status(item, today, threshold)
            if status != STATUS_EXPIRING_SOON:
                continue
            product = self._manager.products.get(item.product_id)
            items.append(
                {
                    "product": product.name if product else "",
                    "quantity": item.quantity,
                    "unit": item.unit,
                    "best_before": item.best_before,
                    "days_left": days_left,
                    "location": self._location(item.shelf_id),
                }
            )
            if len(items) >= MAX_ATTR_ITEMS:
                break
        return {"items": items, "threshold_days": threshold}


class LowStockSensor(_BaseSensor):
    _key = "low_stock"
    _attr_icon = "mdi:cart-arrow-down"

    @property
    def native_value(self) -> int:
        return self._manager.stats()["low_stock"]

    @property
    def extra_state_attributes(self) -> dict:
        products = []
        for product in self._manager.products.values():
            if product.min_stock is None:
                continue
            total = self._manager.total_quantity(product.id)
            if total < product.min_stock:
                products.append(
                    {
                        "name": product.name,
                        "total": total,
                        "min_stock": product.min_stock,
                        "unit": product.default_unit,
                    }
                )
        return {"products": products}


class TotalItemsSensor(_BaseSensor):
    _key = "total_items"
    _attr_icon = "mdi:package-variant-closed"
    _attr_state_class = "measurement"

    @property
    def native_value(self) -> int:
        return self._manager.stats()["total_items"]

    @property
    def extra_state_attributes(self) -> dict:
        stats = self._manager.stats()
        return {
            "total_quantity": stats["total_quantity"],
            "by_room": stats["by_room"],
            "by_category": stats["by_category"],
        }
