export const features = {
  worldMap: true,
  upazilaMode: false,
  weather: false,
  accounts: false,
  cloudSync: false,
  publicProfiles: false,
  collaborativeTrips: false,
  expenseSplitter: true,
  travelJournal: true,
  leaderboard: true,
  adminCms: false,
  travelRoulette: true,
  shareCards: true,
} as const;

export type FeatureFlags = typeof features;
