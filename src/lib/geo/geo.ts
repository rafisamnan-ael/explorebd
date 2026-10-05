import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import type { LatLng } from './haversine';

export type Bounds = [[number, number], [number, number]];

export function geometryPositions(geometry: Geometry): Position[] {
  const out: Position[] = [];
  const walk = (coords: unknown): void => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number') {
      out.push(coords as Position);
      return;
    }
    for (const child of coords) walk(child);
  };
  walk((geometry as { coordinates: unknown }).coordinates);
  return out;
}

export function boundsOfGeometry(geometry: Geometry): Bounds {
  const positions = geometryPositions(geometry);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of positions) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

export function boundsOfFeatureCollection(fc: FeatureCollection): Bounds {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    const [[aX, aY], [bX, bY]] = boundsOfGeometry(feature.geometry);
    minX = Math.min(minX, aX);
    minY = Math.min(minY, aY);
    maxX = Math.max(maxX, bX);
    maxY = Math.max(maxY, bY);
  }
  return [
    [minX, minY],
    [maxX, maxY],
  ];
}

export function featureCentroid(feature: Feature): LatLng {
  const [[minX, minY], [maxX, maxY]] = boundsOfGeometry(feature.geometry as Geometry);
  return { lat: (minY + maxY) / 2, lng: (minX + maxX) / 2 };
}

export function padBounds([[minX, minY], [maxX, maxY]]: Bounds, factor = 0.06): Bounds {
  const dx = (maxX - minX) * factor;
  const dy = (maxY - minY) * factor;
  return [
    [minX - dx, minY - dy],
    [maxX + dx, maxY + dy],
  ];
}

/** Ray-casting point-in-polygon for a single ring. */
export function pointInRing(point: LatLng, ring: Position[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as [number, number];
    const [xj, yj] = ring[j] as [number, number];
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInPolygon(point: LatLng, polygon: Position[][]): boolean {
  if (!polygon.length) return false;
  if (!pointInRing(point, polygon[0]!)) return false;
  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(point, polygon[i]!)) return false;
  }
  return true;
}
