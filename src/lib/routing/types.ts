import type { GeoPoint } from '@/types';

export interface RouteLeg {
  from: GeoPoint;
  to: GeoPoint;
  distanceKm: number;
  durationMinutes: number;
}

export interface RouteResult {
  points: GeoPoint[];
  legs: RouteLeg[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  approximate: boolean;
  provider: string;
}

export interface RouteMatrix {
  /** durations minutes[i][j] */
  durations: number[][];
  /** distances km[i][j] */
  distances: number[][];
  approximate: boolean;
  provider: string;
}

export interface RoutingProvider {
  id: string;
  approximate: boolean;
  matrix(points: GeoPoint[]): Promise<RouteMatrix>;
  route(points: GeoPoint[]): Promise<RouteResult>;
}
