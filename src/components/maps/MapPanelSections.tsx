import { Search, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { statusList, statusMeta } from '@/components/ui/StatusPill';
import { statusOrder, mapThemes, type MapTheme } from '@/lib/map/themes';
import type { DivisionProgress } from '@/lib/passport/stats';
import type { District, TravelStatus } from '@/types';
import type { AppSettings } from '@/types';

export function ProgressSummary({ visited, total, percent }: { visited: number; total: number; percent: number }) {
  const { t, formatNumber } = useI18n();
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="cluster" style={{ justifyContent: 'space-between' }}>
        <span className="eyebrow">{t('map.progressLabel')}</span>
        <strong>{t('map.progress', { visited: formatNumber(visited), total: formatNumber(total) })}</strong>
      </div>
      <div className="progress">
        <span style={{ width: `${Math.round(percent * 100)}%` }} />
      </div>
    </div>
  );
}

export function DistrictSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="field">
      <label className="field-label" htmlFor="district-search">
        {t('map.searchLabel')}
      </label>
      <div style={{ position: 'relative' }}>
        <Search
          size={18}
          aria-hidden
          style={{ position: 'absolute', left: 12, top: 15, color: 'var(--text-subtle)' }}
        />
        <input
          id="district-search"
          className="input"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('map.searchPlaceholder')}
          style={{ paddingLeft: 38, paddingRight: value ? 38 : 12 }}
        />
        {value ? (
          <button
            type="button"
            className="btn-icon"
            aria-label={t('a11y.clearSearch')}
            style={{ position: 'absolute', right: 2, top: 2, width: 40, height: 40 }}
            onClick={() => onChange('')}
          >
            <X size={16} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function DivisionGrid({
  progress,
  active,
  onSelect,
}: {
  progress: DivisionProgress[];
  active: string | 'all';
  onSelect: (id: string | 'all') => void;
}) {
  const { t, shortLocale } = useI18n();
  return (
    <div className="stack" style={{ gap: 10 }}>
      <span className="eyebrow">{t('map.divisions')}</span>
      <div className="division-grid">
        <button
          type="button"
          className="division-card"
          aria-pressed={active === 'all'}
          onClick={() => onSelect('all')}
        >
          <div className="division-card-name">{t('common.all')}</div>
          <div className="division-card-count">{t('map.progressLabel')}</div>
        </button>
        {progress.map((division) => (
          <button
            key={division.id}
            type="button"
            className="division-card"
            aria-pressed={active === division.id}
            onClick={() => onSelect(active === division.id ? 'all' : division.id)}
          >
            <div className="division-card-name">{shortLocale === 'bn' ? division.nameBn : division.nameEn}</div>
            <div className="division-card-count">
              {t('map.divisionProgress', { visited: division.visited, total: division.total })}
            </div>
            <div className="division-bar">
              <span style={{ width: `${Math.round(division.percent * 100)}%` }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StatusFilterRow({
  value,
  onChange,
  counts,
}: {
  value: TravelStatus | 'all';
  onChange: (value: TravelStatus | 'all') => void;
  counts: Record<TravelStatus, number>;
}) {
  const { t } = useI18n();
  return (
    <div className="stack" style={{ gap: 8 }}>
      <span className="eyebrow">{t('map.statusFilter')}</span>
      <div className="status-filter">
        <button type="button" className="chip" aria-pressed={value === 'all'} onClick={() => onChange('all')}>
          {t('common.all')}
        </button>
        {statusOrder.map((status) => (
          <button
            key={status}
            type="button"
            className="chip"
            aria-pressed={value === status}
            onClick={() => onChange(value === status ? 'all' : status)}
          >
            <span className="status-dot" style={{ background: `var(${statusMeta[status].colorVar})` }} aria-hidden />
            {t(statusMeta[status].labelKey)}
            {counts[status] ? ` · ${counts[status]}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DistrictList({
  districts,
  statusMap,
  selectedId,
  onSelect,
  emptyLabel,
}: {
  districts: District[];
  statusMap: Record<string, TravelStatus>;
  selectedId?: string | null;
  onSelect: (districtId: string) => void;
  emptyLabel: string;
}) {
  const { t, shortLocale } = useI18n();
  if (!districts.length) {
    return <p className="muted" style={{ padding: 12 }}>{emptyLabel}</p>;
  }
  return (
    <ul className="list-clean">
      {districts.map((district) => {
        const status = statusMap[district.id] ?? 'unvisited';
        return (
          <li key={district.id}>
            <button
              type="button"
              className="district-row"
              aria-current={selectedId === district.id}
              onClick={() => onSelect(district.id)}
            >
              <span
                className="status-dot"
                style={{ background: `var(${statusMeta[status].colorVar})`, width: 12, height: 12 }}
                aria-hidden
              />
              <span className="district-row-name">
                {shortLocale === 'bn' ? district.nameBn : district.nameEn}
                <span className="district-row-sub" style={{ display: 'block' }}>
                  {shortLocale === 'bn' ? district.nameEn : district.nameBn}
                  {' · '}
                  {shortLocale === 'bn' ? district.divisionNameBn : district.divisionNameEn}
                </span>
              </span>
              <span className="sr-only">{t(statusMeta[status].labelKey)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MapStyleControls({
  themeId,
  settings,
  onUpdate,
}: {
  themeId: string;
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
}) {
  const { t, shortLocale } = useI18n();
  return (
    <div className="stack" style={{ gap: 14 }}>
      <span className="eyebrow">{t('map.customize')}</span>

      <div className="field">
        <span className="field-label">{t('map.theme')}</span>
        <div className="pill-row">
          {mapThemes.map((theme: MapTheme) => (
            <button
              key={theme.id}
              type="button"
              className="chip"
              aria-pressed={themeId === theme.id}
              onClick={() => onUpdate({ mapThemeId: theme.id })}
            >
              <span
                aria-hidden
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: theme.status.visited,
                  display: 'inline-block',
                  marginRight: 6,
                }}
              />
              {shortLocale === 'bn' ? theme.labelBn : theme.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="label-language">
          {t('map.labelLanguage')}
        </label>
        <select
          id="label-language"
          className="select"
          value={settings.labelLanguage}
          onChange={(e) => onUpdate({ labelLanguage: e.target.value as AppSettings['labelLanguage'] })}
        >
          <option value="en">{t('locale.en')}</option>
          <option value="bn">{t('locale.bn')}</option>
          <option value="both">{t('map.labelBoth')}</option>
        </select>
      </div>

      <label className="settings-row" style={{ borderBottom: 'none', paddingBlock: 4 }}>
        <span className="field-label">{t('map.labels')}</span>
        <button
          type="button"
          className="switch"
          role="switch"
          aria-checked={settings.showLabels}
          onClick={() => onUpdate({ showLabels: !settings.showLabels })}
        />
      </label>

      <label className="settings-row" style={{ borderBottom: 'none', paddingBlock: 4 }}>
        <span className="field-label">{t('map.background')}</span>
        <button
          type="button"
          className="switch"
          role="switch"
          aria-checked={settings.backgroundTexture}
          onClick={() => onUpdate({ backgroundTexture: !settings.backgroundTexture })}
        />
      </label>

      <div className="field">
        <label className="field-label" htmlFor="display-name">
          {t('map.displayName')}
        </label>
        <input
          id="display-name"
          className="input"
          value={settings.displayName}
          placeholder={t('map.displayNamePlaceholder')}
          maxLength={40}
          onChange={(e) => onUpdate({ displayName: e.target.value })}
        />
      </div>
    </div>
  );
}

export function StatusEditorOptions({
  current,
  onPick,
  onClear,
}: {
  current: TravelStatus;
  onPick: (status: TravelStatus) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="stack" style={{ gap: 2 }}>
      {statusList.map((status) => {
        const meta = statusMeta[status];
        const Icon = meta.Icon;
        return (
          <button
            key={status}
            type="button"
            role="menuitemradio"
            aria-checked={current === status}
            className="status-option"
            onClick={() => onPick(status)}
          >
            <span className="status-dot" style={{ background: `var(${meta.colorVar})` }} aria-hidden />
            <Icon size={16} aria-hidden />
            {t(meta.labelKey)}
          </button>
        );
      })}
      <button type="button" className="status-option" onClick={onClear}>
        <X size={16} aria-hidden />
        {t('status.clearStatus')}
      </button>
    </div>
  );
}
