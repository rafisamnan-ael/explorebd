import { useMemo, useState } from 'react';
import { Check, RotateCcw, Trophy, X } from 'lucide-react';
import { useI18n } from '@/i18n';
import { dailyChallengeQuestions, quickTen, questionsForCategory, quizQuestions, QUIZ_VERSION } from '@/data/quiz';
import { saveLocalScore, submitScore } from '@/lib/games/leaderboard';
import { useUiStore } from '@/store/uiStore';
import { PageHero } from '@/components/common/Chrome';
import { EmptyState } from '@/components/ui/EmptyState';
import type { QuizQuestion } from '@/types';

type Mode = 'menu' | 'playing' | 'done';

export default function QuizPage() {
  const { t, shortLocale } = useI18n();
  const toast = useUiStore((s) => s.toast);
  const [mode, setMode] = useState<Mode>('menu');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [name, setName] = useState('');

  const current = questions[index];
  const isAnswered = selected !== null;
  const isCorrect = current ? current.answerIds.includes(selected ?? '') : false;

  const start = (set: QuizQuestion[]) => {
    setQuestions(set);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setMode('playing');
  };

  const answer = (optionId: string) => {
    if (isAnswered) return;
    setSelected(optionId);
    if (current?.answerIds.includes(optionId)) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      const finalScore = score;
      void saveLocalScore({ game: 'quiz', score: finalScore, total: questions.length, difficulty: 'mixed' });
      setMode('done');
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const submit = async () => {
    const ok = await submitScore({ game: 'quiz', name: name || 'Guest', score, total: questions.length, gameVersion: QUIZ_VERSION, difficulty: 'medium' });
    toast(ok ? t('games.scoreSubmitted') : t('games.leaderboardOffline'), ok ? 'success' : 'default');
  };

  const menu = useMemo(
    () => [
      { key: 'quickTen', labelKey: 'games.quickTen', run: () => start(quickTen()) },
      { key: 'daily', labelKey: 'games.dailyChallenge', run: () => start(dailyChallengeQuestions()) },
      { key: 'category', labelKey: 'games.categoryQuiz', run: () => start(questionsForCategory('landmarks')) },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="container page page-narrow">
      <PageHero eyebrow={t('nav.games')} title={t('games.quizTitle')} />

      {mode === 'menu' ? (
        <div className="stack" style={{ gap: 12 }}>
          {menu.map((item) => (
            <button key={item.key} type="button" className="game-card card-hover" style={{ textAlign: 'left' }} onClick={item.run}>
              <strong>{t(item.labelKey)}</strong>
              <span className="muted">{t('games.questionOf', { current: 1, total: quizQuestions.length })}</span>
            </button>
          ))}
        </div>
      ) : null}

      {mode === 'playing' && current ? (
        <div className="stack" style={{ gap: 20 }}>
          <div className="cluster" style={{ justifyContent: 'space-between' }}>
            <span className="muted">{t('games.questionOf', { current: index + 1, total: questions.length })}</span>
            <span className="badge badge-primary">{t('games.score')}: {score}</span>
          </div>
          <div className="quiz-progress"><span style={{ width: `${((index + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }} /></div>

          <h2 style={{ fontSize: '1.3rem' }}>{shortLocale === 'bn' ? current.localeData.bn.prompt : current.localeData.en.prompt}</h2>

          <div className="stack" style={{ gap: 10 }}>
            {current.options.map((option) => {
              const correct = current.answerIds.includes(option.id);
              const state = !isAnswered ? 'idle' : correct ? 'correct' : option.id === selected ? 'wrong' : 'idle';
              return (
                <button
                  key={option.id}
                  type="button"
                  className="quiz-option"
                  data-state={state}
                  disabled={isAnswered}
                  onClick={() => answer(option.id)}
                >
                  {isAnswered && correct ? <Check size={18} aria-hidden /> : isAnswered && option.id === selected ? <X size={18} aria-hidden /> : null}
                  {shortLocale === 'bn' ? option.labelBn : option.labelEn}
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
              <strong>{isCorrect ? t('games.correct') : t('games.wrong')}</strong>
              <p className="muted" style={{ marginTop: 6 }}>
                <span className="eyebrow">{t('games.explanation')}</span>{' '}
                {shortLocale === 'bn' ? current.localeData.bn.explanation : current.localeData.en.explanation}
              </p>
              <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={next}>
                {index + 1 >= questions.length ? t('games.seeResults') : t('games.nextQuestion')}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {mode === 'done' ? (
        <div className="card card-pad stack" style={{ gap: 16, alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={30} aria-hidden style={{ color: 'var(--gold)' }} />
          <h2>{t('games.yourScore', { score, total: questions.length })}</h2>
          <div className="field" style={{ width: '100%', maxWidth: 320, textAlign: 'left' }}>
            <label className="field-label" htmlFor="quiz-name">{t('games.yourName')}</label>
            <input id="quiz-name" className="input" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="cluster" style={{ gap: 10 }}>
            <button type="button" className="btn btn-primary" onClick={() => void submit()}>{t('games.submitScore')}</button>
            <button type="button" className="btn btn-secondary" onClick={() => setMode('menu')}>
              <RotateCcw size={16} aria-hidden /> {t('games.playAgain')}
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'menu' && !quizQuestions.length ? <EmptyState title={t('common.empty')} /> : null}
    </div>
  );
}
