import { useEffect, useRef, useState } from 'react';
import type { TravelStatus } from '@/types';
import type { MapTheme } from '@/lib/map/themes';
import type { ShareScope } from '@/lib/share/shareCode';
import { ExportMap } from './ExportMap';

export type ShareFormat = 'social' | 'square' | 'story';

export const shareFormatSize: Record<ShareFormat, { width: number; height: number }> = {
  social: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

interface ShareCardProps {
  format: ShareFormat;
  kind: ShareScope;
  statusMap: Record<string, TravelStatus>;
  theme: MapTheme;
  locale: 'bn' | 'en';
  /** e.g. "Exploring Bangladesh" / "Exploring World" */
  tag: string;
  visited: number;
  total: number;
  unit: string;
  url: string;
  percentLabel?: string;
  displayName?: string;
  showLabels?: boolean;
  texture?: boolean;
}

const sizeConfig: Record<ShareFormat, { tag: number; big: number; small: number; name: number; pad: number }> = {
  social: { tag: 30, big: 52, small: 20, name: 22, pad: 30 },
  square: { tag: 40, big: 66, small: 26, name: 28, pad: 42 },
  story: { tag: 50, big: 84, small: 34, name: 34, pad: 58 },
};

export function ShareCard({
  format,
  kind,
  statusMap,
  theme,
  locale,
  tag,
  visited,
  total,
  unit,
  url,
  percentLabel = 'completed',
  displayName,
  showLabels = true,
  texture,
}: ShareCardProps) {
  const { width, height } = shareFormatSize[format];
  const s = sizeConfig[format];
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round((visited / total) * 100))) : 0;
  const barColor = 'linear-gradient(90deg, #278661 0%, #176b4d 38%, #c69b4b 72%, #c66245 100%)';

  // Measure the map region so the map is drawn to fit exactly (never cropped by the bands).
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const update = () => setMapSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [format, kind]);

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${theme.background} 0%, color-mix(in srgb, ${theme.background} 84%, ${theme.titleColor}) 100%)`,
        fontFamily: 'Inter, "Noto Sans Bengali", system-ui, sans-serif',
      }}
    >
      {/* Top: tag + optional name (left), bold visited count (right) */}
      <div
        style={{
          flexShrink: 0,
          padding: `${s.pad}px ${s.pad}px ${s.pad * 0.85}px`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: s.tag, lineHeight: 1.05, color: theme.titleColor, letterSpacing: '-0.01em' }}>
            {tag}
          </div>
          {displayName ? (
            <div style={{ fontWeight: 700, fontSize: s.name, color: theme.subtitleColor, marginTop: s.name * 0.35 }}>{displayName}</div>
          ) : null}
        </div>
        <div style={{ textAlign: 'right', lineHeight: 0.95, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: s.big, color: theme.titleColor }}>{visited}</span>
          <span style={{ fontWeight: 700, fontSize: s.small, color: theme.subtitleColor }}> / {total}</span>
          <div style={{ fontSize: s.small, fontWeight: 700, color: theme.subtitleColor, marginTop: 2 }}>{unit}</div>
        </div>
      </div>

      {/* Map region — its own space, never covered */}
      <div ref={mapRef} style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {mapSize.width > 0 && mapSize.height > 0 ? (
          <ExportMap
            kind={kind}
            statusMap={statusMap}
            theme={theme}
            width={mapSize.width}
            height={mapSize.height}
            texture={texture}
            showLabels={showLabels}
            locale={locale}
          />
        ) : null}
      </div>

      {/* Bottom: colourful progress bar + percentage + url */}
      <div
        style={{
          flexShrink: 0,
          padding: `${s.pad * 0.85}px ${s.pad}px ${s.pad}px`,
        }}
      >
        <div
          style={{
            height: Math.max(12, s.pad * 0.36),
            borderRadius: 999,
            overflow: 'hidden',
            background: `color-mix(in srgb, ${theme.titleColor} 14%, transparent)`,
            boxShadow: `inset 0 0 0 1px ${theme.districtStroke}`,
          }}
        >
          <div style={{ width: `${percent}%`, height: '100%', borderRadius: 999, background: barColor }} />
        </div>
        <div
          style={{
            marginTop: s.pad * 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            color: theme.subtitleColor,
            fontSize: s.small,
          }}
        >
          <span style={{ fontWeight: 800, color: theme.titleColor }}>{percent}% {percentLabel}</span>
          <span style={{ letterSpacing: '0.02em' }}>{url}</span>
        </div>
      </div>
    </div>
  );
}
