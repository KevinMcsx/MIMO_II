import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const SHAPES = ['circle', 'square', 'triangle', 'star'];
const COLORS = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444', '#A855F7'];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const ShapeIcon = ({ shape, color, size = 48 }) => {
  let el;
  if (shape === 'circle') {
    el = <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />;
  } else if (shape === 'square') {
    el = <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 6 }} />;
  } else if (shape === 'triangle') {
    el = (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }}
      />
    );
  } else {
    el = <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>;
  }
  return <div className="flex items-center justify-center" style={{ width: size, height: size }}>{el}</div>;
};

const difficultySettings = {
  1: { shapeCount: 3, useColor: false, colorCount: 1, seqLen: 7, optionCount: 4, rounds: 10, time: 0, scoreMult: 1, label: 'shapes only' },
  2: { shapeCount: 3, useColor: true, colorCount: 3, seqLen: 7, optionCount: 4, rounds: 12, time: 0, scoreMult: 1.5, label: 'shapes + colors' },
  3: { shapeCount: 4, useColor: true, colorCount: 4, seqLen: 9, optionCount: 6, rounds: 15, time: 120, scoreMult: 2, label: 'longer patterns' },
  4: { shapeCount: 4, useColor: true, colorCount: 4, seqLen: 11, optionCount: 6, rounds: 20, time: 75, scoreMult: 3, label: 'expert speed' },
};

export default function Game9PatternPrediction({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;

  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const [sequence, setSequence] = useState([]);
  const [answerItem, setAnswerItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  const generateRound = useCallback(() => {
    const shapePool = shuffle(SHAPES).slice(0, settings.shapeCount);
    const colorPool = settings.useColor ? shuffle(COLORS).slice(0, settings.colorCount) : [COLORS[0]];
    const colorOffset = settings.useColor ? 1 + Math.floor(Math.random() * (colorPool.length - 1)) : 0;

    const itemAt = (i) => ({
      shape: shapePool[i % shapePool.length],
      color: colorPool[(i + colorOffset) % colorPool.length],
    });

    const visibleLen = settings.seqLen - 1;
    const seq = [];
    for (let i = 0; i < visibleLen; i++) seq.push(itemAt(i));
    const answer = itemAt(visibleLen);

    const opts = [answer];
    const allCombos = [];
    for (const sh of shapePool) for (const c of colorPool) allCombos.push({ shape: sh, color: c });
    const distractors = shuffle(allCombos.filter((c) => !(c.shape === answer.shape && c.color === answer.color)));
    while (opts.length < settings.optionCount && distractors.length) opts.push(distractors.pop());

    setSequence(seq);
    setAnswerItem(answer);
    setOptions(shuffle(opts));
    setSelectedIndex(null);
    setFeedback(null);
    setRoundStartTime(Date.now());
  }, [settings]);

  // Countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tmr = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tmr);
    }
    if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      generateRound();
    }
  }, [countdown, gameState, generateRound]);

  // Timer (only when timed)
  useEffect(() => {
    if (gameState !== 'playing' || paused || settings.time === 0) return;
    if (timeLeft > 0) {
      const tmr = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(tmr);
    }
    endGame();
  }, [timeLeft, gameState, paused, settings.time]);

  const advance = () => {
    if (round < totalRounds) {
      setRound(round + 1);
      generateRound();
    } else {
      endGame();
    }
  };

  const handleAnswer = (index) => {
    if (gameState !== 'playing' || paused || selectedIndex !== null) return;
    const rt = Date.now() - roundStartTime;
    setReactionTimes((prev) => [...prev, rt]);
    setSelectedIndex(index);

    const chosen = options[index];
    const isCorrect = chosen.shape === answerItem.shape && chosen.color === answerItem.color;

    if (isCorrect) {
      sounds.correctHit();
      const points = Math.round(100 * settings.scoreMult);
      setScore(score + points);
      setCorrectCount((c) => c + 1);
      setFeedback('correct');
    } else {
      sounds.wrongHit();
      setWrongCount((w) => w + 1);
      setScore(Math.max(0, score - 20));
      setFeedback('wrong');
    }

    setTimeout(advance, 750);
  };

  // Keyboard: keys 1..optionCount
  useEffect(() => {
    if (gameState !== 'playing' || paused) return;
    const handler = (e) => {
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        handleAnswer(num - 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, paused, options, handleAnswer]);

  const endGame = async () => {
    if (gameState === 'finished') return;
    sounds.gameEnd();
    setGameState('finished');

    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;
    const totalTime = settings.time > 0 ? (settings.time - timeLeft) * 1000 : reactionTimes.reduce((a, b) => a + b, 0);

    await saveGameResult({
      game_type: 9,
      difficulty,
      total_time: totalTime,
      avg_reaction_time: avgReactionTime,
      correct_hits: correctCount,
      wrong_hits: wrongCount,
      correct_shapes: correctCount,
      wrong_shapes: wrongCount,
      score,
      player_name: playerName,
    });
  };

  const togglePause = () => {
    setPaused(!paused);
    sounds.buttonPress();
  };

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;
    const totalTime = settings.time > 0 ? (settings.time - timeLeft) * 1000 : reactionTimes.reduce((a, b) => a + b, 0);
    const totalAttempts = correctCount + wrongCount;

    return (
      <ResultsScreen
        gameTitle={t('patternPrediction')}
        gameResult={{
          game_type: 9,
          difficulty,
          score,
          avg_reaction_time: avgReactionTime,
          correct_hits: correctCount,
          wrong_hits: wrongCount,
          correct_shapes: correctCount,
          wrong_shapes: wrongCount,
          total_time: totalTime,
        }}
        stats={{
          totalTime,
          avgReactionTime,
          correctHits: correctCount,
          wrongHits: wrongCount,
          totalAttempts,
        }}
        onPlayAgain={() => window.location.reload()}
        onMainMenu={onMainMenu}
        playerName={playerName}
      />
    );
  }

  const optionSize = settings.optionCount > 4 ? 44 : 52;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-slate-800">
              {t('round')} {round}/{totalRounds}
            </p>
            <p className="text-base sm:text-lg font-semibold text-pink-600">
              {t('score')}: {score}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {settings.time > 0 && (
              <p className="text-lg sm:text-xl font-bold text-slate-700">
                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            )}
            <Button onClick={togglePause} size="icon" variant="ghost">
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl z-40"
            >
              <div className="text-9xl font-black text-white drop-shadow-lg">{countdown}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused */}
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePause}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"
            >
              <div className="text-center">
                <Play className="w-24 h-24 text-white mx-auto mb-4" />
                <p className="text-3xl font-bold text-white">PAUSED</p>
                <p className="text-lg text-white/80 mt-2">Click to resume</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="mb-4 text-center">
          <p className="text-base sm:text-lg font-semibold text-slate-700">
            🔮 {t('predictNext')}
          </p>
        </div>

        {/* Sequence */}
        {gameState === 'playing' && (
          <>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 min-h-[64px]">
              {sequence.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-slate-100 rounded-xl border-2 border-slate-200 p-1.5"
                >
                  <ShapeIcon shape={item.shape} color={item.color} size={44} />
                </motion.div>
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: sequence.length * 0.06 }}
                className="bg-pink-100 rounded-xl border-2 border-dashed border-pink-400 p-1.5 flex items-center justify-center"
                style={{ width: 56, height: 56 }}
              >
                <span className="text-3xl font-black text-pink-500">?</span>
              </motion.div>
            </div>

            {/* Options */}
            <div className={`grid gap-3 mb-6 ${settings.optionCount > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {options.map((opt, i) => {
                const isCorrect = opt.shape === answerItem.shape && opt.color === answerItem.color;
                const wasSelected = selectedIndex === i;
                let cls = 'bg-slate-100 border-slate-300 hover:border-pink-500 hover:shadow-lg';
                if (feedback) {
                  if (isCorrect) cls = 'bg-green-100 border-green-500 shadow-lg';
                  else if (wasSelected) cls = 'bg-red-100 border-red-500';
                  else cls = 'bg-slate-50 border-slate-200 opacity-60';
                }
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: feedback ? 1 : 1.05 }}
                    whileTap={{ scale: feedback ? 1 : 0.95 }}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedIndex !== null}
                    className={`relative rounded-xl border-4 p-3 transition-all flex flex-col items-center ${cls}`}
                  >
                    <ShapeIcon shape={opt.shape} color={opt.color} size={optionSize} />
                    <span className="absolute top-1 left-1 bg-white/80 text-slate-700 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <div className="h-6 text-center mb-2">
              <AnimatePresence>
                {feedback === 'correct' && (
                  <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-green-600 font-bold">
                    ✓ {t('correct')}!
                  </motion.p>
                )}
                {feedback === 'wrong' && (
                  <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-600 font-bold">
                    ✗ {t('wrong')}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Stats */}
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xl font-bold text-green-600">✓ {correctCount}</p>
            <p className="text-xs text-slate-600">{t('correct')}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">✗ {wrongCount}</p>
            <p className="text-xs text-slate-600">{t('wrong')}</p>
          </div>
        </div>
      </div>

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={9} />
    </div>
  );
}