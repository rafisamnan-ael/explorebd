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
  progressText: string;
  displayName?: string;
  showLabels?: boolean;
  texture?: boolean;
}

const sizeConfig: Record<ShareFormat, { app: number; name: number; count: number; pad: number }> = {
  social: { app: 36, name: 26, count: 42, pad: 40 },
  square: { app: 48, name: 36, count: 56, pad: 56 },
  story: { app: 56, name: 44, count: 68, pad: 72 },
};

export function ShareCard({
  format,
  kind,
  statusMap,
  theme,
  locale,
  progressText,
  displayName,
  showLabels = true,
  texture,
}: ShareCardProps) {
  const { width, height } = shareFormatSize[format];
  const s = sizeConfig[format];

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

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${s.pad * 1.2}px ${s.pad}px ${s.pad}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
          background: `linear-gradient(to top, ${theme.background}f2 30%, ${theme.background}b3 65%, ${theme.background}00 100%)`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: s.app, lineHeight: 1, color: theme.titleColor }}>{brand.name}</div>
          <div style={{ fontSize: s.name, fontWeight: 600, color: theme.subtitleColor, marginTop: s.app * 0.12 }}>{brand.nameBn}</div>
          {displayName ? (
            <div style={{ fontWeight: 700, fontSize: s.name, color: theme.titleColor, marginTop: s.name * 0.5 }}>{displayName}</div>
          ) : null}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: s.count,
            lineHeight: 1,
            color: theme.titleColor,
            textAlign: 'right',
            whiteSpace: 'nowrap',
          }}
        >
          {progressText}
        </div>
      </div>
    </div>
  );
}
