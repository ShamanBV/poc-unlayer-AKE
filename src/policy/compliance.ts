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

export interface Variant {
  id: string;
  order: number;
  count?: number;
  text: string;
  note?: string;
  product?: string;
  placeholders?: Placeholder[];
  deprecated?: boolean;
}

export interface Element {
  id: string;
  slot: string;
  label?: string;
  displayOrder: number;
  defaultVariantId: string;
  variants: Variant[];
  layout?: LayoutOverride;
  spacing?: Spacing;
  kbMeta?: Record<string, unknown>;
}

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
  position: number;
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

export interface LinkConfig {
  // Suffix appended to every external_link href (e.g. UTM string).
  // Smart-joined: starts with "?" but switched to "&" if URI already has a query.
  hrefSuffix?: string;
}

// Per-tool defaults — mirrors Apryse's brand policy shape
// (config.tools.<tool>.properties.<prop>.value). For the POC we only carry
// containerPadding for branded_image; extend as more tools need policy-driven
// defaults.
export interface ToolDefaults {
  branded_image?: {
    containerPadding?: string;
  };
}

export interface CompliancePolicy {
  $schema?: string;
  version: string;
  context: {
    company: string;
    country: string;
    language: string;
    product: string;
    kbSnapshotId?: string;
  };
  documentDefaults: DocumentDefaults;
  documentContainer?: ContainerSpec;
  linkConfig?: LinkConfig;
  tools?: ToolDefaults;
  blocks: {
    preview_disclosures: BlockBase;
    regulatory_footer: BlockBase;
    legal_footer: LegalFooterBlock;
  };
}

export interface BuildContext {
  documentDefaults: DocumentDefaults;
  documentContainer: ContainerSpec;
  contextProduct: string;
  linkConfig: LinkConfig;
  tools: ToolDefaults;
}

export async function loadCompliancePolicy(url = '/compliance.json'): Promise<CompliancePolicy> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load compliance policy: ${res.status}`);
  return (await res.json()) as CompliancePolicy;
}

// Drop variants whose `product` is set to something other than the active
// product. Variants without a `product` field are market-general — always kept.
export function filterVariantsByProduct(variants: Variant[], product: string): Variant[] {
  return variants.filter((v) => !v.product || v.product === product);
}
