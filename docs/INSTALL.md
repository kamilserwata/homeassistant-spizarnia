# Installing Spiżarnia in Home Assistant

Spiżarnia is a **custom integration**. It works on every Home Assistant install
type (OS, Supervised, Container, Core). This guide covers every way to get it
running, plus updating and troubleshooting.

---

## 🇵🇱 Szybki start (po polsku)

1. **HACS → ⋮ (prawy górny róg) → Custom repositories.**
2. Wklej `https://github.com/kamilserwata/homeassistant-spizarnia`, kategoria **Integration**, **Add**.
3. Wyszukaj **Spiżarnia** na liście HACS, **Download**, potem **zrestartuj Home Assistant**.
4. **Ustawienia → Urządzenia i usługi → Dodaj integrację → Spiżarnia.**
5. Gotowe — **Spiżarnia** pojawia się w panelu bocznym. Na start tworzy się katalog
   ~230 produktów oraz pokój „Spiżarnia" z półką „Półka 1".

> Skanowanie kodów kamerą wymaga **HTTPS** (np. Nabu Casa). Po HTTP działa tylko
> ręczne wpisanie kodu.

---

## Method 1 — HACS custom repository (recommended)

Until Spiżarnia is accepted into the HACS default store, add it as a custom repo:

1. Open **HACS** in the sidebar.
2. Top-right **⋮** menu → **Custom repositories**.
3. Repository: `https://github.com/kamilserwata/homeassistant-spizarnia`
   Category: **Integration** → **Add**.
4. Search HACS for **Spiżarnia** and click **Download**.
5. **Restart Home Assistant** (Settings → System → top-right power icon → Restart).
6. Add the integration: **Settings → Devices & Services → Add Integration**, search
   **Spiżarnia**, confirm the single setup step.

When accepted into the default store, steps 2–3 disappear — you'll just search for it.

## Method 2 — Manual copy

Good for Core installs or when you don't use HACS.

1. Download this repository (or a release — see Method 3).
2. Copy the folder `custom_components/spizarnia` into your Home Assistant config so you
   end up with:

   ```
   <config>/custom_components/spizarnia/__init__.py
   <config>/custom_components/spizarnia/manifest.json
   ...
   ```

   `<config>` is where your `configuration.yaml` lives (e.g. `/config` on HA OS,
   `~/.homeassistant` on Core).
3. **Restart Home Assistant.**
4. **Settings → Devices & Services → Add Integration → Spiżarnia.**

The pre-built frontend panel is already included in
`custom_components/spizarnia/frontend_dist/panel.js` — there is **no build step** for
end users.

## Method 3 — Release ZIP

1. Go to the [Releases](https://github.com/kamilserwata/homeassistant-spizarnia/releases) page.
2. Download `spizarnia.zip` from the latest release.
3. Unzip it into `<config>/custom_components/spizarnia/` (the zip contains the
   integration files directly).
4. Restart Home Assistant and add the integration.

## After installation

- **Spiżarnia** appears in the sidebar (icon: cupboard).
- A starter catalog (~230 Polish pantry products) and an example room **Spiżarnia**
  with shelf **Półka 1** are created automatically on first run.
- The UI language follows your Home Assistant language (Polish → Polish, everything
  else → English).

### Options (no YAML)

**Settings → Devices & Services → Spiżarnia → Configure:**

- Expiring-soon threshold (days) — default 30
- Open Food Facts lookup on/off + locale
- History retention (days)

### Barcode scanning requires HTTPS

Browsers only grant camera access in a **secure context**. To scan with your phone:

- Use **Home Assistant Cloud (Nabu Casa)**, **or**
- Put Home Assistant behind your own **reverse proxy with a TLS certificate**.

Over plain `http://…:8123` the scanner view still works, but only through **manual code
entry** (which also covers USB/Bluetooth barcode scanners that type like a keyboard).

## Updating

- **HACS:** open Spiżarnia in HACS → **Update**, then restart Home Assistant.
- **Manual / ZIP:** replace the `custom_components/spizarnia` folder with the new
  version and restart.

Your data (rooms, shelves, products, batches, history) lives in Home Assistant storage
and is preserved across updates and included in Home Assistant backups.

## Uninstalling

1. **Settings → Devices & Services → Spiżarnia → ⋮ → Delete.**
2. Remove it from HACS (or delete `custom_components/spizarnia`).
3. Restart Home Assistant.

Stored pantry data is removed with the config entry; a Home Assistant backup taken
earlier still contains it if you need to restore.

## Local development instance

To try it against a throwaway Home Assistant:

```bash
docker compose -f dev/docker-compose.yml up -d   # HA on http://localhost:8123
```

This mounts `custom_components/` into the container. After editing Python code,
`docker compose -f dev/docker-compose.yml restart`. For the panel, rebuild with
`cd frontend && npm run watch` and refresh the browser. See
[CONTRIBUTING.md](../CONTRIBUTING.md) for the full dev workflow.

## Troubleshooting

- **Spiżarnia doesn't show up in "Add Integration".** Make sure the files are under
  `<config>/custom_components/spizarnia/` and you **restarted** Home Assistant. Check
  **Settings → System → Logs** for `custom_components.spizarnia`.
- **The sidebar panel is blank / old.** Hard-refresh the browser (Ctrl/Cmd+Shift+R).
  The panel URL is version-busted, so a restart normally clears it.
- **Scanner shows "requires HTTPS".** Expected over HTTP — see the HTTPS section above.
- **Open Food Facts lookups fail.** They degrade gracefully (you can still add products
  manually). Check that the HA host has outbound internet and the locale option is valid.

Need help? Open an [issue](https://github.com/kamilserwata/homeassistant-spizarnia/issues).
