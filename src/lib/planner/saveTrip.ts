import { db } from '@/db/local/db';
import type { TripDraft } from '@/types';

export async function createTripDraft(partial: Partial<TripDraft> & { startDistrictId: string }): Promise<TripDraft> {
  const now = new Date().toISOString();
  const draft: TripDraft = {
    id: `trip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: partial.title ?? 'My Bangladesh trip',
    startDistrictId: partial.startDistrictId,
    destinationDistrictIds: partial.destinationDistrictIds ?? [],
    placeIds: partial.placeIds ?? [],
    startDate: partial.startDate,
    endDate: partial.endDate,
    days: partial.days ?? 2,
    travelerCount: partial.travelerCount ?? 2,
    groupType: partial.groupType ?? 'friends',
    children: partial.children ?? false,
    budgetBdt: partial.budgetBdt,
    pace: partial.pace ?? 'balanced',
    hotelTier: partial.hotelTier ?? 'mid',
    transportPreferences: partial.transportPreferences ?? ['any'],
    interests: partial.interests ?? [],
    roundTrip: partial.roundTrip ?? true,
    updatedAt: now,
  };
  await db.tripDrafts.put(draft);
  return draft;
}
