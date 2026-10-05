import { routeConfig } from '@/config/providers';
import type { TransportMode } from '@/types';
import { HaversineFallbackProvider } from './haversineProvider';
import { ServerRoutingProvider } from './orsProvider';
import type { RoutingProvider } from './types';

function toMode(prefs: TransportMode[]): 'bus' | 'car' | 'train' | 'flight' | 'any' {
  if (!prefs.length || prefs.includes('any') || prefs.length > 1) return 'any';
  return prefs[0] as 'bus' | 'car' | 'train' | 'flight';
}

export function getRoutingProvider(prefs: TransportMode[] = ['any']): RoutingProvider {
  const mode = toMode(prefs);
  if (routeConfig.provider === 'openrouteservice') {
    return new ServerRoutingProvider(mode);
  }
  return new HaversineFallbackProvider(mode);
}

export * from './types';
export { optimizeOrder, nearestNeighborOrder, twoOpt } from './optimize';
