// Shaman Visual Library modal — simplified port of shaman_composite_editor's
// ImagePicker (banner-editor/components/ImagePicker.tsx). Library only — no
// local upload tab, per Shaman's brand-asset policy.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchBds, fetchImages, getAltText, type BdsAsset } from '../policy/bds-mock';

export interface SelectedAsset {
  id: number | string;
  name: string;
  url: string;
  alt: string;
}

interface VisualLibraryProps {
  open: boolean;
  accountId: string;
  productId?: number;
  initialTab?: 'all' | 'logo' | 'hero' | 'icon';
  onSelect: (asset: SelectedAsset) => void;
  onClose: () => void;
}

type FilterTab = 'all' | 'logo' | 'hero' | 'icon';

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'logo', label: 'Logos' },
  { value: 'hero', label: 'Hero' },
  { value: 'icon', label: 'Icons' },
];

export function VisualLibrary({ open, accountId, productId, initialTab = 'all', onSelect, onClose }: VisualLibraryProps) {
  const [allImages, setAllImages] = useState<BdsAsset[]>([]);
  const [logos, setLogos] = useState<BdsAsset[]>([]);
  const [heroImages, setHeroImages] = useState<BdsAsset[]>([]);
  const [icons, setIcons] = useState<BdsAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<FilterTab>(initialTab);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setSearch('');
  }, [open, initialTab]);

  // Load BDS-categorised assets once on open.
  useEffect(() => {
    if (!open) return;
    fetchBds(accountId, productId).then((bds) => {
      setLogos(bds.logos);
      setHeroImages(bds.heroImages);
      setIcons(bds.icons);
    });
  }, [open, accountId, productId]);

  // Load + debounce the general-search list.
  const runSearch = useCallback(
    (term: string) => {
      setLoading(true);
      fetchImages(accountId, term)
        .then((res) => setAllImages(res.images))
        .finally(() => setLoading(false));
    },
    [accountId],
  );

  useEffect(() => {
    if (!open) return;
    runSearch('');
  }, [open, runSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 350);
  };

  const visible = useMemo(() => {
    if (tab === 'logo') return logos;
    if (tab === 'hero') return heroImages;
    if (tab === 'icon') return icons;
    return allImages;
  }, [tab, allImages, logos, heroImages, icons]);

  if (!open) return null;

  return (
    <div className="vl-backdrop" onClick={onClose}>
      <div className="vl-modal" onClick={(e) => e.stopPropagation()}>
        <header className="vl-header">
          <h2>Visual Library</h2>
          <button className="vl-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="vl-controls">
          <input
            className="vl-search"
            type="text"
            placeholder="Search the library…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="vl-tabs">
            {TABS.map((t) => (
              <button
                key={t.value}
                className={`vl-tab ${tab === t.value ? 'vl-tab-active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {!loading && (
            <div className="vl-count">Total {visible.length} {visible.length === 1 ? 'document' : 'documents'}</div>
          )}
        </div>

        <div className="vl-grid">
          {loading && <div className="vl-empty">Loading…</div>}
          {!loading && visible.length === 0 && <div className="vl-empty">No assets match</div>}
          {!loading &&
            visible.map((img) => {
              const url = img.cdnUrlHighRes ?? img.cdnUrlThumb ?? '';
              return (
                <button
                  key={img.id}
                  className="vl-tile"
                  onClick={() => onSelect({ id: img.id, name: img.name, url, alt: getAltText(img) })}
                  title={img.name}
                >
                  <div className="vl-thumb">
                    {url ? (
                      <img
                        src={img.cdnUrlThumb ?? url}
                        alt={img.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="vl-placeholder" />
                    )}
                  </div>
                  <div className="vl-label">{img.name}</div>
                </button>
              );
            })}
        </div>

        <footer className="vl-footer">
          <small>
            Account: <code>{accountId}</code>
            {productId != null && (
              <>
                {' · '}Product: <code>{productId}</code>
              </>
            )}
          </small>
        </footer>
      </div>
    </div>
  );
}
