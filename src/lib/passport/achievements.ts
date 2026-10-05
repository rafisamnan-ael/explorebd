import type { PassportEntry } from '@/types';
import type { StatusMap } from './stats';

export interface Achievement {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  goal: number;
  test: (ctx: AchievementContext) => boolean;
  progress: (ctx: AchievementContext) => number;
}

export interface AchievementContext {
  statusMap: StatusMap;
  entries: PassportEntry[];
  visitedIds: Set<string>;
  updatedThisMonth: Set<string>;
}

const HILL_DISTRICTS = ['bd-rangamati', 'bd-khagrachhari', 'bd-bandarban'];
const COASTAL_DISTRICTS = [
  'bd-coxs-bazar',
  'bd-chattogram',
  'bd-bagerhat',
  'bd-khulna',
  'bd-satkhira',
  'bd-barguna',
  'bd-patuakhali',
  'bd-bhola',
  'bd-pirojpur',
  'bd-jhalokati',
  'bd-noakhali',
  'bd-lakshmipur',
  'bd-feni',
];
const HERITAGE_DISTRICTS = [
  'bd-dhaka',
  'bd-bagerhat',
  'bd-naogaon',
  'bd-rajshahi',
  'bd-bogura',
  'bd-cumilla',
  'bd-mymensingh',
  'bd-sylhet',
];
const PARK_DISTRICTS = [
  'bd-khulna',
  'bd-bagerhat',
  'bd-moulvibazar',
  'bd-gazipur',
  'bd-tangail',
  'bd-habiganj',
  'bd-bandarban',
  'bd-coxs-bazar',
];

function countAmong(visited: Set<string>, ids: string[]): number {
  return ids.filter((id) => visited.has(id)).length;
}

export const achievements: Achievement[] = [
  {
    id: 'firstDistrict',
    nameKey: 'achievements.firstDistrict.name',
    descriptionKey: 'achievements.firstDistrict.description',
    icon: 'map-pin',
    goal: 1,
    test: ({ visitedIds }) => visitedIds.size >= 1,
    progress: ({ visitedIds }) => Math.min(1, visitedIds.size),
  },
  {
    id: 'tenDistricts',
    nameKey: 'achievements.tenDistricts.name',
    descriptionKey: 'achievements.tenDistricts.description',
    icon: 'compass',
    goal: 10,
    test: ({ visitedIds }) => visitedIds.size >= 10,
    progress: ({ visitedIds }) => Math.min(10, visitedIds.size),
  },
  {
    id: 'halfway',
    nameKey: 'achievements.halfway.name',
    descriptionKey: 'achievements.halfway.description',
    icon: 'milestone',
    goal: 32,
    test: ({ visitedIds }) => visitedIds.size >= 32,
    progress: ({ visitedIds }) => Math.min(32, visitedIds.size),
  },
  {
    id: 'legend',
    nameKey: 'achievements.legend.name',
    descriptionKey: 'achievements.legend.description',
    icon: 'trophy',
    goal: 64,
    test: ({ visitedIds }) => visitedIds.size >= 64,
    progress: ({ visitedIds }) => Math.min(64, visitedIds.size),
  },
  {
    id: 'completeDhaka',
    nameKey: 'achievements.completeDhaka.name',
    descriptionKey: 'achievements.completeDhaka.description',
    icon: 'landmark',
    goal: 13,
    test: ({ visitedIds }) => countAmong(visitedIds, dhakaDistrictIds()) >= 13,
    progress: ({ visitedIds }) => Math.min(13, countAmong(visitedIds, dhakaDistrictIds())),
  },
  {
    id: 'completeChattogram',
    nameKey: 'achievements.completeChattogram.name',
    descriptionKey: 'achievements.completeChattogram.description',
    icon: 'mountain',
    goal: 11,
    test: ({ visitedIds }) => countAmong(visitedIds, chattogramDistrictIds()) >= 11,
    progress: ({ visitedIds }) => Math.min(11, countAmong(visitedIds, chattogramDistrictIds())),
  },
  {
    id: 'coastal',
    nameKey: 'achievements.coastal.name',
    descriptionKey: 'achievements.coastal.description',
    icon: 'waves',
    goal: 5,
    test: ({ visitedIds }) => countAmong(visitedIds, COASTAL_DISTRICTS) >= 5,
    progress: ({ visitedIds }) => Math.min(5, countAmong(visitedIds, COASTAL_DISTRICTS)),
  },
  {
    id: 'hill',
    nameKey: 'achievements.hill.name',
    descriptionKey: 'achievements.hill.description',
    icon: 'mountain-snow',
    goal: 3,
    test: ({ visitedIds }) => countAmong(visitedIds, HILL_DISTRICTS) >= 3,
    progress: ({ visitedIds }) => Math.min(3, countAmong(visitedIds, HILL_DISTRICTS)),
  },
  {
    id: 'heritage',
    nameKey: 'achievements.heritage.name',
    descriptionKey: 'achievements.heritage.description',
    icon: 'columns-3',
    goal: 5,
    test: ({ visitedIds }) => countAmong(visitedIds, HERITAGE_DISTRICTS) >= 5,
    progress: ({ visitedIds }) => Math.min(5, countAmong(visitedIds, HERITAGE_DISTRICTS)),
  },
  {
    id: 'fiveParks',
    nameKey: 'achievements.fiveParks.name',
    descriptionKey: 'achievements.fiveParks.description',
    icon: 'trees',
    goal: 5,
    test: ({ visitedIds }) => countAmong(visitedIds, PARK_DISTRICTS) >= 5,
    progress: ({ visitedIds }) => Math.min(5, countAmong(visitedIds, PARK_DISTRICTS)),
  },
  {
    id: 'weekendWarrior',
    nameKey: 'achievements.weekendWarrior.name',
    descriptionKey: 'achievements.weekendWarrior.description',
    icon: 'calendar-check',
    goal: 3,
    test: ({ updatedThisMonth }) => updatedThisMonth.size >= 3,
    progress: ({ updatedThisMonth }) => Math.min(3, updatedThisMonth.size),
  },
];

function dhakaDistrictIds(): string[] {
  return [
    'bd-dhaka',
    'bd-faridpur',
    'bd-gazipur',
    'bd-gopalganj',
    'bd-kishoreganj',
    'bd-madaripur',
    'bd-manikganj',
    'bd-munshiganj',
    'bd-narayanganj',
    'bd-narsingdi',
    'bd-rajbari',
    'bd-shariatpur',
    'bd-tangail',
  ];
}

function chattogramDistrictIds(): string[] {
  return [
    'bd-bandarban',
    'bd-brahmanbaria',
    'bd-chandpur',
    'bd-chattogram',
    'bd-cumilla',
    'bd-coxs-bazar',
    'bd-feni',
    'bd-khagrachhari',
    'bd-lakshmipur',
    'bd-noakhali',
    'bd-rangamati',
  ];
}

export function buildAchievementContext(
  statusMap: StatusMap,
  entries: PassportEntry[],
): AchievementContext {
  const visitedIds = new Set<string>();
  const updatedThisMonth = new Set<string>();
  const now = new Date();
  for (const e of entries) {
    if (e.status === 'visited' || e.status === 'favorite' || e.status === 'lived_here') {
      visitedIds.add(e.entityId);
    }
    const d = new Date(e.updatedAt);
    if (d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()) {
      updatedThisMonth.add(e.entityId);
    }
  }
  for (const [id, status] of Object.entries(statusMap)) {
    if (status === 'visited' || status === 'favorite' || status === 'lived_here') visitedIds.add(id);
  }
  return { statusMap, entries, visitedIds, updatedThisMonth };
}

export interface AchievementState {
  achievement: Achievement;
  unlocked: boolean;
  progress: number;
}

export function evaluateAchievements(ctx: AchievementContext): AchievementState[] {
  return achievements.map((achievement) => ({
    achievement,
    unlocked: achievement.test(ctx),
    progress: achievement.progress(ctx),
  }));
}
