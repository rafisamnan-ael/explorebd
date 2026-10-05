import { describe, expect, it } from 'vitest';
import { haversineKm, roadDistanceKm, estimateTravelMinutes, formatDuration } from '@/lib/geo/haversine';
import { nearestNeighborOrder, twoOpt, optimizeOrder } from '@/lib/routing/optimize';

describe('haversine', () => {
  it('computes Dhaka → Chattogram as roughly 220 km', () => {
    const km = haversineKm({ lat: 23.8103, lng: 90.4125 }, { lat: 22.3569, lng: 91.7832 });
    expect(km).toBeGreaterThan(190);
    expect(km).toBeLessThan(260);
  });

  it('applies a road factor greater than 1', () => {
    const a = { lat: 23.81, lng: 90.41 };
    const b = { lat: 22.36, lng: 91.78 };
    expect(roadDistanceKm(a, b)).toBeGreaterThan(haversineKm(a, b));
  });

  it('estimates travel time', () => {
    expect(estimateTravelMinutes(100, 'car')).toBeGreaterThan(60);
    expect(estimateTravelMinutes(1000, 'flight')).toBeGreaterThan(60);
  });

  it('formats durations', () => {
    expect(formatDuration(90, 'en')).toContain('1');
    expect(formatDuration(45, 'bn')).toContain('মিনিট');
  });
});

describe('route optimisation', () => {
  const durations = [
    [0, 10, 30, 40],
    [10, 0, 25, 35],
    [30, 25, 0, 12],
    [40, 35, 12, 0],
  ];

  it('nearest neighbour starts at 0', () => {
    const order = nearestNeighborOrder(durations);
    expect(order[0]).toBe(0);
    expect(order).toHaveLength(4);
    expect(new Set(order).size).toBe(4);
  });

  it('2-opt never increases cost and keeps a valid permutation', () => {
    const order = twoOpt([0, 3, 2, 1], durations, false);
    expect(new Set(order).size).toBe(4);
    const cost = (o: number[]) => o.slice(0, -1).reduce((sum, v, i) => sum + durations[v]![o[i + 1]!]!, 0);
    expect(cost(order)).toBeLessThanOrEqual(cost([0, 3, 2, 1]));
  });

  it('optimizeOrder returns identity for a single point', () => {
    expect(optimizeOrder([[0]], false)).toEqual([0]);
  });
});
