import { useMemo } from 'react';
import { EmailEditor, type EditorRef, type EmailEditorProps } from 'react-email-editor';
import { FRUZAQLA } from '../brand/fruzaqla';
import { brandToUnlayerOptions } from '../brand/toUnlayerOptions';
import { buildPreviewDisclosuresCustomJS } from '../blocks/preview-disclosures';
import { buildRegulatoryFooterCustomJS } from '../blocks/regulatory-footer';
import { buildLegalFooterCustomJS } from '../blocks/legal-footer';
import { REFERENCES_CUSTOM_JS } from '../blocks/references';
import { buildSingleInstanceCustomJS, type SingleInstanceEntry } from '../blocks/single-instance';
import type { CompliancePolicy } from '../policy/compliance';

interface UnlayerEditorProps {
  editorRef: React.RefObject<EditorRef | null>;
  projectId?: number;
  compliancePolicy: CompliancePolicy;
  onEditorReady?: () => void;
}

export function UnlayerEditor({ editorRef, projectId, compliancePolicy, onEditorReady }: UnlayerEditorProps) {
  const { options, bodyValues, trackedNames } = useMemo(() => {
    const { options: brandOptions, bodyValues } = brandToUnlayerOptions(FRUZAQLA);
    const { blocks, documentDefaults, documentContainer, linkConfig, context } = compliancePolicy;
    const ctx = {
      documentDefaults,
      documentContainer: documentContainer ?? {},
      contextProduct: context.product,
      linkConfig: linkConfig ?? {},
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
