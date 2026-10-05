import type { GeoPoint } from '@/types';
import { apiConfig } from '@/config/providers';
import type { RouteMatrix, RouteResult, RoutingProvider } from './types';
import { HaversineFallbackProvider } from './haversineProvider';

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${apiConfig.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) throw new Error(`Routing request failed: ${res.status}`);
  return (await res.json()) as T;
}

/**
 * Server-proxied openrouteservice / HeiGIT provider. The API key lives only on
 * the server; the browser never sees it. Falls back to Haversine on any error.
 */
export class ServerRoutingProvider implements RoutingProvider {
  id = 'openrouteservice';
  approximate = false;

  private fallback: HaversineFallbackProvider;

  constructor(mode: 'bus' | 'car' | 'train' | 'flight' | 'any' = 'car') {
    this.fallback = new HaversineFallbackProvider(mode);
  }

  async matrix(points: GeoPoint[]): Promise<RouteMatrix> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const result = await postJson<RouteMatrix>('/route/matrix', { points }, controller.signal);
      clearTimeout(timeout);
      return result;
    } catch {
      return this.fallback.matrix(points);
    }
  }

  async route(points: GeoPoint[]): Promise<RouteResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      const result = await postJson<RouteResult>('/route', { points }, controller.signal);
      clearTimeout(timeout);
      return result;
    } catch {
      return this.fallback.route(points);
    }
  }
}
