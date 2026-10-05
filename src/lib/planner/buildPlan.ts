import { getDistrict } from '@/data/districts';
import { places, placesForDistrict } from '@/data/places';
import { getRoutingProvider, optimizeOrder } from '@/lib/routing';
import { buildItinerary } from './itinerary';
import { computeBudget } from './budget';
import type { BuiltPlan } from '@/components/planner/PlanResult';
import type { TripDraft } from '@/types';

export async function buildPlanFromDraft(draft: TripDraft): Promise<BuiltPlan> {
  const startDistrict = getDistrict(draft.startDistrictId);
  if (!startDistrict) throw new Error('Unknown start district');
  const destDistricts = draft.destinationDistrictIds
    .map((id) => getDistrict(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const points = [startDistrict, ...destDistricts].map((d) => ({ lat: d.lat, lng: d.lng }));
  const provider = getRoutingProvider(draft.transportPreferences);
  const matrix = await provider.matrix(points);
  const order = optimizeOrder(matrix.durations, draft.roundTrip);
  const pool = [startDistrict, ...destDistricts];
  const orderedDistricts = order.map((i) => pool[i]!);
  const route = await provider.route(order.map((i) => points[i]!));

  const placesByDistrict: Record<string, typeof places> = {};
  for (const district of orderedDistricts) {
    const chosen = draft.placeIds.filter((pid) => places.find((p) => p.id === pid)?.districtId === district.id);
    const source = chosen.length ? places.filter((p) => chosen.includes(p.id)) : placesForDistrict(district.id).slice(0, 2);
    if (source.length) placesByDistrict[district.id] = source;
  }

  const days = draft.days ?? 2;
  const itinerary = buildItinerary({ orderedDistricts, placesByDistrict, dayCount: days, pace: draft.pace, roundTrip: draft.roundTrip });
  const budget = computeBudget({
    legs: route.legs,
    days,
    travelerCount: draft.travelerCount,
    hotelTier: draft.hotelTier,
    pace: draft.pace,
    transportPreferences: draft.transportPreferences,
  });

  return {
    itinerary,
    budget,
    route,
    orderedDistricts,
    days,
    transportMode: draft.transportPreferences[0] ?? 'any',
    approximate: route.approximate,
    startName: startDistrict.nameEn,
  };
}
