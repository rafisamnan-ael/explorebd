import { useRef, useState } from 'react';
import { Check, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useI18n } from '@/i18n';
import { districts, getDistrict } from '@/data/districts';
import { places, placesForDistrict } from '@/data/places';
import { interestOptions } from '@/data/seasons';
import { useStatusMap } from '@/hooks/useStatusMap';
import { useUiStore } from '@/store/uiStore';
import { getRoutingProvider, optimizeOrder } from '@/lib/routing';
import { buildItinerary } from '@/lib/planner/itinerary';
import { computeBudget } from '@/lib/planner/budget';
import { recommendDestinations } from '@/lib/planner/recommend';
import { createTripDraft } from '@/lib/planner/saveTrip';
import { printNode } from '@/lib/export/exportImage';
import { PlanResult, type BuiltPlan } from '@/components/planner/PlanResult';
import { PageHero } from '@/components/common/Chrome';
import type { GroupType, HotelTier, Pace, TransportMode } from '@/types';

const interestKeys = interestOptions;

export default function PlannerPage() {
  const { t } = useI18n();
  const statusMap = useStatusMap();
  const toast = useUiStore((s) => s.toast);
  const resultRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [startDistrictId, setStartDistrictId] = useState('bd-dhaka');
  const [destinationDistrictIds, setDestinationDistrictIds] = useState<string[]>([]);
  const [placeIds, setPlaceIds] = useState<string[]>([]);
  const [useDates, setUseDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(2);
  const [pace, setPace] = useState<Pace>('balanced');
  const [groupType, setGroupType] = useState<GroupType>('friends');
  const [travelerCount, setTravelerCount] = useState(2);
  const [children, setChildren] = useState(false);
  const [interests, setInterests] = useState<string[]>(['nature']);
  const [budgetBdt, setBudgetBdt] = useState(15000);
  const [hotelTier, setHotelTier] = useState<HotelTier>('mid');
  const [transport, setTransport] = useState<TransportMode>('bus');
  const [roundTrip, setRoundTrip] = useState(true);
  const [building, setBuilding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<BuiltPlan | null>(null);

  const steps = [
    t('planner.startTitle'),
    t('planner.destinationTitle'),
    t('planner.datesTitle'),
    t('planner.peopleTitle'),
    t('planner.budgetTitle'),
    t('planner.buildTitle'),
  ];

  const effectiveDays = (() => {
    if (useDates && startDate && endDate) {
      const diff = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) + 1;
      return Math.max(1, diff);
    }
    return days;
  })();

  const toggleDistrict = (id: string) => {
    setDestinationDistrictIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const togglePlace = (id: string) => {
    setPlaceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const recommend = () => {
    const recommendations = recommendDestinations(
      {
        places,
        statusMap,
        month: new Date().getMonth() + 1,
        interests,
        budgetBdt,
        days: effectiveDays,
        startDistrictId,
        groupType,
        pace,
        hotelTier,
      },
      3,
    );
    setDestinationDistrictIds(recommendations.map((r) => r.district.id));
    toast(t('recommend.title'), 'success');
  };

  const build = async () => {
    setBuilding(true);
    setPlan(null);
    try {
      const destDistricts = destinationDistrictIds.map((id) => getDistrict(id)).filter(Boolean) as NonNullable<ReturnType<typeof getDistrict>>[];
      const startDistrict = getDistrict(startDistrictId) ?? districts[0]!;
      const points = [startDistrict, ...destDistricts].map((d) => ({ lat: d.lat, lng: d.lng }));
      const provider = getRoutingProvider([transport]);
      const matrix = await provider.matrix(points);
      const order = optimizeOrder(matrix.durations, roundTrip);
      const orderedDistricts = order.map((i) => [startDistrict, ...destDistricts][i]!);
      const orderedPoints = order.map((i) => points[i]!);
      const route = await provider.route(orderedPoints);

      const placesByDistrict: Record<string, typeof places> = {};
      for (const district of orderedDistricts) {
        const chosen = placeIds.filter((pid) => places.find((p) => p.id === pid)?.districtId === district.id);
        const source = chosen.length
          ? places.filter((p) => chosen.includes(p.id))
          : placesForDistrict(district.id).slice(0, 2);
        if (source.length) placesByDistrict[district.id] = source;
      }

      const itinerary = buildItinerary({ orderedDistricts, placesByDistrict, dayCount: effectiveDays, pace, roundTrip });
      const budget = computeBudget({
        legs: route.legs,
        days: effectiveDays,
        travelerCount,
        hotelTier,
        pace,
        transportPreferences: [transport],
      });

      setPlan({ itinerary, budget, route, orderedDistricts, days: effectiveDays, transportMode: transport, approximate: route.approximate, startName: startDistrict.nameEn });
      setStep(5);
    } catch {
      toast(t('errors.generic'), 'danger');
    } finally {
      setBuilding(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await createTripDraft({
        title: `${getDistrict(startDistrictId)?.nameEn ?? 'Bangladesh'} trip`,
        startDistrictId,
        destinationDistrictIds,
        placeIds,
        startDate: useDates ? startDate : undefined,
        endDate: useDates ? endDate : undefined,
        days: effectiveDays,
        travelerCount,
        groupType,
        children,
        budgetBdt,
        pace,
        hotelTier,
        transportPreferences: [transport],
        interests,
        roundTrip,
      });
      toast(t('common.saved'), 'success');
    } finally {
      setSaving(false);
    }
  };

  const copySummary = async () => {
    if (!plan) return;
    const lines = [
      `${t('planner.title')} — ${getDistrict(startDistrictId)?.nameEn}`,
      `${t('planner.route')}: ${plan.orderedDistricts.map((d) => d.nameEn).join(' → ')}`,
      `${t('planner.tripTotal')}: ৳${plan.budget.total}`,
      `${t('planner.perPerson')}: ৳${plan.budget.perPerson}`,
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    toast(t('common.copied'), 'success');
  };

  const onPrint = () => {
    if (resultRef.current) void printNode(resultRef.current);
  };

  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.planner')} title={t('planner.title')} body={t('planner.subtitle')} />

      <div className="wizard-head">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            className="wizard-step"
            data-active={index === step}
            data-done={index < step}
            onClick={() => setStep(index)}
          >
            <span className="wizard-step-index">{index < step ? <Check size={13} aria-hidden /> : index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="card card-pad wizard-body">
        {step === 0 ? (
          <div className="stack" style={{ gap: 16 }}>
            <h3>{t('planner.startTitle')}</h3>
            <p className="muted">{t('planner.startSubtitle')}</p>
            <div className="field" style={{ maxWidth: 420 }}>
              <label className="field-label" htmlFor="planner-start">{t('planner.startDistrict')}</label>
              <select id="planner-start" className="select" value={startDistrictId} onChange={(e) => setStartDistrictId(e.target.value)}>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameEn} — {d.nameBn}</option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="stack" style={{ gap: 16 }}>
            <h3>{t('planner.destinationTitle')}</h3>
            <p className="muted">{t('planner.destinationSubtitle')}</p>
            <div className="cluster" style={{ gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={recommend}>
                <Wand2 size={15} aria-hidden /> {t('planner.recommendForMe')}
              </button>
              <span className="muted" style={{ fontSize: '0.85rem' }}>{t('common.selected', { count: destinationDistrictIds.length })}</span>
            </div>
            <div className="pill-row" style={{ maxHeight: 220, overflow: 'auto' }}>
              {districts.filter((d) => d.id !== startDistrictId).map((d) => (
                <button key={d.id} type="button" className="chip" aria-pressed={destinationDistrictIds.includes(d.id)} onClick={() => toggleDistrict(d.id)}>
                  {d.nameEn}
                </button>
              ))}
            </div>
            {destinationDistrictIds.length ? (
              <div className="stack" style={{ gap: 12 }}>
                <h4>{t('planner.chosenPlaces')}</h4>
                {destinationDistrictIds.map((id) => {
                  const dc = getDistrict(id);
                  const dcPlaces = placesForDistrict(id);
                  if (!dc || !dcPlaces.length) return null;
                  return (
                    <div key={id} className="stack" style={{ gap: 6 }}>
                      <strong style={{ fontSize: '0.9rem' }}>{dc.nameEn}</strong>
                      <div className="pill-row">
                        {dcPlaces.map((p) => (
                          <button key={p.id} type="button" className="chip" aria-pressed={placeIds.includes(p.id)} onClick={() => togglePlace(p.id)}>
                            {p.nameEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="stack" style={{ gap: 16 }}>
            <h3>{t('planner.datesTitle')}</h3>
            <p className="muted">{t('planner.datesSubtitle')}</p>
            <div className="pill-row">
              <button type="button" className="chip" aria-pressed={!useDates} onClick={() => setUseDates(false)}>{t('planner.useDays')}</button>
              <button type="button" className="chip" aria-pressed={useDates} onClick={() => setUseDates(true)}>{t('planner.useDates')}</button>
            </div>
            {useDates ? (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="field">
                  <label className="field-label" htmlFor="p-start">{t('planner.startDate')}</label>
                  <input id="p-start" type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="p-end">{t('planner.endDate')}</label>
                  <input id="p-end" type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="field" style={{ maxWidth: 220 }}>
                <label className="field-label" htmlFor="p-days">{t('planner.numberOfDays')}</label>
                <input id="p-days" type="number" min={1} max={30} className="input" value={days} onChange={(e) => setDays(Number(e.target.value))} />
              </div>
            )}
            <div className="field">
              <span className="field-label">{t('planner.pace')}</span>
              <div className="pill-row">
                {(['relaxed', 'balanced', 'packed'] as Pace[]).map((p) => (
                  <button key={p} type="button" className="chip" aria-pressed={pace === p} onClick={() => setPace(p)}>
                    {t(`planner.pace${p.charAt(0).toUpperCase()}${p.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="stack" style={{ gap: 16 }}>
            <h3>{t('planner.peopleTitle')}</h3>
            <p className="muted">{t('planner.peopleSubtitle')}</p>
            <div className="field">
              <span className="field-label">{t('planner.groupType')}</span>
              <div className="pill-row">
                {(['solo', 'couple', 'family', 'friends'] as GroupType[]).map((g) => (
                  <button key={g} type="button" className="chip" aria-pressed={groupType === g} onClick={() => setGroupType(g)}>
                    {t(`planner.group${g.charAt(0).toUpperCase()}${g.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field" style={{ maxWidth: 220 }}>
              <label className="field-label" htmlFor="p-travelers">{t('planner.travelerCount')}</label>
              <input id="p-travelers" type="number" min={1} max={40} className="input" value={travelerCount} onChange={(e) => setTravelerCount(Number(e.target.value))} />
            </div>
            <label className="cluster" style={{ gap: 8, fontWeight: 600 }}>
              <input type="checkbox" checked={children} onChange={(e) => setChildren(e.target.checked)} />
              {t('planner.withChildren')}
            </label>
            <div className="field">
              <span className="field-label">{t('planner.interests')}</span>
              <div className="pill-row">
                {interestKeys.map((interest) => (
                  <button key={interest} type="button" className="chip" aria-pressed={interests.includes(interest)} onClick={() => setInterests((prev) => prev.includes(interest) ? prev.filter((x) => x !== interest) : [...prev, interest])}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="stack" style={{ gap: 16 }}>
            <h3>{t('planner.budgetTitle')}</h3>
            <p className="muted">{t('planner.budgetSubtitle')}</p>
            <div className="field" style={{ maxWidth: 420 }}>
              <label className="field-label" htmlFor="p-budget">{t('planner.totalBudget')}</label>
              <input id="p-budget" type="number" min={0} step={500} className="input" value={budgetBdt} onChange={(e) => setBudgetBdt(Number(e.target.value))} />
            </div>
            <div className="field">
              <span className="field-label">{t('planner.hotelTier')}</span>
              <div className="pill-row">
                {(['budget', 'mid', 'premium'] as HotelTier[]).map((h) => (
                  <button key={h} type="button" className="chip" aria-pressed={hotelTier === h} onClick={() => setHotelTier(h)}>
                    {t(`planner.hotel${h.charAt(0).toUpperCase()}${h.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field-label">{t('planner.transport')}</span>
              <div className="pill-row">
                {(['bus', 'train', 'car', 'flight', 'any'] as TransportMode[]).map((m) => (
                  <button key={m} type="button" className="chip" aria-pressed={transport === m} onClick={() => setTransport(m)}>
                    {t(`planner.transport${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
            <label className="cluster" style={{ gap: 8, fontWeight: 600 }}>
              <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} />
              {t('planner.roundTrip')}
            </label>
          </div>
        ) : null}

        {step === 5 ? (
          <div>
            {plan ? (
              <div ref={resultRef}>
                <PlanResult plan={plan} saving={saving} onSave={() => void saveDraft()} onPrint={onPrint} onCopy={() => void copySummary()} />
              </div>
            ) : (
              <div className="stack" style={{ gap: 16, alignItems: 'center', textAlign: 'center', padding: '40px 0' }}>
                <Sparkles size={28} aria-hidden style={{ color: 'var(--primary)' }} />
                <h3>{t('planner.buildTitle')}</h3>
                <p className="muted">{t('planner.buildSubtitle')}</p>
                <button type="button" className="btn btn-primary btn-lg" onClick={() => void build()} disabled={building || destinationDistrictIds.length === 0}>
                  {building ? <Loader2 size={18} className="spin" aria-hidden /> : <Sparkles size={18} aria-hidden />}
                  {building ? t('common.loading') : t('planner.generate')}
                </button>
                {destinationDistrictIds.length === 0 ? <p className="subtle">{t('planner.emptyDestinations')}</p> : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="wizard-foot">
        <button type="button" className="btn btn-secondary" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          {t('common.back')}
        </button>
        {step < 4 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => Math.min(5, s + 1))}>
            {t('common.next')}
          </button>
        ) : step === 4 ? (
          <button type="button" className="btn btn-primary" onClick={() => void build()} disabled={building || destinationDistrictIds.length === 0}>
            {building ? <Loader2 size={16} className="spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
            {t('planner.generate')}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={() => void build()} disabled={building || destinationDistrictIds.length === 0}>
            {t('planner.regenerate')}
          </button>
        )}
      </div>
    </div>
  );
}
