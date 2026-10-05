import { districts } from '@/data/districts';
import { countries } from '@/data/countries';
import type { TravelStatus } from '@/types';

export type ShareScope = 'bd' | 'world';

const DISTRICT_ORDER = districts.map((d) => d.id);
const COUNTRY_ORDER = countries.map((c) => c.id);

const CODE: Record<TravelStatus, string> = {
  unvisited: '0',
  want_to_go: '1',
  visited: '2',
  favorite: '3',
  lived_here: '4',
};

const DECODE: Record<string, TravelStatus> = {
  '0': 'unvisited',
  '1': 'want_to_go',
  '2': 'visited',
  '3': 'favorite',
  '4': 'lived_here',
};

export type StatusMap = Record<string, TravelStatus>;

export interface SharePayload {
  scope: ShareScope;
  name?: string;
  statusMap: StatusMap;
}

function orderFor(scope: ShareScope): string[] {
  return scope === 'world' ? COUNTRY_ORDER : DISTRICT_ORDER;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encodes a travel map (districts or countries) into a short URL-safe string. */
export function encodeShareMap(statusMap: StatusMap, name = '', scope: ShareScope = 'bd'): string {
  const digits = orderFor(scope)
    .map((id) => CODE[statusMap[id] ?? 'unvisited'])
    .join('');
  return toBase64Url(JSON.stringify({ v: 2, s: scope, n: name.slice(0, 40), d: digits }));
}

export function decodeShareMap(code: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code)) as { v?: number; s?: string; n?: string; d?: string };
    if (!parsed || typeof parsed.d !== 'string') return null;
    const scope: ShareScope = parsed.s === 'world' ? 'world' : 'bd';
    const statusMap: StatusMap = {};
    orderFor(scope).forEach((id, index) => {
      const char = parsed.d![index];
      if (char && char !== '0') statusMap[id] = DECODE[char] ?? 'unvisited';
    });
    return { scope, name: parsed.n || undefined, statusMap };
  } catch {
    return null;
  }
}

export function shareMapUrl(code: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/m/${code}`;
}

export interface CaptionStats {
  visited: number;
  total: number;
  divisions: number;
  percent: number;
}

export function buildShareCaption(
  locale: 'bn' | 'en',
  stats: CaptionStats,
  scope: ShareScope = 'bd',
  mode: 'visited' | 'wishlist' = 'visited',
): string {
  const unitEn = scope === 'world' ? 'countries' : 'districts of Bangladesh';
  const regionEn = scope === 'world' ? 'the world' : 'Bangladesh';
  const tag = scope === 'world' ? '#ExploreBD #World #Travel' : '#ExploreBD #Bangladesh #TravelBangladesh';
  const tagBn = scope === 'world' ? '#এক্সপ্লোরবিডি #বিশ্ব #ভ্রমণ' : '#এক্সপ্লোরবিডি #বাংলাদেশ #ভ্রমণ';

  if (locale === 'bn') {
    const unitBn = scope === 'world' ? 'দেশের' : 'জেলার';
    const regionBn = scope === 'world' ? 'বিশ্বের' : 'বাংলাদেশের';
    if (mode === 'wishlist') {
      return [
        `${regionBn} ${stats.visited}টি ${unitBn} আমার ইচ্ছাতালিকায় — পরের ভ্রমণ পরিকল্পনা করছি! 🗺️`,
        'আপনার ভ্রমণ ম্যাপ বানান ও শেয়ার করুন 👇',
        tagBn,
      ].join('\n');
    }
    return [
      `আমি ${regionBn} ${stats.total}টির মধ্যে ${stats.visited}টি ঘুরেছি (${stats.percent}%) — ${stats.divisions}টি বিভাগ সম্পূর্ণ! 🇧🇩`,
      'আপনার বাংলাদেশ ভ্রমণ ম্যাপ বানান ও শেয়ার করুন 👇',
      tagBn,
    ].join('\n');
  }

  if (mode === 'wishlist') {
    return [
      `${stats.visited} ${unitEn} on my wishlist — planning my next trips! 🗺️`,
      `Build and share your own ${regionEn} travel map 👇`,
      tag,
    ].join('\n');
  }

  return [
    `I've explored ${stats.visited} of ${stats.total} ${unitEn} (${stats.percent}%)! 🇧🇩`,
    `Build and share your own ${regionEn} travel map 👇`,
    tag,
  ].join('\n');
}
