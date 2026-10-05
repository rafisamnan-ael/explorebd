import { useEffect, useRef } from 'react';
import maplibregl, { type Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import { mapConfig } from '@/config/providers';
import { districts, getDistrict } from '@/data/districts';
import { loadDistrictGeoJson } from '@/lib/map/loadGeo';
import { prepareDistrictGeoJson } from '@/lib/map/prepareGeo';
import type { MapTheme } from '@/lib/map/themes';
import { useI18n } from '@/i18n';

const SOURCE = 'bd-districts';
const ROUTE = 'planner-route';

export interface PlannerMapProps {
  originId: string | null;
  destinationIds: string[];
  orderedIds: string[];
  returnToOrigin: boolean;
  theme: MapTheme;
  onDistrictClick?: (districtId: string) => void;
}

function stateColor(theme: MapTheme): maplibregl.ExpressionSpecification {
  return [
    'match',
    ['coalesce', ['feature-state', 'role'], 'none'],
    'origin',
    '#397C91',
    'destination',
    theme.status.visited,
    theme.status.unvisited,
  ];
}

export function PlannerMap({ originId, destinationIds, orderedIds, returnToOrigin, theme, onDistrictClick }: PlannerMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const geoRef = useRef<FeatureCollection | null>(null);
  const idMapRef = useRef<Map<string, string>>(new Map());
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hoveredRef = useRef<string | null>(null);
  const cbRef = useRef(onDistrictClick);
  cbRef.current = onDistrictClick;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    let disposed = false;
    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        sources: {},
        layers: [{ id: 'bg', type: 'background', paint: { 'background-color': theme.background } }],
      },
      bounds: mapConfig.bounds,
      fitBoundsOptions: { padding: 10, duration: 0 },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
      touchZoomRotate: false,
      keyboard: false,
      dragPan: false,
    });
    mapRef.current = map;

    const ensure = () => {
      if (disposed || !map.isStyleLoaded() || !geoRef.current) return;
      if (!map.getSource(SOURCE)) map.addSource(SOURCE, { type: 'geojson', data: geoRef.current, promoteId: 'shapeID' });
      if (!map.getLayer('pl-fill')) {
        map.addLayer({
          id: 'pl-fill',
          type: 'fill',
          source: SOURCE,
          paint: { 'fill-color': stateColor(theme), 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.86] },
        });
      }
      if (!map.getLayer('pl-line')) {
        map.addLayer({ id: 'pl-line', type: 'line', source: SOURCE, paint: { 'line-color': theme.districtStroke, 'line-width': 0.8 } });
      }
      if (!map.getSource(ROUTE)) map.addSource(ROUTE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      if (!map.getLayer('pl-route')) {
        map.addLayer({
          id: 'pl-route',
          type: 'line',
          source: ROUTE,
          paint: { 'line-color': theme.accent === '#2563EB' ? '#C69B4B' : theme.accent, 'line-width': 3, 'line-dasharray': [2, 1.4], 'line-opacity': 0.9 },
        });
      }
    };

    map.on('load', ensure);
    map.on('styledata', ensure);
    map.on('idle', ensure);
    map.on('mousemove', (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['pl-fill'] })[0];
      const fid = f ? String(f.id) : undefined;
      if (hoveredRef.current && hoveredRef.current !== fid) map.setFeatureState({ source: SOURCE, id: hoveredRef.current }, { hover: false });
      if (f && fid) {
        map.getCanvas().style.cursor = 'pointer';
        hoveredRef.current = fid;
        map.setFeatureState({ source: SOURCE, id: fid }, { hover: true });
      } else {
        map.getCanvas().style.cursor = '';
        hoveredRef.current = null;
      }
    });
    map.on('click', (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['pl-fill'] })[0];
      const districtId = (f?.properties as { districtId?: string } | undefined)?.districtId;
      if (districtId) cbRef.current?.(districtId);
    });

    loadDistrictGeoJson()
      .then((fc) => {
        if (disposed) return;
        geoRef.current = prepareDistrictGeoJson(fc);
        const idMap = new Map<string, string>();
        for (const feature of geoRef.current.features) {
          const props = feature.properties as { districtId?: string } | null;
          if (props?.districtId && feature.id !== undefined) idMap.set(props.districtId, String(feature.id));
        }
        idMapRef.current = idMap;
        ensure();
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Roles (origin/destination) + paint
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    for (const district of districts) {
      const fid = idMapRef.current.get(district.id);
      if (!fid) continue;
      const role = district.id === originId ? 'origin' : destinationIds.includes(district.id) ? 'destination' : 'none';
      map.setFeatureState({ source: SOURCE, id: fid }, { role });
    }
    if (map.getLayer('pl-fill')) map.setPaintProperty('pl-fill', 'fill-color', stateColor(theme));
  }, [originId, destinationIds, theme]);

  // Route line + numbered markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource(ROUTE)) return;
    const chain: string[] = [];
    if (originId) chain.push(originId);
    chain.push(...orderedIds);
    if (returnToOrigin && originId && orderedIds.length) chain.push(originId);
    const coords = chain.map((id) => { const d = getDistrict(id); return [d?.lng ?? 0, d?.lat ?? 0] as [number, number]; });
    (map.getSource(ROUTE) as maplibregl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: coords.length > 1 ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }] : [],
    });

    for (const m of markersRef.current) m.remove();
    markersRef.current = [];
    chain.forEach((id, i) => {
      const d = getDistrict(id);
      if (!d) return;
      const el = document.createElement('span');
      const isOrigin = id === originId && (i === 0 || i === chain.length - 1);
      el.className = `pl-marker ${isOrigin ? 'pl-marker-origin' : ''}`;
      el.textContent = isOrigin ? '★' : String(i);
      markersRef.current.push(new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([d.lng, d.lat]).addTo(map));
    });
  }, [originId, orderedIds, returnToOrigin]);

  return <div ref={containerRef} className="map-canvas" role="application" aria-label={t('planner.mapLabel')} style={{ width: '100%', height: '100%' }} />;
}
