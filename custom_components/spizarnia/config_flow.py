"""Config flow and options flow for Spiżarnia."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

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
    PANEL_TITLE,
)

OFF_LOCALES = ["pl", "world", "de", "fr", "en", "es", "it"]


class SpizarniaConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single-step config flow (no user input required)."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()
        if user_input is not None:
            return self.async_create_entry(title=PANEL_TITLE, data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return SpizarniaOptionsFlow()


class SpizarniaOptionsFlow(OptionsFlow):
    """Options: alert threshold, OFF, history retention."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        opts = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    OPT_EXPIRING_SOON_DAYS,
                    default=opts.get(
                        OPT_EXPIRING_SOON_DAYS, DEFAULT_EXPIRING_SOON_DAYS
                    ),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=1, max=365, step=1, mode=NumberSelectorMode.BOX
                    )
                ),
                vol.Optional(
                    OPT_OFF_ENABLED,
                    default=opts.get(OPT_OFF_ENABLED, DEFAULT_OFF_ENABLED),
                ): BooleanSelector(),
                vol.Optional(
                    OPT_OFF_LOCALE,
                    default=opts.get(OPT_OFF_LOCALE, DEFAULT_OFF_LOCALE),
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=OFF_LOCALES, mode=SelectSelectorMode.DROPDOWN
                    )
                ),
                vol.Optional(
                    OPT_HISTORY_RETENTION_DAYS,
                    default=opts.get(
                        OPT_HISTORY_RETENTION_DAYS,
                        DEFAULT_HISTORY_RETENTION_DAYS,
                    ),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=7, max=1000, step=1, mode=NumberSelectorMode.BOX
                    )
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
