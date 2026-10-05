/**
 * Validates the GeoJSON boundary files used by ExploreBD.
 * Run with: npm run scripts:validate-geo
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface Feature {
  type: string;
  id?: string | number;
  properties: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown } | null;
}

interface FeatureCollection {
  type: string;
  features: Feature[];
}

function walkCoords(coords: unknown, cb: (lng: number, lat: number) => void): void {
  if (!Array.isArray(coords)) return;
  if (typeof coords[0] === 'number') {
    cb(coords[0] as number, coords[1] as number);
    return;
  }
  for (const child of coords) walkCoords(child, cb);
}

function validate(path: string, expectedCount: number | null): number {
  const text = readFileSync(path, 'utf8');
  const fc = JSON.parse(text) as FeatureCollection;
  if (fc.type !== 'FeatureCollection') throw new Error(`${path}: not a FeatureCollection`);
  let invalidCoords = 0;
  let points = 0;
  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    walkCoords(feature.geometry.coordinates, (lng, lat) => {
      points += 1;
      if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lng) > 180) invalidCoords += 1;
    });
  }
  if (invalidCoords) throw new Error(`${path}: ${invalidCoords} invalid coordinates`);
  if (expectedCount !== null && fc.features.length !== expectedCount) {
    throw new Error(`${path}: expected ${expectedCount} features, found ${fc.features.length}`);
  }
  // eslint-disable-next-line no-console
  console.log(`OK ${path}: ${fc.features.length} features, ${points} coordinates`);
  return fc.features.length;
}

try {
  validate(resolve(root, 'public/data/geo/bd-districts.geojson'), 64);
  const worldCount = validate(resolve(root, 'public/data/geo/world-countries.geojson'), null);
  if (worldCount < 150) throw new Error(`world geojson too small: ${worldCount}`);
  // eslint-disable-next-line no-console
  console.log('Geo validation passed.');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Geo validation failed:', error);
  process.exit(1);
}
