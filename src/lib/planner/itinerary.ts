import type { District, Place } from '@/types';
import { estimateTravelMinutes, roadDistanceKm } from '@/lib/geo/haversine';
import type { Pace } from './budget';

export interface ItineraryItem {
  type: 'travel' | 'place' | 'rest';
  label: string;
  minutes: number;
  districtId?: string;
  placeId?: string;
}

export interface DayPlan {
  day: number;
  items: ItineraryItem[];
  activityMinutes: number;
  travelMinutes: number;
  districts: string[];
}

export interface ItineraryResult {
  days: DayPlan[];
  totalTravelMinutes: number;
  totalDistanceKm: number;
  usedDays: number;
}

const maxMinutesPerDay: Record<Pace, number> = { relaxed: 300, balanced: 420, packed: 540 };
const defaultPlaceMinutes = 120;
const lunchMinutes = 45;

export interface ItineraryInput {
  orderedDistricts: District[];
  placesByDistrict: Record<string, Place[]>;
  dayCount: number;
  pace: Pace;
  roundTrip: boolean;
}

export function buildItinerary(input: ItineraryInput): ItineraryResult {
  const { orderedDistricts, placesByDistrict, pace, roundTrip } = input;
  const dayCap = maxMinutesPerDay[pace];
  const dayCount = Math.max(1, input.dayCount);

  const days: DayPlan[] = Array.from({ length: dayCount }, (_, i) => ({
    day: i + 1,
    items: [],
    activityMinutes: 0,
    travelMinutes: 0,
    districts: [],
  }));

  let dayIndex = 0;
  let totalTravelMinutes = 0;
  let totalDistanceKm = 0;

  const current = () => days[Math.min(dayIndex, dayCount - 1)]!;

  const pushItem = (item: ItineraryItem) => {
    let day = current();
    const used = day.activityMinutes + day.travelMinutes;
    if (used + item.minutes > dayCap && day.items.length > 0 && dayIndex < dayCount - 1) {
      dayIndex += 1;
      day = current();
    }
    day.items.push(item);
    if (item.type === 'travel') {
      day.travelMinutes += item.minutes;
      totalTravelMinutes += item.minutes;
    } else {
      day.activityMinutes += item.minutes;
    }
    if (item.districtId && !day.districts.includes(item.districtId)) {
      day.districts.push(item.districtId);
    }
  };

  const sequence = roundTrip && orderedDistricts.length > 1 ? [...orderedDistricts, orderedDistricts[0]!] : orderedDistricts;

  for (let i = 0; i < sequence.length; i += 1) {
    const district = sequence[i]!;
    if (i > 0) {
      const prev = sequence[i - 1]!;
      const km = roadDistanceKm({ lat: prev.lat, lng: prev.lng }, { lat: district.lat, lng: district.lng });
      totalDistanceKm += km;
      pushItem({
        type: 'travel',
        label: `${prev.nameEn} → ${district.nameEn}`,
        minutes: estimateTravelMinutes(km, 'car'),
        districtId: district.id,
      });
    }

    const isRepeatStart = roundTrip && i === sequence.length - 1;
    if (isRepeatStart) continue;

    const places = placesByDistrict[district.id] ?? [];
    if (places.length === 0) {
      pushItem({
        type: 'rest',
        label: district.nameEn,
        minutes: defaultPlaceMinutes,
        districtId: district.id,
      });
      continue;
    }

    let placeMinutesUsed = 0;
    for (const place of places) {
      const minutes = place.typicalDurationMinutes ?? defaultPlaceMinutes;
      // Insert a lunch break around midday.
      if (placeMinutesUsed > 120 && !current().items.some((it) => it.label === 'lunch')) {
        pushItem({ type: 'rest', label: 'lunch', minutes: lunchMinutes });
      }
      pushItem({
        type: 'place',
        label: place.nameEn,
        minutes,
        districtId: district.id,
        placeId: place.id,
      });
      placeMinutesUsed += minutes;
    }
  }

  return {
    days,
    totalTravelMinutes,
    totalDistanceKm,
    usedDays: Math.min(dayCount, dayIndex + 1),
  };
}
