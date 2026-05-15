import type { BrandDefinition } from './fruzaqla';

// Maps a Shaman BDS brand definition to Unlayer EmailEditor `options` shape.
// Returns the bits that go into <EmailEditor options={...} /> and the body
// values used by editor.loadDesign({ body: { ... } }) on first ready.

export interface UnlayerInit {
  options: Record<string, unknown>;
  bodyValues: Record<string, unknown>;
}

export function brandToUnlayerOptions(brand: BrandDefinition): UnlayerInit {
  const fontFamily = { label: 'Arial', value: brand.body.fontFamily };
  const presetColors = brand.colors.map((c) => c.hex);

  const bodyValues = {
    backgroundColor: brand.body.backgroundColor,
    contentWidth: brand.body.contentWidth,
    fontFamily,
    textColor: brand.body.textColor,
    linkStyle: {
      body: true,
      linkColor: brand.body.linkColor,
      linkHoverColor: brand.body.linkHoverColor,
      linkUnderline: true,
      linkHoverUnderline: true,
      inherit: false,
    },
  };

  const options: Record<string, unknown> = {
    appearance: { theme: 'classic_light' },
    customCSS: [
      `.segmented-control-item.selected { background-color: #00A66F !important; color: #fff !important; }`,
      `.nav-link:has([data-icon="code"]) { display: none !important; }`,
      `.nav-link:has([data-icon="image"]) { display: none !important; }`,
      `.blockbuilder-content-tool[data-tool-type="row"] { display: none !important; }`,
      // ── Single-instance tools: TODO badge & "added" disabled state ──
      `.blockbuilder-content-tool.shaman-tool-todo { position: relative; }`,
      `.blockbuilder-content-tool.shaman-tool-todo::after {
         content: "";
         position: absolute;
         top: 6px;
         right: 6px;
         width: 18px;
         height: 18px;
         background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23CC1478'><path d='M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'/></svg>");
         background-repeat: no-repeat;
         background-position: center;
         background-size: contain;
       }`,
      `.blockbuilder-content-tool.shaman-tool-added {
         opacity: 0.4;
         cursor: not-allowed !important;
       }`,
      `.blockbuilder-content-tool.shaman-tool-added * { cursor: not-allowed !important; }`,
      // ── Rich-text toolbar (TinyMCE-based) customisation ───────────────
      // 1. Hide individual buttons by accessibility label.
      `[aria-label="Strikethrough"],
       [aria-label="Justify"] { display: none !important; }`,
      // 2. Hide entire toolbar groups whose only purpose is bullets/numbered
      //    (so no empty group leaves a flex gap).
      `.tox-toolbar__group:has([aria-label="Bullet list"]),
       .tox-toolbar__group:has([aria-label="Numbered list"]) { display: none !important; }`,
      // 3. Hide font family without affecting font size — both are
      //    .tox-tbtn--bespoke; font size's label contains "size".
      `.tox-tbtn--bespoke:not([aria-label*="size" i]) { display: none !important; }`,
      // 4. Also hide the toolbar group that contains *only* font family
      //    (if it sits in its own group, this collapses the leftover slot).
      `.tox-toolbar__group:has(.tox-tbtn--bespoke):not(:has([aria-label*="size" i])) { display: none !important; }`,
      // 5. Reorder: place the Bold/Italic/Underline group before everything
      //    else (default order: 0; -1 puts B/I/U first).
      `.tox-toolbar__group:has([aria-label="Bold"]) { order: -1; }`,
      // 6. Left-align toolbar rows. The default group has flex:1 1 0% +
      //    justify-content:flex-end which makes the last group expand and
      //    right-align its content. Force groups to content-size and inner
      //    content to flex-start.
      `.tox-toolbar, .tox-toolbar__primary { justify-content: flex-start !important; }`,
      `.tox-toolbar__group { flex: 0 0 auto !important; justify-content: flex-start !important; }`,
    ],
    displayMode: 'email',
    tabs: {
      content: { enabled: true, position: 1 },
      blocks: { enabled: true, position: 2 },
      body: { enabled: true, position: 3 },
      images: { enabled: false },
      uploads: { enabled: true, position: 5 },
    },
    fonts: { showDefaultFonts: true },
    tools: {
      table: { enabled: true },
      menu: { enabled: false },
      heading: {
        properties: {
          fontFamily: { value: fontFamily },
          color: { value: brand.headings.h2.color },
          fontSize: { value: brand.headings.h2.fontSize },
          fontWeight: { value: 'bold' },
          textAlign: { value: brand.headings.h2.textAlign },
          containerPadding: { value: '25px 40px 15px 40px' },
          lineHeight: { value: brand.headings.h2.lineHeight },
        },
      },
      text: {
        properties: {
          fontFamily: { value: fontFamily },
          color: { value: brand.body.textColor },
          fontSize: { value: '16px' },
          textAlign: { value: brand.body.textAlign },
          containerPadding: { value: '0px 40px 30px 40px' },
          lineHeight: { value: brand.body.lineHeight },
        },
      },
      button: {
        properties: {
          buttonColors: {
            value: {
              color: brand.buttons.primary.color,
              backgroundColor: brand.buttons.primary.backgroundColor,
              hoverColor: brand.buttons.primary.hoverColor,
              hoverBackgroundColor: brand.buttons.primary.hoverBackgroundColor,
            },
          },
          fontSize: { value: brand.buttons.primary.fontSize },
          fontWeight: { value: 'bold' },
          borderRadius: { value: brand.buttons.primary.borderRadius },
          padding: { value: brand.buttons.primary.padding },
          containerPadding: { value: '25px' },
          textAlign: { value: 'center' },
        },
      },
      divider: {
        properties: {
          border: {
            value: {
              borderTopWidth: '2px',
              borderTopStyle: brand.divider.borderTopStyle,
              borderTopColor: brand.divider.borderTopColor,
            },
          },
          containerPadding: { value: '10px 40px' },
        },
      },
      image: {
        properties: {
          textAlign: { value: 'center' },
          containerPadding: { value: '0px' },
        },
      },
    },
    features: {
      textEditor: { tables: true, inlineFontControls: false, defaultFontSize: '13px' },
      audit: false,
      ai: false,
      colorPicker: {
        presets: presetColors,
        colors: [
          {
            id: 'fruzaqla',
            label: 'Fruzaqla',
            colors: presetColors,
            default: true,
          },
        ],
      },
    },
    editor: {
      minWidth: parseInt(brand.body.contentWidth, 10) || 600,
      maxWidth: parseInt(brand.body.contentWidth, 10) || 600,
    },
    designTags: {},
    body: { values: bodyValues },
  };

  return { options, bodyValues };
}
