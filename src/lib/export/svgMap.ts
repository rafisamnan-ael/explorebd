import type { Feature, FeatureCollection, Position } from 'geojson';

export interface Projector {
  project: (lngLat: [number, number]) => [number, number];
}

export function createProjector(
  bounds: [[number, number], [number, number]],
  width: number,
  height: number,
  padding = 12,
): Projector {
  const [[minX, minY], [maxX, maxY]] = bounds;
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  // Preserve aspect ratio (equirectangular with latitude correction).
  const midLat = (minY + maxY) / 2;
  const latScale = Math.cos((midLat * Math.PI) / 180);
  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const scale = Math.min(availW / (spanX * latScale), availH / spanY);
  const drawW = spanX * latScale * scale;
  const drawH = spanY * scale;
  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;
  return {
    project: ([lng, lat]) => [offsetX + (lng - minX) * latScale * scale, offsetY + (maxY - lat) * scale],
  };
}

function ringToPath(ring: Position[], projector: Projector): string {
  let d = '';
  for (let i = 0; i < ring.length; i += 1) {
    const [x, y] = projector.project(ring[i] as [number, number]);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
}

export function geometryToPath(geometry: Feature['geometry'], projector: Projector): string {
  if (!geometry) return '';
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map((ring) => ringToPath(ring, projector)).join(' ');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates
      .map((polygon) => polygon.map((ring) => ringToPath(ring, projector)).join(' '))
      .join(' ');
  }
  return '';
}

export function featureToPath(feature: Feature, projector: Projector): string {
  return geometryToPath(feature.geometry, projector);
}

export interface SvgPathEntry {
  path: string;
  feature: Feature;
}

export function buildSvgPaths(
  fc: FeatureCollection,
  projector: Projector,
): SvgPathEntry[] {
  return fc.features
    .filter((f) => f.geometry)
    .map((feature) => ({ feature, path: featureToPath(feature, projector) }))
    .filter((entry) => entry.path.length > 0);
}
