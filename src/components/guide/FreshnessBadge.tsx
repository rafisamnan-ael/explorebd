import { BadgeCheck, AlertTriangle, HelpCircle } from 'lucide-react';
import { useI18n } from '@/i18n';

interface FreshnessBadgeProps {
  verifiedAt?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export function FreshnessBadge({ verifiedAt, confidence }: FreshnessBadgeProps) {
  const { t } = useI18n();

  if (!verifiedAt) {
    return (
      <span className="freshness" data-level="muted">
        <HelpCircle size={13} aria-hidden />
        {t('guide.freshness.unverified')}
      </span>
    );
  }

  const days = Math.floor((Date.now() - new Date(verifiedAt).getTime()) / 86_400_000);
  let label: string;
  if (days <= 0) label = t('guide.freshness.verifiedToday');
  else if (days === 1) label = t('guide.freshness.verifiedYesterday');
  else if (days < 180) label = t('guide.freshness.verifiedDaysAgo', { days });
  else label = t('guide.freshness.stale');

  const level = days < 180 && confidence !== 'low' ? 'fresh' : days < 400 ? 'warn' : 'muted';
  const Icon = level === 'fresh' ? BadgeCheck : AlertTriangle;

  return (
    <span className="freshness" data-level={level}>
      <Icon size={13} aria-hidden />
      {label}
    </span>
  );
}
