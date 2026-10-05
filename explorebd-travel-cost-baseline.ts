/**
 * ExploreBD initial travel-cost baseline.
 * Planning estimates, NOT booking quotes.
 * Checked: 2026-10-05
 *
 * Important:
 * - Ordinary inter-district bus: official rate baseline.
 * - AC bus: market-estimated; no government-fixed AC fare chart.
 * - Train: exact route fares should override distance fallbacks.
 * - Flight: dynamic; use stored route range/feed when possible.
 * - Hotels: city-specific observed planning baselines where available.
 */

export type PriceConfidence =
  | "official_exact"
  | "official_formula"
  | "market_observed"
  | "city_baseline"
  | "fallback_estimate";

export const COST_DATA_VERSION = "2026-10-05";

export const BUS_RATE = {
  ordinaryIntercityPerKm: 2.40,
  dhakaChattogramMetroPerKm: 2.70,
  dtcaAreaPerKm: 2.60,
  checkedAt: "2026-10-05",
  validFrom: "2026-09-22",
  sourceType: "official_formula" as PriceConfidence,
};

export const AC_BUS_MULTIPLIER = {
  economyAc: [1.55, 1.90] as const,
  premiumAc: [1.90, 2.40] as const,
  sleeperOrBusiness: [2.40, 3.10] as const,
};

export const TRAIN_CLASS_MULTIPLIER = {
  shovanChair: 1.0,
  firstSeat: 1.52,
  snigdha: 1.90,
  acSeat: 2.28,
  acBerth: 3.42,
};

export const TRAIN_ROUTE_FARES = {
  "dhaka:chattogram": {
    shovanChair: 450,
    firstSeat: 685,
    snigdha: 855,
    acSeat: 1025,
    checkedAt: "2026-08-21",
  },
  "dhaka:rajshahi": {
    shovanChair: 405,
    snigdha: 771,
    acSeat: 926,
    acBerth: 1386,
    checkedAt: "2026-08-21",
  },
  "dhaka:coxs-bazar": {
    shovanChair: 695,
    snigdha: 1325,
    acSeat: 1590,
    acBerth: 2380,
    checkedAt: "2026-08-21",
  },
} as const;

export const FLIGHT_ROUTE_BASELINE = {
  "dhaka:chattogram": {
    low: 4700,
    high: 7500,
    confidence: "market_observed" as PriceConfidence,
  },
  "dhaka:sylhet": {
    low: 4700,
    high: 8000,
    confidence: "market_observed" as PriceConfidence,
  },
  "dhaka:saidpur": {
    low: 4800,
    high: 8500,
    confidence: "market_observed" as PriceConfidence,
  },
  "dhaka:coxs-bazar": {
    low: 5200,
    high: 9000,
    confidence: "market_observed" as PriceConfidence,
  },
} as const;

export const HOTEL_BASELINE = {
  dhaka: {
    budget: 3650,
    mid: 5050,
    comfort: 9300,
    confidence: "city_baseline" as PriceConfidence,
    checkedAt: "2026-09",
  },
  "coxs-bazar": {
    budget: 3150,
    mid: 4150,
    comfort: 5850,
    confidence: "city_baseline" as PriceConfidence,
    checkedAt: "2026-09",
  },
  sylhet: {
    budget: 2200,
    mid: 3050,
    comfort: 4650,
    confidence: "city_baseline" as PriceConfidence,
    checkedAt: "2026-09",
  },
  khulna: {
    budget: 1250,
    mid: 2950,
    comfort: 3550,
    confidence: "city_baseline" as PriceConfidence,
    checkedAt: "2026-09",
  },
  chattogram: {
    budget: 3000,
    mid: 4200,
    comfort: 6200,
    confidence: "fallback_estimate" as PriceConfidence,
    checkedAt: "2026-10-05",
  },
} as const;

export const GENERIC_HOTEL_TIER = {
  A: { budget: 3200, mid: 5000, comfort: 8000 },
  B: { budget: 2200, mid: 3500, comfort: 5500 },
  C: { budget: 1500, mid: 2500, comfort: 4000 },
} as const;

export const FOOD_PER_PERSON_PER_DAY = {
  save: 600,
  balanced: 1000,
  comfort: 1800,
  premium: 3000,
} as const;

export const LOCAL_TRANSPORT_PER_PERSON_PER_DAY = {
  save: [300, 500] as const,
  balanced: [600, 1000] as const,
  comfort: [1200, 2000] as const,
};

export function roundFare(value: number, nearest = 10) {
  return Math.round(value / nearest) * nearest;
}

export function ordinaryBusEstimate(roadDistanceKm: number) {
  const base = roadDistanceKm * BUS_RATE.ordinaryIntercityPerKm;

  // Small uncertainty band for route/toll/seating effects.
  return {
    low: roundFare(base * 0.98),
    expected: roundFare(base * 1.05),
    high: roundFare(base * 1.12),
    confidence: "official_formula" as PriceConfidence,
  };
}

export function acBusEstimate(
  roadDistanceKm: number,
  level: keyof typeof AC_BUS_MULTIPLIER = "economyAc"
) {
  const ordinary = ordinaryBusEstimate(roadDistanceKm);
  const [lo, hi] = AC_BUS_MULTIPLIER[level];

  return {
    low: roundFare(ordinary.expected * lo, 50),
    high: roundFare(ordinary.expected * hi, 50),
    confidence: "fallback_estimate" as PriceConfidence,
  };
}

export function fallbackFlightEstimate(airDistanceKm: number) {
  const floor = 4700;
  const distanceComponent = Math.max(0, airDistanceKm - 150) * 3;
  const low = floor + distanceComponent;

  return {
    low: roundFare(low, 100),
    high: roundFare(low * 1.45, 100),
    confidence: "fallback_estimate" as PriceConfidence,
  };
}

export function calculateRooms(people: number, occupancyPerRoom: number) {
  return Math.max(1, Math.ceil(people / Math.max(1, occupancyPerRoom)));
}

export function totalStayCost(
  nightlyRoomRate: number,
  nights: number,
  rooms: number
) {
  return nightlyRoomRate * nights * rooms;
}
