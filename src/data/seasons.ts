import { places } from './places';

export const interestOptions = [
  'nature',
  'beach',
  'hill',
  'heritage',
  'food',
  'family',
  'adventure',
  'wildlife',
  'photography',
  'history',
  'culture',
  'religious',
  'boating',
  'trekking',
] as const;

export type Interest = (typeof interestOptions)[number];

/** Curated district picks by month, combined with place best-month data. */
const curatedByMonth: Record<number, string[]> = {
  1: ['bd-coxs-bazar', 'bd-khulna', 'bd-sunamganj', 'bd-rajshahi', 'bd-dhaka'],
  2: ['bd-coxs-bazar', 'bd-bagerhat', 'bd-sunamganj', 'bd-rajshahi', 'bd-dhaka'],
  3: ['bd-coxs-bazar', 'bd-chattogram', 'bd-dhaka', 'bd-sylhet', 'bd-cumilla'],
  4: ['bd-coxs-bazar', 'bd-chattogram', 'bd-bandarban', 'bd-sylhet', 'bd-gazipur'],
  5: ['bd-bandarban', 'bd-rangamati', 'bd-sylhet', 'bd-chattogram', 'bd-moulvibazar'],
  6: ['bd-moulvibazar', 'bd-sylhet', 'bd-bandarban', 'bd-coxs-bazar', 'bd-rangamati'],
  7: ['bd-sylhet', 'bd-moulvibazar', 'bd-bandarban', 'bd-rangamati', 'bd-khagrachhari'],
  8: ['bd-sylhet', 'bd-moulvibazar', 'bd-bandarban', 'bd-rangamati', 'bd-coxs-bazar'],
  9: ['bd-sylhet', 'bd-moulvibazar', 'bd-bandarban', 'bd-coxs-bazar', 'bd-khagrachhari'],
  10: ['bd-sylhet', 'bd-coxs-bazar', 'bd-rangamati', 'bd-sundarbans', 'bd-moulvibazar'],
  11: ['bd-coxs-bazar', 'bd-khulna', 'bd-bagerhat', 'bd-sunamganj', 'bd-rajshahi'],
  12: ['bd-coxs-bazar', 'bd-khulna', 'bd-bagerhat', 'bd-sunamganj', 'bd-dhaka'],
};

export function seasonalDistrictIds(month: number): string[] {
  const ids = new Set<string>(curatedByMonth[month] ?? []);
  for (const place of places) {
    if (place.bestMonths.includes(month)) ids.add(place.districtId);
  }
  return [...ids];
}

export function bestMonthLabel(months: number[]): { en: string; bn: string } {
  const en = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const bn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  if (!months.length) return { en: 'Year-round', bn: 'সারা বছর' };
  return { en: months.map((m) => en[m - 1]).join(', '), bn: months.map((m) => bn[m - 1]).join(', ') };
}
