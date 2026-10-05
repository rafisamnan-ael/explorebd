import { Link, useNavigate } from 'react-router-dom';
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
import { HeroSlideshow } from '@/components/home/HeroSlideshow';
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
  const navigate = useNavigate();
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
      <section className="hero hero-cinematic">
        <HeroSlideshow />
        <div className="container hero-cinematic-inner">
          <div className="hero-copy">
            <span className="hero-pill">{t('home.eyebrow')}</span>
            <h1 className="display-xl">{t('home.heroTitle')}</h1>
            <p className="hero-sub">{t('home.heroSubtitle')}</p>
            <div className="hero-actions">
              <Link to="/map" className="btn hero-cta-primary btn-lg">
                {t('home.ctaStartMap')} <ArrowRight size={18} aria-hidden />
              </Link>
              <Link to="/planner" className="btn hero-cta-ghost btn-lg">
                {t('home.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
        <a href="#map-preview" className="hero-scroll-cue" aria-label={t('home.mapPreviewCta')}>
          <span />
        </a>
      </section>

      <section className="section" id="map-preview">
        <div className="container home-map-grid">
          <div className="home-map-copy">
            <h2 className="section-title">{t('home.mapPreviewTitle')}</h2>
            <p className="muted">{t('home.mapPreviewCopy')}</p>
            {hasData ? (
              <div className="stat-grid" style={{ marginTop: 20 }}>
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
              <p className="muted" style={{ marginTop: 20 }}>{t('home.previewEmpty')}</p>
            )}
            <div className="cluster" style={{ gap: 12, marginTop: 24 }}>
              <Link to="/map" className="btn btn-primary">
                {t('home.mapPreviewCta')}
              </Link>
              <Link to="/share" className="btn btn-secondary">
                {t('share.title')}
              </Link>
            </div>
          </div>
          <div className="home-map-preview card">
            <BangladeshMap
              statusMap={previewStatus}
              theme={theme}
              showLabels={false}
              labelLanguage="en"
              onDistrictClick={() => navigate('/map')}
            />
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
    </div>
  );
}
