import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { clearAllLocalData, exportAllLocalData } from '@/db/local/db';
import { downloadDataUrl } from '@/lib/export/exportImage';
import { mapThemes } from '@/lib/map/themes';
import { Segmented } from '@/components/ui/Segmented';
import { Modal } from '@/components/ui/Modal';
import { PageHero } from '@/components/common/Chrome';
import type { AppSettings } from '@/types';

export default function SettingsPage() {
  const { t, shortLocale } = useI18n();
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const toast = useUiStore((s) => s.toast);
  const [clearOpen, setClearOpen] = useState(false);

  if (!settings) return null;

  const exportData = async () => {
    const bundle = await exportAllLocalData();
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(bundle, null, 2))}`;
    downloadDataUrl(dataUrl, `explorebd-data-${new Date().toISOString().slice(0, 10)}.json`);
    toast(t('common.saved'), 'success');
  };

  const clearData = async () => {
    await clearAllLocalData();
    setClearOpen(false);
    toast(t('settings.clearDataDone'), 'success');
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="container page">
      <PageHero title={t('settings.title')} body={t('settings.subtitle')} />

      <div className="card card-pad stack" style={{ gap: 0 }}>
        <h2 className="section-title" style={{ fontSize: '1.15rem', marginBottom: 4 }}>{t('settings.appearance')}</h2>
        <div className="settings-row">
          <span className="field-label">{t('theme.label')}</span>
          <Segmented
            ariaLabel={t('theme.label')}
            value={settings.theme}
            onChange={(value) => void update({ theme: value })}
            options={[
              { value: 'light', label: t('theme.light') },
              { value: 'dark', label: t('theme.dark') },
              { value: 'system', label: t('theme.system') },
            ]}
          />
        </div>
        <div className="settings-row">
          <span className="field-label">{t('settings.reducedMotion')}</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.reducedMotion}
            className="switch"
            onClick={() => void update({ reducedMotion: !settings.reducedMotion })}
          />
        </div>

        <h2 className="section-title" style={{ fontSize: '1.15rem', marginTop: 24, marginBottom: 4 }}>{t('settings.language')}</h2>
        <div className="settings-row">
          <span className="field-label">{t('locale.label')}</span>
          <Segmented
            ariaLabel={t('locale.label')}
            value={settings.locale}
            onChange={(value) => void update({ locale: value as AppSettings['locale'] })}
            options={[
              { value: 'bn-BD', label: t('locale.bn') },
              { value: 'en-BD', label: t('locale.en') },
            ]}
          />
        </div>

        <h2 className="section-title" style={{ fontSize: '1.15rem', marginTop: 24, marginBottom: 4 }}>{t('settings.map')}</h2>
        <div className="settings-row">
          <span className="field-label">{t('map.theme')}</span>
          <div className="pill-row">
            {mapThemes.map((theme) => (
              <button key={theme.id} type="button" className="chip" aria-pressed={settings.mapThemeId === theme.id} onClick={() => void update({ mapThemeId: theme.id })}>
                {shortLocale === 'bn' ? theme.labelBn : theme.labelEn}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-row">
          <span className="field-label">{t('map.labels')}</span>
          <button type="button" role="switch" aria-checked={settings.showLabels} className="switch" onClick={() => void update({ showLabels: !settings.showLabels })} />
        </div>
        <div className="settings-row">
          <span className="field-label">{t('map.labelLanguage')}</span>
          <select className="select" style={{ maxWidth: 220 }} value={settings.labelLanguage} onChange={(e) => void update({ labelLanguage: e.target.value as AppSettings['labelLanguage'] })}>
            <option value="en">{t('locale.en')}</option>
            <option value="bn">{t('locale.bn')}</option>
            <option value="both">{t('map.labelBoth')}</option>
          </select>
        </div>

        <h2 className="section-title" style={{ fontSize: '1.15rem', marginTop: 24, marginBottom: 4 }}>{t('settings.privacy')}</h2>
        <div className="settings-row">
          <div>
            <span className="field-label">{t('settings.analytics')}</span>
            <div className="subtle" style={{ fontSize: '0.8rem' }}>{t('settings.analyticsHint')}</div>
          </div>
          <button type="button" role="switch" aria-checked={settings.analytics} className="switch" onClick={() => void update({ analytics: !settings.analytics })} />
        </div>

        <h2 className="section-title" style={{ fontSize: '1.15rem', marginTop: 24, marginBottom: 4 }}>{t('settings.data')}</h2>
        <div className="settings-row" style={{ borderBottom: 'none' }}>
          <div className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={() => void exportData()}>
              <Download size={17} aria-hidden /> {t('settings.exportData')}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setClearOpen(true)}>
              <Trash2 size={17} aria-hidden /> {t('settings.clearData')}
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('settings.clearData')}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setClearOpen(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-danger" onClick={() => void clearData()}>{t('settings.clearData')}</button>
          </>
        }
      >
        <p className="muted">{t('settings.clearDataConfirm')}</p>
      </Modal>
    </div>
  );
}
