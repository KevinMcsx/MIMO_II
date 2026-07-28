import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const COLOR_OPTS = [
  { name: 'YELLOW', hex: '#FFD700' },
  { name: 'BLUE', hex: '#00D4FF' },
  { name: 'GREEN', hex: '#00FF85' },
  { name: 'RED', hex: '#FF4444' },
];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Game18StroopColor({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [stimulus, setStimulus] = useState(null);

  const difficultySettings = {
    1: { time: 60, rounds: 20, conflict: 0.3, scoreMultiplier: 1 },
    2: { time: 60, rounds: 25, conflict: 0.6, scoreMultiplier: 1.5 },
    3: { time: 50, rounds: 30, conflict: 1.0, scoreMultiplier: 2 },
    4: { time: 40, rounds: 35, conflict: 1.0, scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tm = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      generateRound();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && timeLeft > 0) {
      const tm = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, paused]);

  const generateRound = () => {
    const word = rand(COLOR_OPTS);
    let ink;
    if (Math.random() < settings.conflict) {
      ink = rand(COLOR_OPTS.filter(c => c.hex !== word.hex));
    } else {
      ink = word;
    }
    setStimulus({ word: word.name, ink: ink.hex });
    setRoundStartTime(Date.now());
  };

  const handleAnswer = (hex) => {
    if (gameState !== 'playing' || paused || !stimulus) return;
    const rt = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, rt]);
    if (hex === stimulus.ink) {
      sounds.correctHit();
      setScore(score + Math.round(100 * settings.scoreMultiplier));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
    if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    await saveGameResult({ game_type: 18, difficulty, total_time: totalTime, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    const totalAttempts = correctCount + wrongCount;
    return <ResultsScreen gameTitle={t('stroopColor')} gameResult={{ game_type: 18, difficulty, score, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: avg, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p>
            <p className="text-lg font-semibold text-slate-600">{t('score')}: {score}</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-xl font-bold text-slate-700">⏱️ {timeLeft}s</p>
            <Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button>
            <Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button>
          </div>
        </div>

        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
              <div className="text-9xl font-black text-white">{countdown}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50">
              <div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 text-center">
          <p className="text-sm text-slate-500 font-semibold uppercase">Pick the INK color</p>
        </div>

        {stimulus && (
          <div className="flex justify-center mb-8">
            <div key={round} className="text-6xl font-black" style={{ color: stimulus.ink }}>{stimulus.word}</div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="grid grid-cols-2 gap-4">
            {COLOR_OPTS.map(c => (
              <Button key={c.hex} onClick={() => handleAnswer(c.hex)} className="h-16 text-lg font-bold text-white" style={{ backgroundColor: c.hex }}>
                {c.name}
              </Button>
            ))}
          </div>
        )}

        <div className="flex justify-around text-center mt-6">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={18} />
    </div>
  );
}