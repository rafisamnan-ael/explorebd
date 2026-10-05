import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { countries, continents } from '@/data/countries';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useUiStore } from '@/store/uiStore';
import { getMapTheme } from '@/lib/map/themes';
import { matchesQuery } from '@/lib/search/normalize';
import { WorldMap } from '@/components/maps/WorldMap';
import { MapModeSwitch } from '@/components/maps/MapModeSwitch';
import { StatusEditorOptions } from '@/components/maps/MapPanelSections';
import { PageHero } from '@/components/common/Chrome';
import { Sheet } from '@/components/ui/Sheet';
import { statusMeta } from '@/components/ui/StatusPill';
import type { TravelStatus } from '@/types';

export default function WorldPage() {
  const { t, shortLocale, formatNumber } = useI18n();
  const isMobile = useIsMobile();
  const countryEntries = usePassportStore((s) => s.countryEntries);
  const setCountryStatus = usePassportStore((s) => s.setCountryStatus);
  const clearCountryStatus = usePassportStore((s) => s.clearCountryStatus);
  const settings = useSettingsStore((s) => s.settings);
  const toast = useUiStore((s) => s.toast);
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

  const visitedCount = Object.values(statusMap).filter(
    (s) => s === 'visited' || s === 'favorite' || s === 'lived_here',
  ).length;

  const filtered = useMemo(
    () =>
      countries.filter((c) => {
        if (continent !== 'all' && c.continent !== continent) return false;
        if (query && !matchesQuery(query, { primary: [c.nameEn, c.nameBn], secondary: [c.iso2] })) return false;
        return true;
      }),
    [continent, query],
  );

  const selectedCountry = countries.find((c) => c.id === selected);

  const nameOf = (id: string) => {
    const c = countries.find((x) => x.id === id);
    if (!c) return id;
    return shortLocale === 'bn' ? c.nameBn : c.nameEn;
  };

  const handleSelect = (countryId: string) => {
    setSelected(countryId);
    if (isMobile) setSheetOpen(true);
  };

  const pickStatus = (countryId: string, status: TravelStatus) => {
    void setCountryStatus(countryId, status);
    toast(t('map.statusSet', { name: nameOf(countryId), status: t(statusMeta[status].labelKey) }), 'success');
  };

  const editor = selected ? (
    <div className="stack" style={{ gap: 12 }}>
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <strong>{nameOf(selected)}</strong>
        <span className="badge">
          <span className="status-dot" style={{ background: `var(${statusMeta[statusMap[selected] ?? 'unvisited'].colorVar})` }} aria-hidden />
          {t(statusMeta[statusMap[selected] ?? 'unvisited'].shortKey)}
        </span>
      </div>
      <StatusEditorOptions
        current={statusMap[selected] ?? 'unvisited'}
        onPick={(status) => pickStatus(selected, status)}
        onClear={() => void clearCountryStatus(selected)}
      />
    </div>
  ) : (
    <p className="muted" style={{ fontSize: '0.85rem' }}>{t('map.selectCountryHint')}</p>
  );

  const listSection = (
    <div className="stack" style={{ gap: 12 }}>
      <div className="field">
        <label className="field-label" htmlFor="world-search">{t('common.search')}</label>
        <div style={{ position: 'relative' }}>
          <Search size={18} aria-hidden style={{ position: 'absolute', left: 12, top: 15, color: 'var(--text-subtle)' }} />
          <input
            id="world-search"
            className="input"
            style={{ paddingLeft: 38, paddingRight: query ? 38 : 12 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('world.searchPlaceholder')}
          />
          {query ? (
            <button type="button" className="btn-icon" aria-label={t('a11y.clearSearch')} style={{ position: 'absolute', right: 2, top: 2, width: 40, height: 40 }} onClick={() => setQuery('')}>
              <X size={16} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      <div className="pill-row">
        <button type="button" className="chip" aria-pressed={continent === 'all'} onClick={() => setContinent('all')}>
          {t('common.all')}
        </button>
        {continents.map((c) => (
          <button key={c.id} type="button" className="chip" aria-pressed={continent === c.id} onClick={() => setContinent(c.id)}>
            {t(c.labelKey)}
          </button>
        ))}
      </div>
      <span className="eyebrow">{t('map.countryList')}</span>
      <div className="country-list">
        <ul className="list-clean">
          {filtered.map((country) => (
            <li key={country.id}>
              <button
                type="button"
                className="district-row"
                aria-current={selected === country.id}
                onClick={() => handleSelect(country.id)}
              >
                <span className="status-dot" style={{ background: `var(${statusMeta[statusMap[country.id] ?? 'unvisited'].colorVar})`, width: 12, height: 12 }} aria-hidden />
                <span className="district-row-name">
                  {shortLocale === 'bn' ? country.nameBn : country.nameEn}
                  <span className="district-row-sub" style={{ display: 'block' }}>{country.iso2}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <PageHero
        eyebrow={t('nav.world')}
        title={t('world.title')}
        body={t('map.selectCountryHint')}
      />

      <MapModeSwitch mode="world" />

      <div className="map-workspace">
        <aside className="map-panel" aria-label={t('map.countryList')}>
          <div className="map-panel-section">
            <div className="cluster" style={{ justifyContent: 'space-between' }}>
              <span className="eyebrow">{t('nav.world')}</span>
              <strong>{t('world.progress', { visited: formatNumber(visitedCount), total: formatNumber(countries.length) })}</strong>
            </div>
            <div className="progress">
              <span style={{ width: `${Math.round((visitedCount / countries.length) * 100)}%` }} />
            </div>
          </div>
          <div className="map-panel-section">{listSection}</div>
          {!isMobile ? <div className="map-panel-section">{editor}</div> : null}
        </aside>

        <div className="map-stage">
          <WorldMap statusMap={statusMap} theme={theme} onCountryClick={handleSelect} onBackgroundClick={() => setSelected(null)} />
        </div>
      </div>

      <Sheet open={isMobile && sheetOpen && Boolean(selectedCountry)} onClose={() => setSheetOpen(false)} title={selectedCountry ? nameOf(selectedCountry.id) : ''}>
        {selectedCountry ? editor : null}
      </Sheet>
    </div>
  );
}
