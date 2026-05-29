import { useMemo } from 'react';
import { EmailEditor, type EditorRef, type EmailEditorProps } from 'react-email-editor';
import { FRUZAQLA } from '../brand/fruzaqla';
import { brandToUnlayerOptions } from '../brand/toUnlayerOptions';
import { buildPreviewDisclosuresCustomJS } from '../blocks/preview-disclosures';
import { buildRegulatoryFooterCustomJS } from '../blocks/regulatory-footer';
import { buildLegalFooterCustomJS } from '../blocks/legal-footer';
import { REFERENCES_CUSTOM_JS } from '../blocks/references';
import { buildSingleInstanceCustomJS, type SingleInstanceEntry } from '../blocks/single-instance';
import { buildBrandedImageCustomJS } from '../blocks/branded-image';
import type { CompliancePolicy } from '../policy/compliance';

interface UnlayerEditorProps {
  editorRef: React.RefObject<EditorRef | null>;
  projectId?: number;
  compliancePolicy: CompliancePolicy;
  onEditorReady?: () => void;
  // Triggered when the branded_image tool's "Open Visual Library" is clicked.
  onOpenVisualLibrary?: () => void;
}

// Apply a Visual Library selection by mutating the most-recently-added
// branded_image in the design. Called by the host after the modal selects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyVisualLibrarySelection(editor: any, picked: { id: string | number; name: string; url: string; alt?: string }) {
  editor.saveDesign((design: { body?: { rows?: Array<Record<string, unknown>> } }) => {
    const rows = design?.body?.rows ?? [];
    let target: Record<string, unknown> | null = null;
    for (const r of rows) {
      const cols = (r as { columns?: Array<{ contents?: Array<Record<string, unknown>> }> }).columns ?? [];
      for (const c of cols) {
        for (const x of c.contents ?? []) {
          const slug = (x.slug || (typeof x.type === 'string' && x.type.startsWith('custom#') ? x.type.slice(7) : null)) as string | null;
          if (slug === 'branded_image') target = x;
        }
      }
    }
    if (!target) return;
    const values = (target.values ?? {}) as Record<string, unknown>;
    values.assetUrl = picked.url;
    values.assetId = String(picked.id);
    values.assetName = picked.name;
    // Use only Shaman's AI-authored alt text. If absent, leave alt empty.
    // Always overwrite — picking a new image should reset the alt accordingly.
    values.alt = picked.alt ?? '';
    // Sync the library_picker widget value so the panel thumbnail + bin update.
    values._library = { url: picked.url, name: picked.name };
    target.values = values;
    editor.loadDesign(design);
  });
}

export function UnlayerEditor({ editorRef, projectId, compliancePolicy, onEditorReady, onOpenVisualLibrary }: UnlayerEditorProps) {
  const { options, bodyValues, trackedNames } = useMemo(() => {
    const { options: brandOptions, bodyValues } = brandToUnlayerOptions(FRUZAQLA);
    const { blocks, documentDefaults, documentContainer, linkConfig, tools, context } = compliancePolicy;
    const ctx = {
      documentDefaults,
      documentContainer: documentContainer ?? {},
      contextProduct: context.product,
      linkConfig: linkConfig ?? {},
      tools: tools ?? {},
    };
    // Compact positions: enabled compliance blocks always occupy 1..N regardless
    // of which ones are disabled, so Unlayer's built-in tools don't slip into the
    // gap (e.g. "Button" sliding into position 1 when preview_disclosures is off).
    const enabledOrder = [
      { key: 'preview_disclosures', position: blocks.preview_disclosures.position, enabled: blocks.preview_disclosures.enabled },
      { key: 'regulatory_footer', position: blocks.regulatory_footer.position, enabled: blocks.regulatory_footer.enabled },
      { key: 'legal_footer', position: blocks.legal_footer.position, enabled: blocks.legal_footer.enabled },
    ]
      .filter((b) => b.enabled)
      .sort((a, b) => a.position - b.position);
    const compactPos: Record<string, number> = {};
    enabledOrder.forEach((b, i) => {
      compactPos[b.key] = i + 1;
    });

    const tracked: SingleInstanceEntry[] = [];
    const customJS: string[] = [];
    if (blocks.preview_disclosures.enabled) {
      customJS.push(buildPreviewDisclosuresCustomJS({ ...blocks.preview_disclosures, position: compactPos.preview_disclosures }, ctx));
      tracked.push({ name: 'preview_disclosures', label: blocks.preview_disclosures.label, required: blocks.preview_disclosures.required ?? false });
    }
    if (blocks.regulatory_footer.enabled) {
      customJS.push(buildRegulatoryFooterCustomJS({ ...blocks.regulatory_footer, position: compactPos.regulatory_footer }, ctx));
      tracked.push({ name: 'regulatory_footer', label: blocks.regulatory_footer.label, required: blocks.regulatory_footer.required ?? false });
    }
    if (blocks.legal_footer.enabled) {
      customJS.push(buildLegalFooterCustomJS({ ...blocks.legal_footer, position: compactPos.legal_footer }, ctx));
      tracked.push({ name: 'legal_footer', label: blocks.legal_footer.label, required: blocks.legal_footer.required ?? false });
    }
    // The branded image tool slots right after the compliance blocks so it
    // sits near the Content panel top, ahead of the built-in tools.
    customJS.push(buildBrandedImageCustomJS(ctx, enabledOrder.length + 1));
    customJS.push(REFERENCES_CUSTOM_JS, buildSingleInstanceCustomJS(tracked));
    return { options: { ...brandOptions, customJS }, bodyValues, trackedNames: tracked.map((t) => t.name) };
  }, [compliancePolicy]);

  const onReady: EmailEditorProps['onReady'] = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = (editorRef.current as any)?.editor;
    if (!editor) return;

    editor.loadDesign({
      body: {
        id: 'default-body',
        rows: [],
        headers: [],
        footers: [],
        values: bodyValues,
      },
    });

    // Track which compliance custom tools are present and post state to the
    // editor iframe so single-instance.ts can lock/unlock their tiles.
    // Tracked list is driven by which blocks were enabled in the policy.
    const broadcast = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.saveDesign((design: any) => {
        const added: Record<string, boolean> = {};
        (design?.body?.rows ?? []).forEach((r: { columns?: { contents?: Record<string, unknown>[] }[] }) => {
          (r.columns ?? []).forEach((c) => {
            (c.contents ?? []).forEach((x) => {
              const slug = (x.slug ||
                (typeof x.type === 'string' && x.type.startsWith('custom#') ? x.type.slice(7) : null)) as string | null;
              if (slug && trackedNames.includes(slug)) {
                added[slug] = true;
              }
            });
          });
        });
        const iframe = document.querySelector<HTMLIFrameElement>('iframe');
        iframe?.contentWindow?.postMessage({ type: 'shaman:tool-state', added }, '*');
      });
    };

    editor.addEventListener('design:loaded', broadcast);
    editor.addEventListener('design:updated', broadcast);
    editor.addEventListener('content:added', broadcast);
    editor.addEventListener('content:removed', broadcast);
    // Initial state
    setTimeout(broadcast, 200);

    // Branded image bridge: forward "open Visual Library" requests from the
    // iframe to the host, and handle "layout changed" by mutating the parent
    // row's padding so side-to-side renders edge-to-edge in every email client.
    const bridge = (e: MessageEvent) => {
      const data = e.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'shaman:open-visual-library' || (data.type === 'shaman:branded-image-action' && data.action === 'open')) {
        onOpenVisualLibrary?.();
      }
      if (data.type === 'shaman:branded-image-action' && data.action === 'clear') {
        applyVisualLibrarySelection(editor, { id: '', name: '(no image selected)', url: '' });
      }
      // Layout (Padded/Side-to-side) now controls the image's own container
      // padding directly — no row mutation needed.
    };
    window.addEventListener('message', bridge);

    onEditorReady?.();
  };

  return (
    <div className="unlayer-editor-wrapper">
      <EmailEditor
        ref={editorRef}
        onReady={onReady}
        projectId={projectId}
        minHeight="100%"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options={options as any}
      />
    </div>
  );
}
