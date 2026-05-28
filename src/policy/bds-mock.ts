// Mock for the Shaman Brand Design System (BDS) asset registry.
// In production this would be a remote API: `fetchAssetsByTag('BDS-logo')`.

export interface BdsAsset {
  id: string;
  label: string;
  tag: string;
  url: string;
}

const ASSETS: BdsAsset[] = [
  {
    id: 'asset_novartis_primary',
    label: 'Novartis — Primary',
    tag: 'BDS-logo',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/320px-Novartis-Logo.svg.png',
  },
  {
    id: 'asset_novartis_compact',
    label: 'Novartis — Compact',
    tag: 'BDS-logo',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Novartis-Logo.svg/160px-Novartis-Logo.svg.png',
  },
  {
    id: 'asset_scemblix',
    label: 'Scemblix wordmark',
    tag: 'BDS-logo',
    url: 'https://via.placeholder.com/200x60/8b0e3a/ffffff?text=SCEMBLIX',
  },
];

export function fetchAssetsByTag(tag: string): BdsAsset[] {
  return ASSETS.filter((a) => a.tag === tag);
}

export function resolveAssetUrl(assetId: string): string | null {
  return ASSETS.find((a) => a.id === assetId)?.url ?? null;
}
