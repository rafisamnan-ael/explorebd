import { useMemo, useState } from 'react';
import { Download, ListFilter, Palette, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '@/i18n';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useStatusMap } from '@/hooks/useStatusMap';
import { computeStats } from '@/lib/passport/stats';
import { getMapTheme } from '@/lib/map/themes';
import { districts } from '@/data/districts';
import { statusMeta } from '@/components/ui/StatusPill';
import { Sheet } from '@/components/ui/Sheet';
import { Modal } from '@/components/ui/Modal';
import { ExportDialog } from '@/components/sharing/ExportDialog';
import { BangladeshMap } from '@/components/maps/BangladeshMap';
import { MapModeSwitch } from '@/components/maps/MapModeSwitch';
import {
  DistrictList,
  DistrictSearchInput,
  DivisionGrid,
  MapStyleControls,
  ProgressSummary,
  StatusEditorOptions,
  StatusFilterRow,
} from '@/components/maps/MapPanelSections';
import { matchesQuery } from '@/lib/search/normalize';
import type { TravelStatus } from '@/types';

type PanelSheet = 'list' | 'filters' | 'style' | null;

export default function MapPage() {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const statusMap = useStatusMap();
  const entries = usePassportStore((s) => s.entries);
  const setStatus = usePassportStore((s) => s.setStatus);
  const clearStatus = usePassportStore((s) => s.clearStatus);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.update);
  const toast = useUiStore((s) => s.toast);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TravelStatus | 'all'>('all');
  const [panel, setPanel] = useState<PanelSheet>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const themeId = settings?.mapThemeId ?? 'forest';
  const theme = getMapTheme(themeId);
  const stats = useMemo(() => computeStats(statusMap, entries), [statusMap, entries]);

  const statusCounts = useMemo(() => {
    const counts: Record<TravelStatus, number> = {
      unvisited: 0,
      want_to_go: 0,
      visited: 0,
      favorite: 0,
      lived_here: 0,
    };
    for (const district of districts) counts[statusMap[district.id] ?? 'unvisited'] += 1;
    return counts;
  }, [statusMap]);

  const filteredDistricts = useMemo(() => {
    return districts.filter((district) => {
      if (divisionFilter !== 'all' && district.divisionId !== divisionFilter) return false;
      if (statusFilter !== 'all' && (statusMap[district.id] ?? 'unvisited') !== statusFilter) return false;
      if (query && !matchesQuery(query, { primary: [district.nameEn, district.nameBn], secondary: district.aliases })) {
        return false;
      }
      return true;
    });
  }, [divisionFilter, statusFilter, query, statusMap]);

  const legendLabels = useMemo(
    () =>
      ({
        unvisited: t('status.unvisited'),
        want_to_go: t('status.want_to_go'),
        visited: t('status.visited'),
        favorite: t('status.favorite'),
        lived_here: t('status.lived_here'),
      }) satisfies Record<TravelStatus, string>,
    [t],
  );

  const handleMapClick = (districtId: string) => {
    const current = statusMap[districtId] ?? 'unvisited';
    if (current === 'unvisited') {
      void setStatus(districtId, 'visited');
    }
    setSelectedId(districtId);
    if (isMobile) setPanel('list');
  };

  const pickStatus = (districtId: string, status: TravelStatus) => {
    void setStatus(districtId, status);
    toast(t('map.statusSet', { name: nameOf(districtId), status: t(statusMeta[status].labelKey) }), 'success');
  };

  const nameOf = (id: string) => {
    const d = districts.find((x) => x.id === id);
    return d ? d.nameEn : id;
  };

  const selectDistrict = (districtId: string) => {
    const current = statusMap[districtId] ?? 'unvisited';
    if (current === 'unvisited') void setStatus(districtId, 'visited');
    setSelectedId(districtId);
    if (isMobile) setPanel('list');
  };

  const listSection = (
    <div className="stack" style={{ gap: 12 }}>
      <DistrictSearchInput value={query} onChange={setQuery} />
      {!filteredDistricts.length ? (
        <p className="muted" style={{ padding: 8 }}>{t('map.noResults', { query })}</p>
      ) : (
        <div className="panel-scroll">
          <DistrictList
            districts={filteredDistricts}
            statusMap={statusMap}
            selectedId={selectedId}
            onSelect={selectDistrict}
            emptyLabel={t('map.noResults', { query })}
          />
        </div>
      )}
    </div>
  );

  const filtersSection = (
    <div className="stack" style={{ gap: 18 }}>
      <StatusFilterRow value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
      <DivisionGrid progress={stats.divisionProgress} active={divisionFilter} onSelect={setDivisionFilter} />
    </div>
  );

  const styleSection = settings ? (
    <MapStyleControls themeId={themeId} settings={settings} onUpdate={(patch) => void updateSettings(patch)} />
  ) : null;

  return (
    <div className="container page">
      <div className="page-hero" style={{ paddingBottom: 20 }}>
        <span className="eyebrow">{t('home.eyebrow')}</span>
        <h1>{t('map.title')}</h1>
        <p>{t('map.selectZilaHint')}</p>
      </div>

      <MapModeSwitch mode="bd" />

      {isMobile ? (
        <div className="mobile-toolbar" role="toolbar" aria-label={t('map.title')}>
          <button type="button" className="chip" onClick={() => setPanel('list')}>
            <ListFilter size={15} aria-hidden /> {t('map.mobileSheets.districts')}
          </button>
          <button type="button" className="chip" onClick={() => setPanel('filters')}>
            <SlidersHorizontal size={15} aria-hidden /> {t('map.mobileSheets.filters')}
          </button>
          <button type="button" className="chip" onClick={() => setPanel('style')}>
            <Palette size={15} aria-hidden /> {t('map.mobileSheets.style')}
          </button>
          <button type="button" className="chip" onClick={() => setExportOpen(true)}>
            <Download size={15} aria-hidden /> {t('map.mobileSheets.share')}
          </button>
        </div>
      ) : null}

      <div className="map-workspace">
        <aside className="map-panel" aria-label={t('map.districtList')}>
          <div className="map-panel-section">
            <ProgressSummary visited={stats.visitedDistricts} total={stats.totalDistricts} percent={stats.travelPercent} />
            <div className="cluster" style={{ gap: 8 }}>
              <span className="badge badge-primary">
                <span className="status-dot" style={{ background: 'var(--status-visited)' }} aria-hidden />
                {t('status.visited')} · {stats.visitedDistricts}
              </span>
              <span className="badge">
                <span className="status-dot" style={{ background: 'var(--status-unvisited)' }} aria-hidden />
                {t('status.unvisited')} · {stats.totalDistricts - stats.visitedDistricts}
              </span>
            </div>
            <div className="cluster" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  for (const d of districts) void setStatus(d.id, 'visited');
                  toast(t('common.saved'), 'success');
                }}
              >
                {t('common.selectAll')}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setResetOpen(true)}>
                {t('common.clearAll')}
              </button>
            </div>
          </div>
          {!isMobile && selectedId ? (
            <div className="map-panel-section" aria-live="polite">
              <div className="cluster" style={{ justifyContent: 'space-between' }}>
                <strong>{nameOf(selectedId)}</strong>
                <span className="badge">
                  <span className="status-dot" style={{ background: `var(${statusMeta[statusMap[selectedId] ?? 'unvisited'].colorVar})` }} aria-hidden />
                  {t(statusMeta[statusMap[selectedId] ?? 'unvisited'].shortKey)}
                </span>
              </div>
              <StatusEditorOptions
                current={statusMap[selectedId] ?? 'unvisited'}
                onPick={(status) => pickStatus(selectedId, status)}
                onClear={() => void clearStatus(selectedId)}
              />
            </div>
          ) : null}
          <div className="map-panel-section">{listSection}</div>
          <div className="map-panel-section">{filtersSection}</div>
          <div className="map-panel-section">{styleSection}</div>
          <div className="map-panel-section">
            <button type="button" className="btn btn-primary btn-block" onClick={() => setExportOpen(true)}>
              <Download size={18} aria-hidden />
              {t('map.exportSection')}
            </button>
          </div>
        </aside>

        <div className="map-stage">
          <BangladeshMap
            statusMap={statusMap}
            theme={theme}
            showLabels={settings?.showLabels ?? false}
            labelLanguage={settings?.labelLanguage ?? 'en'}
            selectedDistrictId={selectedId}
            onDistrictClick={handleMapClick}
            onBackgroundClick={() => setSelectedId(null)}
          />
        </div>
      </div>

      <Sheet open={isMobile && panel === 'list'} onClose={() => setPanel(null)} title={t('map.mobileSheets.districts')}>
        {selectedId && isMobile ? (
          <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
            <strong>{nameOf(selectedId)}</strong>
            <StatusEditorOptions
              current={statusMap[selectedId] ?? 'unvisited'}
              onPick={(status) => pickStatus(selectedId, status)}
              onClear={() => {
                void clearStatus(selectedId);
                setPanel(null);
              }}
            />
          </div>
        ) : null}
        {listSection}
      </Sheet>

      <Sheet open={isMobile && panel === 'filters'} onClose={() => setPanel(null)} title={t('map.mobileSheets.filters')}>
        {filtersSection}
      </Sheet>

      <Sheet open={isMobile && panel === 'style'} onClose={() => setPanel(null)} title={t('map.mobileSheets.style')}>
        {styleSection}
      </Sheet>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title={t('map.resetMap')}>
        <p className="muted">{t('map.resetConfirm')}</p>
        <div className="cluster" style={{ gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setResetOpen(false)}>
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              for (const d of districts) void clearStatus(d.id);
              setResetOpen(false);
            }}
          >
            {t('common.clearAll')}
          </button>
        </div>
      </Modal>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        statusMap={statusMap}
        theme={theme}
        legendLabels={legendLabels}
        displayName={settings?.displayName || undefined}
        subtitle={t('home.title')}
        stats={{
          visited: stats.visitedDistricts,
          total: stats.totalDistricts,
          divisions: stats.divisionsComplete,
          percent: Math.round(stats.travelPercent * 100),
        }}
      />
    </div>
  );
}
