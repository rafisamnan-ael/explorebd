import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map as MlMap, type MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import { mapConfig } from '@/config/providers';
import { districts } from '@/data/districts';
import type { TravelStatus } from '@/types';
import { loadDistrictGeoJson } from '@/lib/map/loadGeo';
import { prepareDistrictGeoJson } from '@/lib/map/prepareGeo';
import type { MapTheme } from '@/lib/map/themes';
import { useI18n } from '@/i18n';

type StatusMap = Record<string, TravelStatus>;

export interface BangladeshMapProps {
  statusMap: StatusMap;
  theme: MapTheme;
  showLabels: boolean;
  labelLanguage: 'en' | 'bn' | 'both';
  selectedDistrictId?: string | null;
  onDistrictClick?: (districtId: string, point: { x: number; y: number }) => void;
  onBackgroundClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

const SOURCE_ID = 'bd-districts';
const SELECTED_SOURCE = 'bd-selected';
const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

function baseStyle(theme: MapTheme): maplibregl.StyleSpecification {
  return {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {},
    layers: [{ id: 'background', type: 'background', paint: { 'background-color': theme.background } }],
  };
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

function applyStatuses(map: MlMap, statusMap: StatusMap, idMap: Map<string, string>, theme: MapTheme) {
  if (!map.getSource(SOURCE_ID)) return;
  for (const [districtId, featureId] of idMap) {
    map.setFeatureState({ source: SOURCE_ID, id: featureId }, { status: statusMap[districtId] ?? 'unvisited' });
  }
  // Ensure paint expression is current.
  if (map.getLayer('districts-fill')) {
    map.setPaintProperty('districts-fill', 'fill-color', statusColorExpression(theme));
  }
}

export function BangladeshMap({
  statusMap,
  theme,
  showLabels,
  labelLanguage,
  selectedDistrictId,
  onDistrictClick,
  onBackgroundClick,
  className,
  ariaLabel,
}: BangladeshMapProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const geoRef = useRef<FeatureCollection | null>(null);
  const idMapRef = useRef<Map<string, string>>(new Map());
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const hoveredRef = useRef<string | null>(null);
  const themeRef = useRef(theme);
  const statusRef = useRef(statusMap);
  const callbacksRef = useRef({ onDistrictClick, onBackgroundClick });
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [tilesOk, setTilesOk] = useState(true);

  themeRef.current = theme;
  statusRef.current = statusMap;
  callbacksRef.current = { onDistrictClick, onBackgroundClick };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    let disposed = false;

    const map = new maplibregl.Map({
      container,
      style: baseStyle(themeRef.current),
      center: mapConfig.initialCenter,
      zoom: mapConfig.initialZoom,
      bounds: mapConfig.bounds,
      fitBoundsOptions: { padding: 30, duration: 0 },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;

    const ensureLayers = () => {
      if (disposed || !map.isStyleLoaded()) return;
      const geo = geoRef.current;
      if (!geo) return;
      const currentTheme = themeRef.current;
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, { type: 'geojson', data: geo, promoteId: 'shapeID' });
      }
      if (!map.getLayer('districts-fill')) {
        map.addLayer({
          id: 'districts-fill',
          type: 'fill',
          source: SOURCE_ID,
          paint: {
            'fill-color': statusColorExpression(currentTheme),
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.94, 0.84],
          },
        });
      }
      if (!map.getLayer('districts-line')) {
        map.addLayer({
          id: 'districts-line',
          type: 'line',
          source: SOURCE_ID,
          paint: { 'line-color': currentTheme.districtStroke, 'line-width': 0.8 },
        });
      }
      if (!map.getSource(SELECTED_SOURCE)) {
        map.addSource(SELECTED_SOURCE, { type: 'geojson', data: EMPTY_FC });
      }
      if (!map.getLayer('districts-selected')) {
        map.addLayer({
          id: 'districts-selected',
          type: 'line',
          source: SELECTED_SOURCE,
          paint: { 'line-color': currentTheme.districtStrokeActive, 'line-width': 2.4 },
        });
      }
      applyStatuses(map, statusRef.current, idMapRef.current, currentTheme);
    };

    const onMouseMove = (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['districts-fill'] });
      const feature = features[0];
      const featureId = feature ? String(feature.id) : undefined;
      if (hoveredRef.current && hoveredRef.current !== featureId) {
        map.setFeatureState({ source: SOURCE_ID, id: hoveredRef.current }, { hover: false });
      }
      if (feature && featureId) {
        map.getCanvas().style.cursor = 'pointer';
        hoveredRef.current = featureId;
        map.setFeatureState({ source: SOURCE_ID, id: featureId }, { hover: true });
      } else {
        map.getCanvas().style.cursor = '';
        hoveredRef.current = null;
      }
    };

    const onClick = (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, { layers: ['districts-fill'] });
      const districtId = (features[0]?.properties as { districtId?: string } | undefined)?.districtId;
      if (districtId) {
        callbacksRef.current.onDistrictClick?.(districtId, { x: event.point.x, y: event.point.y });
      } else {
        callbacksRef.current.onBackgroundClick?.();
      }
    };

    const onError = () => {
      if (!map.isStyleLoaded()) setTilesOk(false);
    };

    map.on('load', () => {
      ensureLayers();
      setState('ready');
    });
    map.on('styledata', ensureLayers);
    map.on('idle', ensureLayers);
    map.on('error', onError);
    map.on('mousemove', onMouseMove);
    map.on('click', onClick);

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
        ensureLayers();
      })
      .catch(() => setState('error'));

    const controller = new AbortController();
    if (mapConfig.styleUrl) {
      fetch(mapConfig.styleUrl, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error('style'))))
        .then((style) => {
          if (!disposed) map.setStyle(style as maplibregl.StyleSpecification);
        })
        .catch(() => {
          if (!disposed) setTilesOk(false);
        });
    }

    return () => {
      disposed = true;
      controller.abort();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('background')) map.setPaintProperty('background', 'background-color', theme.background);
    if (map.getLayer('districts-fill')) map.setPaintProperty('districts-fill', 'fill-color', statusColorExpression(theme));
    if (map.getLayer('districts-line')) map.setPaintProperty('districts-line', 'line-color', theme.districtStroke);
    if (map.getLayer('districts-selected')) map.setPaintProperty('districts-selected', 'line-color', theme.districtStrokeActive);
  }, [theme, state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    applyStatuses(map, statusMap, idMapRef.current, themeRef.current);
  }, [statusMap, state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource(SELECTED_SOURCE)) return;
    const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource;
    const geo = geoRef.current;
    if (!selectedDistrictId || !geo) {
      source.setData(EMPTY_FC);
      return;
    }
    const feature = geo.features.find(
      (f) => (f.properties as { districtId?: string } | null)?.districtId === selectedDistrictId,
    );
    source.setData({ type: 'FeatureCollection', features: feature ? [feature] : [] });
  }, [selectedDistrictId, state]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const district of districts) {
      let marker = markersRef.current.get(district.id);
      if (!marker) {
        const el = document.createElement('span');
        el.className = 'map-label';
        marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([district.lng, district.lat])
          .addTo(map);
        markersRef.current.set(district.id, marker);
      }
      const el = marker.getElement();
      if (!showLabels) {
        el.style.display = 'none';
        continue;
      }
      const text =
        labelLanguage === 'both'
          ? `${district.nameEn} · ${district.nameBn}`
          : labelLanguage === 'bn'
            ? district.nameBn
            : district.nameEn;
      el.textContent = text;
      el.style.color = theme.labelColor;
      el.style.display = '';
    }
  }, [showLabels, labelLanguage, theme, state]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        className="map-canvas"
        role="application"
        aria-label={ariaLabel ?? t('map.title')}
        style={{ width: '100%', height: '100%' }}
      />
      {state === 'loading' ? (
        <div className="map-overlay map-overlay-loading" role="status">
          <div className="skeleton" style={{ width: 160, height: 18 }} />
          <span className="sr-only">{t('a11y.loadingMap')}</span>
        </div>
      ) : null}
      {state === 'error' ? (
        <div className="map-overlay map-overlay-error" role="alert">
          {t('errors.loadFailed')}
        </div>
      ) : null}
      {!tilesOk && state === 'ready' ? <div className="map-tiles-note">{t('errors.mapTilesUnavailable')}</div> : null}
      <div className="map-attribution" aria-hidden>
        {t('export.madeWith')} · {mapConfig.attribution}
      </div>
    </div>
  );
}
