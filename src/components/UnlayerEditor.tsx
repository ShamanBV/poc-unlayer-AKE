import { EmailEditor, type EditorRef, type EmailEditorProps } from 'react-email-editor';
import { FRUZAQLA } from '../brand/fruzaqla';
import { brandToUnlayerOptions } from '../brand/toUnlayerOptions';
import { PREVIEW_DISCLOSURES_CUSTOM_JS } from '../blocks/preview-disclosures';
import { REGULATORY_FOOTER_CUSTOM_JS } from '../blocks/regulatory-footer';
import { LEGAL_FOOTER_CUSTOM_JS } from '../blocks/legal-footer';
import { REFERENCES_CUSTOM_JS } from '../blocks/references';
import { SINGLE_INSTANCE_CUSTOM_JS } from '../blocks/single-instance';

interface UnlayerEditorProps {
  editorRef: React.RefObject<EditorRef | null>;
  projectId?: number;
  onEditorReady?: () => void;
}

const { options: brandOptions, bodyValues } = brandToUnlayerOptions(FRUZAQLA);
const options = {
  ...brandOptions,
  customJS: [
    PREVIEW_DISCLOSURES_CUSTOM_JS,
    REGULATORY_FOOTER_CUSTOM_JS,
    LEGAL_FOOTER_CUSTOM_JS,
    REFERENCES_CUSTOM_JS,
    SINGLE_INSTANCE_CUSTOM_JS,
  ],
};

export function UnlayerEditor({ editorRef, projectId, onEditorReady }: UnlayerEditorProps) {
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

    // Track which tracked custom tools are present and post state to the
    // editor iframe so single-instance.ts can lock/unlock their tiles.
    const TRACKED = ['preview_disclosures', 'regulatory_footer', 'legal_footer'];

    const broadcast = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.saveDesign((design: any) => {
        const added: Record<string, boolean> = {};
        (design?.body?.rows ?? []).forEach((r: { columns?: { contents?: Record<string, unknown>[] }[] }) => {
          (r.columns ?? []).forEach((c) => {
            (c.contents ?? []).forEach((x) => {
              const slug = (x.slug ||
                (typeof x.type === 'string' && x.type.startsWith('custom#') ? x.type.slice(7) : null)) as string | null;
              if (slug && TRACKED.includes(slug)) {
                added[slug] = true;
                console.log('[shaman:debug] full content node:', JSON.parse(JSON.stringify(x)));
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
