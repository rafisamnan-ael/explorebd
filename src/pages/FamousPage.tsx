import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useI18n } from '@/i18n';
import { famousEntries, famousTypes } from '@/data/famous';
import { getDistrict } from '@/data/districts';
import { matchesQuery } from '@/lib/search/normalize';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';

export default function FamousPage() {
  const { t, shortLocale } = useI18n();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>('all');
  const [districtId, setDistrictId] = useState('all');

  const districtOptions = useMemo(() => {
    const ids = [...new Set(famousEntries.map((f) => f.districtId))];
    return ids
      .map((id) => getDistrict(id))
      .filter(Boolean)
      .sort((a, b) => a!.nameEn.localeCompare(b!.nameEn));
  }, []);

  const filtered = famousEntries.filter((entry) => {
    if (type !== 'all' && entry.type !== type) return false;
    if (districtId !== 'all' && entry.districtId !== districtId) return false;
    if (query && !matchesQuery(query, { primary: [entry.nameEn, entry.nameBn] })) return false;
    return true;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const arr = map.get(entry.districtId) ?? [];
      arr.push(entry);
      map.set(entry.districtId, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="container page">
      <PageHero eyebrow={t('home.eyebrow')} title={t('famous.title')} body={t('famous.subtitle')} />

      <div className="guide-toolbar">
        <div className="field" style={{ flex: 1, minWidth: 200 }}>
          <label className="field-label" htmlFor="famous-search">{t('common.search')}</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} aria-hidden style={{ position: 'absolute', left: 12, top: 15, color: 'var(--text-subtle)' }} />
            <input id="famous-search" className="input" style={{ paddingLeft: 38 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('famous.searchPlaceholder')} />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="famous-district">{t('guide.filterDistrict')}</label>
          <select id="famous-district" className="select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
            <option value="all">{t('common.all')}</option>
            {districtOptions.map((d) => (
              <option key={d!.id} value={d!.id}>{shortLocale === 'bn' ? d!.nameBn : d!.nameEn}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 24 }}>
        <button type="button" className="chip" aria-pressed={type === 'all'} onClick={() => setType('all')}>{t('common.all')}</button>
        {famousTypes.map((ft) => (
          <button key={ft} type="button" className="chip" aria-pressed={type === ft} onClick={() => setType(ft)}>
            {t(`famous.types.${ft}`)}
          </button>
        ))}
      </div>

      {grouped.size ? (
        <div className="stack" style={{ gap: 32 }}>
          {[...grouped.entries()].map(([districtIdKey, entries]) => {
            const district = getDistrict(districtIdKey);
            return (
              <section key={districtIdKey}>
                {district ? (
                  <Link to={`/guide/${district.slug}`} style={{ display: 'inline-block', marginBottom: 12 }}>
                    <h2 className="section-title" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                      {shortLocale === 'bn' ? district.nameBn : district.nameEn}
                    </h2>
                  </Link>
                ) : null}
                <div className="pill-row">
                  {entries.map((entry) => (
                    <span key={entry.id} className="badge" title={shortLocale === 'bn' ? entry.noteBn : entry.noteEn}>
                      <span className="subtle" style={{ fontSize: '0.7rem' }}>{t(`famous.types.${entry.type}`)}</span>
                      {shortLocale === 'bn' ? entry.nameBn : entry.nameEn}
                    </span>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t('famous.noResults')} action={<button type="button" className="btn btn-secondary" onClick={() => { setQuery(''); setType('all'); setDistrictId('all'); }}>{t('guide.clearFilters')}</button>} />
      )}
    </div>
  );
}
