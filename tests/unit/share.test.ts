import { describe, expect, it } from 'vitest';
import { buildShareCaption, decodeShareMap, encodeShareMap, shareMapUrl } from '@/lib/share/shareCode';
import { platformShareUrl } from '@/lib/share/social';

describe('share map code', () => {
  it('round-trips a status map and name', () => {
    const statusMap = { 'bd-dhaka': 'visited', 'bd-coxs-bazar': 'favorite', 'bd-sylhet': 'want_to_go' } as const;
    const code = encodeShareMap(statusMap, 'Rafi');
    const decoded = decodeShareMap(code);
    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe('Rafi');
    expect(decoded!.statusMap['bd-dhaka']).toBe('visited');
    expect(decoded!.statusMap['bd-coxs-bazar']).toBe('favorite');
    expect(decoded!.statusMap['bd-sylhet']).toBe('want_to_go');
    // Unvisited districts are omitted.
    expect(decoded!.statusMap['bd-barguna']).toBeUndefined();
  });

  it('preserves Bangla names through encoding', () => {
    const code = encodeShareMap({ 'bd-dhaka': 'visited' }, 'রাফি');
    expect(decodeShareMap(code)!.name).toBe('রাফি');
  });

  it('returns null for invalid input', () => {
    expect(decodeShareMap('not-a-valid-code')).toBeNull();
    expect(decodeShareMap('')).toBeNull();
  });

  it('builds a share URL', () => {
    expect(shareMapUrl('abc', 'https://example.com')).toBe('https://example.com/m/abc');
  });
});

describe('share caption', () => {
  it('includes the stats and hashtags in English', () => {
    const caption = buildShareCaption('en', { visited: 12, total: 64, divisions: 2, percent: 19 });
    expect(caption).toContain('12');
    expect(caption).toContain('64');
    expect(caption).toContain('#ExploreBD');
  });

  it('includes Bangla hashtags in Bangla', () => {
    const caption = buildShareCaption('bn', { visited: 12, total: 64, divisions: 2, percent: 19 });
    expect(caption).toContain('#এক্সপ্লোরবিডি');
  });
});

describe('social intents', () => {
  it('creates encoded platform share URLs', () => {
    const url = platformShareUrl('facebook', 'https://example.com/m/abc', 'hello');
    expect(url).toContain('facebook.com/sharer');
    expect(url).toContain(encodeURIComponent('https://example.com/m/abc'));
  });
});
