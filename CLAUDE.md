# Spiżarnia — instrukcje dla Claude Code

Custom integration Home Assistant: zarządzanie domowymi zapasami (pomieszczenia →
półki → partie produktów), panel w sidebarze, skanowanie kodów, sensory/eventy.

## Dokumenty źródłowe — CZYTAJ PRZED PRACĄ

- **`docs/SPEC.md`** — architektura, model danych, WebSocket API, encje/eventy/serwisy,
  fazy implementacji (§19). Implementuj fazami, nie zaczynaj kolejnej przed DoD poprzedniej.
- **`docs/DESIGN.md`** — widoki, flow, komponenty `spz-*`, tokeny, zasady UX. Frontend
  buduj wyłącznie wg tego dokumentu.

## Stack

- Backend: Python w procesie HA (custom_components/spizarnia), storage HA, WS API. Zero requirements.
- Frontend: Lit 3 + TypeScript + Vite → jeden ESM `frontend_dist/panel.js` (commitowany).
- Testy: pytest + pytest-homeassistant-custom-component; vitest dla logiki TS.

## Komendy

```bash
cd frontend && npm run build      # build panelu do custom_components/spizarnia/frontend_dist/
cd frontend && npm run watch      # dev rebuild
docker compose -f dev/docker-compose.yml up -d   # HA dev na :8123
pytest tests/ -q                  # testy backendu
ruff check custom_components/     # lint
```

## Zasady twarde

1. Domena zawsze `spizarnia` (bez polskich znaków) — domain, prefiks WS (`spizarnia/*`),
   prefiks eventów (`spizarnia_*`), storage keys, url `/spizarnia`.
2. Wszystkie mutacje danych przez `StoreManager` (store.py) — nigdy bezpośrednio w WS/serwisach.
3. UI: tylko design tokens HA; z komponentów HA wolno używać wyłącznie `ha-icon`.
4. Każdy string UI przez i18n (frontend/src/i18n/pl.json + en.json) — zero literałów w komponentach.
5. Rozdzielenie ProductDefinition (katalog) / Item (partia) — nie spłaszczać.
6. **Projekt publiczny** (GitHub + HACS default, licencja MIT): commity, kod,
   komentarze, README, issues — PO ANGIELSKU (wyjątek od globalnej konwencji PL,
   bo społeczność międzynarodowa). UI dwujęzyczne pl/en przez i18n.
7. Line endings LF (`.gitattributes`).
8. Po zmianach frontendu ZAWSZE `npm run build` przed commitem (CI porównuje dist).
9. Release: podbij `manifest.json` version → tag `v*` → release.yml buduje
   `spizarnia.zip`. Checklist publikacji: docs/SPEC.md §17.2–17.3.
