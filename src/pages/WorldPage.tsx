import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useI18n } from '@/i18n';
import { countries, continents } from '@/data/countries';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { getMapTheme } from '@/lib/map/themes';
import { matchesQuery } from '@/lib/search/normalize';
import { WorldMap } from '@/components/maps/WorldMap';
import { StatusEditorOptions } from '@/components/maps/MapPanelSections';
import { PageHero } from '@/components/common/Chrome';
import { Sheet } from '@/components/ui/Sheet';
import { statusMeta } from '@/components/ui/StatusPill';
import type { TravelStatus } from '@/types';

export default function WorldPage() {
  const { t, shortLocale } = useI18n();
  const countryEntries = usePassportStore((s) => s.countryEntries);
  const setCountryStatus = usePassportStore((s) => s.setCountryStatus);
  const clearCountryStatus = usePassportStore((s) => s.clearCountryStatus);
  const settings = useSettingsStore((s) => s.settings);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');

  const [query, setQuery] = useState('');
  const [continent, setContinent] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const statusMap = useMemo(() => {
    const map: Record<string, TravelStatus> = {};
    for (const e of countryEntries) map[e.entityId] = e.status;
    return map;
  }, [countryEntries]);

  const visitedCount = Object.values(statusMap).filter((s) => s === 'visited' || s === 'favorite' || s === 'lived_here').length;

  const filtered = countries.filter((c) => {
    if (continent !== 'all' && c.continent !== continent) return false;
    if (query && !matchesQuery(query, { primary: [c.nameEn, c.nameBn] })) return false;
    return true;
  });

  const selectedCountry = countries.find((c) => c.id === selected);

  const handleSelect = (countryId: string) => {
    setSelected(countryId);
    setSheetOpen(true);
  };

  return (
    <div className="container page">
      <PageHero
        eyebrow={t('nav.world')}
        title={t('world.title')}
        body={t('world.subtitle')}
      />

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: 16 }}>
        <div className="map-stage" style={{ height: '54vh' }}>
          <WorldMap
            statusMap={statusMap}
            theme={theme}
            onCountryClick={handleSelect}
            onBackgroundClick={() => setSelected(null)}
          />
        </div>
      </div>

      <div className="cluster" style={{ gap: 16, marginTop: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <strong>{t('world.progress', { visited: visitedCount, total: countries.length })}</strong>
        <div style={{ position: 'relative', minWidth: 220 }}>
          <Search size={17} aria-hidden style={{ position: 'absolute', left: 12, top: 15, color: 'var(--text-subtle)' }} />
          <input
            className="input"
            style={{ paddingLeft: 38, minHeight: 44 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('world.searchPlaceholder')}
          />
        </div>
      </div>

      <div className="pill-row" style={{ marginTop: 16 }}>
        <button type="button" className="chip" aria-pressed={continent === 'all'} onClick={() => setContinent('all')}>
          {t('common.all')}
        </button>
        {continents.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={continent === c.id} onClick={() => setContinent(c.id)}>
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      <div className="card card-pad" style={{ marginTop: 20, maxHeight: 380, overflow: 'auto' }}>
        <ul className="list-clean">
          {filtered.map((country) => (
            <li key={country.id}>
              <button type="button" className="district-row" onClick={() => handleSelect(country.id)}>
                <span className="status-dot" style={{ background: `var(${statusMeta[statusMap[country.id] ?? 'unvisited'].colorVar})` }} aria-hidden />
                <span className="district-row-name">{shortLocale === 'bn' ? country.nameBn : country.nameEn}</span>
                <span className="district-row-sub">{country.iso2}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Sheet open={sheetOpen && Boolean(selectedCountry)} onClose={() => setSheetOpen(false)} title={selectedCountry ? (shortLocale === 'bn' ? selectedCountry.nameBn : selectedCountry.nameEn) : ''}>
        {selectedCountry ? (
          <StatusEditorOptions
            current={statusMap[selectedCountry.id] ?? 'unvisited'}
            onPick={(status) => {
              void setCountryStatus(selectedCountry.id, status);
              setSheetOpen(false);
            }}
            onClear={() => {
              void clearCountryStatus(selectedCountry.id);
              setSheetOpen(false);
            }}
          />
        ) : null}
      </Sheet>
    </div>
  );
}
