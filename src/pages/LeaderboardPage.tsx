import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useI18n } from '@/i18n';
import { fetchLeaderboard, getLocalScores, type LeaderboardRow } from '@/lib/games/leaderboard';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { LocalScore } from '@/types';

export default function LeaderboardPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [local, setLocal] = useState<LocalScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [server, localScores] = await Promise.all([fetchLeaderboard(), getLocalScores()]);
      if (!active) return;
      setRows(server);
      setLocal(localScores.slice(0, 10));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container page page-narrow">
      <PageHero eyebrow={t('nav.leaderboard')} title={t('games.leaderboardTitle')} body={t('games.leaderboardSubtitle')} />

      {loading ? <div className="skeleton" style={{ height: 220 }} /> : null}

      {!loading && rows === null ? (
        <div className="stack" style={{ gap: 16 }}>
          <div className="card card-pad"><p className="muted">{t('games.leaderboardOffline')}</p></div>
          <h2 className="section-title" style={{ fontSize: '1.15rem' }}>{t('games.localScores')}</h2>
          {local.length ? (
            <div className="card" style={{ overflow: 'hidden' }}>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>{t('games.rank')}</th>
                    <th>{t('games.score')}</th>
                    <th>{t('games.time')}</th>
                    <th>{t('common.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {local.map((score, index) => (
                    <tr key={score.id}>
                      <td className={index === 0 ? 'rank-medal' : ''}>{index + 1}</td>
                      <td>{score.score}{score.total ? `/${score.total}` : ''}</td>
                      <td>{score.timeMs ? `${Math.round(score.timeMs / 1000)}s` : '—'}</td>
                      <td>{new Date(score.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<Trophy size={22} aria-hidden />} title={t('games.noLocalScores')} />
          )}
        </div>
      ) : null}

      {!loading && rows !== null ? (
        rows.length ? (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>{t('games.rank')}</th>
                  <th>{t('games.player')}</th>
                  <th>{t('games.score')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.rank}-${row.name}`}>
                    <td className={row.rank <= 3 ? 'rank-medal' : ''}>{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<Trophy size={22} aria-hidden />} title={t('games.noScores')} />
        )
      ) : null}
    </div>
  );
}
