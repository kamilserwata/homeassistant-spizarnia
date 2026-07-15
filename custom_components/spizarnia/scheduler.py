"""Daily scheduler: recompute statuses, fire expiry events, prune history."""

from __future__ import annotations

import logging
from datetime import UTC, datetime

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.event import async_track_time_change

from .const import (
    EVENT_ITEM_EXPIRED,
    EVENT_ITEM_EXPIRING_SOON,
    SIGNAL_DATA_CHANGED,
    STATUS_EXPIRED,
    STATUS_EXPIRING_SOON,
)
from .store import StoreManager, compute_status

_LOGGER = logging.getLogger(__name__)


class Scheduler:
    """Runs a daily tick at 00:05 plus one at startup."""

    def __init__(self, hass: HomeAssistant, manager: StoreManager) -> None:
        self.hass = hass
        self.manager = manager
        self._unsub = None

    def start(self) -> None:
        self._unsub = async_track_time_change(
            self.hass, self._scheduled_tick, hour=0, minute=5, second=0
        )
        self.hass.async_create_task(self.async_tick())

    def stop(self) -> None:
        if self._unsub:
            self._unsub()
            self._unsub = None

    @callback
    def _scheduled_tick(self, _now) -> None:
        self.hass.async_create_task(self.async_tick())

    async def async_tick(self) -> None:
        """Recompute statuses; emit one-shot expiry events; prune history."""
        today = datetime.now(UTC).date()
        threshold = self.manager.expiring_soon_days
        changed = False
        for item in list(self.manager.items.values()):
            status, days_left = compute_status(item, today, threshold)
            product = self.manager.products.get(item.product_id)
            product_name = product.name if product else ""
            base = {
                "item_id": item.id,
                "product_id": item.product_id,
                "product_name": product_name,
                "best_before": item.best_before,
                "days_left": days_left,
                "room": self._room_name(item.shelf_id),
                "shelf": self._shelf_name(item.shelf_id),
                "quantity": item.quantity,
                "unit": item.unit,
            }
            if status == STATUS_EXPIRED and not item.notified_expired:
                item.notified_expired = True
                item.notified_expiring = True
                changed = True
                self.hass.bus.async_fire(EVENT_ITEM_EXPIRED, base)
            elif status == STATUS_EXPIRING_SOON and not item.notified_expiring:
                item.notified_expiring = True
                changed = True
                self.hass.bus.async_fire(EVENT_ITEM_EXPIRING_SOON, base)

        if changed:
            self.manager._save_data()  # noqa: SLF001

        self.manager.prune_history()

        # Push a data-changed signal so sensors refresh with the new day.
        from homeassistant.helpers.dispatcher import async_dispatcher_send

        async_dispatcher_send(self.hass, SIGNAL_DATA_CHANGED)

    def _room_name(self, shelf_id: str | None) -> str:
        shelf = self.manager.shelves.get(shelf_id) if shelf_id else None
        if not shelf:
            return ""
        room = self.manager.rooms.get(shelf.room_id)
        return room.name if room else ""

    def _shelf_name(self, shelf_id: str | None) -> str:
        shelf = self.manager.shelves.get(shelf_id) if shelf_id else None
        return shelf.name if shelf else ""

    def reset_expiring_flags(self) -> None:
        """Clear ``notified_expiring`` for items no longer in the threshold.

        Called when ``expiring_soon_days`` changes so the event can re-fire.
        """
        today = datetime.now(UTC).date()
        threshold = self.manager.expiring_soon_days
        for item in self.manager.items.values():
            status, _ = compute_status(item, today, threshold)
            if status not in (STATUS_EXPIRED, STATUS_EXPIRING_SOON):
                item.notified_expiring = False
        self.manager._save_data()  # noqa: SLF001
