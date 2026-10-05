import { z } from 'zod';

export const travelStatusSchema = z.enum(['unvisited', 'want_to_go', 'visited', 'favorite', 'lived_here']);

export const passportEntrySchema = z.object({
  id: z.string().min(1),
  entityType: z.enum(['district', 'upazila', 'country']),
  entityId: z.string().min(1),
  status: travelStatusSchema,
  visitedAt: z.string().optional(),
  visitCount: z.number().int().min(0).max(9999).optional(),
  note: z.string().max(600).optional(),
  updatedAt: z.string(),
});

export const tripDraftSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  startDistrictId: z.string().min(1),
  destinationDistrictIds: z.array(z.string()),
  placeIds: z.array(z.string()),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.number().int().min(1).max(60).optional(),
  travelerCount: z.number().int().min(1).max(60),
  groupType: z.enum(['solo', 'couple', 'family', 'friends']),
  children: z.boolean(),
  budgetBdt: z.number().min(0).optional(),
  pace: z.enum(['relaxed', 'balanced', 'packed']),
  hotelTier: z.enum(['budget', 'mid', 'premium']),
  transportPreferences: z.array(z.enum(['bus', 'train', 'car', 'flight', 'any'])),
  interests: z.array(z.string()),
  roundTrip: z.boolean(),
  updatedAt: z.string(),
});

export const journalEntrySchema = z.object({
  id: z.string().min(1),
  districtId: z.string().optional(),
  placeId: z.string().optional(),
  date: z.string(),
  caption: z.string().min(1).max(160),
  note: z.string().max(4000).optional(),
  rating: z.number().min(1).max(5).optional(),
  companions: z.string().max(200).optional(),
  favoriteMoment: z.string().max(400).optional(),
  photoBlobIds: z.array(z.string()),
  visibility: z.enum(['private', 'link', 'public']),
  updatedAt: z.string(),
});

export const placeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  districtId: z.string().min(1),
  nameEn: z.string().min(1),
  nameBn: z.string().min(1),
  shortDescriptionEn: z.string().min(1),
  shortDescriptionBn: z.string().min(1),
  descriptionEn: z.string().optional(),
  descriptionBn: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  categories: z.array(z.string()),
  interests: z.array(z.string()),
  bestMonths: z.array(z.number().int().min(1).max(12)),
  typicalDurationMinutes: z.number().int().positive().optional(),
  cost: z
    .object({
      minBdt: z.number().optional(),
      maxBdt: z.number().optional(),
      basis: z.enum(['person', 'group', 'entry', 'day']).optional(),
    })
    .optional(),
  nearbyPlaceIds: z.array(z.string()),
  media: z.array(
    z.object({
      url: z.string(),
      altEn: z.string(),
      altBn: z.string(),
      author: z.string().optional(),
      sourceUrl: z.string().optional(),
      license: z.string().optional(),
      licenseUrl: z.string().optional(),
    }),
  ),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  verifiedAt: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  published: z.boolean(),
});

export const leaderboardSubmissionSchema = z.object({
  game: z.enum(['quiz', 'puzzle']),
  name: z.string().min(1).max(24),
  score: z.number().int().min(0).max(1000),
  total: z.number().int().min(1).max(1000).optional(),
  timeMs: z.number().int().min(0).max(3_600_000).optional(),
  accuracy: z.number().min(0).max(1).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  gameVersion: z.number().int().min(1),
  turnstileToken: z.string().optional(),
});

export const placeReportSchema = z.object({
  placeId: z.string().min(1),
  type: z.enum(['price', 'hours', 'closed', 'wrong', 'other']),
  details: z.string().min(3).max(1000),
  turnstileToken: z.string().optional(),
});

export type PlaceReportInput = z.infer<typeof placeReportSchema>;
export type LeaderboardSubmission = z.infer<typeof leaderboardSubmissionSchema>;
