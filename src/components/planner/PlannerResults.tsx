import { useI18n } from '@/i18n';
import { getDistrict } from '@/data/districts';
import { formatDuration } from '@/lib/geo/haversine';
import { hotelRateForDistrict, PRICE_LABELS } from '@/data/travel-cost';
import { CheckCircle2, AlertTriangle, Bus, TrainFront, Plane, Printer, Save, Share2, RotateCcw, Info } from 'lucide-react';
import type { GeneratedTripPlan } from '@/lib/planner/generatePlan';
import type { PlannerState } from '@/lib/planner/plannerState';

const modeIcon = { bus: Bus, train: TrainFront, flight: Plane, car: Bus, boat: Bus } as const;

interface PlannerResultsProps {
  plan: GeneratedTripPlan;
  state: PlannerState;
  saving: boolean;
  onUpdate: (patch: Partial<PlannerState>) => void;
  onPrint: () => void;
  onSave: () => void;
  onShare: () => void;
  onStartOver: () => void;
}

export function PlannerResults({ plan, state, saving, onUpdate, onPrint, onSave, onShare, onStartOver }: PlannerResultsProps) {
  const { t, shortLocale, formatCurrency } = useI18n();
  const name = (id: string) => {
    const d = getDistrict(id);
    return d ? (shortLocale === 'bn' ? d.nameBn : d.nameEn) : id;
  };

  const feas = plan.feasibility;
  const feasTone = feas === 'comfortable' ? 'var(--success)' : feas === 'busy' ? 'var(--warning)' : 'var(--danger)';
  const feasLabel = t(`planner.feas${feas === 'comfortable' ? 'Comfortable' : feas === 'busy' ? 'Busy' : 'TooTight'}`);

  const costRows: Array<{ key: keyof GeneratedTripPlan['costs']; label: string; detail: string }> = [
    { key: 'transport', label: t('planner.transportCost'), detail: t('planner.whyTransport') },
    { key: 'accommodation', label: t('planner.accommodation'), detail: t('planner.whyHotel') },
    { key: 'food', label: t('planner.food'), detail: t('planner.whyFood') },
    { key: 'localTransport', label: t('planner.localTransport'), detail: t('planner.whyLocal') },
    { key: 'entryFees', label: t('planner.entryFees'), detail: t('planner.whyEntry') },
    { key: 'extras', label: t('planner.extras'), detail: t('planner.whyExtras') },
  ];
  const maxHigh = Math.max(1, ...costRows.map((r) => plan.costs[r.key].high));

  return (
    <div className="planner-results">
      <div className="pr-summary card card-pad">
        <div className="eyebrow">{t('planner.yourTrip')}</div>
        <h2 className="section-title" style={{ fontSize: '1.5rem', marginTop: 4 }}>
          {[state.originDistrictId, ...plan.routeDistrictIds].filter(Boolean).map((id) => name(id!)).join(' → ')}
        </h2>
        <div className="cluster" style={{ gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
          <span className="badge">{plan.days.length} {t('common.days')}</span>
          <span className="badge">{state.travellers} {t('common.people')}</span>
          <span className="badge badge-primary">{t(`planner.style${state.travelStyle.charAt(0).toUpperCase()}${state.travelStyle.slice(1)}`)}</span>
          <span className="badge">~{Math.round(plan.totalDistanceKm)} {t('common.km')}</span>
          <span className="badge">~{formatDuration(plan.totalTravelMinutes, shortLocale)} {shortLocale === 'bn' ? 'ভ্রমণ' : 'travel'}</span>
        </div>
        <div className="cluster" style={{ gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="stat-tile-label">{t('planner.estimatedTotal')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(plan.costs.total.low)}–{formatCurrency(plan.costs.total.high)}</div>
          </div>
          <div>
            <div className="stat-tile-label">{t('planner.perPerson')}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatCurrency(plan.costs.perPerson.low)}–{formatCurrency(plan.costs.perPerson.high)}</div>
          </div>
          {state.totalBudget ? (
            <div>
              <div className="stat-tile-label">{t('planner.budget')}</div>
              <div className="cluster" style={{ gap: 8 }}>
                <strong>{formatCurrency(state.totalBudget)}</strong>
                {plan.budgetStatus ? (
                  <span className="badge" style={{ color: plan.budgetStatus === 'within' ? 'var(--success)' : plan.budgetStatus === 'near' ? 'var(--warning)' : 'var(--danger)' }}>
                    {t(`planner.budget${plan.budgetStatus === 'within' ? 'Within' : plan.budgetStatus === 'near' ? 'Near' : 'Over'}`)}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        {plan.suggestions.length ? (
          <ul className="list-clean" style={{ marginTop: 12, display: 'grid', gap: 4 }}>
            {plan.suggestions.map((s) => (
              <li key={s} className="muted" style={{ fontSize: '0.85rem' }}>• {t(`planner.${s}`)}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="card card-pad cluster" style={{ gap: 12, alignItems: 'flex-start' }}>
        <span style={{ color: feasTone, marginTop: 2 }}>
          {feas === 'comfortable' ? <CheckCircle2 size={20} aria-hidden /> : <AlertTriangle size={20} aria-hidden />}
        </span>
        <div>
          <strong>{t('planner.feasibility')}: {feasLabel}</strong>
          <p className="muted" style={{ fontSize: '0.88rem', marginTop: 2 }}>
            {feas === 'too_tight'
              ? t('planner.feasTooTightHint')
              : feas === 'busy'
                ? t('planner.feasBusyHint')
                : t('planner.feasComfortableHint')}
          </p>
          {plan.warnings.includes('approximate_route') ? <p className="subtle" style={{ fontSize: '0.8rem' }}>{t('planner.approxRouteNote')}</p> : null}
          {plan.warnings.includes('entry_not_included') ? <p className="subtle" style={{ fontSize: '0.8rem' }}>{t('planner.entryNotIncluded')}</p> : null}
        </div>
      </div>

      <section>
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>{t('planner.transportHeading')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          {plan.segments.map((seg) => (
            <div key={seg.key} className="card card-pad">
              <div className="cluster" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <strong>{name(seg.originId)} → {name(seg.destinationId)}</strong>
                <span className="subtle" style={{ fontSize: '0.82rem' }}>~{Math.round(seg.distanceKm)} {t('common.km')}</span>
              </div>
              <div className="cluster" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {seg.options.map((opt) => {
                  const Icon = modeIcon[opt.mode];
                  const active = opt.id === seg.chosenId;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className="chip"
                      aria-pressed={active}
                      onClick={() => onUpdate({ selectedTransportBySegment: { ...state.selectedTransportBySegment, [seg.key]: opt.id } })}
                    >
                      <Icon size={15} aria-hidden />
                      {opt.label}
                      <span className="subtle" style={{ marginLeft: 6 }}>
                        {formatCurrency(opt.farePerPerson.low)}{opt.farePerPerson.high !== opt.farePerPerson.low ? `–${formatCurrency(opt.farePerPerson.high)}` : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              {(() => {
                const chosen = seg.options.find((o) => o.id === seg.chosenId) ?? seg.options[0]!;
                return (
                  <div className="cluster" style={{ gap: 10, marginTop: 10, fontSize: '0.8rem' }}>
                    <span className="badge badge-primary">{chosen.sourceLabel}</span>
                    <span className="subtle">{t('planner.duration')}: ~{formatDuration(chosen.durationMinutes, shortLocale)}</span>
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>{t('planner.costBreakdown')}</h3>
        <div className="card card-pad">
          {costRows.map((row) => {
            const c = plan.costs[row.key];
            return (
              <details key={row.key} className="cost-row">
                <summary>
                  <span>{row.label}</span>
                  <span className="cost-bar"><span style={{ width: `${Math.round((c.high / maxHigh) * 100)}%` }} /></span>
                  <span className="cost-value">{formatCurrency(c.low)}–{formatCurrency(c.high)}</span>
                </summary>
                <p className="subtle" style={{ fontSize: '0.82rem', padding: '6px 0 10px' }}>{row.detail}</p>
              </details>
            );
          })}
          <div className="budget-row is-total" style={{ marginTop: 10 }}>
            <span>{t('planner.estimatedTotal')}</span>
            <span>{formatCurrency(plan.costs.total.low)}–{formatCurrency(plan.costs.total.high)}</span>
          </div>
          <div className="budget-row">
            <span className="muted">{t('planner.perPerson')}</span>
            <span className="muted">{formatCurrency(plan.costs.perPerson.low)}–{formatCurrency(plan.costs.perPerson.high)}</span>
          </div>
        </div>
      </section>

      {plan.overnightDistrictIds.length ? (
        <section>
          <h3 className="section-title" style={{ fontSize: '1.2rem' }}>{t('planner.whereToStay')}</h3>
          <div className="stack" style={{ gap: 10 }}>
            {[...new Set(plan.overnightDistrictIds)].map((id) => {
              const tier = state.travelStyle === 'save' ? 'budget' : state.travelStyle === 'comfort' ? 'premium' : 'mid';
              const h = hotelRateForDistrict(id, tier === 'budget' ? 'budget' : tier === 'premium' ? 'premium' : 'mid');
              return (
                <div key={id} className="card card-pad cluster" style={{ justifyContent: 'space-between', gap: 10 }}>
                  <span><strong>{name(id)}</strong> · {t(`planner.hotel${tier === 'budget' ? 'Budget' : tier === 'premium' ? 'Premium' : 'Mid'}`)}</span>
                  <span className="cluster" style={{ gap: 8 }}>
                    <span className="badge">{formatCurrency(h.rate)}/{t('planner.night')}</span>
                    <span className="badge badge-primary">{h.confidence === 'city_baseline' ? PRICE_LABELS.city_baseline : PRICE_LABELS.fallback_estimate}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section>
        <h3 className="section-title" style={{ fontSize: '1.2rem' }}>{t('planner.dayPlan')}</h3>
        <div className="stack" style={{ gap: 12 }}>
          {plan.days.map((d) => (
            <div key={d.index} className="day-card">
              <div className="day-card-head">
                <span>{t('planner.day', { n: d.index })}</span>
                <span className="subtle">{d.title}</span>
              </div>
              <ul className="day-items">
                {d.items.map((item, i) => (
                  <li key={i} className="day-item">
                    <span className="day-item-time">{item.time}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
                <li className="day-item subtle">{t('planner.approxTiming')}</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <label className="cluster card card-pad" style={{ gap: 10, fontWeight: 600 }}>
        <input type="checkbox" checked={state.useOvernightTravel} onChange={(e) => onUpdate({ useOvernightTravel: e.target.checked })} />
        <span>
          {t('planner.overnightLabel')}
          <span className="muted" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 400 }}>{t('planner.overnightHint')}</span>
        </span>
      </label>

      <div className="cluster" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-primary" onClick={onPrint}><Printer size={16} aria-hidden /> {t('planner.printPdf')}</button>
        <button type="button" className="btn btn-secondary" onClick={onSave} disabled={saving}><Save size={16} aria-hidden /> {t('planner.saveTrip')}</button>
        <button type="button" className="btn btn-secondary" onClick={onShare}><Share2 size={16} aria-hidden /> {t('planner.shareTrip')}</button>
        <button type="button" className="btn btn-ghost" onClick={onStartOver}><RotateCcw size={16} aria-hidden /> {t('planner.startOver')}</button>
      </div>

      <p className="subtle cluster" style={{ gap: 6, fontSize: '0.76rem' }}>
        <Info size={14} aria-hidden /> {t('planner.disclaimer')}
      </p>
    </div>
  );
}
