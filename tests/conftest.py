"""HA-free fixtures for pure StoreManager logic tests.

The ``pytest-homeassistant-custom-component`` plugin (which sets the HA event
loop policy) is loaded only under ``tests/integration/`` so that the pure store
tests here run on any platform without spinning up Home Assistant.
"""

from __future__ import annotations

import pytest


class FakeStore:
    """Minimal stand-in for homeassistant.helpers.storage.Store."""

    def __init__(self) -> None:
        self.data: dict | None = None

    def async_delay_save(self, data_func, _delay) -> None:
        self.data = data_func()

    async def async_save(self, data) -> None:
        self.data = data

    async def async_load(self):
        return self.data


@pytest.fixture
def manager():
    """A StoreManager wired to fake stores (no Home Assistant required)."""
    from custom_components.spizarnia.store import StoreManager

    mgr = StoreManager.__new__(StoreManager)
    mgr.hass = None
    mgr.expiring_soon_days = 30
    mgr.history_retention_days = 400
    mgr._data_store = FakeStore()
    mgr._history_store = FakeStore()
    mgr.rooms = {}
    mgr.shelves = {}
    mgr.products = {}
    mgr.items = {}
    mgr.history = []
    mgr._listeners = []
    return mgr
