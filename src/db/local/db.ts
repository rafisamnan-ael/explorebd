import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  JournalEntry,
  LocalScore,
  PassportEntry,
  PhotoBlob,
  Place,
  TripDraft,
} from '@/types';

export const SCHEMA_VERSION = 1;

export interface SavedPlaceRow {
  id: string;
  placeId: string;
  savedAt: string;
}

export interface OfflineArticleRow {
  id: string;
  districtSlug: string;
  payload: string;
  savedAt: string;
}

export interface MetaRow {
  key: string;
  value: unknown;
  updatedAt: string;
}

export class ExploreDb extends Dexie {
  settings!: Table<AppSettings, string>;
  passportDistricts!: Table<PassportEntry, string>;
  passportCountries!: Table<PassportEntry, string>;
  tripDrafts!: Table<TripDraft, string>;
  savedPlaces!: Table<SavedPlaceRow, string>;
  journalEntries!: Table<JournalEntry, string>;
  photos!: Table<PhotoBlob, string>;
  quizProgress!: Table<Record<string, unknown>, string>;
  localScores!: Table<LocalScore, string>;
  offlineArticles!: Table<OfflineArticleRow, string>;
  meta!: Table<MetaRow, string>;

  constructor() {
    super('explorebd');
    this.version(SCHEMA_VERSION).stores({
      settings: 'id',
      passportDistricts: 'id, entityId, status, updatedAt',
      passportCountries: 'id, entityId, status, updatedAt',
      tripDrafts: 'id, updatedAt',
      savedPlaces: 'id, placeId, savedAt',
      journalEntries: 'id, date, districtId, updatedAt',
      photos: 'id, createdAt',
      quizProgress: 'id',
      localScores: 'id, game, createdAt',
      offlineArticles: 'id, districtSlug',
      meta: 'key',
    });
  }
}

export const db = new ExploreDb();

export async function ensureSettings(): Promise<AppSettings> {
  const existing = await db.settings.get('settings');
  if (existing) return existing;
  const fresh: AppSettings = {
    id: 'settings',
    locale: 'bn-BD',
    theme: 'system',
    displayName: '',
    mapThemeId: 'forest',
    showLabels: false,
    labelLanguage: 'en',
    backgroundTexture: true,
    roundTrip: true,
    reducedMotion: false,
    analytics: false,
    updatedAt: new Date().toISOString(),
  };
  await db.settings.put(fresh);
  return fresh;
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const row = await db.meta.get(key);
  return row?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value, updatedAt: new Date().toISOString() });
}

/**
 * Converts the legacy starter's binary `visited: string[]` list into
 * multi-status passport entries. Pure and testable.
 */
export function convertLegacyVisited(raw: unknown, now = new Date().toISOString()): PassportEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: PassportEntry[] = [];
  for (const entityId of raw) {
    if (typeof entityId !== 'string' || !entityId) continue;
    entries.push({
      id: `district:${entityId}`,
      entityType: 'district',
      entityId,
      status: 'visited',
      updatedAt: now,
    });
  }
  return entries;
}

/**
 * Migrates the legacy starter's `localStorage` visit list (binary visited)
 * into the multi-status passport. Runs once.
 */
export async function migrateLegacyVisited(): Promise<number> {
  const already = await getMeta<boolean>('legacyMigrated');
  if (already) return 0;

  let migrated = 0;
  try {
    const raw =
      localStorage.getItem('explorebd.visited') ??
      localStorage.getItem('visited') ??
      localStorage.getItem('visitedDistricts');
    if (raw) {
      const entries = convertLegacyVisited(JSON.parse(raw) as unknown);
      for (const entry of entries) {
        await db.passportDistricts.put(entry);
        migrated += 1;
      }
    }
  } catch {
    // Ignore malformed legacy data.
  }

  await setMeta('legacyMigrated', true);
  return migrated;
}

export async function clearAllLocalData(): Promise<void> {
  await Promise.all([
    db.settings.clear(),
    db.passportDistricts.clear(),
    db.passportCountries.clear(),
    db.tripDrafts.clear(),
    db.savedPlaces.clear(),
    db.journalEntries.clear(),
    db.photos.clear(),
    db.quizProgress.clear(),
    db.localScores.clear(),
    db.offlineArticles.clear(),
    db.meta.clear(),
  ]);
}

export interface ExportBundle {
  exportedAt: string;
  version: number;
  settings: AppSettings | undefined;
  passportDistricts: PassportEntry[];
  passportCountries: PassportEntry[];
  tripDrafts: TripDraft[];
  savedPlaces: SavedPlaceRow[];
  journalEntries: JournalEntry[];
  localScores: LocalScore[];
  savedPlaceDetails: Place[];
}

export async function exportAllLocalData(savedPlaceDetails: Place[] = []): Promise<ExportBundle> {
  return {
    exportedAt: new Date().toISOString(),
    version: SCHEMA_VERSION,
    settings: await db.settings.get('settings'),
    passportDistricts: await db.passportDistricts.toArray(),
    passportCountries: await db.passportCountries.toArray(),
    tripDrafts: await db.tripDrafts.toArray(),
    savedPlaces: await db.savedPlaces.toArray(),
    journalEntries: await db.journalEntries.toArray(),
    localScores: await db.localScores.toArray(),
    savedPlaceDetails,
  };
}
