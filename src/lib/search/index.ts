import { districts } from '@/data/districts';
import { places } from '@/data/places';
import { famousEntries } from '@/data/famous';
import type { TripDraft } from '@/types';
import { scoreMatch } from './normalize';

export interface SearchResult {
  type: 'district' | 'place' | 'famous' | 'trip';
  id: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  href: string;
  score: number;
}

export function searchAll(query: string, trips: TripDraft[] = [], limitPerGroup = 6): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const d of districts) {
    const score = scoreMatch(q, { primary: [d.nameEn, d.nameBn], secondary: d.aliases });
    if (score > 0) {
      results.push({
        type: 'district',
        id: d.id,
        title: d.nameEn,
        titleBn: d.nameBn,
        subtitle: d.divisionNameEn,
        subtitleBn: d.divisionNameBn,
        href: `/guide/${d.slug}`,
        score,
      });
    }
  }

  for (const p of places) {
    if (!p.published) continue;
    const district = districts.find((d) => d.id === p.districtId);
    const score = scoreMatch(q, {
      primary: [p.nameEn, p.nameBn],
      secondary: [...p.categories, p.shortDescriptionEn, ...(district ? [district.nameEn, district.nameBn] : [])],
    });
    if (score > 0) {
      results.push({
        type: 'place',
        id: p.id,
        title: p.nameEn,
        titleBn: p.nameBn,
        subtitle: district?.nameEn ?? '',
        subtitleBn: district?.nameBn ?? '',
        href: `/place/${p.slug}`,
        score,
      });
    }
  }

  for (const f of famousEntries) {
    const score = scoreMatch(q, { primary: [f.nameEn, f.nameBn] });
    if (score > 0) {
      const district = districts.find((d) => d.id === f.districtId);
      results.push({
        type: 'famous',
        id: f.id,
        title: f.nameEn,
        titleBn: f.nameBn,
        subtitle: district?.nameEn ?? '',
        subtitleBn: district?.nameBn ?? '',
        href: district ? `/guide/${district.slug}` : '/famous',
        score,
      });
    }
  }

  for (const trip of trips) {
    const score = scoreMatch(q, { primary: [trip.title] });
    if (score > 0) {
      results.push({
        type: 'trip',
        id: trip.id,
        title: trip.title,
        titleBn: trip.title,
        subtitle: '',
        subtitleBn: '',
        href: `/trip/${trip.id}`,
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const grouped: SearchResult[] = [];
  const perType = new Map<string, number>();
  for (const r of results) {
    const count = perType.get(r.type) ?? 0;
    if (count >= limitPerGroup) continue;
    perType.set(r.type, count + 1);
    grouped.push(r);
  }
  return grouped;
}
