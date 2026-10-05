import { Bus, Car, Clock3, Copy, Loader2, MapPin, Printer, Save, Utensils, BedDouble, Ticket, Wallet, TrainFront, Plane, Route as RouteIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { formatDuration } from '@/lib/geo/haversine';
import type { ItineraryResult } from '@/lib/planner/itinerary';
import type { BudgetResult } from '@/lib/planner/budget';
import type { RouteResult } from '@/lib/routing/types';
import type { District, TransportMode } from '@/types';

export interface BuiltPlan {
  itinerary: ItineraryResult;
  budget: BudgetResult;
  route: RouteResult;
  orderedDistricts: District[];
  days: number;
  transportMode: TransportMode;
  approximate: boolean;
  startName: string;
}

const budgetIcons = {
  transportCost: Bus,
  accommodation: BedDouble,
  food: Utensils,
  entryFees: Ticket,
  localTransport: Car,
  contingency: Wallet,
} as const;

const modeIcons: Record<string, typeof Bus> = {
  bus: Bus,
  train: TrainFront,
  car: Car,
  flight: Plane,
  any: RouteIcon,
};

export function PlanResult({
  plan,
  saving,
  onSave,
  onPrint,
  onCopy,
}: {
  plan: BuiltPlan;
  saving: boolean;
  onSave: () => void;
  onPrint: () => void;
  onCopy: () => void;
}) {
  const { t, shortLocale, formatCurrency } = useI18n();
  const ModeIcon = modeIcons[plan.transportMode] ?? RouteIcon;

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="cluster" style={{ gap: 12 }}>
          <span className="badge badge-primary">{t('planner.planReady')}</span>
          <span className="cluster" style={{ gap: 6, fontSize: '0.85rem' }}>
            <ModeIcon size={16} aria-hidden />
            {t(`planner.transport${plan.transportMode.charAt(0).toUpperCase()}${plan.transportMode.slice(1)}`)}
          </span>
          <span className="cluster" style={{ gap: 6, fontSize: '0.85rem' }}>
            <Clock3 size={16} aria-hidden />
            {formatDuration(plan.route.totalDurationMinutes, shortLocale)}
          </span>
          <span className="cluster" style={{ gap: 6, fontSize: '0.85rem' }}>
            <MapPin size={16} aria-hidden />
            {Math.round(plan.route.totalDistanceKm)} {t('common.km')}
          </span>
        </div>
        <div className="cluster" style={{ gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCopy}>
            <Copy size={15} aria-hidden /> {t('common.copy')}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onPrint}>
            <Printer size={15} aria-hidden /> {t('planner.printPlan')}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 size={15} className="spin" aria-hidden /> : <Save size={15} aria-hidden />}
            {t('planner.saveDraft')}
          </button>
        </div>
      </div>

      {plan.approximate ? <p className="subtle" style={{ fontSize: '0.82rem' }}>⚠ {t('planner.approximateRoute')}</p> : null}

      <div className="plan-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <section className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>{t('planner.route')}</h3>
          <ol className="route-list">
            {plan.orderedDistricts.map((district, index) => (
              <li key={`${district.id}-${index}`} className="route-stop">
                <span className="route-index">{index + 1}</span>
                <span style={{ fontWeight: 600 }}>{shortLocale === 'bn' ? district.nameBn : district.nameEn}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>{t('planner.budgetTitleCard')}</h3>
          <ul className="budget-list">
            {plan.budget.categories.map((category) => {
              const Icon = budgetIcons[category.key];
              return (
                <li key={category.key} className="budget-row">
                  <span className="cluster" style={{ gap: 8 }}>
                    <Icon size={15} aria-hidden className="subtle" />
                    {t(`planner.${category.key}`)}
                  </span>
                  <span>{formatCurrency(category.amount)}</span>
                </li>
              );
            })}
            <li className="budget-row is-total">
              <span>{t('planner.tripTotal')}</span>
              <span>{formatCurrency(plan.budget.total)}</span>
            </li>
            <li className="budget-row">
              <span className="muted">{t('planner.perPerson')}</span>
              <span className="muted">{formatCurrency(plan.budget.perPerson)}</span>
            </li>
          </ul>
          <p className="subtle" style={{ fontSize: '0.75rem', marginTop: 12 }}>{t('planner.estimatedNote')}</p>
        </section>
      </div>

      <section>
        <h3 style={{ marginBottom: 14 }}>{t('planner.dayPlan')}</h3>
        <div className="stack" style={{ gap: 14 }}>
          {plan.itinerary.days.map((day) => (
            <div key={day.day} className="day-card">
              <div className="day-card-head">
                <span>{t('planner.day', { n: day.day })}</span>
                <span className="subtle">
                  {day.districts.length ? day.districts.map((id) => plan.orderedDistricts.find((d) => d.id === id)?.nameEn ?? '').filter(Boolean).join(' · ') : t('planner.noActivities')}
                </span>
              </div>
              <ul className="day-items">
                {day.items.map((item, index) => (
                  <li key={index} className="day-item">
                    <span className="day-item-time">{formatDuration(item.minutes, shortLocale)}</span>
                    {item.type === 'travel' ? <RouteIcon size={15} aria-hidden className="subtle" /> : item.type === 'place' ? <MapPin size={15} aria-hidden className="subtle" /> : <Utensils size={15} aria-hidden className="subtle" />}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
