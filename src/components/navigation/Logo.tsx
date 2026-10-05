import { brand } from '@/config/brand';

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={brand.name}
      className="logo-mark"
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--river)" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#logoGrad)" />
      <path
        d="M9 26c3.5 0 5-2.4 8-2.4s4.5 2.4 8 2.4c2.4 0 4-1 6-2.6"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M20 9c4.6 0 8 3.2 8 7.4 0 5-8 12.6-8 12.6s-8-7.6-8-12.6C12 12.2 15.4 9 20 9Z"
        fill="white"
      />
      <circle cx="20" cy="16.6" r="3" fill="var(--primary)" />
    </svg>
  );
}
