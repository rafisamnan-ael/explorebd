import { Bookmark, Check, Circle, Heart, House, type LucideIcon } from 'lucide-react';
import { useI18n } from '@/i18n';
import type { TravelStatus } from '@/types';

export const statusMeta: Record<
  TravelStatus,
  { labelKey: string; shortKey: string; colorVar: string; Icon: LucideIcon }
> = {
  unvisited: { labelKey: 'status.unvisited', shortKey: 'status.short.unvisited', colorVar: '--status-unvisited', Icon: Circle },
  want_to_go: { labelKey: 'status.want_to_go', shortKey: 'status.short.want_to_go', colorVar: '--status-want', Icon: Bookmark },
  visited: { labelKey: 'status.visited', shortKey: 'status.short.visited', colorVar: '--status-visited', Icon: Check },
  favorite: { labelKey: 'status.favorite', shortKey: 'status.short.favorite', colorVar: '--status-favorite', Icon: Heart },
  lived_here: { labelKey: 'status.lived_here', shortKey: 'status.short.lived_here', colorVar: '--status-lived', Icon: House },
};

export const statusList: TravelStatus[] = ['visited', 'want_to_go', 'favorite', 'lived_here', 'unvisited'];

export function StatusPill({ status, short = false }: { status: TravelStatus; short?: boolean }) {
  const { t } = useI18n();
  const meta = statusMeta[status];
  const { Icon } = meta;
  return (
    <span className="status-pill" data-status={status}>
      <span className="status-dot" style={{ background: `var(${meta.colorVar})` }} aria-hidden />
      <Icon size={14} aria-hidden />
      {t(short ? meta.shortKey : meta.labelKey)}
    </span>
  );
}

export function StatusDot({ status, size = 10 }: { status: TravelStatus; size?: number }) {
  return (
    <span
      className="status-dot"
      style={{ background: `var(${statusMeta[status].colorVar})`, width: size, height: size }}
      aria-hidden
    />
  );
}
