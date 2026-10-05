import { describe, expect, it } from 'vitest';
import { computeBudget } from '@/lib/planner/budget';
import { buildItinerary } from '@/lib/planner/itinerary';
import { districts, getDistrict } from '@/data/districts';
import { placesForDistrict } from '@/data/places';
import type { TransportMode } from '@/types';

describe('budget engine', () => {
  it('produces the expected categories and totals', () => {
    const result = computeBudget({
      legs: [{ from: { lat: 23.8, lng: 90.4 }, to: { lat: 22.3, lng: 91.8 }, distanceKm: 300, durationMinutes: 420 }],
      days: 3,
      travelerCount: 2,
      hotelTier: 'mid',
      pace: 'balanced',
      transportPreferences: ['bus'],
    });
    const keys = result.categories.map((c) => c.key);
    expect(keys).toContain('transportCost');
    expect(keys).toContain('contingency');
    expect(result.total).toBeGreaterThan(result.subtotal - 1);
    expect(result.perPerson).toBe(Math.round(result.total / 2));
  });

  it('is cheaper for a budget hotel tier', () => {
    const base = { legs: [], days: 2, travelerCount: 2, pace: 'balanced' as const, transportPreferences: ['bus'] as TransportMode[] };
    const budget = computeBudget({ ...base, hotelTier: 'budget' });
    const premium = computeBudget({ ...base, hotelTier: 'premium' });
    expect(budget.total).toBeLessThan(premium.total);
  });
});

describe('itinerary scheduling', () => {
  it('distributes activities across the requested days', () => {
    const dhaka = getDistrict('bd-dhaka')!;
    const chattogram = getDistrict('bd-chattogram')!;
    const result = buildItinerary({
      orderedDistricts: [dhaka, chattogram],
      placesByDistrict: {
        'bd-dhaka': placesForDistrict('bd-dhaka'),
        'bd-chattogram': placesForDistrict('bd-chattogram'),
      },
      dayCount: 2,
      pace: 'balanced',
      roundTrip: true,
    });
    expect(result.days).toHaveLength(2);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    const hasItems = result.days.some((d) => d.items.length > 0);
    expect(hasItems).toBe(true);
    expect(districts.length).toBe(64);
  });

  it('never exceeds the day count', () => {
    const result = buildItinerary({
      orderedDistricts: [districts[0]!, districts[1]!],
      placesByDistrict: {},
      dayCount: 1,
      pace: 'packed',
      roundTrip: false,
    });
    expect(result.days).toHaveLength(1);
  });
});
