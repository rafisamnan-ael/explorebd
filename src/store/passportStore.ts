import { create } from 'zustand';
import { db, ensureSettings, migrateLegacyVisited, type SavedPlaceRow } from '@/db/local/db';
import type { PassportEntry, TravelStatus } from '@/types';

interface PassportState {
  ready: boolean;
  entries: PassportEntry[];
  countryEntries: PassportEntry[];
  savedPlaceIds: string[];
  init: () => Promise<void>;
  setStatus: (
    entityId: string,
    status: TravelStatus,
    options?: { visitedAt?: string; visitCount?: number; note?: string },
  ) => Promise<void>;
  clearStatus: (entityId: string) => Promise<void>;
  setCountryStatus: (countryId: string, status: TravelStatus) => Promise<void>;
  clearCountryStatus: (countryId: string) => Promise<void>;
  toggleSavedPlace: (placeId: string) => Promise<void>;
  getStatus: (entityId: string) => TravelStatus;
  refreshSavedPlaces: () => Promise<void>;
}

export const usePassportStore = create<PassportState>((set, get) => ({
  ready: false,
  entries: [],
  countryEntries: [],
  savedPlaceIds: [],

  init: async () => {
    await ensureSettings();
    await migrateLegacyVisited();
    const [entries, countryEntries, saved] = await Promise.all([
      db.passportDistricts.toArray(),
      db.passportCountries.toArray(),
      db.savedPlaces.toArray(),
    ]);
    set({
      entries,
      countryEntries,
      savedPlaceIds: saved.map((s: SavedPlaceRow) => s.placeId),
      ready: true,
    });
  },

  setStatus: async (entityId, status, options) => {
    const now = new Date().toISOString();
    const entry: PassportEntry = {
      id: `district:${entityId}`,
      entityType: 'district',
      entityId,
      status,
      visitedAt: options?.visitedAt,
      visitCount: options?.visitCount,
      note: options?.note,
      updatedAt: now,
    };
    await db.passportDistricts.put(entry);
    set((state) => {
      const others = state.entries.filter((e) => e.entityId !== entityId);
      return { entries: [...others, entry] };
    });
  },

  clearStatus: async (entityId) => {
    await db.passportDistricts.delete(`district:${entityId}`);
    set((state) => ({ entries: state.entries.filter((e) => e.entityId !== entityId) }));
  },

  setCountryStatus: async (countryId, status) => {
    if (status === 'unvisited') {
      await db.passportCountries.delete(`country:${countryId}`);
      set((state) => ({ countryEntries: state.countryEntries.filter((e) => e.entityId !== countryId) }));
      return;
    }
    const entry: PassportEntry = {
      id: `country:${countryId}`,
      entityType: 'country',
      entityId: countryId,
      status,
      updatedAt: new Date().toISOString(),
    };
    await db.passportCountries.put(entry);
    set((state) => ({
      countryEntries: [...state.countryEntries.filter((e) => e.entityId !== countryId), entry],
    }));
  },

  clearCountryStatus: async (countryId) => {
    await db.passportCountries.delete(`country:${countryId}`);
    set((state) => ({ countryEntries: state.countryEntries.filter((e) => e.entityId !== countryId) }));
  },

  toggleSavedPlace: async (placeId) => {
    const exists = get().savedPlaceIds.includes(placeId);
    if (exists) {
      await db.savedPlaces.delete(`place:${placeId}`);
      set((state) => ({ savedPlaceIds: state.savedPlaceIds.filter((id) => id !== placeId) }));
    } else {
      await db.savedPlaces.put({ id: `place:${placeId}`, placeId, savedAt: new Date().toISOString() });
      set((state) => ({ savedPlaceIds: [...state.savedPlaceIds, placeId] }));
    }
  },

  getStatus: (entityId) => {
    const entry = get().entries.find((e) => e.entityId === entityId);
    return entry?.status ?? 'unvisited';
  },

  refreshSavedPlaces: async () => {
    const saved = await db.savedPlaces.toArray();
    set({ savedPlaceIds: saved.map((s: SavedPlaceRow) => s.placeId) });
  },
}));
