import { useMemo } from 'react';
import { usePassportStore } from '@/store/passportStore';
import type { StatusMap } from '@/lib/passport/stats';
import type { PassportEntry, TravelStatus } from '@/types';

export function useStatusMap(): StatusMap {
  const entries = usePassportStore((s) => s.entries);
  return useMemo(() => {
    const map: StatusMap = {};
    for (const e of entries) map[e.entityId] = e.status;
    return map;
  }, [entries]);
}

export function usePassportEntries(): PassportEntry[] {
  return usePassportStore((s) => s.entries);
}

export function useDistrictStatus(districtId: string): TravelStatus {
  return usePassportStore((s) => s.entries.find((e) => e.entityId === districtId)?.status ?? 'unvisited');
}
