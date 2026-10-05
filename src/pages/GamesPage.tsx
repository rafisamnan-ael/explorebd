import { Link } from 'react-router-dom';
import { Gamepad2, Puzzle, Trophy } from 'lucide-react';
import { useI18n } from '@/i18n';
import { PageHero } from '@/components/common/Chrome';

export default function GamesPage() {
  const { t } = useI18n();
  const games = [
    { to: '/games/quiz', title: t('games.quizTitle'), body: t('games.subtitle'), Icon: Gamepad2 },
    { to: '/games/map-puzzle', title: t('games.puzzleTitle'), body: t('games.findDistrictHint'), Icon: Puzzle },
    { to: '/leaderboard', title: t('games.leaderboardTitle'), body: t('games.leaderboardSubtitle'), Icon: Trophy },
  ];
  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.games')} title={t('games.title')} body={t('games.subtitle')} />
      <div className="card-grid">
        {games.map(({ to, title, body, Icon }) => (
          <Link key={to} to={to} className="game-card card-hover">
            <span className="interest-icon">
              <Icon size={22} aria-hidden />
            </span>
            <h3>{title}</h3>
            <p className="muted" style={{ fontSize: '0.9rem' }}>{body}</p>
            <span className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>{t('games.play')}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
