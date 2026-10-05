import type { District } from '../data/districts';

const toRad = (n: number) => n * Math.PI / 180;

export function haversineKm(a: District, b: District) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Fast client-side heuristic. For production road routing, replace with OSRM/GraphHopper/Mapbox Directions.
export function nearestNeighborRoute(start: District, stops: District[], returnToStart = false) {
  const remaining = [...stops.filter(s => s.id !== start.id)];
  const route = [start];
  let current = start;
  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((candidate, i) => {
      const dist = haversineKm(current, candidate);
      if (dist < bestDistance) { bestDistance = dist; bestIndex = i; }
    });
    current = remaining.splice(bestIndex, 1)[0];
    route.push(current);
  }
  if (returnToStart && route.length > 1) route.push(start);
  return route;
}

export function routeDistanceKm(route: District[]) {
  return route.slice(1).reduce((sum, item, i) => sum + haversineKm(route[i], item), 0);
}
