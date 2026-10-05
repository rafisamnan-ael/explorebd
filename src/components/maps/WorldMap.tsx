import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MlMap, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import type { TravelStatus } from '@/types';
import { loadWorldGeoJson } from '@/lib/map/loadGeo';
import { prepareWorldGeoJson } from '@/lib/map/prepareGeo';
import type { MapTheme } from '@/lib/map/themes';
import { useI18n } from '@/i18n';

const SOURCE_ID = 'world-countries';

export interface WorldMapProps {
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  onCountryClick?: (countryId: string, point: { x: number; y: number }) => void;
  onBackgroundClick?: () => void;
}

function statusColorExpression(theme: MapTheme): maplibregl.ExpressionSpecification {
  return [
    'match',
    ['coalesce', ['feature-state', 'status'], 'unvisited'],
    'want_to_go',
    theme.status.want_to_go,
    'visited',
    theme.status.visited,
    'favorite',
    theme.status.favorite,
    'lived_here',
    theme.status.lived_here,
    theme.status.unvisited,
  ];
}

export function WorldMap({ statusMap, theme, onCountryClick, onBackgroundClick }: WorldMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const geoRef = useRef<FeatureCollection | null>(null);
  const idMapRef = useRef<Map<string, string>>(new Map());
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

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
        layers: [{ id: 'background', type: 'background', paint: { 'background-color': theme.background } }],
      },
      center: [12, 18],
      zoom: 0.6,
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

    const apply = () => {
      if (!map.getSource(SOURCE_ID)) return;
      for (const [countryId, featureId] of idMapRef.current) {
        map.setFeatureState({ source: SOURCE_ID, id: featureId }, { status: statusMap[countryId] ?? 'unvisited' });
      }
      map.setPaintProperty('districts-fill', 'fill-color', statusColorExpression(theme));
    };

    const ensure = () => {
      if (disposed || !map.isStyleLoaded() || !geoRef.current) return;
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, { type: 'geojson', data: geoRef.current });
      }
      if (!map.getLayer('districts-fill')) {
        map.addLayer({
          id: 'districts-fill',
          type: 'fill',
          source: SOURCE_ID,
          paint: { 'fill-color': statusColorExpression(theme), 'fill-opacity': 0.85 },
        });
      }
      if (!map.getLayer('districts-line')) {
        map.addLayer({ id: 'districts-line', type: 'line', source: SOURCE_ID, paint: { 'line-color': theme.districtStroke, 'line-width': 0.5 } });
      }
      apply();
    };

    map.on('load', () => {
      ensure();
      setState('ready');
    });
    map.on('styledata', ensure);
    map.on('idle', ensure);
    map.on('error', () => undefined);
    map.on('mousemove', (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['districts-fill'] });
      map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });
    map.on('click', (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['districts-fill'] });
      const countryId = (features[0]?.properties as { countryId?: string } | undefined)?.countryId;
      if (countryId) onCountryClick?.(countryId, { x: event.point.x, y: event.point.y });
      else onBackgroundClick?.();
    });

    loadWorldGeoJson()
      .then((fc) => {
        if (disposed) return;
        geoRef.current = prepareWorldGeoJson(fc);
        const idMap = new Map<string, string>();
        for (const feature of geoRef.current.features) {
          const props = feature.properties as { countryId?: string } | null;
          if (props?.countryId && feature.id !== undefined) idMap.set(props.countryId, String(feature.id));
        }
        idMapRef.current = idMap;
        ensure();
      })
      .catch(() => setState('error'));

    return () => {
      disposed = true;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', theme.background);
    if (map.getLayer('districts-fill')) map.setPaintProperty('districts-fill', 'fill-color', statusColorExpression(theme));
  }, [theme, state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource(SOURCE_ID)) return;
    for (const [countryId, featureId] of idMapRef.current) {
      map.setFeatureState({ source: SOURCE_ID, id: featureId }, { status: statusMap[countryId] ?? 'unvisited' });
    }
  }, [statusMap, state]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} role="application" aria-label={t('world.title')} />
      {state === 'loading' ? (
        <div className="map-overlay map-overlay-loading" role="status">
          <div className="skeleton" style={{ width: 160, height: 18 }} />
        </div>
      ) : null}
      {state === 'error' ? <div className="map-overlay map-overlay-error">{t('errors.loadFailed')}</div> : null}
    </div>
  );
}
