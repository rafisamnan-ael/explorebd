import { brand } from '@/config/brand';
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
  visited: number;
  total: number;
  unit: string;
  url: string;
  displayName?: string;
  showLabels?: boolean;
  texture?: boolean;
}

const sizeConfig: Record<ShareFormat, { app: number; tag: number; big: number; small: number; name: number; pad: number }> = {
  social: { app: 40, tag: 17, big: 74, small: 30, name: 24, pad: 40 },
  square: { app: 52, tag: 22, big: 104, small: 40, name: 32, pad: 56 },
  story: { app: 62, tag: 26, big: 132, small: 50, name: 40, pad: 72 },
};

export function ShareCard({
  format,
  kind,
  statusMap,
  theme,
  locale,
  visited,
  total,
  unit,
  url,
  displayName,
  showLabels = true,
  texture,
}: ShareCardProps) {
  const { width, height } = shareFormatSize[format];
  const s = sizeConfig[format];
  const percent = total > 0 ? Math.max(0, Math.min(1, visited / total)) : 0;
  const barColor = `linear-gradient(90deg, #278661 0%, #176b4d 38%, #c69b4b 72%, #c66245 100%)`;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background: theme.background,
        fontFamily: 'Inter, "Noto Sans Bengali", system-ui, sans-serif',
      }}
    >
      <ExportMap
        kind={kind}
        statusMap={statusMap}
        theme={theme}
        width={width}
        height={height}
        texture={texture}
        showLabels={showLabels}
        locale={locale}
      />

      {/* Top overlay: app name (left) + bold visited count (right) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: `${s.pad}px ${s.pad}px ${s.pad * 1.6}px`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          background: `linear-gradient(to bottom, ${theme.background}f2 6%, ${theme.background}99 45%, ${theme.background}00 100%)`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: s.app, lineHeight: 1, color: theme.titleColor, letterSpacing: '-0.01em' }}>
            {brand.name}
          </div>
          <div style={{ fontSize: s.tag, fontWeight: 600, color: theme.subtitleColor, marginTop: s.tag * 0.25, letterSpacing: '0.02em' }}>
            {brand.tagline}
          </div>
          {displayName ? (
            <div style={{ fontWeight: 700, fontSize: s.name, color: theme.titleColor, marginTop: s.name * 0.5 }}>{displayName}</div>
          ) : null}
        </div>
        <div style={{ textAlign: 'right', lineHeight: 0.9, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: s.big, color: theme.titleColor }}>{visited}</span>
          <span style={{ fontWeight: 700, fontSize: s.small, color: theme.subtitleColor }}>
            {' '}
            / {total}
          </span>
          <div style={{ fontSize: s.tag, fontWeight: 700, color: theme.subtitleColor, marginTop: s.tag * 0.4 }}>{unit}</div>
        </div>
      </div>

      {/* Bottom overlay: colourful progress bar + url row */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${s.pad * 1.8}px ${s.pad}px ${s.pad}px`,
          background: `linear-gradient(to top, ${theme.background}f2 8%, ${theme.background}99 55%, ${theme.background}00 100%)`,
        }}
      >
        <div
          style={{
            height: Math.max(14, s.pad * 0.42),
            borderRadius: 999,
            overflow: 'hidden',
            background: `color-mix(in srgb, ${theme.titleColor} 16%, transparent)`,
            boxShadow: `inset 0 0 0 1px ${theme.districtStroke}`,
          }}
        >
          <div
            style={{
              width: `${Math.round(percent * 100)}%`,
              height: '100%',
              borderRadius: 999,
              background: barColor,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div
          style={{
            marginTop: s.pad * 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            color: theme.subtitleColor,
            fontWeight: 700,
            fontSize: s.tag,
          }}
        >
          <span style={{ color: theme.titleColor }}>{brand.name}</span>
          <span style={{ letterSpacing: '0.02em' }}>{url}</span>
        </div>
      </div>
    </div>
  );
}
