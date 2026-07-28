import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game20SpeedTap({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pos, setPos] = useState(null);

  const ds = { 1: { time: 20, dotSize: 70, mult: 1 }, 2: { time: 25, dotSize: 56, mult: 1.5 }, 3: { time: 30, dotSize: 46, mult: 2 }, 4: { time: 35, dotSize: 38, mult: 3 } };
  const s = ds[difficulty];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); setTimeLeft(s.time); spawn(); }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && timeLeft > 0) { const tm = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'playing' && timeLeft === 0) { endGame(); }
  }, [timeLeft, gameState, paused]);

  const spawn = () => setPos({ x: 8 + Math.random() * 84, y: 8 + Math.random() * 68 });

  const handleTap = () => {
    if (gameState !== 'playing' || paused || !pos) return;
    sounds.correctHit();
    setScore(score + Math.round(10 * s.mult));
    setCorrectCount(correctCount + 1);
    spawn();
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = s.time * 1000;
    await saveGameResult({ game_type: 20, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: 0, correct_shapes: correctCount, wrong_shapes: 0, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = s.time * 1000;
    return <ResultsScreen gameTitle={t('speedTap')} gameResult={{ game_type: 20, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: 0, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: 0, totalAttempts: correctCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-lg font-semibold text-pink-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2 items-center"><p className="text-xl font-bold text-slate-700">⏱️ {timeLeft}s</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div onClick={handleTap} className="relative bg-slate-100 rounded-2xl border-2 border-slate-200 cursor-pointer flex items-center justify-center" style={{ height: 360 }}>
          {pos && <motion.div key={correctCount} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute rounded-full bg-pink-500 shadow-lg" style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: s.dotSize, height: s.dotSize }} />}
          {!pos && <p className="text-slate-300">Get ready...</p>}
        </div>
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={20} />
    </div>
  );
}