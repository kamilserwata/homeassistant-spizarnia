"""Sidebar panel registration + static path setup."""

from __future__ import annotations

import logging
import os

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import (
    FILES_URL,
    IMAGES_DIRNAME,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL,
)

_LOGGER = logging.getLogger(__name__)

DIST_DIRNAME = "frontend_dist"
PANEL_FILENAME = "panel.js"


def _dist_path() -> str:
    return os.path.join(os.path.dirname(__file__), DIST_DIRNAME)


def images_path(hass: HomeAssistant) -> str:
    """Absolute path to the product image cache under /config."""
    return hass.config.path(PANEL_URL, IMAGES_DIRNAME)


async def async_register_panel(hass: HomeAssistant, version: str) -> None:
    """Register static paths and the custom sidebar panel."""
    dist = _dist_path()
    imgs = images_path(hass)
    await hass.async_add_executor_job(lambda: os.makedirs(imgs, exist_ok=True))

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(FILES_URL, dist, True),
            StaticPathConfig(f"{FILES_URL}/{IMAGES_DIRNAME}", imgs, True),
        ]
    )

    if PANEL_URL in hass.data.get("frontend_panels", {}):
        return

    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        frontend_url_path=PANEL_URL,
        require_admin=False,
        config={
            "_panel_custom": {
                "name": "spizarnia-panel",
                "module_url": f"{FILES_URL}/{PANEL_FILENAME}?v={version}",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
    )


def async_remove_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel on unload."""
    if PANEL_URL in hass.data.get("frontend_panels", {}):
        frontend.async_remove_panel(hass, PANEL_URL)
