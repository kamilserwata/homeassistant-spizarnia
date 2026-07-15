"""Open Food Facts client with in-memory cache and image download.

Runs on the backend (proxy) so the user's IP never reaches OFF, CORS is avoided
and caching/rate-limiting live in one place. Never blocks a flow: any failure
degrades to ``None`` with ``last_error`` set.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from io import BytesIO

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    DEFAULT_CATEGORY,
    OFF_CACHE_TTL,
    OFF_CATEGORY_MAP,
    OFF_IMAGE_MAX_PX,
    OFF_IMAGE_QUALITY,
    OFF_TIMEOUT,
)

_LOGGER = logging.getLogger(__name__)

_FIELDS = "product_name,product_name_pl,brands,quantity,image_front_url,categories_tags"


def map_off_category(categories_tags: list[str]) -> str:
    """Map an OFF ``categories_tags`` list to one of our category keys."""
    for tag in reversed(categories_tags or []):  # most specific tag last
        for prefix, category in OFF_CATEGORY_MAP.items():
            if tag.startswith(prefix):
                return category
    return DEFAULT_CATEGORY


class OFFClient:
    """Thin async client for the Open Food Facts product API."""

    def __init__(
        self,
        hass: HomeAssistant,
        version: str,
        *,
        enabled: bool = True,
        locale: str = "pl",
        images_path: str | None = None,
    ) -> None:
        self.hass = hass
        self.enabled = enabled
        self.locale = locale
        self.images_path = images_path
        self.last_error = False
        self._user_agent = (
            f"Spizarnia-HA/{version} (+https://github.com/kamilserwata/homeassistant-spizarnia)"
        )
        self._cache: dict[str, tuple[float, dict | None]] = {}

    def update_options(self, *, enabled: bool, locale: str) -> None:
        self.enabled = enabled
        self.locale = locale

    async def lookup(self, code: str) -> dict | None:
        """Return a suggestion dict for a barcode, or ``None`` if not found."""
        self.last_error = False
        now = time.monotonic()
        cached = self._cache.get(code)
        if cached and now - cached[0] < OFF_CACHE_TTL:
            return cached[1]

        data = await self._fetch(code, self.locale)
        if data is None and self.locale != "world":
            data = await self._fetch(code, "world")
        self._cache[code] = (now, data)
        return data

    async def _fetch(self, code: str, locale: str) -> dict | None:
        url = (
            f"https://{locale}.openfoodfacts.org/api/v2/product/{code}?fields={_FIELDS}"
        )
        session = async_get_clientsession(self.hass)
        try:
            async with asyncio.timeout(OFF_TIMEOUT):
                resp = await session.get(url, headers={"User-Agent": self._user_agent})
                if resp.status == 404:
                    return None
                if resp.status >= 500:
                    self.last_error = True
                    return None
                payload = await resp.json()
        except (TimeoutError, Exception) as err:  # noqa: BLE001
            _LOGGER.debug("OFF lookup failed for %s: %s", code, err)
            self.last_error = True
            return None

        if payload.get("status") != 1:
            return None
        product = payload.get("product", {})
        categories = product.get("categories_tags", [])
        name = (
            product.get("product_name_pl") or product.get("product_name") or ""
        ).strip()
        if not name:
            return None
        return {
            "name": name,
            "brand": (product.get("brands") or "").split(",")[0].strip(),
            "quantity_text": product.get("quantity", ""),
            "image_url": product.get("image_front_url"),
            "categories": categories,
            "suggested_category": map_off_category(categories),
            "code": code,
        }

    async def download_image(self, image_url: str, product_id: str) -> str | None:
        """Download + resize a product image; return the relative stored path."""
        if not self.images_path or not image_url:
            return None
        try:
            data = await self._download_bytes(image_url)
            if data is None:
                return None
            rel_name = f"{product_id}.jpg"
            dest = os.path.join(self.images_path, rel_name)
            await self.hass.async_add_executor_job(self._resize_save, data, dest)
            return rel_name
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("OFF image download failed: %s", err)
            return None

    async def _download_bytes(self, url: str) -> bytes | None:
        session = async_get_clientsession(self.hass)
        try:
            async with asyncio.timeout(OFF_TIMEOUT):
                resp = await session.get(url, headers={"User-Agent": self._user_agent})
                if resp.status != 200:
                    return None
                return await resp.read()
        except Exception:  # noqa: BLE001
            return None

    @staticmethod
    def _resize_save(data: bytes, dest: str) -> None:
        from PIL import Image  # Pillow ships with HA core

        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with Image.open(BytesIO(data)) as img:
            img = img.convert("RGB")
            img.thumbnail((OFF_IMAGE_MAX_PX, OFF_IMAGE_MAX_PX))
            img.save(dest, "JPEG", quality=OFF_IMAGE_QUALITY)
