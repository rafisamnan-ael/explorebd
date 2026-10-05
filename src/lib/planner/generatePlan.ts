import { districts, getDistrict } from '@/data/districts';
import { placesForDistrict, placeById } from '@/data/places';
import { getRoutingProvider, optimizeOrder } from '@/lib/routing';
import { haversineKm, roadDistanceKm, estimateTravelMinutes } from '@/lib/geo/haversine';
import {
  busEstimate,
  foodPerDay,
  flightRangeFor,
  hotelRateForDistrict,
  localTransportPerDay,
  trainOptionsFor,
  PRICE_LABELS,
  type PriceConfidence,
  type HotelTier,
} from '@/data/travel-cost';
import type { PlannerState, TravelStyle } from './plannerState';

export interface CostRange {
  low: number;
  expected?: number;
  high: number;
}

export interface TransportOption {
  id: string;
  mode: 'bus' | 'train' | 'flight' | 'car' | 'boat';
  className?: string;
  label: string;
  durationMinutes: number;
  farePerPerson: CostRange;
  confidence: PriceConfidence;
  sourceLabel: string;
}

export interface TransportSegment {
  key: string;
  originId: string;
  destinationId: string;
  distanceKm: number;
  durationMinutes: number;
  options: TransportOption[];
  chosenId: string;
}

export interface PlannedAttraction {
  id: string;
  nameEn: string;
  nameBn: string;
  category: string;
  minutes: number;
  entryFee?: { min: number; max: number };
}

export interface DayItem {
  time: string;
  label: string;
  districtId?: string;
}

export interface TripDay {
  index: number;
  title: string;
  items: DayItem[];
  overnightDistrictId?: string;
  costLow: number;
  costHigh: number;
}

export interface GeneratedTripPlan {
  routeDistrictIds: string[];
  segments: TransportSegment[];
  totalDistanceKm: number;
  totalTravelMinutes: number;
  feasibility: 'comfortable' | 'busy' | 'too_tight';
  days: TripDay[];
  attractionsByDistrict: Record<string, PlannedAttraction[]>;
  costs: {
    transport: CostRange;
    accommodation: CostRange;
    food: CostRange;
    localTransport: CostRange;
    entryFees: CostRange;
    extras: CostRange;
    total: CostRange;
    perPerson: CostRange;
  };
  warnings: string[];
  assumptions: string[];
  budgetStatus?: 'within' | 'near' | 'over';
  suggestions: string[];
  approximate: boolean;
  overnightDistrictIds: string[];
}

const AIRPORT_DISTRICTS = new Set(['bd-dhaka', 'bd-chattogram', 'bd-sylhet', 'bd-coxs-bazar', 'bd-nilphamari']);
const HILL_DISTRICTS = new Set(['bd-bandarban', 'bd-rangamati', 'bd-khagrachhari']);

function coord(id: string) {
  const d = getDistrict(id);
  return { lat: d?.lat ?? 23.7, lng: d?.lng ?? 90.4 };
}

const CATEGORY_MINUTES: Record<string, number> = {
  heritage: 75,
  religious: 50,
  beach: 120,
  nature: 120,
  wildlife: 150,
  hill: 180,
  lake: 120,
  waterfall: 90,
  island: 180,
  city: 90,
  adventure: 120,
  food: 60,
};

function attractionMinutes(placeId: string): number {
  const p = placeById.get(placeId);
  if (!p) return 90;
  return p.typicalDurationMinutes ?? CATEGORY_MINUTES[p.categories[0] ?? 'city'] ?? 90;
}

function isFlightRoute(a: string, b: string): boolean {
  if (!AIRPORT_DISTRICTS.has(a) || !AIRPORT_DISTRICTS.has(b)) return false;
  return a === 'bd-dhaka' || b === 'bd-dhaka';
}

function buildOptions(originId: string, destinationId: string, distanceKm: number): TransportOption[] {
  const options: TransportOption[] = [];
  const bus = busEstimate(originId, destinationId, distanceKm);
  options.push({
    id: 'bus:nonac',
    mode: 'bus',
    className: 'nonac',
    label: 'Non-AC Coach',
    durationMinutes: estimateTravelMinutes(distanceKm, 'bus'),
    farePerPerson: { low: bus.nonAc.low, expected: bus.nonAc.expected, high: bus.nonAc.high },
    confidence: bus.nonAc.confidence,
    sourceLabel: PRICE_LABELS[bus.nonAc.confidence],
  });
  options.push({
    id: 'bus:ac',
    mode: 'bus',
    className: 'ac',
    label: 'AC Coach',
    durationMinutes: estimateTravelMinutes(distanceKm, 'bus'),
    farePerPerson: { low: bus.ac.low, high: bus.ac.high },
    confidence: bus.ac.confidence,
    sourceLabel: PRICE_LABELS[bus.ac.confidence],
  });
  const trains = trainOptionsFor(originId, destinationId);
  if (trains.length) {
    const cheapest = trains.reduce((a, b) => (b.fare < a.fare ? b : a));
    options.push({
      id: `train:${cheapest.className}`,
      mode: 'train',
      className: cheapest.className,
      label: `Train — ${cheapest.className}`,
      durationMinutes: estimateTravelMinutes(distanceKm, 'train'),
      farePerPerson: { low: cheapest.fare, expected: cheapest.fare, high: cheapest.fare },
      confidence: 'official_exact',
      sourceLabel: PRICE_LABELS.official_exact,
    });
  }
  if (isFlightRoute(originId, destinationId)) {
    const air = haversineKm(coord(originId), coord(destinationId));
    const f = flightRangeFor(originId, destinationId, air);
    options.push({
      id: 'flight',
      mode: 'flight',
      label: 'Flight',
      durationMinutes: 75 + Math.round((air / 600) * 60) + 120,
      farePerPerson: { low: f.low, high: f.high },
      confidence: f.confidence,
      sourceLabel: PRICE_LABELS[f.confidence],
    });
  }
  return options;
}

function recommendOption(options: TransportOption[], style: TravelStyle): TransportOption {
  const byId = (id: string) => options.find((o) => o.id === id);
  if (style === 'save') return byId('bus:nonac') ?? options[0]!;
  if (style === 'comfort') {
    return options.find((o) => o.mode === 'flight') ?? options.find((o) => o.mode === 'train') ?? byId('bus:ac') ?? options[0]!;
  }
  return options.find((o) => o.mode === 'train') ?? byId('bus:ac') ?? options[0]!;
}

function tierForStyle(style: TravelStyle): HotelTier {
  return style === 'save' ? 'budget' : style === 'comfort' ? 'premium' : 'mid';
}

function fmtTime(minutes: number): string {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.round(m % 60);
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function selectedAttractions(state: PlannerState, districtId: string): PlannedAttraction[] {
  const chosen = state.selectedPlaceIdsByDistrict[districtId];
  const source = chosen && chosen.length ? chosen : placesForDistrict(districtId).slice(0, 3).map((p) => p.id);
  return source
    .map((id) => placeById.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      id: p.id,
      nameEn: p.nameEn,
      nameBn: p.nameBn,
      category: p.categories[0] ?? 'city',
      minutes: attractionMinutes(p.id),
      entryFee: p.cost?.maxBdt ? { min: p.cost.minBdt ?? 0, max: p.cost.maxBdt } : undefined,
    }));
}

export async function generateTripPlan(state: PlannerState): Promise<GeneratedTripPlan> {
  const origin = getDistrict(state.originDistrictId ?? '') ?? districts[0]!;
  const destinations = state.destinationDistrictIds.map((id) => getDistrict(id)).filter((d): d is NonNullable<typeof d> => Boolean(d));

  const points = [origin, ...destinations].map((d) => ({ lat: d.lat, lng: d.lng }));
  const provider = getRoutingProvider(['any']);
  const matrix = await provider.matrix(points);
  const approx = matrix.approximate;

  // Route order
  let orderedDistrictIds: string[];
  if (state.routeMode === 'manual' && state.manualRouteOrder.length) {
    orderedDistrictIds = state.manualRouteOrder;
  } else if (destinations.length <= 1) {
    orderedDistrictIds = destinations.map((d) => d.id);
  } else {
    let order = optimizeOrder(matrix.durations, false);
    // Optional preferred first destination
    if (state.preferredFirstDestinationId) {
      const preferredIdx = points.findIndex((_, i) => [origin, ...destinations][i]?.id === state.preferredFirstDestinationId);
      if (preferredIdx > 0 && order.includes(preferredIdx)) {
        order = [preferredIdx, ...order.filter((i) => i !== preferredIdx)];
        // re-optimize the remainder from the preferred start
        const remainder = order.slice(1);
        const subOrder = optimizeOrder(
          remainder.map((a) => remainder.map((b) => matrix.durations[a]?.[b] ?? 0)),
          false,
        ).map((i) => remainder[i]!);
        order = [preferredIdx, ...subOrder];
      }
    }
    orderedDistrictIds = order.map((i) => [origin, ...destinations][i]!.id);
  }
  const routeDistricts = orderedDistrictIds.map((id) => getDistrict(id)!).filter(Boolean);
  const fullChain = [origin, ...routeDistricts];
  const sequence = state.returnToOrigin && routeDistricts.length ? [...fullChain, origin] : fullChain;

  // Segments
  const segments: TransportSegment[] = [];
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;
  for (let i = 0; i < sequence.length - 1; i += 1) {
    const a = sequence[i]!;
    const b = sequence[i + 1]!;
    const ai = points.findIndex((p) => Math.abs(p.lat - a.lat) < 1e-9 && Math.abs(p.lng - a.lng) < 1e-9);
    const bi = points.findIndex((p) => Math.abs(p.lat - b.lat) < 1e-9 && Math.abs(p.lng - b.lng) < 1e-9);
    const distanceKm = ai >= 0 && bi >= 0 ? matrix.distances[ai]?.[bi] ?? roadDistanceKm(a, b) : roadDistanceKm(a, b);
    const durationMinutes = ai >= 0 && bi >= 0 ? matrix.durations[ai]?.[bi] ?? estimateTravelMinutes(distanceKm, 'bus') : estimateTravelMinutes(distanceKm, 'bus');
    totalDistanceKm += distanceKm;
    totalTravelMinutes += durationMinutes;
    const key = `${a.id}->${b.id}`;
    const options = buildOptions(a.id, b.id, distanceKm);
    const recommended = recommendOption(options, state.travelStyle);
    const chosenId = state.selectedTransportBySegment[key] ?? recommended.id;
    segments.push({ key, originId: a.id, destinationId: b.id, distanceKm, durationMinutes, options, chosenId });
    const chosen = options.find((o) => o.id === chosenId) ?? recommended;
    if (chosen.mode === 'flight') totalTravelMinutes += 0; // flight time already included
  }

  // Attractions per visited destination
  const attractionsByDistrict: Record<string, PlannedAttraction[]> = {};
  for (const d of routeDistricts) attractionsByDistrict[d.id] = selectedAttractions(state, d.id);

  // Build day plan
  const dayCap = 600; // 10 active hours
  const days: TripDay[] = [];
  let dayIndex = 0;
  let clock = 6 * 60 + 30;
  const newDay = () => {
    dayIndex += 1;
    clock = 7 * 60;
    return { index: dayIndex, title: '', items: [] as DayItem[], costLow: 0, costHigh: 0 } as TripDay;
  };
  let day = newDay();
  day.title = `${origin.nameEn} → ${(routeDistricts[0] ?? origin).nameEn}`;
  day.items.push({ time: fmtTime(clock), label: `Depart ${origin.nameEn}`, districtId: origin.id });

  let remaining = dayCap;
  const atLastDay = () => days.length >= state.days - 1;
  const pushDay = () => {
    days.push(day);
    day = newDay();
    remaining = dayCap;
  };

  for (let i = 0; i < sequence.length - 1; i += 1) {
    const from = sequence[i]!;
    const to = sequence[i + 1]!;
    const seg = segments[i];
    const travel = seg?.durationMinutes ?? estimateTravelMinutes(roadDistanceKm(from, to), 'bus');
    clock += travel;
    remaining -= travel;
    day.items.push({ time: fmtTime(clock), label: `Arrive ${to.nameEn}`, districtId: to.id });
    const isFinalReturn = state.returnToOrigin && i === sequence.length - 2 && to.id === origin.id;
    if (isFinalReturn) break;
    const attractions = attractionsByDistrict[to.id] ?? [];
    clock += 45; // lunch / check-in
    remaining -= 45;
    for (const attraction of attractions) {
      if (!atLastDay() && remaining - attraction.minutes < 60 && day.items.length > 2) {
        day.overnightDistrictId = to.id;
        pushDay();
        day.title = to.nameEn;
      }
      clock += attraction.minutes;
      remaining -= attraction.minutes;
      day.items.push({ time: fmtTime(clock), label: attraction.nameEn, districtId: to.id });
    }
    day.overnightDistrictId = to.id;
    if (!atLastDay() && i < sequence.length - 2) pushDay();
  }
  if (!days.includes(day)) days.push(day);

  // Overnight districts & nights
  const nights = Math.max(0, days.length - 1);
  const overnightDistrictIds = days.slice(0, nights).map((d) => d.overnightDistrictId ?? routeDistricts[0]?.id ?? origin.id);
  const tier = tierForStyle(state.travelStyle);
  const rooms = Math.max(1, Math.ceil(state.travellers / 2));

  // Accommodation
  let stayLow = 0;
  let stayHigh = 0;
  for (let n = 0; n < nights; n += 1) {
    const h = hotelRateForDistrict(overnightDistrictIds[n] ?? origin.id, tier);
    stayLow += Math.round(h.rate * 0.92) * rooms;
    stayHigh += Math.round(h.rate * 1.12) * rooms;
  }

  // Transport
  let transportLow = 0;
  let transportHigh = 0;
  for (const seg of segments) {
    const opt = seg.options.find((o) => o.id === seg.chosenId) ?? seg.options[0]!;
    transportLow += opt.farePerPerson.low * state.travellers;
    transportHigh += opt.farePerPerson.high * state.travellers;
  }

  // Food
  const foodPer = foodPerDay(state.travelStyle);
  const foodLow = Math.round(foodPer * 0.85) * state.travellers * state.days;
  const foodHigh = Math.round(foodPer * 1.2) * state.travellers * state.days;

  // Local transport (hill multiplier)
  let localLow = 0;
  let localHigh = 0;
  for (const d of routeDistricts) {
    const base = localTransportPerDay(state.travelStyle);
    const mult = HILL_DISTRICTS.has(d.id) ? 1.6 : 1;
    localLow += Math.round(base * 0.8 * mult) * state.travellers;
    localHigh += Math.round(base * 1.25 * mult) * state.travellers;
  }

  // Entry fees
  let entryLow = 0;
  let entryHigh = 0;
  let unknownEntry = false;
  for (const list of Object.values(attractionsByDistrict)) {
    for (const a of list) {
      if (a.entryFee) {
        entryLow += a.entryFee.min * state.travellers;
        entryHigh += a.entryFee.max * state.travellers;
      } else {
        unknownEntry = true;
      }
    }
  }

  const sumLow = transportLow + stayLow + foodLow + localLow + entryLow;
  const sumHigh = transportHigh + stayHigh + foodHigh + localHigh + entryHigh;
  const extrasLow = Math.round(sumLow * 0.06);
  const extrasHigh = Math.round(sumHigh * 0.1);
  const totalLow = sumLow + extrasLow;
  const totalHigh = sumHigh + extrasHigh;

  // Feasibility
  const available = state.days * dayCap;
  const attracted = Object.values(attractionsByDistrict).flat().reduce((s, a) => s + a.minutes, 0);
  const required = totalTravelMinutes + attracted + state.days * (90 + 60);
  const ratio = available > 0 ? required / available : 2;
  const feasibility = ratio <= 0.8 ? 'comfortable' : ratio <= 1.05 ? 'busy' : 'too_tight';

  // Warnings
  const warnings: string[] = [];
  if (approx) warnings.push('approximate_route');
  if (unknownEntry) warnings.push('entry_not_included');
  if (feasibility === 'too_tight') warnings.push('too_tight');
  if (feasibility === 'busy') warnings.push('busy');

  // Budget status + suggestions
  let budgetStatus: GeneratedTripPlan['budgetStatus'];
  const suggestions: string[] = [];
  if (state.totalBudget && state.totalBudget > 0) {
    const expected = (totalLow + totalHigh) / 2;
    if (totalHigh <= state.totalBudget) budgetStatus = 'within';
    else if (totalLow <= state.totalBudget || expected <= state.totalBudget * 1.08) budgetStatus = 'near';
    else budgetStatus = 'over';
    if (budgetStatus !== 'within') {
      const hasAc = segments.some((s) => s.options.find((o) => o.id === s.chosenId)?.className === 'ac');
      if (hasAc) suggestions.push('suggest_non_ac');
      if (tier !== 'budget') suggestions.push('suggest_lower_hotel');
      if (!state.useOvernightTravel && totalTravelMinutes > 6 * 60) suggestions.push('suggest_overnight');
      if (state.destinationDistrictIds.length > 1) suggestions.push('suggest_remove_destination');
    }
  }

  const assumptions = [
    `Travel style: ${state.travelStyle}`,
    `Accommodation: ${tier} tier · ${rooms} room(s) × ${nights} night(s)`,
    `Food: ৳${foodPer}/person/day`,
    'Transport fares use configured/estimated rates (see source labels).',
  ];

  return {
    routeDistrictIds: routeDistricts.map((d) => d.id),
    segments,
    totalDistanceKm,
    totalTravelMinutes,
    feasibility,
    days,
    attractionsByDistrict,
    costs: {
      transport: { low: transportLow, high: transportHigh },
      accommodation: { low: stayLow, high: stayHigh },
      food: { low: foodLow, high: foodHigh },
      localTransport: { low: localLow, high: localHigh },
      entryFees: { low: entryLow, high: entryHigh },
      extras: { low: extrasLow, high: extrasHigh },
      total: { low: totalLow, high: totalHigh, expected: Math.round((totalLow + totalHigh) / 2) },
      perPerson: {
        low: Math.round(totalLow / Math.max(1, state.travellers)),
        high: Math.round(totalHigh / Math.max(1, state.travellers)),
      },
    },
    warnings,
    assumptions,
    budgetStatus,
    suggestions,
    approximate: approx,
    overnightDistrictIds,
  };
}
