import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Route, Trash2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { db } from '@/db/local/db';
import { getDistrict } from '@/data/districts';
import { useUiStore } from '@/store/uiStore';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { TripDraft } from '@/types';

export default function TripsPage() {
  const { t, shortLocale } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const [trips, setTrips] = useState<TripDraft[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    const rows = await db.tripDrafts.toArray();
    setTrips(rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    setLoaded(true);
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    await db.tripDrafts.delete(id);
    toast(t('common.removed'), 'success');
    void load();
  };

  return (
    <div className="container page page-narrow">
      <PageHero eyebrow={t('nav.planner')} title={t('planner.savedDrafts')} />

      {loaded && !trips.length ? (
        <EmptyState
          icon={<Route size={22} aria-hidden />}
          title={t('planner.noDrafts')}
          action={<Link to="/planner" className="btn btn-primary">{t('home.openPlanner')}</Link>}
        />
      ) : (
        <div className="stack" style={{ gap: 12 }}>
          {trips.map((trip) => {
            const start = getDistrict(trip.startDistrictId);
            const destinations = trip.destinationDistrictIds.map((id) => getDistrict(id)).filter(Boolean);
            return (
              <div key={trip.id} className="card card-pad cluster" style={{ gap: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div>
                  <strong>{trip.title}</strong>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {start ? (shortLocale === 'bn' ? start.nameBn : start.nameEn) : ''} → {destinations.map((d) => (shortLocale === 'bn' ? d!.nameBn : d!.nameEn)).join(', ') || '—'}
                  </div>
                  <div className="subtle" style={{ fontSize: '0.78rem' }}>
                    {trip.days ?? 2} {t('common.days')} · {trip.travelerCount} {t('common.people')}
                  </div>
                </div>
                <div className="cluster" style={{ gap: 8 }}>
                  <Link to={`/trip/${trip.id}`} className="btn btn-primary btn-sm">{t('planner.loadDraft')}</Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => void remove(trip.id)} aria-label={t('planner.deleteDraft')}>
                    <Trash2 size={15} aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
