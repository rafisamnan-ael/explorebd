import { districts } from '@/data/districts';
import type { TravelStatus } from '@/types';

/** Stable district order so a code always maps back to the same districts. */
const ORDER = districts.map((d) => d.id);

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
  name?: string;
  statusMap: StatusMap;
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

/**
 * Encodes a travel map into a short URL-safe string. Only non-unvisited
 * statuses are meaningful; the fixed 64-character digit string keeps decoding
 * simple and order-independent of future content edits.
 */
export function encodeShareMap(statusMap: StatusMap, name = ''): string {
  const digits = ORDER.map((id) => CODE[statusMap[id] ?? 'unvisited']).join('');
  return toBase64Url(JSON.stringify({ v: 1, n: name.slice(0, 40), d: digits }));
}

export function decodeShareMap(code: string): SharePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(code)) as { v?: number; n?: string; d?: string };
    if (!parsed || typeof parsed.d !== 'string') return null;
    const statusMap: StatusMap = {};
    ORDER.forEach((id, index) => {
      const char = parsed.d![index];
      if (char && char !== '0') statusMap[id] = DECODE[char] ?? 'unvisited';
    });
    return { name: parsed.n || undefined, statusMap };
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

export function buildShareCaption(locale: 'bn' | 'en', stats: CaptionStats): string {
  if (locale === 'bn') {
    return [
      `আমি বাংলাদেশের ${stats.total}টি জেলার মধ্যে ${stats.visited}টি ঘুরেছি (${stats.percent}%) — ${stats.divisions}টি বিভাগ সম্পূর্ণ! 🇧🇩`,
      'আপনার বাংলাদেশ ভ্রমণ ম্যাপ বানান ও শেয়ার করুন 👇',
      '#এক্সপ্লোরবিডি #বাংলাদেশ #ভ্রমণ',
    ].join('\n');
  }
  return [
    `I've explored ${stats.visited} of ${stats.total} districts of Bangladesh (${stats.percent}%) — ${stats.divisions} divisions complete! 🇧🇩`,
    'Build and share your own Bangladesh travel map 👇',
    '#ExploreBD #Bangladesh #TravelBangladesh',
  ].join('\n');
}
