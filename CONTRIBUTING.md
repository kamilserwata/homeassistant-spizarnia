# Contributing to Spiżarnia

Thanks for your interest in improving Spiżarnia! Contributions are welcome.

## Language

The **code, comments, commit messages, README and issues are in English** (the
project targets an international audience via the HACS default store). The **UI is
bilingual** (Polish + English) through the i18n files — never hardcode UI strings.

## Development setup

```bash
# Backend (Python, runs inside Home Assistant)
python -m pip install ruff pytest pytest-homeassistant-custom-component
pytest tests/ -q
ruff check custom_components/

# Frontend (Lit + TypeScript + Vite)
cd frontend
npm ci
npm run watch      # rebuild the panel on change
npm run test       # vitest (pure logic)
npm run typecheck

# A local Home Assistant dev instance on :8123
docker compose -f dev/docker-compose.yml up -d
```

## Rules

1. The domain is always `spizarnia` (no diacritics) everywhere: domain, WS prefix
   (`spizarnia/*`), event prefix (`spizarnia_*`), storage keys and the `/spizarnia` URL.
2. All data mutations go through `StoreManager` (`store.py`) — never mutate storage
   directly from the WebSocket API or services.
3. Frontend uses only Home Assistant design tokens; the only HA component allowed is
   `ha-icon`.
4. Every UI string goes through i18n (`frontend/src/i18n/pl.json` + `en.json`) — keep
   the key sets identical.
5. Keep `ProductDefinition` (catalog) and `Item` (batch) separate.
6. LF line endings (enforced by `.gitattributes`).
7. **After any frontend change, run `npm run build` and commit the regenerated
   `custom_components/spizarnia/frontend_dist/panel.js`** — CI fails if the committed
   bundle is stale.

## Before opening a PR

- `ruff check custom_components/` and `ruff format --check custom_components/` pass
- `pytest tests/ -q` passes
- `cd frontend && npm run typecheck && npm run build` pass, dist committed
- New behaviour is covered by tests where practical
