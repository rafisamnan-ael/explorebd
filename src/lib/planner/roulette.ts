import type { GroupType } from '@/types';
import type { StatusMap } from '@/lib/passport/stats';
import { recommendDestinations, type Recommendation } from './recommend';

export interface RouletteFilters {
  startDistrictId: string;
  maxBudgetBdt?: number;
  maxTravelMinutes?: number;
  month: number;
  interest?: string;
  includeVisited: boolean;
  groupType: GroupType;
}

export interface RouletteInput {
  filters: RouletteFilters;
  statusMap: StatusMap;
  places: import('@/types').Place[];
  seed?: number;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function spinRoulette(input: RouletteInput): Recommendation | undefined {
  const { filters, statusMap, places } = input;
  const recommendations = recommendDestinations(
    {
      places,
      statusMap,
      month: filters.month,
      interests: filters.interest ? [filters.interest] : [],
      budgetBdt: filters.maxBudgetBdt,
      days: 2,
      startDistrictId: filters.startDistrictId,
      groupType: filters.groupType,
      pace: 'balanced',
      hotelTier: 'mid',
    },
    20,
  );

  const filtered = recommendations.filter((r) => {
    if (filters.maxBudgetBdt && r.estimatedBudget > filters.maxBudgetBdt) return false;
    if (filters.maxTravelMinutes && r.travelMinutes > filters.maxTravelMinutes) return false;
    const visited = statusMap[r.district.id] === 'visited' || statusMap[r.district.id] === 'favorite' || statusMap[r.district.id] === 'lived_here';
    if (!filters.includeVisited && visited) return false;
    return true;
  });

  if (!filtered.length) return undefined;

  const seed = input.seed ?? Date.now();
  const random = mulberry32(seed);
  // Bias toward higher scores while staying surprising.
  const pool = filtered.slice(0, Math.max(3, Math.ceil(filtered.length * 0.6)));
  const index = Math.floor(random() * pool.length);
  return pool[index]!;
}
