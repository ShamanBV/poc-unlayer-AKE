// Shaman BDS + image library fetchers.
//
// Strategy: real API first (via Vite proxy → apryse-designer Docker on
// localhost:3001), mock fallback when that's unreachable.
//
// Response shape mirrors apryse-designer's GET /api/shaman/bds and
// GET /api/shaman/images so the React UI works against either source
// without conditional branches.
//
// Each fetcher returns a `source` flag so the picker can surface a
// "Showing mock library — apryse-designer not reachable" banner.

export interface BdsAsset {
  id: number | string;
  name: string;
  cdnUrlThumb: string | null;
  cdnUrlHighRes: string | null;
  tags?: { id: number; name: string }[];
  // Single source of truth for alt text. Shaman's AI populates it on upload;
  // users can override via the image-info dialog. Empty/null when neither has
  // been applied (older uploads predate the AI alt-text pipeline).
  altText?: string | null;
}

export function getAltText(asset: BdsAsset): string {
  return asset.altText ?? '';
}

// Legacy single-tag shape used by the legal-footer logo picker.
export interface BdsAssetLegacy {
  id: string;
  label: string;
  tag: string;
  url: string;
}

// ── Mock data ───────────────────────────────────────────────────────────────
// SVG data URLs — no network dependency, always render. Sized to roughly match
// the categories so the picker looks alive: hero images at 600×300, icons at
// 64×64, logo wordmarks at 200×60. The Novartis wordmark uses the real
// Wikimedia PNG so at least one logo looks authentic.

function svgDataUrl(label: string, color: string, w = 600, h = 300, fg = '#fff'): string {
  const fontSize = Math.round(h / 6);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>` +
    `<rect width='${w}' height='${h}' fill='${color}'/>` +
    `<text x='50%' y='50%' font-family='Arial,Helvetica,sans-serif' font-size='${fontSize}' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const NOVARTIS_LOGO_PRIMARY = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/320px-Novartis-Logo.svg.png';
const NOVARTIS_LOGO_COMPACT = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/160px-Novartis-Logo.svg.png';

const LOGOS: BdsAsset[] = [
  { id: 1, name: 'Novartis — Primary',         cdnUrlThumb: NOVARTIS_LOGO_PRIMARY,                          cdnUrlHighRes: NOVARTIS_LOGO_PRIMARY,                          tags: [{ id: 1, name: 'BDS logo' }],   altText: 'Novartis corporate logo' },
  { id: 2, name: 'Novartis — Compact',         cdnUrlThumb: NOVARTIS_LOGO_COMPACT,                          cdnUrlHighRes: NOVARTIS_LOGO_COMPACT,                          tags: [{ id: 1, name: 'BDS logo' }],   altText: 'Novartis corporate logo (compact)' },
  { id: 3, name: 'Xanlinax — Wordmark',        cdnUrlThumb: svgDataUrl('XANLINAX', '#B9294F', 240, 60),     cdnUrlHighRes: svgDataUrl('XANLINAX', '#B9294F', 240, 60),     tags: [{ id: 2, name: 'Brand logo' }], altText: 'Xanlinax product wordmark' },
  { id: 4, name: 'Xanlinax — Tagline',         cdnUrlThumb: svgDataUrl('XANLINAX  •  fast & measurable', '#B9294F', 320, 60, '#fff'), cdnUrlHighRes: svgDataUrl('XANLINAX  •  fast & measurable', '#B9294F', 320, 60, '#fff'), tags: [{ id: 2, name: 'Brand logo' }], altText: 'Xanlinax wordmark with tagline' },
  { id: 5, name: 'Scemblix — Wordmark',        cdnUrlThumb: svgDataUrl('SCEMBLIX', '#8b0e3a', 240, 60),     cdnUrlHighRes: svgDataUrl('SCEMBLIX', '#8b0e3a', 240, 60),     tags: [{ id: 2, name: 'Brand logo' }], altText: 'Scemblix product wordmark' },
  { id: 6, name: 'Co-brand strip',             cdnUrlThumb: svgDataUrl('Novartis  ✕  Xanlinax', '#371E31', 320, 60), cdnUrlHighRes: svgDataUrl('Novartis  ✕  Xanlinax', '#371E31', 320, 60), tags: [{ id: 1, name: 'BDS logo' }], altText: 'Novartis × Xanlinax co-brand lockup' },
];

const HERO_IMAGES: BdsAsset[] = [
  { id: 100, name: 'Patient — running outdoors',     cdnUrlThumb: svgDataUrl('Patient running',           '#B9294F'), cdnUrlHighRes: svgDataUrl('Patient running',           '#B9294F'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Patient running outdoors, conveying mobility' },
  { id: 101, name: 'Older woman smiling',             cdnUrlThumb: svgDataUrl('Older woman smiling',       '#AF7049'), cdnUrlHighRes: svgDataUrl('Older woman smiling',       '#AF7049'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Portrait of an older woman smiling outdoors' },
  { id: 102, name: 'HCP consultation',                cdnUrlThumb: svgDataUrl('HCP consultation',          '#2a5d8f'), cdnUrlHighRes: svgDataUrl('HCP consultation',          '#2a5d8f'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Doctor consulting patient in clinic setting' },
  { id: 103, name: 'Lab — Microscope view',          cdnUrlThumb: svgDataUrl('Lab — Microscope',         '#2c7a5d'), cdnUrlHighRes: svgDataUrl('Lab — Microscope',         '#2c7a5d'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Researcher at microscope, lab setting' },
  { id: 104, name: 'Abstract pattern — warm',         cdnUrlThumb: svgDataUrl('Abstract — warm',          '#F7D0A3', 600, 300, '#371E31'), cdnUrlHighRes: svgDataUrl('Abstract — warm', '#F7D0A3', 600, 300, '#371E31'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Warm abstract pattern, brand colours' },
  { id: 105, name: 'Abstract pattern — cool',         cdnUrlThumb: svgDataUrl('Abstract — cool',          '#4a3a8b'), cdnUrlHighRes: svgDataUrl('Abstract — cool',          '#4a3a8b'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Cool abstract pattern, brand colours' },
  { id: 106, name: 'Header — Webinar invite',        cdnUrlThumb: svgDataUrl('Webinar invite',            '#371E31'), cdnUrlHighRes: svgDataUrl('Webinar invite',            '#371E31'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Header banner for a webinar invite email' },
  { id: 107, name: 'Header — First defense',         cdnUrlThumb: svgDataUrl('First defense',             '#5d2a3a'), cdnUrlHighRes: svgDataUrl('First defense',             '#5d2a3a'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Marketing header — first defense theme' },
  { id: 108, name: 'Header — Measured response',     cdnUrlThumb: svgDataUrl('Measured response',         '#B9294F'), cdnUrlHighRes: svgDataUrl('Measured response',         '#B9294F'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Marketing header — measured response theme' },
  { id: 109, name: 'Hero — Forest plot illustration', cdnUrlThumb: svgDataUrl('Forest plot',              '#323232'), cdnUrlHighRes: svgDataUrl('Forest plot',              '#323232'), tags: [{ id: 3, name: 'BDS source assets' }], altText: 'Forest plot showing hazard ratios for death by patient subgroup' },
];

const ICONS: BdsAsset[] = [
  { id: 200, name: 'Pill',            cdnUrlThumb: svgDataUrl('💊',  '#B9294F', 64, 64), cdnUrlHighRes: svgDataUrl('💊',  '#B9294F', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 201, name: 'Doctor',          cdnUrlThumb: svgDataUrl('🩺',  '#2a5d8f', 64, 64), cdnUrlHighRes: svgDataUrl('🩺',  '#2a5d8f', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 202, name: 'Heart',           cdnUrlThumb: svgDataUrl('❤',   '#c0392b', 64, 64), cdnUrlHighRes: svgDataUrl('❤',   '#c0392b', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 203, name: 'Microscope',      cdnUrlThumb: svgDataUrl('🔬',  '#2c7a5d', 64, 64), cdnUrlHighRes: svgDataUrl('🔬',  '#2c7a5d', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 204, name: 'Calendar',        cdnUrlThumb: svgDataUrl('📅',  '#371E31', 64, 64), cdnUrlHighRes: svgDataUrl('📅',  '#371E31', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 205, name: 'Document',        cdnUrlThumb: svgDataUrl('📄',  '#6b6f72', 64, 64), cdnUrlHighRes: svgDataUrl('📄',  '#6b6f72', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 206, name: 'Chart',           cdnUrlThumb: svgDataUrl('📊',  '#2a5d8f', 64, 64), cdnUrlHighRes: svgDataUrl('📊',  '#2a5d8f', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 207, name: 'Email',           cdnUrlThumb: svgDataUrl('✉',   '#AF7049', 64, 64), cdnUrlHighRes: svgDataUrl('✉',   '#AF7049', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 208, name: 'Phone',           cdnUrlThumb: svgDataUrl('☎',   '#2c7a5d', 64, 64), cdnUrlHighRes: svgDataUrl('☎',   '#2c7a5d', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
  { id: 209, name: 'Warning triangle',cdnUrlThumb: svgDataUrl('⚠',   '#CC1478', 64, 64), cdnUrlHighRes: svgDataUrl('⚠',   '#CC1478', 64, 64), tags: [{ id: 4, name: 'BDS icon' }], altText: '' },
];

const GENERAL_IMAGES: BdsAsset[] = [...LOGOS, ...HERO_IMAGES, ...ICONS];

// ── Public types & fetchers ─────────────────────────────────────────────────

export type DataSource = 'api' | 'mock';

export interface BdsResponse {
  logos: BdsAsset[];
  heroImages: BdsAsset[];
  icons: BdsAsset[];
  source: DataSource;
}

export interface ImagesResponse {
  images: BdsAsset[];
  total: number;
  source: DataSource;
}

const PROXY_TIMEOUT_MS = 8000;

async function tryFetchJson<T>(url: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchBds(accountId: string, productId?: number): Promise<BdsResponse> {
  const params = new URLSearchParams({ accountId });
  if (productId != null) params.set('productId', String(productId));
  const real = await tryFetchJson<Omit<BdsResponse, 'source'>>(`/api/shaman/bds?${params}`);
  if (real && (real.logos || real.heroImages || real.icons)) {
    return {
      logos: real.logos ?? [],
      heroImages: real.heroImages ?? [],
      icons: real.icons ?? [],
      source: 'api',
    };
  }
  console.warn('[bds] real API unreachable — using local mock');
  return { logos: LOGOS, heroImages: HERO_IMAGES, icons: ICONS, source: 'mock' };
}

export async function fetchImages(accountId: string, search = ''): Promise<ImagesResponse> {
  const params = new URLSearchParams({ accountId, limit: '100' });
  if (search) params.set('search', search);
  const real = await tryFetchJson<Omit<ImagesResponse, 'source'>>(`/api/shaman/images?${params}`);
  if (real && real.images) {
    return { images: real.images, total: real.total ?? real.images.length, source: 'api' };
  }
  const term = search.toLowerCase().trim();
  const matched = term
    ? GENERAL_IMAGES.filter((img) => img.name.toLowerCase().includes(term))
    : GENERAL_IMAGES;
  return { images: matched, total: matched.length, source: 'mock' };
}

// ── Legacy single-tag helpers (legal-footer logo picker) ────────────────────
// Kept so the existing logo dropdown keeps working without changes.

const LEGACY_BY_TAG: Record<string, BdsAssetLegacy[]> = {
  'BDS-logo': [
    { id: 'asset_novartis_primary', label: 'Novartis — Primary', tag: 'BDS-logo', url: NOVARTIS_LOGO_PRIMARY },
    { id: 'asset_novartis_compact', label: 'Novartis — Compact', tag: 'BDS-logo', url: NOVARTIS_LOGO_COMPACT },
    { id: 'asset_xanlinax_wordmark', label: 'Xanlinax — Wordmark', tag: 'BDS-logo', url: svgDataUrl('XANLINAX', '#B9294F', 240, 60) },
    { id: 'asset_scemblix_wordmark', label: 'Scemblix — Wordmark', tag: 'BDS-logo', url: svgDataUrl('SCEMBLIX', '#8b0e3a', 240, 60) },
  ],
};

export function fetchAssetsByTag(tag: string): BdsAssetLegacy[] {
  return LEGACY_BY_TAG[tag] ?? [];
}

export function resolveAssetUrl(assetId: string): string | null {
  for (const tag of Object.keys(LEGACY_BY_TAG)) {
    const found = LEGACY_BY_TAG[tag].find((a) => a.id === assetId);
    if (found) return found.url;
  }
  return null;
}
