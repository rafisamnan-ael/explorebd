import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useStatusMap } from '@/hooks/useStatusMap';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { computeStats } from '@/lib/passport/stats';
import { getMapTheme } from '@/lib/map/themes';
import { countries } from '@/data/countries';
import { SharePanel } from '@/components/sharing/SharePanel';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TravelStatus } from '@/types';

export default function ShareStudioPage() {
  const { t } = useI18n();
  const bdStatusMap = useStatusMap();
  const entries = usePassportStore((s) => s.entries);
  const countryEntries = usePassportStore((s) => s.countryEntries);
  const settings = useSettingsStore((s) => s.settings);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');

  const bdStats = useMemo(() => {
    const s = computeStats(bdStatusMap, entries);
    return {
      visited: s.visitedDistricts,
      total: s.totalDistricts,
      divisions: s.divisionsComplete,
      percent: Math.round(s.travelPercent * 100),
    };
  }, [bdStatusMap, entries]);

  const worldStatusMap = useMemo(() => {
    const map: Record<string, TravelStatus> = {};
    for (const e of countryEntries) map[e.entityId] = e.status;
    return map;
  }, [countryEntries]);

  const worldStats = useMemo(() => {
    const visited = Object.values(worldStatusMap).filter((s) => s === 'visited' || s === 'favorite' || s === 'lived_here').length;
    return { visited, total: countries.length, divisions: 0, percent: Math.round((visited / countries.length) * 100) };
  }, [worldStatusMap]);

  const hasAny = bdStats.visited > 0 || entries.length > 0 || countryEntries.length > 0;

  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.passport')} title={t('share.studio')} body={t('share.subtitle')} />

      {!hasAny ? (
        <EmptyState
          icon={<ImagePlus size={22} aria-hidden />}
          title={t('passport.markFirst')}
          body={t('share.ctaBody')}
          action={<Link to="/map" className="btn btn-primary">{t('share.buildYours')}</Link>}
        />
      ) : (
        <SharePanel
          bdStatusMap={bdStatusMap}
          worldStatusMap={worldStatusMap}
          bdStats={bdStats}
          worldStats={worldStats}
          theme={theme}
          initialName={settings?.displayName}
        />
      )}
    </div>
  );
}
