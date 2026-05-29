# Unlayer Blocks POC

Vite + React POC of Shaman's custom Unlayer compliance blocks (preview disclosures, regulatory footer, legal footer) plus a `branded_image` tool wired to Shaman's Visual Library.

## Quick start

You need **two** services running:

1. **apryse-designer in Docker** (provides `/api/shaman/*` — Cognito auth + BearerEx + GraphQL composition)
2. **This Vite dev server** (serves the editor on `http://127.0.0.1:5175/`)

### 1. Start apryse-designer (Docker)

```sh
cd ~/Development/dev_projects/apryse-designer
docker compose up -d
```

The container is on host **port 3001** (the `docker-compose.override.yml` sets `network_mode: host` + `PORT=3001`). Verify:

```sh
docker port apryse-designer       # → no published ports (host networking)
curl http://localhost:3001/api/auth/available
```

**Common pitfall — port 3001 taken by a stale process.** Docker silently fails to bind when something else holds the port. If the API returns nothing:

```sh
lsof -iTCP:3001 -sTCP:LISTEN -P   # find the offender
kill <pid>
docker compose restart apryse-designer
```

If Shaman returns `{"error":"Unauthorized"}`, force a fresh Cognito login:

```sh
curl -X POST http://localhost:3001/api/auth/relogin
```

### 2. Start this Vite dev server

```sh
cd ~/Development/dev_projects/unlayer-blocks
npm run dev -- --host 127.0.0.1
```

Opens on `http://127.0.0.1:5175/`. Vite's proxy in `vite.config.ts` forwards `/api/shaman/*` to `http://localhost:3001` (apryse-designer). If the proxy target is down, the Visual Library falls back to the local mock (`src/policy/bds-mock.ts`) so dev isn't blocked.

## Configuration

| Where | Setting | Default |
|---|---|---|
| `src/App.tsx` | `SHAMAN_ACCOUNT_ID` | `shaman-onco-us` |
| `src/App.tsx` | `SHAMAN_PRODUCT_ID` | `2` (Xanlinax) |
| `?policy=...` query param | Compliance policy URL | `/compliance.json` |
| `public/compliance.json` | Live compliance policy | — |
| `public/compliance.reference.json` | Fully-annotated reference policy with `_comment` keys for every field | — |

## Key files

| Path | Purpose |
|---|---|
| `src/blocks/preview-disclosures.ts` `regulatory-footer.ts` `legal-footer.ts` | Three custom Unlayer compliance blocks (policy-driven) |
| `src/blocks/branded-image.ts` | Custom Image tool — Visual Library picker, Padded/Side-to-side layout, alt/link/border-radius |
| `src/blocks/single-instance.ts` | Adds TODO triangle for `required: true` blocks; locks tile after add |
| `src/blocks/render-helpers.ts` | Shared iframe-side JS — cascade merge, placeholder kinds, UTM smart-join |
| `src/blocks/build-element-section.ts` | Generates per-element variant dropdown sections |
| `src/policy/compliance.ts` | Types + `loadCompliancePolicy()` loader |
| `src/policy/bds-mock.ts` | BDS asset fetchers — real API first, mock fallback |
| `src/components/VisualLibrary.tsx` | Modal that mirrors Shaman's Image Picker (logos / hero / icons / search) |
| `src/components/UnlayerEditor.tsx` | Editor mount + postMessage bridge + auto row-padding restructure |

## Built with

- Vite 8 + React 19
- react-email-editor (Unlayer SDK)
- Enterprise Unlayer license — gives us `unlayer.registerPropertyEditor()` for the real `<button>` widget in `branded_image`
