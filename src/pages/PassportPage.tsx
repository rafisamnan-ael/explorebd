import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Columns3,
  Compass,
  Download,
  Landmark,
  MapPin,
  Milestone,
  Mountain,
  MountainSnow,
  Trees,
  Trophy,
  Waves,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { useStatusMap } from '@/hooks/useStatusMap';
import { usePassportStore } from '@/store/passportStore';
import { useSettingsStore } from '@/store/settingsStore';
import { computeStats } from '@/lib/passport/stats';
import { buildAchievementContext, evaluateAchievements } from '@/lib/passport/achievements';
import { getDistrict } from '@/data/districts';
import { getMapTheme } from '@/lib/map/themes';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero, SectionHead } from '@/components/common/Chrome';
import { ExportDialog } from '@/components/sharing/ExportDialog';
import type { TravelStatus } from '@/types';

const iconMap = {
  'map-pin': MapPin,
  compass: Compass,
  milestone: Milestone,
  trophy: Trophy,
  landmark: Landmark,
  mountain: Mountain,
  waves: Waves,
  'mountain-snow': MountainSnow,
  'columns-3': Columns3,
  trees: Trees,
  'calendar-check': Calendar,
} as const;

export default function PassportPage() {
  const { t, shortLocale } = useI18n();
  const statusMap = useStatusMap();
  const entries = usePassportStore((s) => s.entries);
  const settings = useSettingsStore((s) => s.settings);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');
  const [exportOpen, setExportOpen] = useState(false);

  const stats = useMemo(() => computeStats(statusMap, entries), [statusMap, entries]);
  const achievements = useMemo(
    () => evaluateAchievements(buildAchievementContext(statusMap, entries)),
    [statusMap, entries],
  );
  const unlocked = achievements.filter((a) => a.unlocked).length;

  const legendLabels = {
    unvisited: t('status.unvisited'),
    want_to_go: t('status.want_to_go'),
    visited: t('status.visited'),
    favorite: t('status.favorite'),
    lived_here: t('status.lived_here'),
  } as Record<TravelStatus, string>;

  const recent = [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className="container page">
      <PageHero eyebrow={t('home.eyebrow')} title={t('passport.title')} body={t('passport.subtitle')}>
        <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setExportOpen(true)}>
          <Download size={17} aria-hidden /> {t('passport.exportPassport')}
        </button>
      </PageHero>

      {!entries.length ? (
        <EmptyState
          icon={<MapPin size={22} aria-hidden />}
          title={t('passport.markFirst')}
          body={t('home.previewEmpty')}
          action={<Link to="/map" className="btn btn-primary">{t('home.startExploring')}</Link>}
        />
      ) : null}

      <div className="card card-pad cluster" style={{ gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
        <ProgressRing value={stats.travelPercent} size={168} sublabel={t('passport.statTraveled')} />
        <div className="stat-grid" style={{ flex: 1, minWidth: 300 }}>
          <div className="stat-tile">
            <div className="stat-tile-value">{stats.visitedDistricts}</div>
            <div className="stat-tile-label">{t('passport.districtsVisited')}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{stats.divisionsComplete}/8</div>
            <div className="stat-tile-label">{t('passport.divisionsComplete')}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{stats.favorites}</div>
            <div className="stat-tile-label">{t('passport.favorites')}</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-value">{stats.wantToGo}</div>
            <div className="stat-tile-label">{t('passport.wishlist')}</div>
          </div>
        </div>
      </div>

      {stats.nextMilestone ? (
        <div className="milestone" style={{ marginTop: 24 }}>
          <Milestone size={26} aria-hidden style={{ color: 'var(--primary)' }} />
          <div>
            <div className="eyebrow">{t('passport.nextMilestone')}</div>
            <strong>{t('passport.milestone', { count: stats.nextMilestone.remaining, name: stats.nextMilestone.nameEn })}</strong>
          </div>
        </div>
      ) : null}

      <section className="section">
        <SectionHead title={t('passport.divisionsComplete')} />
        <div className="division-grid">
          {stats.divisionProgress.map((division) => (
            <div key={division.id} className="division-card">
              <div className="division-card-name">{shortLocale === 'bn' ? division.nameBn : division.nameEn}</div>
              <div className="division-card-count">{t('map.divisionProgress', { visited: division.visited, total: division.total })}</div>
              <div className="division-bar">
                <span style={{ width: `${Math.round(division.percent * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHead title={t('passport.badges')} />
        <p className="muted" style={{ marginTop: -10, marginBottom: 20 }}>
          {t('passport.achievementsUnlocked', { unlocked, total: achievements.length })}
        </p>
        <div className="badge-grid">
          {achievements.map(({ achievement, unlocked: isUnlocked, progress }) => {
            const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? Trophy;
            return (
              <div key={achievement.id} className="badge-card" data-locked={!isUnlocked}>
                <span className="badge-icon">
                  <Icon size={20} aria-hidden />
                </span>
                <div>
                  <strong style={{ fontSize: '0.92rem' }}>{t(achievement.nameKey)}</strong>
                  <div className="subtle" style={{ fontSize: '0.78rem' }}>{t(achievement.descriptionKey)}</div>
                  <div className="subtle" style={{ fontSize: '0.74rem', marginTop: 4 }}>
                    {Math.min(progress, achievement.goal)}/{achievement.goal}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {recent.length ? (
        <section className="section">
          <SectionHead title={t('passport.recent')} />
          <div className="stack" style={{ gap: 10 }}>
            {recent.map((entry) => {
              const d = getDistrict(entry.entityId);
              return (
                <div key={entry.id} className="cluster card card-pad" style={{ gap: 12, justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{d ? (shortLocale === 'bn' ? d.nameBn : d.nameEn) : entry.entityId}</span>
                  <StatusPill status={entry.status} />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        statusMap={statusMap}
        theme={theme}
        legendLabels={legendLabels}
        displayName={settings?.displayName || undefined}
        subtitle={t('passport.title')}
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
