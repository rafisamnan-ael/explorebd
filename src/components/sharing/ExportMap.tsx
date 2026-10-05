import { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection } from 'geojson';
import { loadDistrictGeoJson, loadWorldGeoJson } from '@/lib/map/loadGeo';
import { prepareDistrictGeoJson, prepareWorldGeoJson } from '@/lib/map/prepareGeo';
import { createProjector, featureToPath } from '@/lib/export/svgMap';
import { mapConfig } from '@/config/providers';
import { districts } from '@/data/districts';
import { countries } from '@/data/countries';
import type { TravelStatus } from '@/types';
import type { MapTheme } from '@/lib/map/themes';
import type { ShareScope } from '@/lib/share/shareCode';

interface ExportMapProps {
  kind: ShareScope;
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  width: number;
  height: number;
  texture?: boolean;
  showLabels?: boolean;
  locale?: 'bn' | 'en';
}

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-168, -58],
  [188, 78],
];

export function ExportMap({ kind, statusMap, theme, width, height, texture, showLabels = true, locale = 'en' }: ExportMapProps) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let active = true;
    setGeo(null);
    const load = kind === 'world' ? loadWorldGeoJson().then(prepareWorldGeoJson) : loadDistrictGeoJson().then(prepareDistrictGeoJson);
    load
      .then((fc) => active && setGeo(fc))
      .catch(() => active && setGeo(null));
    return () => {
      active = false;
    };
  }, [kind]);

  const padding = Math.min(width, height) * (kind === 'world' ? 0.015 : 0.025);
  const bounds = kind === 'world' ? WORLD_BOUNDS : mapConfig.bounds;

  const projector = useMemo(() => createProjector(bounds, width, height, padding), [bounds, width, height, padding]);

  const paths = useMemo(() => {
    if (!geo) return [];
    return geo.features.map((feature) => ({
      id: String(feature.id ?? ''),
      key: kind === 'world'
        ? (feature.properties as { countryId?: string } | null)?.countryId ?? ''
        : (feature.properties as { districtId?: string } | null)?.districtId ?? '',
      d: featureToPath(feature as Feature, projector),
    }));
  }, [geo, projector, kind]);

  const labels = useMemo(() => {
    if (!showLabels) return [];
    const source =
      kind === 'world'
        ? countries
            .filter((c) => statusMap[c.id] && statusMap[c.id] !== 'unvisited')
            .map((c) => ({ id: c.id, nameEn: c.nameEn, nameBn: c.nameBn, lat: c.lat, lng: c.lng }))
        : districts.map((d) => ({ id: d.id, nameEn: d.nameEn, nameBn: d.nameBn, lat: d.lat, lng: d.lng }));
    return source.map((entry) => {
      const [x, y] = projector.project([entry.lng, entry.lat]);
      return {
        id: entry.id,
        x,
        y,
        label: locale === 'bn' ? entry.nameBn : entry.nameEn,
        marked: Boolean(statusMap[entry.id] && statusMap[entry.id] !== 'unvisited'),
      };
    });
  }, [showLabels, kind, width, locale, projector, statusMap]);

  const fontSize = Math.max(8, Math.min(18, width * (kind === 'world' ? 0.009 : 0.0128)));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Travel map" style={{ display: 'block' }}>
      <rect width={width} height={height} fill={theme.background} />
      {texture ? <TextureBackground width={width} height={height} theme={theme} /> : null}
      <g>
        {paths.map((p) =>
          p.d ? (
            <path
              key={p.id}
              d={p.d}
              fill={theme.status[statusMap[p.key] ?? 'unvisited']}
              stroke={theme.districtStroke}
              strokeWidth={Math.max(0.5, width / 1500)}
            />
          ) : null,
        )}
      </g>
      {showLabels ? (
        <g style={{ fontFamily: 'Inter, "Noto Sans Bengali", system-ui, sans-serif', fontWeight: 600 }}>
          {labels.map((l) => (
            <text
              key={l.id}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={fontSize}
              fill={l.marked ? theme.labelColor : theme.attributionColor}
              stroke={theme.background}
              strokeWidth={fontSize * 0.28}
              paintOrder="stroke"
              strokeLinejoin="round"
            >
              {l.label}
            </text>
          ))}
        </g>
      ) : null}
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
