// Mock for the Shaman Brand Design System (BDS) + image library.
//
// Response shape mirrors the composite editor's GET /api/shaman/bds and
// GET /api/shaman/images so the React UI can be reused as-is. In production
// these calls would go through Vite's proxy to the running composite editor
// Next.js dev server (or directly to Shaman QA).

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

// Legacy single-tag shape used by the legal-footer logo picker. Kept for
// backwards compatibility.
export interface BdsAssetLegacy {
  id: string;
  label: string;
  tag: string;
  url: string;
}

// Inline SVG data URLs — no network dependency, always render. We keep the
// real Novartis SVG from Wikimedia so the logo looks like an actual logo.
function svgDataUrl(label: string, color: string, w = 600, h = 300): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'>` +
    `<rect width='${w}' height='${h}' fill='${color}'/>` +
    `<text x='50%' y='50%' font-family='Arial,Helvetica,sans-serif' font-size='${Math.round(h / 8)}' fill='#fff' text-anchor='middle' dominant-baseline='middle'>${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const NOVARTIS_LOGO_PRIMARY = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/320px-Novartis-Logo.svg.png';
const NOVARTIS_LOGO_COMPACT = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/160px-Novartis-Logo.svg.png';
const SCEMBLIX_WORDMARK     = svgDataUrl('SCEMBLIX',           '#8b0e3a', 200, 60);
const HERO_ONCOLOGY         = svgDataUrl('Hero — Oncology',   '#2a5d8f');
const HERO_ABSTRACT         = svgDataUrl('Hero — Abstract',   '#4a3a8b');
const HERO_LAB              = svgDataUrl('Hero — Lab',        '#2c7a5d');
const ICON_PILL             = svgDataUrl('Pill',              '#8b0e3a', 64, 64);
const ICON_DOCTOR           = svgDataUrl('Doctor',            '#2a5d8f', 64, 64);
const ICON_HEART            = svgDataUrl('Heart',             '#c0392b', 64, 64);

const LOGOS: BdsAsset[] = [
  { id: 1, name: 'Novartis — Primary',  cdnUrlThumb: NOVARTIS_LOGO_PRIMARY, cdnUrlHighRes: NOVARTIS_LOGO_PRIMARY, tags: [{ id: 1, name: 'BDS logo' }] },
  { id: 2, name: 'Novartis — Compact',  cdnUrlThumb: NOVARTIS_LOGO_COMPACT, cdnUrlHighRes: NOVARTIS_LOGO_COMPACT, tags: [{ id: 1, name: 'BDS logo' }] },
  { id: 3, name: 'SCEMBLIX wordmark',   cdnUrlThumb: SCEMBLIX_WORDMARK,     cdnUrlHighRes: SCEMBLIX_WORDMARK,     tags: [{ id: 2, name: 'Brand logo' }] },
];

const HERO_IMAGES: BdsAsset[] = [
  { id: 10, name: 'Oncology — Patient', cdnUrlThumb: HERO_ONCOLOGY, cdnUrlHighRes: HERO_ONCOLOGY, tags: [{ id: 3, name: 'BDS source assets' }] },
  { id: 11, name: 'Abstract pattern',   cdnUrlThumb: HERO_ABSTRACT, cdnUrlHighRes: HERO_ABSTRACT, tags: [{ id: 3, name: 'BDS source assets' }] },
  { id: 12, name: 'Lab — Microscope',   cdnUrlThumb: HERO_LAB,      cdnUrlHighRes: HERO_LAB,      tags: [{ id: 3, name: 'BDS source assets' }] },
];

const ICONS: BdsAsset[] = [
  { id: 20, name: 'Pill icon',     cdnUrlThumb: ICON_PILL,   cdnUrlHighRes: ICON_PILL,   tags: [{ id: 4, name: 'BDS icon' }] },
  { id: 21, name: 'Doctor icon',   cdnUrlThumb: ICON_DOCTOR, cdnUrlHighRes: ICON_DOCTOR, tags: [{ id: 4, name: 'BDS icon' }] },
  { id: 22, name: 'Heart icon',    cdnUrlThumb: ICON_HEART,  cdnUrlHighRes: ICON_HEART,  tags: [{ id: 4, name: 'BDS icon' }] },
];

const GENERAL_IMAGES: BdsAsset[] = [...LOGOS, ...HERO_IMAGES, ...ICONS];

export interface BdsResponse {
  logos: BdsAsset[];
  heroImages: BdsAsset[];
  icons: BdsAsset[];
}

export interface ImagesResponse {
  images: BdsAsset[];
  total: number;
}

// Real API first, mock fallback. The proxy in vite.config.ts forwards
// /api/shaman/* to apryse-designer's Next.js dev server (port 3000) which
// handles Cognito auth + BearerEx token + Shaman GraphQL. If the proxy is
// down or returns an error, callers transparently get mock data.

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
  const real = await tryFetchJson<BdsResponse>(`/api/shaman/bds?${params}`);
  if (real && (real.logos || real.heroImages || real.icons)) {
    return {
      logos: real.logos ?? [],
      heroImages: real.heroImages ?? [],
      icons: real.icons ?? [],
    };
  }
  console.warn('[bds] real API unreachable — using local mock');
  return { logos: LOGOS, heroImages: HERO_IMAGES, icons: ICONS };
}

export async function fetchImages(accountId: string, search = ''): Promise<ImagesResponse> {
  const params = new URLSearchParams({ accountId, limit: '100' });
  if (search) params.set('search', search);
  const real = await tryFetchJson<ImagesResponse>(`/api/shaman/images?${params}`);
  if (real && real.images) {
    return { images: real.images, total: real.total ?? real.images.length };
  }
  const term = search.toLowerCase().trim();
  const matched = term
    ? GENERAL_IMAGES.filter((img) => img.name.toLowerCase().includes(term))
    : GENERAL_IMAGES;
  return { images: matched, total: matched.length };
}

// ── Legacy single-tag helpers (legal-footer logo picker) ────────────────────
// Kept so the existing logo dropdown keeps working without changes.

const LEGACY_BY_TAG: Record<string, BdsAssetLegacy[]> = {
  'BDS-logo': [
    { id: 'asset_novartis_primary', label: 'Novartis — Primary', tag: 'BDS-logo', url: NOVARTIS_LOGO_PRIMARY },
    { id: 'asset_novartis_compact', label: 'Novartis — Compact', tag: 'BDS-logo', url: NOVARTIS_LOGO_COMPACT },
    { id: 'asset_scemblix',         label: 'Scemblix wordmark',  tag: 'BDS-logo', url: SCEMBLIX_WORDMARK },
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
