import { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection } from 'geojson';
import { loadDistrictGeoJson } from '@/lib/map/loadGeo';
import { prepareDistrictGeoJson } from '@/lib/map/prepareGeo';
import { createProjector, featureToPath } from '@/lib/export/svgMap';
import { mapConfig } from '@/config/providers';
import type { TravelStatus } from '@/types';
import type { MapTheme } from '@/lib/map/themes';

interface ExportMapProps {
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  width: number;
  height: number;
  texture?: boolean;
}

export function ExportMap({ statusMap, theme, width, height, texture }: ExportMapProps) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let active = true;
    loadDistrictGeoJson()
      .then((fc) => active && setGeo(prepareDistrictGeoJson(fc)))
      .catch(() => active && setGeo(null));
    return () => {
      active = false;
    };
  }, []);

  const paths = useMemo(() => {
    if (!geo) return [];
    const projector = createProjector(mapConfig.bounds, width, height, Math.round(width * 0.02));
    return geo.features.map((feature) => ({
      id: String(feature.id ?? ''),
      districtId: (feature.properties as { districtId?: string } | null)?.districtId ?? '',
      d: featureToPath(feature as Feature, projector),
    }));
  }, [geo, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Bangladesh travel map"
      style={{ display: 'block' }}
    >
      <rect width={width} height={height} fill={theme.background} />
      {texture ? <TextureBackground width={width} height={height} theme={theme} /> : null}
      <g>
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill={theme.status[statusMap[p.districtId] ?? 'unvisited']}
            stroke={theme.districtStroke}
            strokeWidth={Math.max(0.6, width / 1400)}
          />
        ))}
      </g>
    </svg>
  );
}

function TextureBackground({ width, height, theme }: { width: number; height: number; theme: MapTheme }) {
  return (
    <g opacity={0.5}>
      {Array.from({ length: 14 }).map((_, i) => (
        <path
          key={i}
          d={`M0 ${((i + 1) / 15) * height} q ${width * 0.25} ${i % 2 === 0 ? -18 : 18} ${width * 0.5} 0 t ${width * 0.5} 0`}
          fill="none"
          stroke={theme.districtStroke}
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
