import type { FeatureCollection } from 'geojson';

let cache: Promise<FeatureCollection> | null = null;

export function loadDistrictGeoJson(): Promise<FeatureCollection> {
  if (!cache) {
    cache = fetch('/data/geo/bd-districts.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load district geometry: ${res.status}`);
        return res.json() as Promise<FeatureCollection>;
      })
      .catch((error) => {
        cache = null;
        throw error;
      });
  }
  return cache;
}

let worldCache: Promise<FeatureCollection> | null = null;

export function loadWorldGeoJson(): Promise<FeatureCollection> {
  if (!worldCache) {
    worldCache = fetch('/data/geo/world-countries.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load world geometry: ${res.status}`);
        return res.json() as Promise<FeatureCollection>;
      })
      .catch((error) => {
        worldCache = null;
        throw error;
      });
  }
  return worldCache;
}
