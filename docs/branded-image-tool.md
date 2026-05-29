# Branded Image Tool

A custom Unlayer tool that replaces the built-in Image. Every image flows through Shaman's Visual Library (BDS) — no local upload. Adds a Layout toggle (Padded / Side-to-side), policy-driven container padding, and a native per-corner border-radius control.

## Why a custom tool

Unlayer's built-in Image tool:

- Uses Unlayer's own upload UI and CDN — bypasses Shaman's brand-asset registry and MLR record
- Has no concept of "edge-to-edge" vs "padded" beyond the row's own padding (which affects siblings)
- Padding/borders/etc. are configurable but not policy-driven

The `branded_image` tool:

- Only source of images = the **Shaman Visual Library** (`/api/shaman/images`, `/api/shaman/bds`)
- **Layout dropdown**: Padded → policy padding; Side-to-side → 0 padding
- Container padding sourced from `compliance.json → tools.branded_image.containerPadding` (dynamic, not hardcoded)
- Native widgets where possible (link, border_radius); custom widgets only where Unlayer doesn't ship a fit
- Reads Shaman's AI-authored `altText` directly off the image record

## File layout

| File | Role |
|---|---|
| `src/blocks/branded-image.ts` | Tool factory — builds the customJS data URL that registers the tool inside Unlayer's iframe |
| `src/components/VisualLibrary.tsx` | React modal — replicates Shaman's Image Picker (search + tabs + grid). Opens on the host page; the iframe tool sends a postMessage to trigger it |
| `src/components/UnlayerEditor.tsx` | Mounts Unlayer; bridges iframe ↔ host (open library, library-selected, clear) and writes selected asset values into the design |
| `src/policy/bds-mock.ts` | BDS asset fetchers — real API first, mock fallback. `getAltText()` returns Shaman's `altText` field (no AI / filename fallback) |
| `src/brand/toUnlayerOptions.ts` | Disables Unlayer's built-in `image` tool (`tools.image.enabled = false`) so `branded_image` takes its slot |

## Property panel sections

```
┌─ Image ───────────────────────────────┐
│  [thumb] [Select from visual library ] [🗑]
│  Alt text  [_________________]
├─ Action ──────────────────────────────┤
│  Image Link [Open Website ▼]
│  URL        [_________________]
│  Target     [New Tab ▼]
├─ Style ───────────────────────────────┤
│  Layout         [Padded ▼ / Side-to-side]
│  Align          [L][C][R][J]
│  Width          [Auto / 25% / 50% / 75% / 100%]
│  Border radius  All Sides / More Options
│                 [0][px][−][+]   (per-corner when expanded)
└───────────────────────────────────────┘
```

## Widgets

### Custom widgets (`unlayer.registerPropertyEditor`)

- **`library_button`** — primary or ghost-variant button. Used for legacy callers.
- **`library_picker`** — combined preview thumbnail (only when an asset is picked) + "Select from visual library" primary button + bin-icon clear button. Single row.
- **`corner_radius`** — fallback widget if Unlayer's native `border_radius` doesn't render the per-corner UI in this SDK version. Renders single-input All-Sides mode with a "More options" toggle that expands to 2×2 per-corner inputs.

### Native widgets reused

- **`link`** — Action / Link section. Gives the standard Image Link type dropdown + URL + Target.
- **`border_radius`** — currently used for Style → Border radius. If it doesn't expose the per-corner toggle in this SDK version, swap to `corner_radius` (custom widget above).
- **`alignment`** — Style → Align.
- **`dropdown`** — Layout / Width.
- **`text`** — Alt text.

### Document-level event delegation

Custom widgets can't attach DOM event handlers from a render function that returns an HTML string. Each widget marks its action targets with a `data-shaman-*` attribute; a single document-level listener at the top of the script reads the attribute and dispatches.

| Attribute | Event | Action |
|---|---|---|
| `data-shaman-action="open"` | click | `postMessage({type: "shaman:branded-image-action", action: "open"})` |
| `data-shaman-action="clear"` | click | same with `action: "clear"` |
| `data-shaman-corner-widget="<id>"` | change | reads sibling per-corner inputs, calls the widget's `updateValue` callback |
| `data-shaman-corner-toggle="<id>"` | click | swaps between all-sides and per-corner mode by reshaping the value |

## Layout: Padded vs Side-to-side

`Padded` → render wraps the `<img>` in a div with `padding: <policy>`.
`Side-to-side` → render wraps it with `padding: 0`.

Policy comes from `compliance.json`:

```jsonc
"tools": {
  "branded_image": {
    "containerPadding": "20px 20px 20px 20px"
  }
}
```

The row's padding is **never** mutated — earlier iterations did `saveDesign → mutate parent row → loadDesign` which produced a flicker and affected sibling tools. Now the image controls only its own container padding. If the author wants a true body-width bleed, they drop the image in a row with 0 padding (standard Unlayer convention) AND pick Side-to-side.

## Postmessage bridge

```
┌─ iframe (branded_image script) ───────┐    ┌─ host (React) ─────────────────────┐
│                                       │    │                                    │
│ click "Select from visual library"    │ ─→ │ listen for shaman:branded-image-   │
│   posts {type:"shaman:branded-image-  │    │   action with action="open"        │
│   action", action:"open"}             │    │ → open <VisualLibrary> modal       │
│                                       │    │ → user picks → modal closes        │
│                                       │ ←─ │ applyVisualLibrarySelection(editor,│
│                                       │    │   {id, name, url, alt})            │
│                                       │    │ writes assetUrl, assetId,          │
│                                       │    │ assetName, alt, _library into the  │
│                                       │    │ design and reloads it              │
│                                       │    │                                    │
│ click bin (data-shaman-action=clear)  │ ─→ │ applyVisualLibrarySelection with   │
│                                       │    │   {id:"", name:"(no image…)",      │
│                                       │    │    url:"", alt:""}                 │
└───────────────────────────────────────┘    └────────────────────────────────────┘
```

## Selection → values mapping

| `values.*` | Source |
|---|---|
| `assetUrl` | `cdnUrlHighRes ?? cdnUrlThumb` from the picked image |
| `assetId` | image ID as string |
| `assetName` | image `name` (filename) |
| `alt` | `altText` field on the image record (no fallback — empty if Shaman has none) |
| `_library` | `{url, name}` — drives the panel-side `library_picker` thumbnail |
| `layout` | `"padded"` (default) or `"bleed"` |
| `width` | `"auto"` (default) / `"25%"` / `"50%"` / `"75%"` / `"100%"` |
| `borderRadius` | CSS-shorthand string — `"8px"` or `"8px 16px 0px 0px"` |
| `linkAction` | Native Unlayer link shape: `{name: "web", values: {href, target}}` |

## Render output

Editor preview, web export, and email export all use the same `renderHtml`:

```html
<div style="padding:{policyOrZero};text-align:center;">
  <a href="{linkAction.values.href}" target="{linkAction.values.target}" rel="noopener" style="display:block;">  <!-- only if link set -->
    <img src="{assetUrl}"
         alt="{alt}"
         style="display:block;max-width:100%;height:auto;border:0;margin:0 auto;width:{width};border-radius:{borderRadius};" />
  </a>
</div>
```

Standard email-safe HTML. Renders identically in Outlook, Gmail, Apple Mail.

## Placeholder

Before an asset is picked the renderer falls back to Shaman's hosted placeholder:

```
https://placeholder.shamanqa.com/api/placeholder?type=large&emoji=📷&header=Add+Image&body=Select+image+from+library
```

This is the same placeholder Shaman shows in its own editor — keeps the visual continuous for authors used to Shaman. The URL is QA-pinned for this POC; production should resolve `placeholder.<shamancloud|shamandev|shamanqa>.com` per environment.

## Known limitations / out of scope

- **Single image per design instance** for `applyVisualLibrarySelection` and `applyRowPadding` heuristics — they target the *last* `branded_image` in the design. Multi-image flows need per-instance IDs.
- **No upload path** — by design. If non-BDS images ever become required, enterprise Unlayer supports custom upload callbacks (`tools.image.config.callbacks.uploadImage`) that could be wired without rebuilding the picker.
- **`SHAMAN_ACCOUNT_ID` and `SHAMAN_PRODUCT_ID` are hardcoded** in `src/App.tsx` (`shaman-onco-us` + product 2 = Xanlinax). Move to `compliance.json.context` when this stops being a POC.
- **Placeholder URL is QA-pinned.** Should be derived from env at build time.
