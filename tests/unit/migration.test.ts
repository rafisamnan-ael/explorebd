import { describe, expect, it } from 'vitest';
import { convertLegacyVisited } from '@/db/local/db';

describe('legacy localStorage migration', () => {
  it('converts a binary visited list into multi-status entries', () => {
    const entries = convertLegacyVisited(['bd-dhaka', 'bd-coxs-bazar'], '2026-01-01T00:00:00.000Z');
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ entityId: 'bd-dhaka', status: 'visited', entityType: 'district' });
    expect(entries[0]!.id).toBe('district:bd-dhaka');
  });

  it('ignores non-array and non-string values', () => {
    expect(convertLegacyVisited(null)).toEqual([]);
    expect(convertLegacyVisited('nope')).toEqual([]);
    expect(convertLegacyVisited([1, '', 'bd-dhaka'])).toHaveLength(1);
  });
});
