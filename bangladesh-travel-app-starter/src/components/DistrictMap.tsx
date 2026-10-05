import { useEffect, useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

const WIDTH = 560;
const HEIGHT = 660;

type Props = {
  selected: Set<string>;
  onToggle: (id: string) => void;
};

type FeatureCollection = { type: 'FeatureCollection'; features: any[] };

const norm = (v: unknown) => String(v ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

export default function DistrictMap({ selected, onToggle }: Props) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('/data/bangladesh-districts.geojson')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setGeojson)
      .catch(() => setGeojson(null));
  }, []);

  const projected = useMemo(() => {
    if (!geojson) return null;
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojson as any);
    const path = geoPath(projection);
    return { path, features: geojson.features };
  }, [geojson]);

  if (!projected) {
    return (
      <div className="map-placeholder">
        <strong>District GeoJSON not installed yet.</strong>
        <span>Add <code>public/data/bangladesh-districts.geojson</code> to enable clickable real district polygons.</span>
      </div>
    );
  }

  return (
    <svg className="district-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Bangladesh district map">
      {projected.features.map((f, i) => {
        const p = f.properties || {};
        const districtId = norm(p.slug || p.NAME_2 || p.name || p.district || p.ADM2_EN);
        const isSelected = selected.has(districtId);
        return (
          <path
            key={districtId || i}
            d={projected.path(f) || ''}
            className={isSelected ? 'district selected' : 'district'}
            onClick={() => districtId && onToggle(districtId)}
          />
        );
      })}
    </svg>
  );
}
