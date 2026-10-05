export type TravelStatus = 'unvisited' | 'want_to_go' | 'visited' | 'favorite' | 'lived_here';

export type EntityType = 'district' | 'upazila' | 'country';

export interface Division {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  slug: string;
  lat: number;
  lng: number;
}

export interface District {
  id: string;
  code: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  divisionId: string;
  divisionNameEn: string;
  divisionNameBn: string;
  lat: number;
  lng: number;
  geoShapeName: string;
  aliases: string[];
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface PassportEntry {
  id: string;
  entityType: EntityType;
  entityId: string;
  status: TravelStatus;
  visitedAt?: string;
  visitCount?: number;
  note?: string;
  updatedAt: string;
}

export type GroupType = 'solo' | 'couple' | 'family' | 'friends';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type HotelTier = 'budget' | 'mid' | 'premium';
export type TransportMode = 'bus' | 'train' | 'car' | 'flight' | 'any';

export interface TripDraft {
  id: string;
  title: string;
  startDistrictId: string;
  destinationDistrictIds: string[];
  placeIds: string[];
  startDate?: string;
  endDate?: string;
  days?: number;
  travelerCount: number;
  groupType: GroupType;
  children: boolean;
  budgetBdt?: number;
  pace: Pace;
  hotelTier: HotelTier;
  transportPreferences: TransportMode[];
  interests: string[];
  roundTrip: boolean;
  updatedAt: string;
}

export type PlaceCategory =
  | 'beach'
  | 'hill'
  | 'nature'
  | 'heritage'
  | 'religious'
  | 'wildlife'
  | 'city'
  | 'food'
  | 'adventure'
  | 'waterfall'
  | 'lake'
  | 'island';

export interface PlaceMedia {
  url: string;
  altEn: string;
  altBn: string;
  author?: string;
  sourceUrl?: string;
  license?: string;
  licenseUrl?: string;
}

export interface Place {
  id: string;
  slug: string;
  districtId: string;
  nameEn: string;
  nameBn: string;
  shortDescriptionEn: string;
  shortDescriptionBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  lat: number;
  lng: number;
  categories: PlaceCategory[];
  interests: string[];
  bestMonths: number[];
  typicalDurationMinutes?: number;
  cost?: {
    minBdt?: number;
    maxBdt?: number;
    basis?: 'person' | 'group' | 'entry' | 'day';
  };
  transportNotesEn?: string;
  transportNotesBn?: string;
  openingHoursTextEn?: string;
  openingHoursTextBn?: string;
  accessibilityNotesEn?: string;
  accessibilityNotesBn?: string;
  safetyNotesEn?: string;
  safetyNotesBn?: string;
  nearbyPlaceIds: string[];
  familyFriendly?: boolean;
  hidden?: boolean;
  media: PlaceMedia[];
  sourceName?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  confidence?: 'high' | 'medium' | 'low';
  published: boolean;
}

export type FamousType = 'food' | 'product' | 'nature' | 'heritage' | 'culture';

export interface FamousEntry {
  id: string;
  districtId: string;
  type: FamousType;
  nameEn: string;
  nameBn: string;
  noteEn?: string;
  noteBn?: string;
  placeId?: string;
}

export interface QuizOption {
  id: string;
  labelBn: string;
  labelEn: string;
}

export interface QuizQuestion {
  id: string;
  version: number;
  localeData: {
    bn: { prompt: string; explanation: string };
    en: { prompt: string; explanation: string };
  };
  answerIds: string[];
  options: QuizOption[];
  category: 'districts' | 'landmarks' | 'foods' | 'rivers' | 'history' | 'map';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface JournalEntry {
  id: string;
  districtId?: string;
  placeId?: string;
  date: string;
  caption: string;
  note?: string;
  rating?: number;
  companions?: string;
  favoriteMoment?: string;
  photoBlobIds: string[];
  visibility: 'private' | 'link' | 'public';
  updatedAt: string;
}

export interface PhotoBlob {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  createdAt: string;
}

export interface LocalScore {
  id: string;
  game: 'quiz' | 'puzzle';
  score: number;
  total?: number;
  timeMs?: number;
  accuracy?: number;
  difficulty?: string;
  createdAt: string;
}

export interface AppSettings {
  id: 'settings';
  locale: 'bn-BD' | 'en-BD';
  theme: 'light' | 'dark' | 'system';
  displayName: string;
  mapThemeId: string;
  showLabels: boolean;
  labelLanguage: 'en' | 'bn' | 'both';
  backgroundTexture: boolean;
  roundTrip: boolean;
  reducedMotion: boolean;
  analytics: boolean;
  updatedAt: string;
}

export interface CountryEntry {
  id: string;
  nameEn: string;
  nameBn: string;
  continent: string;
  iso2: string;
  lat: number;
  lng: number;
}
