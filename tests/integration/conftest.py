"""Fixtures for HA integration tests.

``pytest-homeassistant-custom-component`` auto-loads via its entry point (which is
why the pure store tests need ``-p no:homeassistant`` on Windows), so it must NOT be
listed in ``pytest_plugins`` here — recent pytest forbids that in a sub-conftest, and
it would be redundant anyway. These tests run in CI (Linux); the ``hass`` fixture
can't start on Windows because of the proactor-loop socket guard.
"""

from __future__ import annotations

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.spizarnia.const import DOMAIN


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture
async def init_integration(hass):
    """Set up the Spiżarnia config entry and return it."""
    entry = MockConfigEntry(domain=DOMAIN, title="Spiżarnia", options={})
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry
