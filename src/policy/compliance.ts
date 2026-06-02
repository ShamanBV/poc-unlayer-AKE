// Compliance policy v3 — per-country file, brand cascade, language-keyed text.
//
// At runtime the active brand and language come from URL params
// (?brand=<vaultid>&lang=<iso639>). In production Shaman will pass these
// from email metadata. Brand-level entries always override the country
// level. Missing brand text for a type='brand' element is a render error.

// ── Common building blocks (unchanged from v2.1) ─────────────────────────────

export interface DocumentDefaults {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  color?: string;
  lineHeight?: string;
  textAlign?: string;
}

export interface LayoutOverride {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number | string;
  color?: string;
  lineHeight?: string;
  textAlign?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface BorderSpec {
  color: string;
  width: string;
  style: string;
  radius: string;
}

export interface ContainerSpec {
  backgroundColor?: string;
  padding?: string;
  border?: BorderSpec;
  marginTop?: string;
}

export interface Spacing {
  marginTop?: string;
  marginBottom?: string;
}

export type PlaceholderKind = 'external_link' | 'email_link' | 'merge_field' | 'plain';

export interface Placeholder {
  key: string;
  kind: PlaceholderKind;
  anchorText: string;
  uri?: string;
}

export type LocalizedText = Record<string, string>;

// ── Element sources (text + placeholders) ────────────────────────────────────

export interface ElementSource {
  text: LocalizedText;
  placeholders?: Placeholder[];
}

export interface VariantSource {
  id: string;
  note?: string;
  deprecated?: boolean;
  text: LocalizedText;
  placeholders?: Placeholder[];
}

// ── Elements: country-level vs brand-level ──────────────────────────────────

export interface CountryElement {
  id: string;
  slot: string;
  label?: string;
  order: number;
  type: 'country';
  layout?: LayoutOverride;
  spacing?: Spacing;
  kbMeta?: Record<string, unknown>;
  // Text lives on the element itself for country-type.
  default: ElementSource;
  variants?: VariantSource[];
}

export interface BrandElement {
  id: string;
  slot: string;
  label?: string;
  order: number;
  type: 'brand';
  layout?: LayoutOverride;
  spacing?: Spacing;
  kbMeta?: Record<string, unknown>;
  // No text here — must come from brands[active].blocks[blockId][id].
}

export type Element = CountryElement | BrandElement;

export interface BrandElementOverride {
  default: ElementSource;
  variants?: VariantSource[];
}

export interface Brand {
  name: string;
  vaultid: string;
  blocks: {
    [blockId: string]: {
      [elementId: string]: BrandElementOverride;
    };
  };
}

// ── Block structure ─────────────────────────────────────────────────────────

export interface SubContainer {
  id: string;
  label?: string;
  layout?: LayoutOverride;
  container?: ContainerSpec;
  elementSpacing?: string;
}

export interface BlockBase {
  enabled: boolean;
  required?: boolean;
  order: number;
  label: string;
  layout?: LayoutOverride;
  container?: ContainerSpec;
  containers?: SubContainer[];
  slotRouting?: Record<string, string | null>;
  slotStyles?: Record<string, LayoutOverride>;
  elements: Element[];
}

export interface LegalFooterLogo {
  enabled: boolean;
  assetTag: string;
  assetId: string;
  width: string;
  alt: string;
  spacing?: Spacing;
}

export interface LegalFooterApprovalCode {
  enabled: boolean;
  mlrDocumentId: string | null;
  fallbackPlaceholder: string;
  layout?: LayoutOverride;
  spacing?: Spacing;
}

export interface LegalFooterBlock extends BlockBase {
  logo: LegalFooterLogo;
  approvalCode: LegalFooterApprovalCode;
}

// ── Top-level policy ────────────────────────────────────────────────────────

export interface CompliancePolicy {
  $schema?: string;
  version: string;
  country: string;
  countryVaultid: string;
  language: string;        // fallback language if URL ?lang= absent
  languages: string[];     // languages provided by this file
  documentDefaults: DocumentDefaults;
  documentContainer?: ContainerSpec;
  blocks: {
    preview_disclosures: BlockBase;
    regulatory_footer: BlockBase;
    legal_footer: LegalFooterBlock;
  };
  brands: Brand[];
}

// ── Build context (passed to block factories) ───────────────────────────────

export interface BuildContext {
  documentDefaults: DocumentDefaults;
  documentContainer: ContainerSpec;
  language: string;
  selectedBrand: Brand;
}

// ── Resolved element (what the factories actually work with) ────────────────
// Brand override + language pick + canonical-as-first-variant already applied.

export interface ResolvedVariant {
  id: string;
  text: string;
  placeholders: Placeholder[];
  note?: string;
  deprecated?: boolean;
}

export interface ResolvedElement {
  id: string;
  slot: string;
  label?: string;
  order: number;
  layout?: LayoutOverride;
  spacing?: Spacing;
  defaultVariantId: string;        // always "default"
  variants: ResolvedVariant[];     // [canonical, ...explicit variants]
}

export class ComplianceResolveError extends Error {}

export function resolveElement(
  el: Element,
  blockId: string,
  brand: Brand,
  language: string,
): ResolvedElement {
  // 1. Look for brand-level override first
  const override = brand.blocks?.[blockId]?.[el.id];
  let source: { default: ElementSource; variants?: VariantSource[] } | undefined;
  if (override) {
    source = { default: override.default, variants: override.variants };
  } else if (el.type === 'country') {
    source = { default: (el as CountryElement).default, variants: (el as CountryElement).variants };
  } else {
    throw new ComplianceResolveError(
      `Missing brand text for ${blockId}.${el.id} (brand vaultid=${brand.vaultid}, type=brand)`,
    );
  }

  const pickText = (lt: LocalizedText, id: string): string => {
    const t = lt?.[language];
    if (t == null) {
      throw new ComplianceResolveError(
        `Missing '${language}' translation for ${blockId}.${el.id}/${id}`,
      );
    }
    return t;
  };

  const canonical: ResolvedVariant = {
    id: 'default',
    text: pickText(source.default.text, 'default'),
    placeholders: source.default.placeholders ?? [],
    note: 'Default',
  };

  const explicit: ResolvedVariant[] = (source.variants ?? []).map((v) => ({
    id: v.id,
    text: pickText(v.text, v.id),
    placeholders: v.placeholders ?? [],
    note: v.note,
    deprecated: v.deprecated,
  }));

  return {
    id: el.id,
    slot: el.slot,
    label: el.label,
    order: el.order,
    layout: el.layout,
    spacing: el.spacing,
    defaultVariantId: 'default',
    variants: [canonical, ...explicit],
  };
}

export async function loadCompliancePolicy(url = '/compliance.json'): Promise<CompliancePolicy> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load compliance policy: ${res.status}`);
  return (await res.json()) as CompliancePolicy;
}
