import { apiConfig } from '@/config/providers';
import { db } from '@/db/local/db';
import type { LocalScore } from '@/types';
import { leaderboardSubmissionSchema, type LeaderboardSubmission } from '@/lib/validation/schemas';

export interface LeaderboardRow {
  rank: number;
  name: string;
  score: number;
  game: 'quiz' | 'puzzle';
  createdAt: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardRow[] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${apiConfig.baseUrl}/leaderboard`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as { entries?: LeaderboardRow[] };
    return data.entries ?? [];
  } catch {
    return null;
  }
}

export async function submitScore(input: Omit<LeaderboardSubmission, 'turnstileToken'>): Promise<boolean> {
  const parsed = leaderboardSubmissionSchema.safeParse(input);
  if (!parsed.success) return false;
  try {
    const res = await fetch(`${apiConfig.baseUrl}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function saveLocalScore(score: Omit<LocalScore, 'id' | 'createdAt'>): Promise<void> {
  const row: LocalScore = {
    ...score,
    id: `score_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  await db.localScores.put(row);
}

export async function getLocalScores(game?: 'quiz' | 'puzzle'): Promise<LocalScore[]> {
  const all = await db.localScores.toArray();
  const filtered = game ? all.filter((s) => s.game === game) : all;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
