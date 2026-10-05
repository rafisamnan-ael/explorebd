import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Loader2, Minus, Plus, MapPin, Star, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useI18n } from '@/i18n';
import { getDistrict } from '@/data/districts';
import { placesForDistrict } from '@/data/places';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { getMapTheme } from '@/lib/map/themes';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { generateTripPlan, type GeneratedTripPlan } from '@/lib/planner/generatePlan';
import { defaultPlannerState, loadPlannerState, savePlannerState, clearPlannerState, type PlannerState, type TravelStyle } from '@/lib/planner/plannerState';
import { createTripDraft } from '@/lib/planner/saveTrip';
import { PlannerMap } from '@/components/planner/PlannerMap';
import { PlannerResults } from '@/components/planner/PlannerResults';
import { DistrictCombobox } from '@/components/planner/DistrictCombobox';
import { Modal } from '@/components/ui/Modal';
import { PageHero } from '@/components/common/Chrome';

function Numbered({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="planner-section">
      <div className="planner-section-head">
        <span className="planner-num">{n}</span>
        <div>
          <h2>{title}</h2>
          {hint ? <p className="muted">{hint}</p> : null}
        </div>
      </div>
      <div className="planner-section-body">{children}</div>
    </section>
  );
}

export default function PlannerPage() {
  const { t, shortLocale, formatCurrency } = useI18n();
  const isMobile = useIsMobile();
  const settings = useSettingsStore((s) => s.settings);
  const toast = useUiStore((s) => s.toast);
  const theme = getMapTheme(settings?.mapThemeId ?? 'forest');

  const [state, setState] = useState<PlannerState>(defaultPlannerState);
  const [resume, setResume] = useState<PlannerState | null>(null);
  const [plan, setPlan] = useState<GeneratedTripPlan | null>(null);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadPlannerState();
    if (saved && saved.destinationDistrictIds.length && saved.originDistrictId) setResume(saved);
  }, []);

  const update = (patch: Partial<PlannerState>) => {
    setState((s) => ({ ...s, ...patch }));
    setStale(true);
  };

  const toggleDestination = (id: string) => {
    setState((s) => {
      const has = s.destinationDistrictIds.includes(id);
      const destinationDistrictIds = has ? s.destinationDistrictIds.filter((x) => x !== id) : [...s.destinationDistrictIds, id];
      let manualRouteOrder = s.manualRouteOrder.filter((x) => destinationDistrictIds.includes(x));
      for (const d of destinationDistrictIds) if (!manualRouteOrder.includes(d)) manualRouteOrder = [...manualRouteOrder, d];
      const selectedPlaceIdsByDistrict = { ...s.selectedPlaceIdsByDistrict };
      if (has) delete selectedPlaceIdsByDistrict[id];
      return { ...s, destinationDistrictIds, manualRouteOrder, selectedPlaceIdsByDistrict };
    });
    setStale(true);
  };

  const orderedIds = plan ? plan.routeDistrictIds : state.routeMode === 'manual' && state.manualRouteOrder.length ? state.manualRouteOrder : state.destinationDistrictIds;

  const build = async () => {
    if (!state.originDistrictId) {
      setError('planner.errNoOrigin');
      return;
    }
    if (!state.destinationDistrictIds.length) {
      setError('planner.errNoDestination');
      return;
    }
    setError(null);
    setBuilding(true);
    try {
      const p = await generateTripPlan(state);
      setPlan(p);
      setStale(false);
      savePlannerState(state);
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch {
      setError('errors.generic');
    } finally {
      setBuilding(false);
    }
  };

  const startOver = () => {
    clearPlannerState();
    setState(defaultPlannerState());
    setPlan(null);
    setConfirmOpen(false);
    setResume(null);
    setStale(false);
  };

  const saveTrip = async () => {
    setSaving(true);
    try {
      const origin = getDistrict(state.originDistrictId ?? '');
      const first = getDistrict(state.destinationDistrictIds[0] ?? '');
      const title = `${origin?.nameEn ?? ''} → ${first?.nameEn ?? ''} · ${state.days} ${t('common.days')}`.trim();
      await createTripDraft({
        title,
        startDistrictId: state.originDistrictId ?? 'bd-dhaka',
        destinationDistrictIds: state.destinationDistrictIds,
        placeIds: Object.values(state.selectedPlaceIdsByDistrict).flat(),
        days: state.days,
        travelerCount: state.travellers,
        budgetBdt: state.totalBudget ?? undefined,
        interests: [],
        roundTrip: state.returnToOrigin,
      });
      toast(t('common.saved'), 'success');
    } finally {
      setSaving(false);
    }
  };

  const shareTrip = async () => {
    const route = [state.originDistrictId, ...plan?.routeDistrictIds ?? state.destinationDistrictIds].filter(Boolean).map((id) => (getDistrict(id!)?.nameEn ?? '')).join(' → ');
    const per = plan ? `~${formatCurrency(plan.costs.perPerson.low)}/person` : '';
    const text = `${route}\n${state.days} days · ${state.travellers} travellers\n${per}\nExploreBD`;
    try {
      await navigator.clipboard.writeText(text);
      toast(t('share.captionCopied'), 'success');
    } catch {
      toast(t('errors.generic'), 'danger');
    }
  };

  const mapElement = (
    <PlannerMap
      originId={state.originDistrictId}
      destinationIds={state.destinationDistrictIds}
      orderedIds={orderedIds}
      returnToOrigin={state.returnToOrigin}
      theme={theme}
      onDistrictClick={(id) => {
        if (id === state.originDistrictId) return;
        toggleDestination(id);
      }}
    />
  );

  const origin = getDistrict(state.originDistrictId ?? '');

  const placeCheckbox = (districtId: string) => {
    const districtPlaces = placesForDistrict(districtId);
    if (!districtPlaces.length) return <p className="subtle" style={{ fontSize: '0.82rem' }}>{t('planner.noAttractions')}</p>;
    const chosen = state.selectedPlaceIdsByDistrict[districtId] ?? [];
    return (
      <div className="attraction-list">
        {districtPlaces.map((p) => (
          <label key={p.id} className="attraction-item">
            <input
              type="checkbox"
              checked={chosen.includes(p.id)}
              onChange={() => {
                setState((s) => {
                  const cur = s.selectedPlaceIdsByDistrict[districtId] ?? [];
                  const next = cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id];
                  return { ...s, selectedPlaceIdsByDistrict: { ...s.selectedPlaceIdsByDistrict, [districtId]: next } };
                });
                setStale(true);
              }}
            />
            <span>{shortLocale === 'bn' ? p.nameBn : p.nameEn}</span>
            <span className="subtle">{p.categories[0]}{p.typicalDurationMinutes ? ` · ${Math.round(p.typicalDurationMinutes / 60) || 1}${shortLocale === 'bn' ? 'ঘ' : 'h'}` : ''}</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="container page planner-page">
      <PageHero eyebrow={t('planner.eyebrow')} title={t('planner.title')} body={t('planner.description')} />

      {resume ? (
        <div className="card card-pad cluster" style={{ gap: 12, justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 }}>
          <span>{t('planner.continuePrev')}</span>
          <span className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => { setState(resume); setResume(null); }}>{t('planner.continue')}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { clearPlannerState(); setResume(null); }}>{t('planner.startNew')}</button>
          </span>
        </div>
      ) : null}

      <div className="planner-workspace">
        <div className="planner-controls">
          <Numbered n={1} title={t('planner.s1')} hint={t('planner.s1Hint')}>
            {origin ? (
              <div className="planner-origin cluster" style={{ gap: 10, justifyContent: 'space-between' }}>
                <span className="cluster" style={{ gap: 8 }}>
                  <span className="planner-origin-icon"><MapPin size={16} aria-hidden /></span>
                  <span>
                    <strong>{shortLocale === 'bn' ? origin.nameBn : origin.nameEn}</strong>
                    <span className="muted" style={{ display: 'block', fontSize: '0.8rem' }}>{shortLocale === 'bn' ? origin.divisionNameBn : origin.divisionNameEn}</span>
                  </span>
                </span>
                <Star size={16} aria-hidden style={{ color: 'var(--brass)' }} />
              </div>
            ) : null}
            <DistrictCombobox
              id="planner-origin"
              placeholder={t('planner.originPlaceholder')}
              excludeIds={[state.originDistrictId ?? '']}
              onSelect={(id) => {
                update({ originDistrictId: id, destinationDistrictIds: state.destinationDistrictIds.filter((x) => x !== id) });
              }}
            />
          </Numbered>

          <Numbered n={2} title={t('planner.s2')} hint={t('planner.s2Hint')}>
            <DistrictCombobox id="planner-dest" placeholder={t('planner.destinationPlaceholder')} excludeIds={[state.originDistrictId ?? '', ...state.destinationDistrictIds]} onSelect={toggleDestination} />
            {state.destinationDistrictIds.length ? (
              <ol className="destination-chips">
                {state.destinationDistrictIds.map((id, i) => {
                  const d = getDistrict(id);
                  return (
                    <li key={id} className="destination-chip">
                      <span className="destination-chip-num">{i + 1}</span>
                      <span>{d ? (shortLocale === 'bn' ? d.nameBn : d.nameEn) : id}</span>
                      <button type="button" aria-label={t('common.remove')} onClick={() => toggleDestination(id)}><Trash2 size={14} aria-hidden /></button>
                    </li>
                  );
                })}
              </ol>
            ) : null}
            {state.destinationDistrictIds.map((id) => {
              const d = getDistrict(id);
              return (
                <details key={id} className="attraction-details">
                  <summary>{t('planner.attractionsIn', { name: d ? (shortLocale === 'bn' ? d.nameBn : d.nameEn) : id })}</summary>
                  {placeCheckbox(id)}
                </details>
              );
            })}
          </Numbered>

          {isMobile ? <div className="planner-map planner-map-inline">{mapElement}</div> : null}

          <Numbered n={3} title={t('planner.s3')}>
            <label className="cluster" style={{ gap: 8, fontWeight: 600 }}>
              <input type="radio" checked={state.routeMode === 'optimized'} onChange={() => update({ routeMode: 'optimized' })} />
              {t('planner.smartRoute')}
            </label>
            {state.routeMode === 'manual' ? (
              <ol className="route-order-list">
                {state.manualRouteOrder.map((id, i) => (
                  <li key={id}>
                    <span className="route-order-index">{i + 1}</span>
                    <span>{getDistrict(id)?.[shortLocale === 'bn' ? 'nameBn' : 'nameEn']}</span>
                    <span className="cluster" style={{ gap: 4 }}>
                      <button type="button" className="btn-icon" aria-label="up" disabled={i === 0} onClick={() => {
                        const next = [...state.manualRouteOrder];
                        [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                        update({ manualRouteOrder: next });
                      }}><ArrowUp size={14} aria-hidden /></button>
                      <button type="button" className="btn-icon" aria-label="down" disabled={i === state.manualRouteOrder.length - 1} onClick={() => {
                        const next = [...state.manualRouteOrder];
                        [next[i + 1], next[i]] = [next[i]!, next[i + 1]!];
                        update({ manualRouteOrder: next });
                      }}><ArrowDown size={14} aria-hidden /></button>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            <label className="cluster" style={{ gap: 8, fontWeight: 600 }}>
              <input type="checkbox" checked={state.routeMode === 'manual'} onChange={(e) => update({ routeMode: e.target.checked ? 'manual' : 'optimized' })} />
              {t('planner.manualRoute')}
            </label>
          </Numbered>

          <Numbered n={4} title={t('planner.s4')}>
            <div className="stepper">
              <button type="button" className="btn-icon" aria-label={t('common.remove')} onClick={() => update({ days: Math.max(1, state.days - 1) })}><Minus size={16} aria-hidden /></button>
              <span className="stepper-value">{state.days} {t('common.days')}</span>
              <button type="button" className="btn-icon" aria-label={t('common.add')} onClick={() => update({ days: Math.min(30, state.days + 1) })}><Plus size={16} aria-hidden /></button>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label className="field-label" htmlFor="planner-budget">{t('planner.totalBudgetOptional')}</label>
              <div className="budget-input">
                <span>৳</span>
                <input id="planner-budget" type="number" min={0} className="input" value={state.totalBudget ?? ''} placeholder="20000" onChange={(e) => update({ totalBudget: e.target.value ? Number(e.target.value) : null })} />
              </div>
            </div>
          </Numbered>

          <Numbered n={5} title={t('planner.s5')}>
            <div className="stepper">
              <button type="button" className="btn-icon" aria-label={t('common.remove')} onClick={() => update({ travellers: Math.max(1, state.travellers - 1) })}><Minus size={16} aria-hidden /></button>
              <span className="stepper-value">{state.travellers} {t('common.people')}</span>
              <button type="button" className="btn-icon" aria-label={t('common.add')} onClick={() => update({ travellers: Math.min(30, state.travellers + 1) })}><Plus size={16} aria-hidden /></button>
            </div>
            <div className="style-cards">
              {(['save', 'balanced', 'comfort'] as TravelStyle[]).map((style) => (
                <label key={style} className="style-card" data-active={state.travelStyle === style}>
                  <input type="radio" name="style" checked={state.travelStyle === style} onChange={() => update({ travelStyle: style })} />
                  <strong>{t(`planner.style${style.charAt(0).toUpperCase()}${style.slice(1)}`)}</strong>
                  <span className="muted">{t(`planner.style${style.charAt(0).toUpperCase()}${style.slice(1)}Desc`)}</span>
                </label>
              ))}
            </div>
            <label className="cluster" style={{ gap: 8, fontWeight: 600, marginTop: 12 }}>
              <input type="checkbox" checked={state.returnToOrigin} onChange={(e) => update({ returnToOrigin: e.target.checked })} />
              {t('planner.returnOrigin')}
            </label>
          </Numbered>

          {error ? <p className="field-error" role="alert">{t(error)}</p> : null}

          <div className={`planner-cta ${isMobile ? 'planner-cta-sticky' : ''}`}>
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => void build()} disabled={building}>
              {building ? <Loader2 size={18} className="spin" aria-hidden /> : null}
              {building ? t('planner.building') : stale && plan ? t('planner.updatePlan') : t('planner.buildCta')}
            </button>
          </div>
        </div>

        {!isMobile ? (
          <div className="planner-map planner-map-sticky">{mapElement}</div>
        ) : null}
      </div>

      <div ref={resultsRef}>
        {plan ? (
          <PlannerResults
            plan={plan}
            state={state}
            saving={saving}
            onUpdate={update}
            onPrint={() => window.print()}
            onSave={() => void saveTrip()}
            onShare={() => void shareTrip()}
            onStartOver={() => setConfirmOpen(true)}
          />
        ) : (
          <div className="planner-empty card card-pad">
            <div className="eyebrow">{t('planner.emptyTitle')}</div>
            <p className="muted">{t('planner.emptyBody')}</p>
          </div>
        )}
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t('planner.startOver')}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmOpen(false)}>{t('common.cancel')}</button>
            <button type="button" className="btn btn-primary" onClick={startOver}>{t('planner.startOver')}</button>
          </>
        }
      >
        <p className="muted">{t('planner.startOverConfirm')}</p>
      </Modal>
    </div>
  );
}
