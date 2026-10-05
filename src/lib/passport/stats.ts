import { districts, divisions } from '@/data/districts';
import type { PassportEntry, TravelStatus } from '@/types';

export type StatusMap = Record<string, TravelStatus>;

export function entriesToStatusMap(entries: PassportEntry[]): StatusMap {
  const map: StatusMap = {};
  for (const e of entries) map[e.entityId] = e.status;
  return map;
}

export interface DivisionProgress {
  id: string;
  nameEn: string;
  nameBn: string;
  visited: number;
  total: number;
  percent: number;
  complete: boolean;
}

export interface NextMilestone {
  type: 'division' | 'allDivisions' | 'total';
  divisionId?: string;
  nameEn: string;
  nameBn: string;
  remaining: number;
  messageKey: string;
  params: Record<string, string | number>;
}

export interface PassportStats {
  visitedDistricts: number;
  wantToGo: number;
  favorites: number;
  livedHere: number;
  totalDistricts: number;
  travelPercent: number;
  divisionsComplete: number;
  divisionProgress: DivisionProgress[];
  favoriteDistrictIds: string[];
  mostVisitedDistrictId?: string;
  nextMilestone?: NextMilestone;
}

const countStatus = (statusMap: StatusMap, status: TravelStatus): number =>
  Object.values(statusMap).filter((s) => s === status).length;

export function computeStats(statusMap: StatusMap, entries: PassportEntry[] = []): PassportStats {
  const visitedDistricts = countStatus(statusMap, 'visited');
  const favorites = countStatus(statusMap, 'favorite');
  const livedHere = countStatus(statusMap, 'lived_here');
  const wantToGo = countStatus(statusMap, 'want_to_go');
  const totalDistricts = districts.length;

  const divisionProgress: DivisionProgress[] = divisions.map((division) => {
    const members = districts.filter((d) => d.divisionId === division.id);
    const visited = members.filter((d) => statusMap[d.id] === 'visited').length;
    return {
      id: division.id,
      nameEn: division.nameEn,
      nameBn: division.nameBn,
      visited,
      total: members.length,
      percent: members.length ? visited / members.length : 0,
      complete: members.length > 0 && visited === members.length,
    };
  });

  const divisionsComplete = divisionProgress.filter((d) => d.complete).length;

  const favoriteDistrictIds = entries.filter((e) => e.status === 'favorite').map((e) => e.entityId);

  const counts = new Map<string, number>();
  for (const e of entries) {
    if (e.visitCount && e.visitCount > 1) counts.set(e.entityId, e.visitCount);
  }
  let mostVisitedDistrictId: string | undefined;
  let maxCount = 1;
  for (const [id, value] of counts) {
    if (value > maxCount) {
      maxCount = value;
      mostVisitedDistrictId = id;
    }
  }

  return {
    visitedDistricts,
    wantToGo,
    favorites,
    livedHere,
    totalDistricts,
    travelPercent: totalDistricts ? visitedDistricts / totalDistricts : 0,
    divisionsComplete,
    divisionProgress,
    favoriteDistrictIds,
    mostVisitedDistrictId,
    nextMilestone: computeNextMilestone(statusMap, divisionProgress),
  };
}

export function computeNextMilestone(
  statusMap: StatusMap,
  divisionProgress: DivisionProgress[],
): NextMilestone | undefined {
  const almostDone = divisionProgress
    .filter((d) => !d.complete && d.visited > 0)
    .sort((a, b) => b.percent - a.percent)[0];
  if (almostDone) {
    const remaining = almostDone.total - almostDone.visited;
    return {
      type: 'division',
      divisionId: almostDone.id,
      nameEn: almostDone.nameEn,
      nameBn: almostDone.nameBn,
      remaining,
      messageKey: 'passport.milestone',
      params: { count: remaining, name: almostDone.nameEn },
    };
  }

  const untouched = divisionProgress
    .filter((d) => d.visited === 0)
    .sort((a, b) => a.total - b.total)[0];
  if (untouched) {
    return {
      type: 'total',
      divisionId: untouched.id,
      nameEn: untouched.nameEn,
      nameBn: untouched.nameBn,
      remaining: untouched.total,
      messageKey: 'passport.milestone',
      params: { count: untouched.total, name: untouched.nameEn },
    };
  }

  const remaining = districts.length - Object.values(statusMap).filter((s) => s === 'visited').length;
  if (remaining > 0) {
    return {
      type: 'total',
      nameEn: 'Bangladesh',
      nameBn: 'বাংলাদেশ',
      remaining,
      messageKey: 'passport.milestone',
      params: { count: remaining, name: 'Bangladesh' },
    };
  }
  return undefined;
}

/** Marks a district as needing no status (cleared). */
export function clearStatus(statusMap: StatusMap, districtId: string): StatusMap {
  const next = { ...statusMap };
  delete next[districtId];
  return next;
}
