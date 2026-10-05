import type { GeoPoint } from '@/types';
import { roadDistanceKm, estimateTravelMinutes } from '@/lib/geo/haversine';
import type { RouteMatrix, RouteResult, RoutingProvider } from './types';

/**
 * Always-available fallback. Uses Haversine distance with a documented road
 * factor — never blocks the planner when a routing API key is absent.
 */
export class HaversineFallbackProvider implements RoutingProvider {
  id = 'haversine';
  approximate = true;

  private mode: 'bus' | 'car' | 'train' | 'flight' | 'any';

  constructor(mode: 'bus' | 'car' | 'train' | 'flight' | 'any' = 'car') {
    this.mode = mode;
  }

  async matrix(points: GeoPoint[]): Promise<RouteMatrix> {
    const n = points.length;
    const durations: number[][] = [];
    const distances: number[][] = [];
    for (let i = 0; i < n; i += 1) {
      durations[i] = [];
      distances[i] = [];
      for (let j = 0; j < n; j += 1) {
        if (i === j) {
          durations[i]![j] = 0;
          distances[i]![j] = 0;
        } else {
          const km = roadDistanceKm(points[i]!, points[j]!);
          distances[i]![j] = km;
          durations[i]![j] = estimateTravelMinutes(km, this.mode);
        }
      }
    }
    return { durations, distances, approximate: true, provider: this.id };
  }

  async route(points: GeoPoint[]): Promise<RouteResult> {
    const legs = [];
    let totalDistanceKm = 0;
    let totalDurationMinutes = 0;
    for (let i = 0; i < points.length - 1; i += 1) {
      const from = points[i]!;
      const to = points[i + 1]!;
      const distanceKm = roadDistanceKm(from, to);
      const durationMinutes = estimateTravelMinutes(distanceKm, this.mode);
      totalDistanceKm += distanceKm;
      totalDurationMinutes += durationMinutes;
      legs.push({ from, to, distanceKm, durationMinutes });
    }
    return {
      points,
      legs,
      totalDistanceKm,
      totalDurationMinutes,
      approximate: true,
      provider: this.id,
    };
  }
}
