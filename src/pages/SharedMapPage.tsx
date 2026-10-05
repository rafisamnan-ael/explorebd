import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Compass, Copy, Link2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { getMapTheme } from '@/lib/map/themes';
import { computeStats } from '@/lib/passport/stats';
import { buildShareCaption, decodeShareMap, encodeShareMap, shareMapUrl } from '@/lib/share/shareCode';
import { openShareWindow, sharePlatforms } from '@/lib/share/social';
import { BangladeshMap } from '@/components/maps/BangladeshMap';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/common/Chrome';
import { statusMeta } from '@/components/ui/StatusPill';
import type { TravelStatus } from '@/types';

export default function SharedMapPage() {
  const { code = '' } = useParams();
  const { t, shortLocale } = useI18n();
  const settings = useSettingsStore((s) => s.settings);
  const toast = useUiStore((s) => s.toast);
  const theme = getMapTheme('forest');

  const payload = useMemo(() => decodeShareMap(code), [code]);

  const legendLabels = {
    unvisited: t('status.unvisited'),
    want_to_go: t('status.want_to_go'),
    visited: t('status.visited'),
    favorite: t('status.favorite'),
    lived_here: t('status.lived_here'),
  } as Record<TravelStatus, string>;

  if (!payload) {
    return (
      <div className="container page">
        <EmptyState
          icon={<Compass size={22} aria-hidden />}
          title={t('share.invalidLink')}
          body={t('share.ctaBody')}
          action={<Link to="/map" className="btn btn-primary">{t('share.buildYours')}</Link>}
        />
      </div>
    );
  }

  const stats = computeStats(payload.statusMap, []);
  const shareUrl = shareMapUrl(encodeShareMap(payload.statusMap, payload.name ?? ''));
  const caption = buildShareCaption(shortLocale, {
    visited: stats.visitedDistricts,
    total: stats.totalDistricts,
    divisions: stats.divisionsComplete,
    percent: Math.round(stats.travelPercent * 100),
  });

  const title = payload.name ? t('share.viewing', { name: payload.name }) : t('share.viewingGeneric');

  return (
    <div className="container page">
      <PageHero eyebrow={t('share.title')} title={title} body={t('share.sharedProgress', { visited: stats.visitedDistricts, total: stats.totalDistricts })} />

      <div className="map-stage" style={{ marginBottom: 20 }}>
        <BangladeshMap
          statusMap={payload.statusMap}
          theme={theme}
          showLabels={settings?.showLabels ?? false}
          labelLanguage={settings?.labelLanguage ?? 'en'}
          ariaLabel={title}
        />
      </div>

      <div className="share-shared-layout">
        <div className="card card-pad cluster" style={{ gap: 24, justifyContent: 'center' }}>
          <ProgressRing value={stats.travelPercent} size={140} sublabel={shortLocale === 'bn' ? 'বাংলাদেশের' : 'of Bangladesh'} />
          <div className="stat-grid" style={{ flex: 1, minWidth: 240 }}>
            <div className="stat-tile">
              <div className="stat-tile-value">{stats.visitedDistricts}/{stats.totalDistricts}</div>
              <div className="stat-tile-label">{t('passport.districtsVisited')}</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-value">{stats.divisionsComplete}/8</div>
              <div className="stat-tile-label">{t('passport.divisionsComplete')}</div>
            </div>
          </div>
        </div>

        <div className="card card-pad stack" style={{ gap: 14 }}>
          <span className="eyebrow">{t('share.shareTo')}</span>
          <div className="social-grid">
            {sharePlatforms.map((platform) => (
              <button
                key={platform}
                type="button"
                className="social-btn"
                onClick={() => openShareWindow(platform, shareUrl, caption)}
              >
                {platform === 'x' ? 'X' : platform.charAt(0).toUpperCase() + platform.slice(1)}
              </button>
            ))}
          </div>
          <div className="share-links">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                void navigator.clipboard.writeText(shareUrl);
                toast(t('share.linkCopied'), 'success');
              }}
            >
              <Link2 size={15} aria-hidden /> {t('share.shareLink')}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                void navigator.clipboard.writeText(caption);
                toast(t('share.captionCopied'), 'success');
              }}
            >
              <Copy size={15} aria-hidden /> {t('share.copyCaption')}
            </button>
          </div>
          <p className="subtle" style={{ fontSize: '0.78rem' }}>{t('share.readonlyNote')}</p>
        </div>
      </div>

      <div className="milestone" style={{ marginTop: 24, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">{t('share.ctaTitle')}</div>
          <strong>{t('share.ctaBody')}</strong>
        </div>
        <Link to="/map" className="btn btn-primary">
          {t('share.buildYours')}
        </Link>
      </div>

      <div className="pill-row" style={{ marginTop: 16 }}>
        {(['visited', 'want_to_go', 'favorite', 'lived_here'] as TravelStatus[]).map((status) => {
          const count = Object.values(payload.statusMap).filter((s) => s === status).length;
          if (!count) return null;
          return (
            <span key={status} className="badge">
              <span className="status-dot" style={{ background: `var(${statusMeta[status].colorVar})` }} aria-hidden />
              {legendLabels[status]} · {count}
            </span>
          );
        })}
      </div>
    </div>
  );
}
