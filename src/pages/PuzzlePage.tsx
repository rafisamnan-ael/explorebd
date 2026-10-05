import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Trophy, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { districts } from '@/data/districts';
import { getMapTheme } from '@/lib/map/themes';
import { saveLocalScore, submitScore } from '@/lib/games/leaderboard';
import { useUiStore } from '@/store/uiStore';
import { BangladeshMap } from '@/components/maps/BangladeshMap';
import { PageHero } from '@/components/common/Chrome';
import { Segmented } from '@/components/ui/Segmented';
import type { TravelStatus } from '@/types';

type Difficulty = 'easy' | 'medium' | 'hard';
type GameState = 'menu' | 'playing' | 'done';

const ROUND_SIZE = 8;

function shuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export default function PuzzlePage() {
  const { t, shortLocale } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const theme = getMapTheme('forest');

  const [state, setState] = useState<GameState>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [targets, setTargets] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [name, setName] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number>(0);
  const [listOpen, setListOpen] = useState(false);

  const currentTargetId = targets[currentIndex];

  useEffect(() => {
    if (state !== 'playing') return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [state]);

  const statusMap = useMemo(() => {
    const map: Record<string, TravelStatus> = {};
    for (const id of found) map[id] = 'visited';
    return map;
  }, [found]);

  const start = () => {
    const picked = shuffle(districts, Date.now()).slice(0, ROUND_SIZE).map((d) => d.id);
    setTargets(picked);
    setCurrentIndex(0);
    setFound(new Set());
    setMistakes(0);
    setFeedback('none');
    setElapsed(0);
    startedAt.current = Date.now();
    setState('playing');
  };

  const finish = () => {
    const score = Math.max(0, ROUND_SIZE - mistakes);
    void saveLocalScore({ game: 'puzzle', score, total: ROUND_SIZE, timeMs: elapsed * 1000, difficulty });
    setState('done');
  };

  const handleGuess = (districtId: string) => {
    if (state !== 'playing' || !currentTargetId) return;
    if (districtId === currentTargetId) {
      const nextFound = new Set(found).add(districtId);
      setFound(nextFound);
      setFeedback('correct');
      window.setTimeout(() => {
        setFeedback('none');
        if (currentIndex + 1 >= targets.length) {
          finish();
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 650);
    } else {
      setMistakes((m) => m + 1);
      setFeedback('wrong');
      window.setTimeout(() => setFeedback('none'), 500);
    }
  };

  const targetDistrict = districts.find((d) => d.id === currentTargetId);

  const submit = async () => {
    const score = Math.max(0, ROUND_SIZE - mistakes);
    const ok = await submitScore({ game: 'puzzle', name: name || 'Guest', score, total: ROUND_SIZE, timeMs: elapsed * 1000, difficulty, gameVersion: 1 });
    toast(ok ? t('games.scoreSubmitted') : t('games.leaderboardOffline'), ok ? 'success' : 'default');
  };

  return (
    <div className="container page">
      <PageHero eyebrow={t('nav.games')} title={t('games.puzzleTitle')} />

      {state === 'menu' ? (
        <div className="card card-pad stack" style={{ gap: 16, maxWidth: 460 }}>
          <span className="field-label">{t('games.chooseDifficulty')}</span>
          <Segmented
            ariaLabel={t('games.chooseDifficulty')}
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'easy', label: t('games.difficultyEasy') },
              { value: 'medium', label: t('games.difficultyMedium') },
              { value: 'hard', label: t('games.difficultyHard') },
            ]}
          />
          <button type="button" className="btn btn-primary" onClick={start}>
            {t('games.startPuzzle')}
          </button>
        </div>
      ) : null}

      {state === 'playing' ? (
        <div className="puzzle-layout">
          <div className="cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="eyebrow">{t('games.findDistrictHint')}</span>
              <h2 style={{ fontSize: '1.4rem' }}>
                {t('games.findDistrict', { name: targetDistrict ? (shortLocale === 'bn' ? targetDistrict.nameBn : targetDistrict.nameEn) : '' })}
              </h2>
            </div>
            <div className="cluster" style={{ gap: 14 }}>
              <span className="badge badge-primary">{t('games.score')}: {found.size}</span>
              <span className="badge">{t('games.mistakes')}: {mistakes}</span>
              <span className="badge">{t('games.time')}: {elapsed}s</span>
            </div>
          </div>

          {feedback !== 'none' ? (
            <div className={`badge ${feedback === 'correct' ? 'badge-primary' : 'badge-sunset'}`}>
              {feedback === 'correct' ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
              {feedback === 'correct' ? t('games.correct') : t('games.wrong')}
            </div>
          ) : null}

          <div className="puzzle-map">
            <BangladeshMap
              statusMap={statusMap}
              theme={theme}
              showLabels={difficulty === 'easy'}
              labelLanguage={shortLocale === 'bn' ? 'bn' : 'en'}
              onDistrictClick={(districtId) => handleGuess(districtId)}
              ariaLabel={t('games.puzzleTitle')}
            />
          </div>

          <div className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setListOpen((v) => !v)}>
              {t('a11y.mapInteractiveHint')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState('menu')}>
              <RotateCcw size={15} aria-hidden /> {t('common.back')}
            </button>
          </div>

          {listOpen ? (
            <div className="pill-row" style={{ maxHeight: 200, overflow: 'auto' }}>
              {districts.map((d) => (
                <button key={d.id} type="button" className="chip" onClick={() => handleGuess(d.id)}>
                  {shortLocale === 'bn' ? d.nameBn : d.nameEn}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {state === 'done' ? (
        <div className="card card-pad stack" style={{ gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={30} aria-hidden style={{ color: 'var(--gold)' }} />
          <h2>{t('games.puzzleComplete')}</h2>
          <div className="cluster" style={{ gap: 20 }}>
            <span className="badge badge-primary">{t('games.score')}: {Math.max(0, ROUND_SIZE - mistakes)}/{ROUND_SIZE}</span>
            <span className="badge">{t('games.mistakes')}: {mistakes}</span>
            <span className="badge">{t('games.time')}: {elapsed}s</span>
          </div>
          <div className="field" style={{ width: '100%', maxWidth: 320, textAlign: 'left' }}>
            <label className="field-label" htmlFor="puzzle-name">{t('games.yourName')}</label>
            <input id="puzzle-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={() => void submit()}>{t('games.submitScore')}</button>
            <button type="button" className="btn btn-secondary" onClick={start}>{t('games.playAgain')}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
