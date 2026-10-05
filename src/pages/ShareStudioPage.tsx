import { Link } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useStatusMap } from '@/hooks/useStatusMap';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { computeStats } from '@/lib/passport/stats';
import { getMapTheme } from '@/lib/map/themes';
import { SharePanel } from '@/components/sharing/SharePanel';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TravelStatus } from '@/types';

export default function ShareStudioPage() {
  const { t } = useI18n();
  const statusMap = useStatusMap();
  const entries = usePassportStore((s) => s.entries);
  const settings = useSettingsStore((s) => s.settings);
  const stats = computeStats(statusMap, entries);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');

  const legendLabels = {
    unvisited: t('status.unvisited'),
    want_to_go: t('status.want_to_go'),
    visited: t('status.visited'),
    favorite: t('status.favorite'),
    lived_here: t('status.lived_here'),
  } as Record<TravelStatus, string>;

  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.passport')} title={t('share.studio')} body={t('share.subtitle')} />

      {stats.visitedDistricts === 0 && entries.length === 0 ? (
        <EmptyState
          icon={<ImagePlus size={22} aria-hidden />}
          title={t('passport.markFirst')}
          body={t('share.ctaBody')}
          action={<Link to="/map" className="btn btn-primary">{t('share.buildYours')}</Link>}
        />
      ) : (
        <SharePanel
          statusMap={statusMap}
          theme={theme}
          legendLabels={legendLabels}
          initialName={settings?.displayName}
          subtitle={t('home.title')}
          stats={{
            visited: stats.visitedDistricts,
            total: stats.totalDistricts,
            divisions: stats.divisionsComplete,
            percent: Math.round(stats.travelPercent * 100),
          }}
        />
      )}
    </div>
  );
}
