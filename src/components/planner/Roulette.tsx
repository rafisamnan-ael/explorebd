import { useState } from 'react';
import { Dices, Loader2, MapPin, Route, Wallet } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { districts } from '@/data/districts';
import { places } from '@/data/places';
import { useStatusMap } from '@/hooks/useStatusMap';
import { spinRoulette } from '@/lib/planner/roulette';
import { createTripDraft } from '@/lib/planner/saveTrip';
import type { Recommendation } from '@/lib/planner/recommend';
import type { GroupType } from '@/types';

const vibes = [
  { id: 'nature', key: 'roulette.nature' },
  { id: 'history', key: 'roulette.history' },
  { id: 'beach', key: 'roulette.beach' },
  { id: 'hill', key: 'roulette.hill' },
  { id: 'food', key: 'roulette.food' },
  { id: 'adventure', key: 'roulette.adventure' },
];

export function Roulette() {
  const { t, shortLocale, formatCurrency, formatNumber } = useI18n();
  const statusMap = useStatusMap();
  const toast = useUiStore((s) => s.toast);

  const [start, setStart] = useState('bd-dhaka');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [vibe, setVibe] = useState<string>('nature');
  const [maxBudget, setMaxBudget] = useState(15000);
  const [includeVisited, setIncludeVisited] = useState(false);
  const [groupType, setGroupType] = useState<GroupType>('friends');
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  const spin = () => {
    setSpinning(true);
    setResult(null);
    window.setTimeout(() => {
      const pick = spinRoulette({
        filters: {
          startDistrictId: start,
          maxBudgetBdt: maxBudget,
          month,
          interest: vibe,
          includeVisited,
          groupType,
        },
        statusMap,
        places,
      });
      setResult(pick ?? null);
      setSpinning(false);
    }, 1200);
  };

  const saveToTrip = async () => {
    if (!result) return;
    await createTripDraft({
      title: `${result.district.nameEn} trip`,
      startDistrictId: start,
      destinationDistrictIds: [result.district.id],
      placeIds: [result.place.id],
      days: 2,
      groupType,
      budgetBdt: maxBudget,
      interests: [vibe],
    });
    toast(t('common.saved'), 'success');
  };

  return (
    <div className="card card-pad stack" style={{ gap: 18 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="roulette-start">{t('planner.startDistrict')}</label>
          <select id="roulette-start" className="select" value={start} onChange={(e) => setStart(e.target.value)}>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>{shortLocale === 'bn' ? d.nameBn : d.nameEn}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="roulette-month">{t('roulette.month')}</label>
          <select id="roulette-month" className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{t(`season.month.${m}`)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="roulette-group">{t('roulette.groupType')}</label>
          <select id="roulette-group" className="select" value={groupType} onChange={(e) => setGroupType(e.target.value as GroupType)}>
            <option value="solo">{t('planner.groupSolo')}</option>
            <option value="couple">{t('planner.groupCouple')}</option>
            <option value="family">{t('planner.groupFamily')}</option>
            <option value="friends">{t('planner.groupFriends')}</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="roulette-budget">
            {t('roulette.maxBudget')} · {formatCurrency(maxBudget)}
          </label>
          <input
            id="roulette-budget"
            type="range"
            min={3000}
            max={60000}
            step={1000}
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <span className="eyebrow">{t('roulette.interest')}</span>
        <div className="pill-row">
          {vibes.map((v) => (
            <button key={v.id} type="button" className="chip" aria-pressed={vibe === v.id} onClick={() => setVibe(v.id)}>
              {t(v.key)}
            </button>
          ))}
        </div>
      </div>

      <label className="cluster" style={{ gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
        <input type="checkbox" checked={includeVisited} onChange={(e) => setIncludeVisited(e.target.checked)} />
        {t('roulette.showVisited')}
      </label>

      <div className="cluster" style={{ gap: 12 }}>
        <button type="button" className="btn btn-primary btn-lg" onClick={spin} disabled={spinning}>
          {spinning ? <Loader2 size={18} className="spin" aria-hidden /> : <Dices size={18} aria-hidden />}
          {spinning ? t('roulette.spinning') : result ? t('roulette.again') : t('roulette.spin')}
        </button>
      </div>

      {!spinning && !result ? <p className="muted">{t('roulette.subtitle')}</p> : null}

      {result ? (
        <div className="card card-pad stack" style={{ gap: 12, background: 'var(--primary-soft)', borderColor: 'transparent' }}>
          <span className="eyebrow">{t('roulette.yourDestination')}</span>
          <h3 style={{ fontSize: '1.5rem' }}>{shortLocale === 'bn' ? result.district.nameBn : result.district.nameEn}</h3>
          <p className="muted">{shortLocale === 'bn' ? result.place.nameBn : result.place.nameEn}</p>
          <div className="cluster" style={{ gap: 16, flexWrap: 'wrap', fontSize: '0.9rem' }}>
            <span className="cluster" style={{ gap: 6 }}>
              <MapPin size={15} aria-hidden /> {shortLocale === 'bn' ? result.district.divisionNameBn : result.district.divisionNameEn}
            </span>
            <span className="cluster" style={{ gap: 6 }}>
              <Route size={15} aria-hidden /> {formatNumber(Math.round(result.distanceKm))} {t('common.km')}
            </span>
            <span className="cluster" style={{ gap: 6 }}>
              <Wallet size={15} aria-hidden /> ~{formatCurrency(result.estimatedBudget)}
            </span>
          </div>
          <div>
            <span className="eyebrow">{t('roulette.why')}</span>
            <ul className="list-clean" style={{ marginTop: 6, display: 'grid', gap: 4 }}>
              {result.reasons.slice(0, 4).map((reason, i) => (
                <li key={i} className="muted" style={{ fontSize: '0.88rem' }}>
                  • {t(reason.key, reason.params)}
                </li>
              ))}
            </ul>
          </div>
          <div className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={() => void saveToTrip()}>
              {t('roulette.saveToTrip')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={spin}>
              {t('roulette.again')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
