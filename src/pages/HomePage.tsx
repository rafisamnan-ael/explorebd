import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Compass,
  Gamepad2,
  Landmark,
  Mountain,
  Palmtree,
  Route,
  Share2,
  Soup,
  Sparkles,
  TreePine,
  Users,
} from 'lucide-react';
import { useI18n } from '@/i18n';
import { brand } from '@/config/brand';
import { features } from '@/config/features';
import { districts } from '@/data/districts';
import { places } from '@/data/places';
import { useStatusMap } from '@/hooks/useStatusMap';
import { usePassportStore } from '@/store/passportStore';
import { computeStats } from '@/lib/passport/stats';
import { getMapTheme } from '@/lib/map/themes';
import { useSettingsStore } from '@/store/settingsStore';
import { BangladeshMap } from '@/components/maps/BangladeshMap';
import { PlaceCard } from '@/components/guide/PlaceCard';
import { Roulette } from '@/components/planner/Roulette';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { SectionHead } from '@/components/common/Chrome';
import type { TravelStatus } from '@/types';

const interestItems = [
  { id: 'nature', key: 'roulette.nature', Icon: TreePine },
  { id: 'beach', key: 'roulette.beach', Icon: Palmtree },
  { id: 'hill', key: 'roulette.hill', Icon: Mountain },
  { id: 'heritage', key: 'roulette.history', Icon: Landmark },
  { id: 'food', key: 'roulette.food', Icon: Soup },
  { id: 'city', key: 'roulette.city', Icon: Building2 },
  { id: 'family', key: 'planner.groupFamily', Icon: Users },
  { id: 'adventure', key: 'roulette.adventure', Icon: Compass },
];

const samplePreview: Record<string, TravelStatus> = {
  'bd-dhaka': 'visited',
  'bd-chattogram': 'visited',
  'bd-coxs-bazar': 'favorite',
  'bd-sylhet': 'visited',
  'bd-khulna': 'want_to_go',
  'bd-rangamati': 'want_to_go',
  'bd-rajshahi': 'lived_here',
};

export default function HomePage() {
  const { t, shortLocale } = useI18n();
  const statusMap = useStatusMap();
  const entries = usePassportStore((s) => s.entries);
  const settings = useSettingsStore((s) => s.settings);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');
  const stats = computeStats(statusMap, entries);

  const hasData = entries.length > 0;
  const previewStatus = hasData ? statusMap : samplePreview;
  const month = new Date().getMonth() + 1;

  const seasonalPlaces = places
    .filter((p) => p.bestMonths.includes(month) && p.published)
    .slice(0, 6);

  const guideDistricts = districts.slice(0, 8);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{t('home.eyebrow')}</span>
            <h1>{t('home.title')}</h1>
            <p>{t('home.subtitle')}</p>
            <div className="hero-actions">
              <Link to="/map" className="btn btn-primary btn-lg">
                {t('home.ctaPrimary')}
              </Link>
              <Link to="/planner" className="btn btn-secondary btn-lg">
                {t('home.ctaSecondary')}
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-map" aria-hidden>
              <BangladeshMap
                statusMap={previewStatus}
                theme={theme}
                showLabels={false}
                labelLanguage="en"
                onDistrictClick={() => undefined}
              />
            </div>
            <div className="card card-pad hero-float">
              <ProgressRing value={hasData ? stats.travelPercent : 0.36} size={92} sublabel={t('home.statVisited')} />
              <div style={{ marginTop: 10, fontSize: '0.8rem' }} className="muted">
                {hasData
                  ? t('map.progress', { visited: stats.visitedDistricts, total: stats.totalDistricts })
                  : t('home.previewEmpty')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            title={t('home.previewTitle')}
            action={
              <Link to="/passport" className="btn btn-sm btn-secondary">
                {t('passport.title')} <ArrowRight size={15} aria-hidden />
              </Link>
            }
          />
          <div className="card card-pad">
            {hasData ? (
              <div className="stat-grid">
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
            ) : (
              <div className="cluster" style={{ gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <p className="muted" style={{ maxWidth: 520 }}>{t('home.previewEmpty')}</p>
                <Link to="/map" className="btn btn-primary">
                  {t('home.startExploring')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <SectionHead title={t('home.seasonalTitle')} />
          <p className="muted" style={{ marginTop: -10, marginBottom: 20 }}>{t('home.seasonalSubtitle')}</p>
          <div className="scroll-row">
            {seasonalPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
          <div className="cluster" style={{ marginTop: 16 }}>
            <Link to={`/season/${month}`} className="btn btn-secondary btn-sm">
              {t('home.seasonalTitle')} <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={t('home.quickPlannerTitle')} />
          <div className="card card-pad cluster" style={{ gap: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 520 }}>
              <p className="muted">{t('home.quickPlannerSubtitle')}</p>
            </div>
            <Link to="/planner" className="btn btn-primary btn-lg">
              <Route size={18} aria-hidden /> {t('home.openPlanner')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <SectionHead title={t('home.interestsTitle')} />
          <p className="muted" style={{ marginTop: -10, marginBottom: 20 }}>{t('home.interestsSubtitle')}</p>
          <div className="interest-grid">
            {interestItems.map(({ id, key, Icon }) => (
              <Link key={id} to={`/guide?interest=${id}`} className="interest-card">
                <span className="interest-icon">
                  <Icon size={20} aria-hidden />
                </span>
                {t(key)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {features.travelRoulette ? (
        <section className="section">
          <div className="container">
            <SectionHead title={t('home.rouletteTitle')} />
            <p className="muted" style={{ marginTop: -10, marginBottom: 20 }}>{t('home.rouletteSubtitle')}</p>
            <Roulette />
          </div>
        </section>
      ) : null}

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <SectionHead
            title={t('home.guideTitle')}
            action={
              <Link to="/guide" className="btn btn-sm btn-secondary">
                {t('nav.guide')} <ArrowRight size={15} aria-hidden />
              </Link>
            }
          />
          <div className="card-grid">
            {guideDistricts.map((district) => (
              <Link key={district.id} to={`/guide/${district.slug}`} className="card card-pad card-hover">
                <strong>{shortLocale === 'bn' ? district.nameBn : district.nameEn}</strong>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {shortLocale === 'bn' ? district.divisionNameBn : district.divisionNameEn}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            title={t('home.gamesTitle')}
            action={
              <Link to="/games" className="btn btn-sm btn-secondary">
                {t('nav.games')} <ArrowRight size={15} aria-hidden />
              </Link>
            }
          />
          <p className="muted" style={{ marginTop: -10 }}>{t('home.gamesSubtitle')}</p>
          <div className="card-grid" style={{ marginTop: 20 }}>
            <Link to="/games/quiz" className="card card-pad card-hover cluster" style={{ gap: 12 }}>
              <span className="interest-icon"><Gamepad2 size={20} aria-hidden /></span>
              <span>{t('games.quiz')}</span>
            </Link>
            <Link to="/games/map-puzzle" className="card card-pad card-hover cluster" style={{ gap: 12 }}>
              <span className="interest-icon"><Sparkles size={20} aria-hidden /></span>
              <span>{t('games.mapPuzzle')}</span>
            </Link>
            <Link to="/leaderboard" className="card card-pad card-hover cluster" style={{ gap: 12 }}>
              <span className="interest-icon"><Compass size={20} aria-hidden /></span>
              <span>{t('games.leaderboardTitle')}</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface-2)' }}>
        <div className="container">
          <div className="card card-pad share-marketing">
            <span className="interest-icon"><Share2 size={20} aria-hidden /></span>
            <div style={{ flex: 1, minWidth: 260 }}>
              <h2 className="section-title" style={{ fontSize: '1.4rem' }}>{t('share.marketingTitle')}</h2>
              <p className="muted">{t('share.marketingBody')}</p>
            </div>
            <Link to="/share" className="btn btn-primary btn-lg">
              <Share2 size={18} aria-hidden /> {t('share.title')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card card-pad cluster" style={{ gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 640 }}>
              <h2 className="section-title">{t('home.trustTitle')}</h2>
              <p className="muted">{t('home.trustBody')}</p>
            </div>
            <Link to="/credits" className="btn btn-secondary">
              {t('home.viewCredits')}
            </Link>
          </div>
          <p className="subtle" style={{ marginTop: 20, fontSize: '0.8rem' }}>
            {brand.name} · {t('home.eyebrow')}
          </p>
        </div>
      </section>
    </div>
  );
}
