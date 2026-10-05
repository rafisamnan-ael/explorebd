import { Link } from 'react-router-dom';
import { CalendarClock, MapPin, Wallet, Clock3 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { getDistrict } from '@/data/districts';
import { bestMonthLabel } from '@/data/seasons';
import type { Place } from '@/types';
import { FreshnessBadge } from './FreshnessBadge';
import { useDistrictStatus } from '@/hooks/useStatusMap';
import { StatusPill } from '@/components/ui/StatusPill';

export function PlaceCard({ place }: { place: Place }) {
  const { t, shortLocale, formatCurrency } = useI18n();
  const district = getDistrict(place.districtId);
  const status = useDistrictStatus(place.districtId);
  const best = bestMonthLabel(place.bestMonths);

  return (
    <article className="card card-hover place-card">
      <Link to={`/place/${place.slug}`} className="place-card-body" style={{ color: 'inherit' }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="place-meta">
            <span className="badge badge-primary">{place.categories[0]}</span>
            {district ? (
              <span className="badge">
                <MapPin size={12} aria-hidden />
                {shortLocale === 'bn' ? district.nameBn : district.nameEn}
              </span>
            ) : null}
            {status !== 'unvisited' ? <StatusPill status={status} short /> : null}
          </div>
          <h3>{shortLocale === 'bn' ? place.nameBn : place.nameEn}</h3>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            {shortLocale === 'bn' ? place.shortDescriptionBn : place.shortDescriptionEn}
          </p>
        </div>
        <div className="stack" style={{ gap: 8, marginTop: 'auto' }}>
          <span className="cluster" style={{ gap: 6, fontSize: '0.82rem' }} title={t('guide.bestTime')}>
            <CalendarClock size={14} aria-hidden className="subtle" />
            <span className="muted">{shortLocale === 'bn' ? best.bn : best.en}</span>
          </span>
          <div className="cluster" style={{ gap: 14, fontSize: '0.82rem' }}>
            {place.typicalDurationMinutes ? (
              <span className="cluster" style={{ gap: 5 }}>
                <Clock3 size={14} aria-hidden className="subtle" />
                <span className="muted">{Math.round(place.typicalDurationMinutes / 60) || 1}{shortLocale === 'bn' ? ' ঘণ্টা' : 'h'}</span>
              </span>
            ) : null}
            {place.cost?.maxBdt ? (
              <span className="cluster" style={{ gap: 5 }}>
                <Wallet size={14} aria-hidden className="subtle" />
                <span className="muted">
                  ~{formatCurrency(place.cost.minBdt ?? 0)}–{formatCurrency(place.cost.maxBdt)}
                </span>
              </span>
            ) : (
              <span className="cluster" style={{ gap: 5 }}>
                <Wallet size={14} aria-hidden className="subtle" />
                <span className="muted">{t('common.unknown')}</span>
              </span>
            )}
          </div>
          <FreshnessBadge verifiedAt={place.verifiedAt} confidence={place.confidence} />
        </div>
      </Link>
    </article>
  );
}
