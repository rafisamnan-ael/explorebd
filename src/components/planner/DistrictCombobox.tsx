import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { districts } from '@/data/districts';
import { matchesQuery } from '@/lib/search/normalize';
import { useI18n } from '@/i18n';

interface DistrictComboboxProps {
  placeholder: string;
  excludeIds?: string[];
  onSelect: (districtId: string) => void;
  id?: string;
}

export function DistrictCombobox({ placeholder, excludeIds = [], onSelect, id }: DistrictComboboxProps) {
  const { shortLocale } = useI18n();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    const base = districts.filter((d) => !excludeIds.includes(d.id));
    if (!q) return base.slice(0, 8);
    return base
      .map((d) => ({ d, score: matchesQuery(q, { primary: [d.nameEn, d.nameBn], secondary: d.aliases }) ? 1 : 0 }))
      .filter((x) => x.score > 0)
      .map((x) => x.d)
      .slice(0, 10);
  }, [query, excludeIds]);

  return (
    <div className="combobox" ref={ref}>
      <div className="combobox-input">
        <Search size={16} aria-hidden />
        <input
          id={id}
          className="input"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) {
              onSelect(results[0].id);
              setQuery('');
              setOpen(false);
            }
          }}
        />
      </div>
      {open && results.length ? (
        <ul className="combobox-list" role="listbox">
          {results.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="combobox-option"
                onClick={() => {
                  onSelect(d.id);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <span>{shortLocale === 'bn' ? d.nameBn : d.nameEn}</span>
                <span className="subtle">{shortLocale === 'bn' ? d.nameEn : d.nameBn} · {shortLocale === 'bn' ? d.divisionNameBn : d.divisionNameEn}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
