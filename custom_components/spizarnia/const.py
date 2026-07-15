"""Constants for the Spiżarnia integration."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "spizarnia"

# Storage
STORAGE_VERSION: Final = 1
STORAGE_KEY_DATA: Final = "spizarnia.data"
STORAGE_KEY_HISTORY: Final = "spizarnia.history"

# History retention
HISTORY_MAX_ENTRIES: Final = 2000
HISTORY_MAX_DAYS: Final = 400

# Dispatcher signal
SIGNAL_DATA_CHANGED: Final = "spizarnia_data_changed"

# Frontend / panel
PANEL_URL: Final = "spizarnia"
PANEL_TITLE: Final = "Spiżarnia"
PANEL_ICON: Final = "mdi:cupboard"
FILES_URL: Final = "/spizarnia_files"
IMAGES_DIRNAME: Final = "images"

# WebSocket / event prefixes
WS_PREFIX: Final = "spizarnia"
EVENT_PREFIX: Final = "spizarnia"

# Events on the HA bus
EVENT_ITEM_ADDED: Final = "spizarnia_item_added"
EVENT_ITEM_CONSUMED: Final = "spizarnia_item_consumed"
EVENT_ITEM_EXPIRING_SOON: Final = "spizarnia_item_expiring_soon"
EVENT_ITEM_EXPIRED: Final = "spizarnia_item_expired"
EVENT_LOW_STOCK: Final = "spizarnia_low_stock"

# Options keys + defaults
OPT_EXPIRING_SOON_DAYS: Final = "expiring_soon_days"
OPT_OFF_ENABLED: Final = "off_enabled"
OPT_OFF_LOCALE: Final = "off_locale"
OPT_DEFAULT_ROOM_ID: Final = "default_room_id"
OPT_HISTORY_RETENTION_DAYS: Final = "history_retention_days"

DEFAULT_EXPIRING_SOON_DAYS: Final = 30
DEFAULT_OFF_ENABLED: Final = True
DEFAULT_OFF_LOCALE: Final = "pl"
DEFAULT_HISTORY_RETENTION_DAYS: Final = 400

# Freshness statuses (computed, not stored)
STATUS_EXPIRED: Final = "expired"
STATUS_EXPIRING_SOON: Final = "expiring_soon"
STATUS_OK: Final = "ok"
STATUS_NO_DATE: Final = "no_date"

# Best-before precision
PRECISION_DAY: Final = "day"
PRECISION_MONTH: Final = "month"
PRECISION_YEAR: Final = "year"
PRECISION_NONE: Final = "none"
PRECISIONS: Final = (PRECISION_DAY, PRECISION_MONTH, PRECISION_YEAR, PRECISION_NONE)

# History entry types
HISTORY_ADD: Final = "add"
HISTORY_CONSUME: Final = "consume"
HISTORY_MOVE: Final = "move"
HISTORY_ADJUST: Final = "adjust"
HISTORY_OPEN: Final = "open"
HISTORY_DELETE: Final = "delete"
HISTORY_EXPIRE_NOTICE: Final = "expire_notice"

# Product sources
SOURCE_PREDEFINED: Final = "predefined"
SOURCE_OFF: Final = "off"
SOURCE_USER: Final = "user"

# Categories (keys are stable, labels are translated in the frontend)
CATEGORIES: Final = (
    "preserves_sweet",
    "preserves_savory",
    "compotes_juices",
    "honey_syrups",
    "canned",
    "dry_goods",
    "spices",
    "oils_fats",
    "drinks",
    "sweets_snacks",
    "frozen",
    "household",
    "other",
)
DEFAULT_CATEGORY: Final = "other"

CATEGORY_EMOJI: Final = {
    "preserves_sweet": "🍓",
    "preserves_savory": "🥒",
    "compotes_juices": "🍑",
    "honey_syrups": "🍯",
    "canned": "🥫",
    "dry_goods": "🌾",
    "spices": "🧂",
    "oils_fats": "🫒",
    "drinks": "🧃",
    "sweets_snacks": "🍫",
    "frozen": "❄️",
    "household": "🧻",
    "other": "📦",
}

# Units
UNITS: Final = ("szt", "słoik", "butelka", "puszka", "opak", "kg", "g", "l", "ml")
DEFAULT_UNIT: Final = "szt"

# Open Food Facts
OFF_TIMEOUT: Final = 10
OFF_CACHE_TTL: Final = 24 * 60 * 60  # 24 h
OFF_IMAGE_MAX_PX: Final = 512
OFF_IMAGE_QUALITY: Final = 80

# Map Open Food Facts categories_tags prefixes to our categories
OFF_CATEGORY_MAP: Final = {
    "en:jams": "preserves_sweet",
    "en:fruit-preserves": "preserves_sweet",
    "en:marmalades": "preserves_sweet",
    "en:pickles": "preserves_savory",
    "en:fermented": "preserves_savory",
    "en:sauces": "preserves_savory",
    "en:tomato-sauces": "preserves_savory",
    "en:canned-foods": "canned",
    "en:canned": "canned",
    "en:canned-fish": "canned",
    "en:canned-vegetables": "canned",
    "en:honeys": "honey_syrups",
    "en:syrups": "honey_syrups",
    "en:juices": "compotes_juices",
    "en:fruit-juices": "compotes_juices",
    "en:compotes": "compotes_juices",
    "en:flours": "dry_goods",
    "en:cereals": "dry_goods",
    "en:pastas": "dry_goods",
    "en:rice": "dry_goods",
    "en:sugars": "dry_goods",
    "en:spices": "spices",
    "en:condiments": "spices",
    "en:vegetable-oils": "oils_fats",
    "en:olive-oils": "oils_fats",
    "en:fats": "oils_fats",
    "en:beverages": "drinks",
    "en:waters": "drinks",
    "en:teas": "drinks",
    "en:coffees": "drinks",
    "en:chocolates": "sweets_snacks",
    "en:biscuits": "sweets_snacks",
    "en:snacks": "sweets_snacks",
    "en:sweets": "sweets_snacks",
    "en:frozen-foods": "frozen",
}
