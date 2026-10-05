import { describe, expect, it } from 'vitest';
import { leaderboardSubmissionSchema, passportEntrySchema, placeSchema } from '@/lib/validation/schemas';
import { places } from '@/data/places';
import { districts } from '@/data/districts';

describe('leaderboard validation', () => {
  it('accepts a valid quiz score', () => {
    const result = leaderboardSubmissionSchema.safeParse({ game: 'quiz', name: 'Rafi', score: 8, total: 10, gameVersion: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name and negative score', () => {
    expect(leaderboardSubmissionSchema.safeParse({ game: 'quiz', name: '', score: -1, gameVersion: 1 }).success).toBe(false);
  });

  it('rejects an unknown game', () => {
    expect(leaderboardSubmissionSchema.safeParse({ game: 'chess', name: 'A', score: 1, gameVersion: 1 }).success).toBe(false);
  });
});

describe('passport entry validation', () => {
  it('rejects an invalid status', () => {
    const result = passportEntrySchema.safeParse({
      id: 'x',
      entityType: 'district',
      entityId: 'bd-dhaka',
      status: 'maybe',
      updatedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});

describe('content integrity', () => {
  const districtIds = new Set(districts.map((d) => d.id));

  it('every place references a valid district', () => {
    for (const place of places) {
      expect(districtIds.has(place.districtId), `${place.id} → ${place.districtId}`).toBe(true);
    }
  });

  it('every place passes schema validation', () => {
    for (const place of places) {
      const result = placeSchema.safeParse(place);
      if (!result.success) {
        throw new Error(`${place.id}: ${result.error.message}`);
      }
      expect(result.success).toBe(true);
    }
  });

  it('has no duplicate district ids or slugs', () => {
    const ids = districts.map((d) => d.id);
    const slugs = districts.map((d) => d.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(ids.length).toBe(64);
  });
});
