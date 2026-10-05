import { districts } from '@/data/districts';
import { haversineKm, roadDistanceKm, estimateTravelMinutes } from '@/lib/geo/haversine';
import type { District, Place, GroupType } from '@/types';
import type { Pace, HotelTier } from './budget';
import { computeBudget } from './budget';
import type { StatusMap } from '@/lib/passport/stats';

export const recommendWeights = {
  seasonMatch: 0.25,
  interestMatch: 0.25,
  budgetMatch: 0.15,
  travelTimeMatch: 0.15,
  unvisitedBoost: 0.1,
  weatherMatch: 0.05,
  freshness: 0.05,
};

export interface RecommendInput {
  places: Place[];
  statusMap: StatusMap;
  month: number;
  interests: string[];
  budgetBdt?: number;
  days: number;
  startDistrictId: string;
  groupType: GroupType;
  pace: Pace;
  hotelTier: HotelTier;
}

export interface RecommendationReason {
  key: string;
  params?: Record<string, string | number>;
}

export interface Recommendation {
  district: District;
  place: Place;
  score: number;
  reasons: RecommendationReason[];
  estimatedDays: number;
  estimatedBudget: number;
  distanceKm: number;
  travelMinutes: number;
}

const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function seasonScore(place: Place, month: number): number {
  if (!place.bestMonths.length) return 0.5;
  if (place.bestMonths.includes(month)) return 1;
  const distance = Math.min(...place.bestMonths.map((m) => Math.min(Math.abs(m - month), 12 - Math.abs(m - month))));
  return clamp01(1 - distance / 6);
}

function interestScore(place: Place, interests: string[]): number {
  if (!interests.length) return 0.5;
  const tags = new Set([...place.interests, ...place.categories]);
  const overlap = interests.filter((i) => tags.has(i)).length;
  return clamp01(0.3 + (overlap / interests.length) * 0.7);
}

function budgetScore(place: Place, budgetBdt: number | undefined, days: number): number {
  if (!place.cost?.maxBdt || !budgetBdt) return 0.6;
  const estimated = place.cost.maxBdt * days;
  return clamp01(1 - Math.max(0, estimated - budgetBdt) / budgetBdt);
}

function freshnessScore(place: Place): number {
  if (!place.verifiedAt) return 0.4;
  const days = (Date.now() - new Date(place.verifiedAt).getTime()) / 86_400_000;
  if (days < 90) return 1;
  if (days < 365) return 0.7;
  if (days < 730) return 0.5;
  return 0.3;
}

export function recommendDestinations(input: RecommendInput, limit = 8): Recommendation[] {
  const start = districts.find((d) => d.id === input.startDistrictId) ?? districts[0]!;
  const candidateDistricts = districts.filter((d) => d.id !== start.id);
  const results: Recommendation[] = [];

  for (const district of candidateDistricts) {
    const districtPlaces = input.places.filter((p) => p.districtId === district.id && p.published);
    if (!districtPlaces.length) continue;

    const distanceKm = roadDistanceKm({ lat: start.lat, lng: start.lng }, { lat: district.lat, lng: district.lng });
    const travelMinutes = estimateTravelMinutes(distanceKm, 'car');
    const reachableDays = Math.max(1, Math.ceil(travelMinutes / 480));

    const scored = districtPlaces
      .map((place) => {
        const season = seasonScore(place, input.month);
        const interest = interestScore(place, input.interests);
        const budget = budgetScore(place, input.budgetBdt, input.days);
        const travelTime = clamp01(1 - distanceKm / 800);
        const unvisited = input.statusMap[district.id] === 'unvisited' || !input.statusMap[district.id] ? 1 : 0;
        const freshness = freshnessScore(place);
        const score =
          season * recommendWeights.seasonMatch +
          interest * recommendWeights.interestMatch +
          budget * recommendWeights.budgetMatch +
          travelTime * recommendWeights.travelTimeMatch +
          unvisited * recommendWeights.unvisitedBoost +
          freshness * recommendWeights.freshness;
        return { place, score, interest, season };
      })
      .sort((a, b) => b.score - a.score);

    const best = scored[0]!;

    const reasons: RecommendationReason[] = [];
    if (best.season >= 0.9) reasons.push({ key: 'recommend.reasonSeason', params: { month: monthNamesEn[input.month - 1]! } });
    if (best.interest >= 0.7 && input.interests.length) {
      const matched = input.interests.filter((i) => new Set([...best.place.interests, ...best.place.categories]).has(i));
      if (matched.length) reasons.push({ key: 'recommend.reasonInterest', params: { interests: matched.join(', ') } });
    }
    if (input.budgetBdt && best.place.cost?.maxBdt && best.place.cost.maxBdt * input.days <= input.budgetBdt) {
      reasons.push({ key: 'recommend.reasonBudget' });
    }
    if (reachableDays <= input.days) {
      reasons.push({
        key: 'recommend.reasonTravelTime',
        params: { days: input.days, start: start.nameEn },
      });
    }
    if (input.statusMap[district.id] === undefined || input.statusMap[district.id] === 'unvisited') {
      reasons.push({ key: 'recommend.reasonUnvisited' });
    }
    if (distanceKm < 150) reasons.push({ key: 'recommend.reasonNear' });

    const budget = computeBudget({
      legs: [{ from: { lat: start.lat, lng: start.lng }, to: { lat: district.lat, lng: district.lng }, distanceKm, durationMinutes: travelMinutes }],
      days: input.days,
      travelerCount: 2,
      hotelTier: input.hotelTier,
      pace: input.pace,
      transportPreferences: ['bus'],
    });

    results.push({
      district,
      place: best.place,
      score: best.score,
      reasons,
      estimatedDays: input.days,
      estimatedBudget: budget.total,
      distanceKm,
      travelMinutes,
    });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

export { haversineKm };
