import { describe, expect, it } from 'vitest';
import { computeStats, type StatusMap } from '@/lib/passport/stats';
import { buildAchievementContext, evaluateAchievements } from '@/lib/passport/achievements';
import { districts, divisions } from '@/data/districts';
import type { PassportEntry } from '@/types';

function entry(entityId: string, status: PassportEntry['status'], extra: Partial<PassportEntry> = {}): PassportEntry {
  return {
    id: `district:${entityId}`,
    entityType: 'district',
    entityId,
    status,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

describe('passport stats', () => {
  it('counts statuses and percentage', () => {
    const statusMap: StatusMap = {
      'bd-dhaka': 'visited',
      'bd-chattogram': 'visited',
      'bd-coxs-bazar': 'favorite',
      'bd-sylhet': 'want_to_go',
    };
    const stats = computeStats(statusMap);
    expect(stats.visitedDistricts).toBe(2);
    expect(stats.favorites).toBe(1);
    expect(stats.wantToGo).toBe(1);
    expect(stats.totalDistricts).toBe(64);
    expect(stats.travelPercent).toBeCloseTo(2 / 64, 5);
  });

  it('computes division progress', () => {
    const allDhaka = districts.filter((d) => d.divisionId === 'bd-div-dhaka');
    const statusMap: StatusMap = {};
    for (const d of allDhaka) statusMap[d.id] = 'visited';
    const stats = computeStats(statusMap);
    const dhaka = stats.divisionProgress.find((p) => p.id === 'bd-div-dhaka');
    expect(dhaka?.complete).toBe(true);
    expect(stats.divisionsComplete).toBe(1);
    expect(divisions).toHaveLength(8);
  });

  it('suggests a next milestone', () => {
    const statusMap: StatusMap = { 'bd-dhaka': 'visited', 'bd-gazipur': 'visited' };
    const stats = computeStats(statusMap);
    expect(stats.nextMilestone).toBeDefined();
    expect(stats.nextMilestone!.remaining).toBeGreaterThan(0);
  });

  it('selects most visited district', () => {
    const entries = [entry('bd-dhaka', 'visited', { visitCount: 5 }), entry('bd-gazipur', 'visited', { visitCount: 2 })];
    const stats = computeStats({ 'bd-dhaka': 'visited', 'bd-gazipur': 'visited' }, entries);
    expect(stats.mostVisitedDistrictId).toBe('bd-dhaka');
  });
});

describe('achievements', () => {
  it('unlocks the first-district badge', () => {
    const entries = [entry('bd-dhaka', 'visited')];
    const states = evaluateAchievements(buildAchievementContext({ 'bd-dhaka': 'visited' }, entries));
    const first = states.find((s) => s.achievement.id === 'firstDistrict');
    expect(first?.unlocked).toBe(true);
  });

  it('locks legend until all districts visited', () => {
    const entries = [entry('bd-dhaka', 'visited')];
    const states = evaluateAchievements(buildAchievementContext({ 'bd-dhaka': 'visited' }, entries));
    const legend = states.find((s) => s.achievement.id === 'legend');
    expect(legend?.unlocked).toBe(false);
  });
});
