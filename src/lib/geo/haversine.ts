const EARTH_RADIUS_KM = 6371.0088;

export interface LatLng {
  lat: number;
  lng: number;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in kilometres. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Road distance is longer than straight-line distance. This factor is a
 * deliberate, documented heuristic — not a guarantee.
 */
export const ROAD_FACTOR = 1.28;

export function roadDistanceKm(a: LatLng, b: LatLng): number {
  return haversineKm(a, b) * ROAD_FACTOR;
}

export function estimateTravelMinutes(
  distanceKm: number,
  mode: 'bus' | 'car' | 'train' | 'flight' | 'any' = 'car',
): number {
  const speed: Record<string, number> = { bus: 35, car: 45, train: 50, any: 42 };
  if (mode === 'flight') {
    return 75 + (distanceKm / 600) * 60;
  }
  const kmph = speed[mode] ?? 42;
  const fixed = distanceKm < 15 ? 6 : 12;
  return Math.round(fixed + (distanceKm / kmph) * 60);
}

export function formatDuration(minutes: number, locale: 'bn' | 'en' = 'en'): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const hourLabel = locale === 'bn' ? 'ঘণ্টা' : 'h';
  const minuteLabel = locale === 'bn' ? 'মিনিট' : 'm';
  if (h === 0) return `${m} ${minuteLabel}`;
  if (m === 0) return `${h} ${hourLabel}`;
  return `${h} ${hourLabel} ${m} ${minuteLabel}`;
}

export function toRadians(deg: number): number {
  return toRad(deg);
}
