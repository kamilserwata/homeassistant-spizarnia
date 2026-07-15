"""Fixtures for HA integration tests (loaded only in this subdirectory).

These pull in pytest-homeassistant-custom-component, which sets the HA event
loop policy. They run in CI (Linux); on Windows the proactor loop clashes with
the plugin's socket guard, so run these with the plugin active on Linux.
"""

from __future__ import annotations

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.spizarnia.const import DOMAIN

pytest_plugins = "pytest_homeassistant_custom_component"


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
