# Spiżarnia 🫙

**Pantry inventory for Home Assistant.** Track what's in your cellar and cupboards —
organised as **rooms → shelves → product batches**, each batch with its own quantity,
best-before and production date.

## Highlights

- 📦 **Rooms, shelves and batches** — day / month / year date precision (jars often
  only say "2027").
- 📱 **Sidebar panel**, mobile-first, follows your Home Assistant theme (dark / light).
- 🔦 **Barcode scanning** with the phone camera + **Open Food Facts** lookup (or manual
  / USB scanner entry).
- ♻️ **FEFO** — always suggests the oldest batch first and warns if you grab a fresher one.
- 🔔 **Sensors, events and services** for automations: expiry & low-stock notifications.
- 🇵🇱🇬🇧 **Bilingual UI** (Polish default + English) and ~230 predefined Polish products.
- 💾 **No YAML, no extra dependencies** — data lives in Home Assistant storage (backed up).

## Setup

After installing via HACS, **restart Home Assistant**, then go to
**Settings → Devices & Services → Add Integration → Spiżarnia**. A starter catalog and
an example room are created automatically. **Spiżarnia** then appears in the sidebar.

> 📷 Camera scanning needs an **HTTPS** connection (e.g. Home Assistant Cloud / Nabu
> Casa). Over plain HTTP, use manual code entry.

See the [installation guide](https://github.com/kamilserwata/homeassistant-spizarnia/blob/main/docs/INSTALL.md)
and [README](https://github.com/kamilserwata/homeassistant-spizarnia) for details,
sensors/events/services and example automations.
