import { useI18n } from '@/i18n';

interface ProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  colorVar?: string;
}

export function ProgressRing({
  value,
  size = 132,
  stroke = 12,
  label,
  sublabel,
  colorVar = '--primary',
}: ProgressRingProps) {
  const { t, formatNumber } = useI18n();
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const percent = formatNumber(Math.round(clamped * 100));

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label ?? t('a11y.progress', { visited: percent, total: 100 })}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="progress-ring-label">
        <strong>{label ?? `${percent}%`}</strong>
        {sublabel ? <span className="subtle">{sublabel}</span> : null}
      </div>
    </div>
  );
}
