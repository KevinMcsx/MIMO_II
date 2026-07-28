import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game22GoNoGo({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [stimulus, setStimulus] = useState(null);
  const [phase, setPhase] = useState('gap');
  const tappedRef = useRef(false);

  const ds = { 1: { time: 30, showTime: 1100, gap: 400, greenRatio: 0.65, mult: 1 }, 2: { time: 35, showTime: 950, gap: 350, greenRatio: 0.6, mult: 1.5 }, 3: { time: 40, showTime: 800, gap: 300, greenRatio: 0.55, mult: 2 }, 4: { time: 45, showTime: 650, gap: 250, greenRatio: 0.5, mult: 3 } };
  const s = ds[difficulty];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); setTimeLeft(s.time); }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && timeLeft > 0) { const tm = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'playing' && timeLeft === 0) { endGame(); }
  }, [timeLeft, gameState, paused]);

  useEffect(() => {
    if (gameState !== 'playing' || paused) return;
    let evalTimer, nextTimer, active = true;
    const tick = () => {
      if (!active) return;
      const isGreen = Math.random() < s.greenRatio;
      setStimulus(isGreen ? 'green' : 'red');
      setPhase('show');
      tappedRef.current = false;
      evalTimer = setTimeout(() => {
        if (!active) return;
        if (!tappedRef.current) {
          if (isGreen) { sounds.wrongHit(); setWrongCount(w => w + 1); setScore(sc => Math.max(0, sc - 20)); }
          else { sounds.correctHit(); setCorrectCount(c => c + 1); setScore(sc => sc + Math.round(50 * s.mult)); }
        }
        setStimulus(null); setPhase('gap');
        nextTimer = setTimeout(tick, s.gap);
      }, s.showTime);
    };
    tick();
    return () => { active = false; clearTimeout(evalTimer); clearTimeout(nextTimer); };
  }, [gameState, paused]);

  const handleTap = () => {
    if (gameState !== 'playing' || paused || phase !== 'show' || tappedRef.current) return;
    tappedRef.current = true;
    if (stimulus === 'green') { sounds.correctHit(); setCorrectCount(c => c + 1); setScore(sc => sc + Math.round(100 * s.mult)); }
    else { sounds.wrongHit(); setWrongCount(w => w + 1); setScore(sc => Math.max(0, sc - 20)); }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = s.time * 1000;
    await saveGameResult({ game_type: 22, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = s.time * 1000;
    return <ResultsScreen gameTitle={t('goNoGo')} gameResult={{ game_type: 22, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-lg font-semibold text-green-600">{t('score')}: {score}</p><p className="text-sm text-slate-500">🟢 Tap &nbsp; 🔴 Don't</p></div>
          <div className="flex gap-2 items-center"><p className="text-xl font-bold text-slate-700">⏱️ {timeLeft}s</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div onClick={handleTap} className="relative bg-slate-100 rounded-2xl border-2 border-slate-200 cursor-pointer flex items-center justify-center" style={{ height: 360 }}>
          {stimulus && <motion.div key={correctCount + '-' + wrongCount} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-32 h-32 rounded-full shadow-lg" style={{ backgroundColor: stimulus === 'green' ? '#22c55e' : '#ef4444' }} />}
          {!stimulus && <p className="text-slate-300">Wait...</p>}
        </div>
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={22} />
    </div>
  );
}