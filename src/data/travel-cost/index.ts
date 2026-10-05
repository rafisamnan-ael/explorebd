import {
  BUS_RATE,
  FLIGHT_ROUTE_BASELINE,
  FOOD_PER_PERSON_PER_DAY,
  GENERIC_HOTEL_TIER,
  HOTEL_BASELINE,
  LOCAL_TRANSPORT_PER_PERSON_PER_DAY,
  TRAIN_ROUTE_FARES,
  acBusEstimate,
  fallbackFlightEstimate,
  ordinaryBusEstimate,
  roundFare,
  type PriceConfidence,
} from './baseline';

export * from './baseline';

/** Human-readable labels for the data-confidence model (Part O). */
export const PRICE_LABELS: Record<PriceConfidence, string> = {
  official_exact: 'Published fare',
  official_formula: 'Official-rate estimate',
  market_observed: 'Typical current range',
  city_baseline: 'Typical room rate',
  fallback_estimate: 'Planning estimate',
};

export type TravelStyle = 'save' | 'balanced' | 'comfort';
export type HotelTier = 'budget' | 'mid' | 'premium';

/** Districts with a city-specific hotel baseline. */
const HOTEL_CITY_BY_DISTRICT: Record<string, keyof typeof HOTEL_BASELINE> = {
  'bd-dhaka': 'dhaka',
  'bd-coxs-bazar': 'coxs-bazar',
  'bd-sylhet': 'sylhet',
  'bd-khulna': 'khulna',
  'bd-chattogram': 'chattogram',
};

export interface HotelRate {
  rate: number;
  confidence: PriceConfidence;
  source: string;
  checkedAt?: string;
}

export function hotelRateForDistrict(districtId: string, tier: HotelTier): HotelRate {
  const city = HOTEL_CITY_BY_DISTRICT[districtId];
  const row = city ? HOTEL_BASELINE[city] : undefined;
  if (row) {
    const rate = tier === 'budget' ? row.budget : tier === 'premium' ? row.comfort : row.mid;
    return { rate, confidence: row.confidence, source: `${city} baseline`, checkedAt: row.checkedAt };
  }
  const t = GENERIC_HOTEL_TIER.B;
  const rate = tier === 'budget' ? t.budget : tier === 'premium' ? t.comfort : t.mid;
  return { rate, confidence: 'fallback_estimate', source: 'generic city tier' };
}

/** Food per person per day by travel style. */
export function foodPerDay(style: TravelStyle): number {
  return FOOD_PER_PERSON_PER_DAY[style];
}

/** Local transport per person per day (mid of the range). */
export function localTransportPerDay(style: TravelStyle): number {
  const [lo, hi] = LOCAL_TRANSPORT_PER_PERSON_PER_DAY[style];
  return Math.round((lo + hi) / 2);
}

/** Map a hotel tier to a food style. */
export function styleForHotelTier(tier: HotelTier): TravelStyle {
  return tier === 'budget' ? 'save' : tier === 'premium' ? 'comfort' : 'balanced';
}

/** District id → canonical route key used by the fare tables (dhaka, coxs-bazar, ...). */
function routeKey(districtId: string): string {
  return districtId.replace(/^bd-/, '');
}

export interface RouteFareOverride {
  nonAc: { min: number; max: number; confidence: PriceConfidence };
  ac: { min: number; max: number; confidence: PriceConfidence };
  checkedAt: string;
}

/** Market-observed route overrides (Part S). Route override beats formula. */
export const BUS_ROUTE_OVERRIDES: Record<string, RouteFareOverride> = {
  'dhaka:coxs-bazar': {
    nonAc: { min: 1000, max: 1150, confidence: 'market_observed' },
    ac: { min: 1800, max: 2300, confidence: 'market_observed' },
    checkedAt: '2026-10-05',
  },
};

export function busEstimate(originDistrictId: string, destinationDistrictId: string, roadDistanceKm: number) {
  const key = `${routeKey(originDistrictId)}:${routeKey(destinationDistrictId)}`;
  const override = BUS_ROUTE_OVERRIDES[key] ?? BUS_ROUTE_OVERRIDES[[routeKey(destinationDistrictId), routeKey(originDistrictId)].join(':')];
  const nonAc = override
    ? { low: override.nonAc.min, high: override.nonAc.max, expected: roundFare((override.nonAc.min + override.nonAc.max) / 2), confidence: override.nonAc.confidence }
    : ordinaryBusEstimate(roadDistanceKm);
  const ac = override
    ? { low: override.ac.min, high: override.ac.max, confidence: override.ac.confidence }
    : acBusEstimate(roadDistanceKm, 'economyAc');
  return { nonAc, ac };
}

export interface TrainOption {
  className: string;
  fare: number;
}

export function trainOptionsFor(originDistrictId: string, destinationDistrictId: string): TrainOption[] {
  const direct = TRAIN_ROUTE_FARES[`${routeKey(originDistrictId)}:${routeKey(destinationDistrictId)}` as keyof typeof TRAIN_ROUTE_FARES];
  const reverse = TRAIN_ROUTE_FARES[`${routeKey(destinationDistrictId)}:${routeKey(originDistrictId)}` as keyof typeof TRAIN_ROUTE_FARES];
  const table = direct ?? reverse;
  if (!table) return [];
  const labels: Record<string, string> = {
    shovanChair: 'Shovan Chair',
    firstSeat: 'First Seat',
    snigdha: 'Snigdha AC',
    acSeat: 'AC Seat',
    acBerth: 'AC Berth',
  };
  return Object.entries(table)
    .filter(([k]) => k !== 'checkedAt')
    .map(([k, v]) => ({ className: labels[k] ?? k, fare: v as number }));
}

export function flightRangeFor(originDistrictId: string, destinationDistrictId: string, airDistanceKm: number) {
  const direct = FLIGHT_ROUTE_BASELINE[`${routeKey(originDistrictId)}:${routeKey(destinationDistrictId)}` as keyof typeof FLIGHT_ROUTE_BASELINE];
  const reverse = FLIGHT_ROUTE_BASELINE[`${routeKey(destinationDistrictId)}:${routeKey(originDistrictId)}` as keyof typeof FLIGHT_ROUTE_BASELINE];
  const table = direct ?? reverse;
  if (table) return { low: table.low, high: table.high, confidence: table.confidence };
  return fallbackFlightEstimate(airDistanceKm);
}

export const ORDINARY_BUS_PER_KM = BUS_RATE.ordinaryIntercityPerKm;
export { ordinaryBusEstimate, acBusEstimate, fallbackFlightEstimate, roundFare };
