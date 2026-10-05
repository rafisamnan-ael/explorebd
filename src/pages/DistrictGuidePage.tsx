import { Link, useParams } from 'react-router-dom';
import { MapPin, Plane, Utensils } from 'lucide-react';
import { useI18n } from '@/i18n';
import { districtBySlug, districts, getDistrict } from '@/data/districts';
import { placesForDistrict } from '@/data/places';
import { famousForDistrict } from '@/data/famous';
import { useStatusMap } from '@/hooks/useStatusMap';
import { useSettingsStore } from '@/store/settingsStore';
import { getMapTheme } from '@/lib/map/themes';
import { haversineKm } from '@/lib/geo/haversine';
import { BangladeshMap } from '@/components/maps/BangladeshMap';
import { PlaceCard } from '@/components/guide/PlaceCard';
import { FreshnessBadge } from '@/components/guide/FreshnessBadge';
import { Breadcrumbs, SectionHead } from '@/components/common/Chrome';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import NotFoundPage from './NotFoundPage';

export default function DistrictGuidePage() {
  const { districtSlug } = useParams();
  const { t, shortLocale } = useI18n();
  const statusMap = useStatusMap();
  const settings = useSettingsStore((s) => s.settings);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');

  const district = districtBySlug.get(districtSlug ?? '');
  if (!district) return <NotFoundPage />;

  const places = placesForDistrict(district.id);
  const famous = famousForDistrict(district.id);
  const status = statusMap[district.id] ?? 'unvisited';

  const nearby = districts
    .filter((d) => d.divisionId === district.divisionId && d.id !== district.id)
    .map((d) => ({ d, km: haversineKm({ lat: district.lat, lng: district.lng }, { lat: d.lat, lng: d.lng }) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 5);

  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: t('nav.guide'), to: '/guide' },
          { label: shortLocale === 'bn' ? district.divisionNameBn : district.divisionNameEn },
          { label: shortLocale === 'bn' ? district.nameBn : district.nameEn },
        ]}
      />

      <div className="page-hero" style={{ paddingTop: 0 }}>
        <div className="cluster" style={{ gap: 10, marginBottom: 10 }}>
          <span className="badge badge-river">
            <MapPin size={13} aria-hidden /> {shortLocale === 'bn' ? district.divisionNameBn : district.divisionNameEn}
          </span>
          <StatusPill status={status} />
        </div>
        <h1>{shortLocale === 'bn' ? district.nameBn : district.nameEn}</h1>
        <p className="muted">{shortLocale === 'bn' ? district.nameEn : district.nameBn}</p>
        <div className="cluster" style={{ gap: 10, marginTop: 12 }}>
          <Link to="/map" className="btn btn-primary btn-sm">
            {t('map.title')}
          </Link>
        </div>
      </div>

      <div className="guide-layout has-toc">
        <nav className="guide-toc" aria-label={t('common.tableOfContents')}>
          <ul>
            <li><a href="#overview">{t('guide.district.overview')}</a></li>
            <li><a href="#top-places">{t('guide.district.topPlaces')}</a></li>
            <li><a href="#famous">{t('guide.district.famousFoods')}</a></li>
            <li><a href="#nearby">{t('guide.district.nearby')}</a></li>
            <li><a href="#sources">{t('guide.district.sources')}</a></li>
          </ul>
        </nav>

        <div className="stack" style={{ gap: 32 }}>
          <section aria-labelledby="overview">
            <h2 className="section-title" id="overview">{t('guide.district.overview')}</h2>
            <div className="card" style={{ height: 320, marginTop: 16, overflow: 'hidden' }}>
              <BangladeshMap
                statusMap={statusMap}
                theme={theme}
                showLabels={false}
                labelLanguage="en"
                selectedDistrictId={district.id}
                onDistrictClick={() => undefined}
                ariaLabel={`${district.nameEn} map`}
              />
            </div>
          </section>

          <section aria-labelledby="top-places">
            <SectionHead id="top-places" title={t('guide.district.topPlaces')} />
            {places.length ? (
              <div className="card-grid">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Plane size={22} aria-hidden />}
                title={t('guide.district.noPlaces')}
                action={
                  <Link to="/guide" className="btn btn-secondary">
                    {t('nav.guide')}
                  </Link>
                }
              />
            )}
          </section>

          {famous.length ? (
            <section aria-labelledby="famous">
              <SectionHead id="famous" title={t('guide.district.famousFoods')} />
              <div className="pill-row">
                {famous.map((f) => (
                  <span key={f.id} className="badge">
                    {f.type === 'food' ? <Utensils size={12} aria-hidden /> : null}
                    {shortLocale === 'bn' ? f.nameBn : f.nameEn}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="nearby">
            <SectionHead id="nearby" title={t('guide.district.nearby')} />
            <div className="pill-row">
              {nearby.map(({ d, km }) => (
                <Link key={d.id} to={`/guide/${d.slug}`} className="chip">
                  {shortLocale === 'bn' ? d.nameBn : d.nameEn} · {Math.round(km)} {t('common.km')}
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="sources">
            <SectionHead id="sources" title={t('guide.district.sources')} />
            <div className="card card-pad stack" style={{ gap: 8 }}>
              <FreshnessBadge verifiedAt={places[0]?.verifiedAt} confidence={places[0]?.confidence} />
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                {t('guide.place.noData')}
              </p>
              <Link to="/credits" className="muted" style={{ fontSize: '0.85rem' }}>
                {t('credits.title')} →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function districtLabel(id: string): string {
  const d = getDistrict(id);
  return d ? d.nameEn : id;
}
