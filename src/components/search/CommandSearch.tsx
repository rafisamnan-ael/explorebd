import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Landmark, MapPin, Search, Sparkles, Route as RouteIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useUiStore } from '@/store/uiStore';
import { db } from '@/db/local/db';
import { searchAll, type SearchResult } from '@/lib/search';
import type { TripDraft } from '@/types';

const typeIcons = {
  district: MapPin,
  place: Landmark,
  famous: Sparkles,
  trip: RouteIcon,
};

const typeLabels: Record<SearchResult['type'], string> = {
  district: 'search.districts',
  place: 'search.places',
  famous: 'search.famous',
  trip: 'search.trips',
};

export function CommandSearch() {
  const { t, shortLocale } = useI18n();
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [trips, setTrips] = useState<TripDraft[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      setQuery('');
      void db.tripDrafts.toArray().then(setTrips);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const results = useMemo(() => searchAll(query, trips), [query, trips]);

  const grouped = useMemo(() => {
    const map = new Map<SearchResult['type'], SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return map;
  }, [results]);

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    navigate(href);
  };

  return createPortal(
    <div className="search-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label={t('search.placeholder')}>
        <div className="search-input-row">
          <Search size={20} aria-hidden />
          <input
            ref={inputRef}
            className="search-input"
            type="search"
            value={query}
            placeholder={t('search.placeholder')}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('search.placeholder')}
          />
          <kbd className="search-kbd">Esc</kbd>
        </div>
        <div className="search-results">
          {query && results.length === 0 ? (
            <p className="muted search-empty">{t('search.noResults', { query })}</p>
          ) : null}
          {!query ? (
            <p className="muted search-empty">{t('search.hint')}</p>
          ) : null}
          {[...grouped.entries()].map(([type, items]) => {
            const Icon = typeIcons[type];
            return (
              <div key={type} className="search-group">
                <div className="search-group-title">{t(typeLabels[type])}</div>
                {items.map((item) => (
                  <button key={item.id} type="button" className="search-result" onClick={() => go(item.href)}>
                    <Icon size={17} aria-hidden />
                    <span className="search-result-main">
                      {shortLocale === 'bn' ? item.titleBn : item.title}
                    </span>
                    <span className="subtle search-result-sub">
                      {shortLocale === 'bn' ? item.subtitleBn : item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
