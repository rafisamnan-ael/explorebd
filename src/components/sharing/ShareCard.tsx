import type { TravelStatus } from '@/types';
import type { MapTheme } from '@/lib/map/themes';
import { statusList } from '@/components/ui/StatusPill';
import { ExportMap } from './ExportMap';

export type ShareFormat = 'social' | 'square' | 'story';

export const shareFormatSize: Record<ShareFormat, { width: number; height: number }> = {
  social: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareCardModel {
  title: string;
  subtitle?: string;
  stats: ShareStat[];
  displayName?: string;
  dateLabel?: string;
}

interface ShareCardProps {
  format: ShareFormat;
  model: ShareCardModel;
  theme: MapTheme;
  statusMap: Record<string, TravelStatus>;
  legendLabels: Record<TravelStatus, string>;
  showLegend?: boolean;
  showDate?: boolean;
  texture?: boolean;
}

export function ShareCard({
  format,
  model,
  theme,
  statusMap,
  legendLabels,
  showLegend = true,
  showDate = true,
  texture,
}: ShareCardProps) {
  const { width, height } = shareFormatSize[format];
  const isStory = format === 'story';
  const mapSize = isStory
    ? { width: Math.round(width * 0.82), height: Math.round(height * 0.42) }
    : format === 'square'
      ? { width: Math.round(width * 0.62), height: Math.round(height * 0.44) }
      : { width: Math.round(width * 0.4), height: Math.round(height * 0.74) };

  return (
    <div
      style={{
        width,
        height,
        background: theme.background,
        color: theme.titleColor,
        display: 'flex',
        flexDirection: isStory ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isStory ? '90px 72px' : '56px 64px',
        gap: 40,
        fontFamily: 'Inter, "Noto Sans Bengali", system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: isStory ? 40 : 24, minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 26, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.accent, fontWeight: 700 }}>
            {model.subtitle ?? 'ExploreBD'}
          </div>
          <h1 style={{ fontSize: isStory ? 84 : format === 'square' ? 62 : 58, lineHeight: 1.05, margin: '14px 0 0', color: theme.titleColor }}>
            {model.title}
          </h1>
          {model.displayName ? (
            <div style={{ fontSize: 34, marginTop: 18, color: theme.subtitleColor, fontWeight: 600 }}>{model.displayName}</div>
          ) : null}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
          {model.stats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: isStory ? 64 : 52, fontWeight: 800, color: theme.titleColor, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 24, color: theme.subtitleColor, marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {showLegend ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 8 }}>
            {statusList.map((status) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: theme.subtitleColor }}>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    background: theme.status[status],
                    display: 'inline-block',
                    border: `1px solid ${theme.districtStroke}`,
                  }}
                />
                {legendLabels[status]}
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: theme.attributionColor, fontSize: 20 }}>
          <span>ExploreBD · এক্সপ্লোর বিডি</span>
          {showDate && model.dateLabel ? <span>{model.dateLabel}</span> : null}
        </div>
      </div>

      <div
        style={{
          width: mapSize.width,
          height: mapSize.height,
          borderRadius: 24,
          overflow: 'hidden',
          border: `1px solid ${theme.districtStroke}`,
          flexShrink: 0,
          background: theme.panel,
        }}
      >
        <ExportMap statusMap={statusMap} theme={theme} width={mapSize.width} height={mapSize.height} texture={texture} />
      </div>
    </div>
  );
}
