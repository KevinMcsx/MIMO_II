import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game19ReactionTarget({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [dotPos, setDotPos] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  const ds = { 1: { rounds: 10, minDelay: 800, maxDelay: 2500, dotSize: 80, mult: 1 }, 2: { rounds: 12, minDelay: 700, maxDelay: 2200, dotSize: 64, mult: 1.5 }, 3: { rounds: 15, minDelay: 600, maxDelay: 2000, dotSize: 52, mult: 2 }, 4: { rounds: 18, minDelay: 500, maxDelay: 1800, dotSize: 44, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); startRound(); }
  }, [countdown, gameState]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const startRound = () => {
    setWaiting(true); setTooEarly(false); setDotPos(null);
    const delay = s.minDelay + Math.random() * (s.maxDelay - s.minDelay);
    timerRef.current = setTimeout(() => {
      setDotPos({ x: 8 + Math.random() * 84, y: 8 + Math.random() * 68 });
      setWaiting(false); startRef.current = Date.now(); sounds.buttonPress();
    }, delay);
  };

  const handleTap = () => {
    if (gameState !== 'playing' || paused) return;
    if (waiting) {
      if (timerRef.current) clearTimeout(timerRef.current);
      sounds.wrongHit(); setTooEarly(true); setWrongCount(wrongCount + 1); setWaiting(false);
      setTimeout(startRound, 800); return;
    }
    if (dotPos) {
      const rt = Date.now() - startRef.current;
      setReactionTimes([...reactionTimes, rt]);
      sounds.correctHit();
      setScore(score + Math.max(10, Math.round((1000 - rt) / 10) * s.mult));
      setCorrectCount(correctCount + 1);
      if (round < totalRounds) { setRound(round + 1); startRound(); } else endGame();
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    await saveGameResult({ game_type: 19, difficulty, total_time: avg * totalRounds, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    return <ResultsScreen gameTitle={t('reactionTarget')} gameResult={{ game_type: 19, difficulty, score, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, total_time: avg * totalRounds }} stats={{ totalTime: avg * totalRounds, avgReactionTime: avg, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-blue-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2"><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div onClick={handleTap} className="relative bg-slate-100 rounded-2xl border-2 border-slate-200 cursor-pointer flex items-center justify-center" style={{ height: 360 }}>
          {waiting && <p className="text-2xl font-bold text-slate-400">Wait for the dot...</p>}
          {tooEarly && <p className="text-2xl font-bold text-red-500">Too early! Wait...</p>}
          {dotPos && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute rounded-full bg-blue-500 shadow-lg" style={{ left: `${dotPos.x}%`, top: `${dotPos.y}%`, width: s.dotSize, height: s.dotSize }} />}
          {!waiting && !tooEarly && !dotPos && <p className="text-slate-300">Get ready...</p>}
        </div>
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={19} />
    </div>
  );
}