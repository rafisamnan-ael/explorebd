export const brand = {
  name: 'ExploreBD',
  nameBn: 'এক্সপ্লোর বিডি',
  tagline: 'Track. Discover. Plan. Go.',
  taglineBn: 'চিহ্নিত করুন। আবিষ্কার করুন। পরিকল্পনা করুন।',
  defaultLocale: 'bn-BD',
  supportedLocales: ['bn-BD', 'en-BD'] as const,
  url: import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
  attribution: 'ExploreBD',
} as const;

export type SupportedLocale = (typeof brand.supportedLocales)[number];
export type ShortLocale = 'bn' | 'en';

export function toShortLocale(locale: string): ShortLocale {
  return locale.startsWith('bn') ? 'bn' : 'en';
}
