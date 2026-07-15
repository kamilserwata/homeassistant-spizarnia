"""Open Food Facts client: mapping + lookup (found / 404 / error)."""

from __future__ import annotations

from custom_components.spizarnia.off_client import OFFClient, map_off_category


def test_map_off_category():
    assert map_off_category(["en:foods", "en:jams"]) == "preserves_sweet"
    assert map_off_category(["en:canned-fish"]) == "canned"
    assert map_off_category(["en:unknown-thing"]) == "other"
    assert map_off_category([]) == "other"


async def test_lookup_found(hass, aioclient_mock):
    aioclient_mock.get(
        "https://pl.openfoodfacts.org/api/v2/product/123",
        json={
            "status": 1,
            "product": {
                "product_name_pl": "Passata pomidorowa",
                "brands": "Mutti, Inne",
                "quantity": "700 g",
                "image_front_url": "https://img/x.jpg",
                "categories_tags": ["en:sauces", "en:tomato-sauces"],
            },
        },
    )
    client = OFFClient(hass, "1.0.0", enabled=True, locale="pl")
    result = await client.lookup("123")
    assert result is not None
    assert result["name"] == "Passata pomidorowa"
    assert result["brand"] == "Mutti"
    assert result["suggested_category"] == "preserves_savory"


async def test_lookup_not_found_falls_back_to_world(hass, aioclient_mock):
    aioclient_mock.get(
        "https://pl.openfoodfacts.org/api/v2/product/999", status=404
    )
    aioclient_mock.get(
        "https://world.openfoodfacts.org/api/v2/product/999", status=404
    )
    client = OFFClient(hass, "1.0.0", enabled=True, locale="pl")
    assert await client.lookup("999") is None
    assert client.last_error is False


async def test_lookup_server_error_sets_flag(hass, aioclient_mock):
    aioclient_mock.get(
        "https://pl.openfoodfacts.org/api/v2/product/500", status=502
    )
    aioclient_mock.get(
        "https://world.openfoodfacts.org/api/v2/product/500", status=502
    )
    client = OFFClient(hass, "1.0.0", enabled=True, locale="pl")
    assert await client.lookup("500") is None
    assert client.last_error is True
