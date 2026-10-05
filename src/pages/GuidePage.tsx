import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '@/i18n';
import { districts, divisions } from '@/data/districts';
import { places } from '@/data/places';
import { useStatusMap } from '@/hooks/useStatusMap';
import { PlaceCard } from '@/components/guide/PlaceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchesQuery } from '@/lib/search/normalize';
import { PageHero } from '@/components/common/Chrome';
import type { Place } from '@/types';

type SortKey = 'recommended' | 'budgetLow' | 'short' | 'fresh';

export default function GuidePage() {
  const { t, shortLocale } = useI18n();
  const [params, setParams] = useSearchParams();
  const statusMap = useStatusMap();

  const [query, setQuery] = useState('');
  const [division, setDivision] = useState('all');
  const [districtId, setDistrictId] = useState('all');
  const [category, setCategory] = useState('all');
  const [month, setMonth] = useState('all');
  const [budget, setBudget] = useState('all');
  const [duration, setDuration] = useState('all');
  const [family, setFamily] = useState(false);
  const [visitedFilter, setVisitedFilter] = useState<'all' | 'visited' | 'unvisited'>('all');
  const [sort, setSort] = useState<SortKey>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const interest = params.get('interest') ?? '';

  const filtered = useMemo(() => {
    const list = places.filter((place) => {
      if (!place.published) return false;
      if (division !== 'all') {
        const d = districts.find((x) => x.id === place.districtId);
        if (d?.divisionId !== division) return false;
      }
      if (districtId !== 'all' && place.districtId !== districtId) return false;
      if (category !== 'all' && !place.categories.includes(category as Place['categories'][number])) return false;
      if (month !== 'all' && !place.bestMonths.includes(Number(month))) return false;
      if (interest && ![...place.interests, ...place.categories].includes(interest)) return false;
      if (family && !place.familyFriendly) return false;
      if (budget !== 'all') {
        const max = place.cost?.maxBdt ?? 0;
        if (budget === 'low' && max > 1000) return false;
        if (budget === 'mid' && (max <= 1000 || max > 4000)) return false;
        if (budget === 'high' && max <= 4000) return false;
      }
      if (duration !== 'all') {
        const mins = place.typicalDurationMinutes ?? 120;
        if (duration === 'short' && mins >= 150) return false;
        if (duration === 'full' && mins < 150) return false;
      }
      const status = statusMap[place.districtId] ?? 'unvisited';
      const isVisited = status === 'visited' || status === 'favorite' || status === 'lived_here';
      if (visitedFilter === 'visited' && !isVisited) return false;
      if (visitedFilter === 'unvisited' && isVisited) return false;
      if (query && !matchesQuery(query, { primary: [place.nameEn, place.nameBn], secondary: [place.shortDescriptionEn] })) {
        return false;
      }
      return true;
    });

    switch (sort) {
      case 'budgetLow':
        return [...list].sort((a, b) => (a.cost?.maxBdt ?? 1e9) - (b.cost?.maxBdt ?? 1e9));
      case 'short':
        return [...list].sort((a, b) => (a.typicalDurationMinutes ?? 120) - (b.typicalDurationMinutes ?? 120));
      case 'fresh':
        return [...list].sort((a, b) => (b.verifiedAt ?? '').localeCompare(a.verifiedAt ?? ''));
      default:
        return list;
    }
  }, [query, division, districtId, category, month, budget, duration, family, visitedFilter, sort, interest, statusMap]);

  const clearFilters = () => {
    setQuery('');
    setDivision('all');
    setDistrictId('all');
    setCategory('all');
    setMonth('all');
    setBudget('all');
    setDuration('all');
    setFamily(false);
    setVisitedFilter('all');
    setParams({});
  };

  const availableDistricts = division === 'all' ? districts : districts.filter((d) => d.divisionId === division);

  return (
    <div className="container page">
      <PageHero eyebrow={t('home.guideSubtitle')} title={t('guide.title')} body={t('guide.subtitle')} />

      <div className="guide-toolbar">
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <label className="field-label" htmlFor="guide-search">{t('common.search')}</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} aria-hidden style={{ position: 'absolute', left: 12, top: 15, color: 'var(--text-subtle)' }} />
            <input
              id="guide-search"
              className="input"
              style={{ paddingLeft: 38 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('guide.searchPlaceholder')}
            />
          </div>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setFiltersOpen((v) => !v)}>
          <SlidersHorizontal size={17} aria-hidden /> {t('common.filters')}
        </button>
        <div className="field" style={{ minWidth: 180 }}>
          <label className="field-label" htmlFor="guide-sort">{t('common.sort')}</label>
          <select id="guide-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="recommended">{t('guide.sortRecommended')}</option>
            <option value="budgetLow">{t('guide.sortBudgetLow')}</option>
            <option value="short">{t('guide.sortShort')}</option>
            <option value="fresh">{t('guide.sortFresh')}</option>
          </select>
        </div>
      </div>

      {filtersOpen ? (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            <div className="field">
              <label className="field-label" htmlFor="f-division">{t('guide.filterDivision')}</label>
              <select id="f-division" className="select" value={division} onChange={(e) => { setDivision(e.target.value); setDistrictId('all'); }}>
                <option value="all">{t('common.all')}</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{shortLocale === 'bn' ? d.nameBn : d.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-district">{t('guide.filterDistrict')}</label>
              <select id="f-district" className="select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
                <option value="all">{t('common.all')}</option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{shortLocale === 'bn' ? d.nameBn : d.nameEn}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-category">{t('guide.filterCategory')}</label>
              <select id="f-category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">{t('common.all')}</option>
                {['beach', 'hill', 'nature', 'heritage', 'religious', 'wildlife', 'city', 'adventure', 'waterfall', 'lake', 'island'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-month">{t('guide.filterMonth')}</label>
              <select id="f-month" className="select" value={month} onChange={(e) => setMonth(e.target.value)}>
                <option value="all">{t('common.all')}</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{t(`season.month.${m}`)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-budget">{t('guide.filterBudget')}</label>
              <select id="f-budget" className="select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                <option value="all">{t('common.all')}</option>
                <option value="low">৳</option>
                <option value="mid">৳৳</option>
                <option value="high">৳৳৳</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-duration">{t('guide.filterDuration')}</label>
              <select id="f-duration" className="select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="all">{t('common.all')}</option>
                <option value="short">{t('guide.durShort')}</option>
                <option value="full">{t('guide.durFull')}</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="f-visited">{t('guide.filterVisited')}</label>
              <select id="f-visited" className="select" value={visitedFilter} onChange={(e) => setVisitedFilter(e.target.value as typeof visitedFilter)}>
                <option value="all">{t('common.all')}</option>
                <option value="visited">{t('guide.visitedOnly')}</option>
                <option value="unvisited">{t('guide.unvisitedOnly')}</option>
              </select>
            </div>
          </div>
          <label className="cluster" style={{ gap: 8, marginTop: 16, fontWeight: 600 }}>
            <input type="checkbox" checked={family} onChange={(e) => setFamily(e.target.checked)} />
            {t('guide.filterFamily')}
          </label>
          <div className="cluster" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearFilters}>{t('guide.clearFilters')}</button>
          </div>
        </div>
      ) : null}

      <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <span className="muted">{t('guide.placeCount', { count: filtered.length })}</span>
        {interest ? (
          <button type="button" className="chip is-active" onClick={() => setParams({})}>
            {interest} · {t('common.clear')}
          </button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="card-grid">
          {filtered.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={t('guide.noResults')}
          body={t('guide.noResultsHint')}
          action={
            <button type="button" className="btn btn-primary" onClick={clearFilters}>
              {t('guide.clearFilters')}
            </button>
          }
        />
      )}
    </div>
  );
}
