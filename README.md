# Spiżarnia 🫙

> Pantry inventory for Home Assistant — rooms, shelves and product batches with
> expiry dates, phone-camera barcode scanning and full automation support.
> *("Spiżarnia" is Polish for "pantry".)*

[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![license][license-badge]](LICENSE)

Spiżarnia is a **custom integration** (not an add-on), so it runs on every Home
Assistant installation — OS, Supervised, Container or Core. It stores everything in
Home Assistant's own storage (covered by your backups) and needs **no YAML** to set up.

---

## Features

- **Rooms → shelves → batches.** A *batch* is a concrete set of jars/packages with its
  own quantity, best-before date and production date. Best-before supports
  **day / month / year precision** (jars often only say "2027").
- **Sidebar panel** that follows your Home Assistant theme (dark / light / custom),
  built mobile-first for one-handed use in the cellar.
- **Barcode scanning** with the phone camera + **Open Food Facts** lookup, or manual
  entry (works with USB/Bluetooth scanners too).
- **FEFO guidance** (first-expired-first-out): consuming a product always suggests the
  oldest batch and warns — without blocking — if you pick a fresher one.
- **Sensors, events and services** for automations: expiry notifications, low-stock
  alerts, add/consume from scripts.
- **Bilingual UI** (Polish default + English), following your Home Assistant language.
- **~230 predefined Polish pantry products** seeded on first run; fully editable.

## Installation

> The full, illustrated guide is in **[docs/INSTALL.md](docs/INSTALL.md)**.

### Via HACS (custom repository)

1. HACS → **⋮** → **Custom repositories**.
2. Add `https://github.com/kamilserwata/homeassistant-spizarnia`, category **Integration**.
3. Install **Spiżarnia**, then **restart Home Assistant**.
4. **Settings → Devices & Services → Add Integration → Spiżarnia.**

*(Once accepted into the HACS default store you'll be able to find it by searching
"Spiżarnia" directly — no custom repository step.)*

### Manual

1. Copy `custom_components/spizarnia` into your `<config>/custom_components/` folder.
2. Restart Home Assistant and add the integration as above.

After setup, **Spiżarnia** appears in the sidebar. A starter catalog and an example
room ("Spiżarnia" with "Półka 1") are created automatically.

## Configuration

No YAML. Options (Settings → Devices & Services → Spiżarnia → **Configure**):

| Option | Default | Meaning |
|---|---|---|
| Expiring-soon threshold (days) | `30` | When a batch counts as "expiring soon" |
| Open Food Facts lookup | on | Look up scanned barcodes online |
| Open Food Facts locale | `pl` | Which OFF site to query (fallback `world`) |
| History retention (days) | `400` | How long the activity log is kept |

## Sensors

One **Spiżarnia** device exposes four sensors:

| Entity | State | Key attributes |
|---|---|---|
| `sensor.spizarnia_expired` | # of expired batches | `items` (product, qty, location, date) |
| `sensor.spizarnia_expiring_soon` | # within the threshold | `items` + `days_left`, `threshold_days` |
| `sensor.spizarnia_low_stock` | # of products below `min_stock` | `products` |
| `sensor.spizarnia_items` | total batches | `total_quantity`, `by_room`, `by_category` |

## Events

| Event | When |
|---|---|
| `spizarnia_item_added` | A batch is added |
| `spizarnia_item_consumed` | A batch is consumed (incl. FEFO) |
| `spizarnia_item_expiring_soon` | Daily tick: a batch crossed the threshold (once) |
| `spizarnia_item_expired` | Daily tick: a batch expired (once) |
| `spizarnia_low_stock` | A product dropped below `min_stock` |

## Services

- `spizarnia.add_item` — add a batch (`product` by name/id/barcode, `quantity`, …)
- `spizarnia.consume` — consume via FEFO (returns which batches were used)
- `spizarnia.move_item` — move a batch to another shelf

### Example automation

```yaml
alias: Pantry expiry notification
trigger:
  - platform: event
    event_type: spizarnia_item_expiring_soon
action:
  - service: notify.mobile_app_telefon
    data:
      title: "Spiżarnia 🫙"
      message: >
        {{ trigger.event.data.product_name }} is expiring
        ({{ trigger.event.data.best_before }}) in {{ trigger.event.data.room }}.
```

## FAQ

- **Barcode scanning does nothing / the camera won't open.**
  Cameras require a **secure (HTTPS) context**. Use Home Assistant Cloud (Nabu Casa) or
  your own reverse proxy with TLS. Over plain HTTP only manual code entry works.
- **Is my data sent anywhere?** No — only the scanned barcode goes to Open Food Facts,
  and only when the lookup is enabled. Everything else stays in your Home Assistant.
- **iPhone scanning?** Safari lacks the native `BarcodeDetector`, so Spiżarnia falls
  back to a bundled scanner (ZXing). It still requires HTTPS.

## Documentation

- [Installation guide](docs/INSTALL.md)
- [Technical specification](docs/SPEC.md) — architecture, data model, API
- [UX/UI specification](docs/DESIGN.md) — views, flows, components, design tokens
- [Contributing](CONTRIBUTING.md)

## License

[MIT](LICENSE)

[hacs-badge]: https://img.shields.io/badge/HACS-Custom-41BDF5.svg
[hacs-url]: https://hacs.xyz
[release-badge]: https://img.shields.io/github/v/release/kamilserwata/homeassistant-spizarnia?include_prereleases
[release-url]: https://github.com/kamilserwata/homeassistant-spizarnia/releases
[license-badge]: https://img.shields.io/github/license/kamilserwata/homeassistant-spizarnia
