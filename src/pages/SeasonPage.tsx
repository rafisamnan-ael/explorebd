import { useParams, Navigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { places } from '@/data/places';
import { districtById } from '@/data/districts';
import { seasonalDistrictIds } from '@/data/seasons';
import { PlaceCard } from '@/components/guide/PlaceCard';
import { PageHero, SectionHead } from '@/components/common/Chrome';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SeasonPage() {
  const { monthSlug } = useParams();
  const { t, shortLocale } = useI18n();
  const month = Number(monthSlug);
  if (!Number.isInteger(month) || month < 1 || month > 12) return <Navigate to="/guide" replace />;

  const monthPlaces = places.filter((p) => p.published && p.bestMonths.includes(month));
  const districtIds = seasonalDistrictIds(month);

  return (
    <div className="container page">
      <PageHero
        eyebrow={t('season.title')}
        title={t('season.subtitle', { month: t(`season.month.${month}`) })}
        body={t('home.seasonalSubtitle')}
      />

      <SectionHead title={t('home.seasonalTitle')} />
      {monthPlaces.length ? (
        <div className="card-grid">
          {monthPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <EmptyState title={t('guide.noResults')} />
      )}

      <section className="section">
        <SectionHead title={t('map.districtList')} />
        <div className="pill-row">
          {districtIds.map((id) => {
            const d = districtById.get(id);
            if (!d) return null;
            return (
              <Link key={id} to={`/guide/${d.slug}`} className="chip">
                {shortLocale === 'bn' ? d.nameBn : d.nameEn}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
