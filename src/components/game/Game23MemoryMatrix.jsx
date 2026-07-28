import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game23MemoryMatrix({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [phase, setPhase] = useState('show');
  const [pattern, setPattern] = useState([]);
  const [activeIdx, setActiveIdx] = useState(null);
  const [tapped, setTapped] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const startTimeRef = useRef(0);
  const timersRef = useRef([]);

  const ds = { 1: { gridSize: 3, patternLen: 3, rounds: 8, flashTime: 600, mult: 1 }, 2: { gridSize: 4, patternLen: 4, rounds: 10, flashTime: 550, mult: 1.5 }, 3: { gridSize: 4, patternLen: 5, rounds: 12, flashTime: 500, mult: 2 }, 4: { gridSize: 5, patternLen: 6, rounds: 15, flashTime: 450, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;
  const total = s.gridSize * s.gridSize;

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); startTimeRef.current = Date.now(); generateRound(); }
  }, [countdown, gameState]);

  useEffect(() => () => clearTimers(), []);

  const generateRound = () => {
    clearTimers();
    const indices = [];
    while (indices.length < s.patternLen) { const idx = Math.floor(Math.random() * total); if (!indices.includes(idx)) indices.push(idx); }
    setPattern(indices);
    setRemaining(indices);
    setTapped([]);
    setActiveIdx(null);
    setPhase('show');
    indices.forEach((idx, i) => {
      timersRef.current.push(setTimeout(() => { setActiveIdx(idx); sounds.buttonPress(); }, i * s.flashTime));
      timersRef.current.push(setTimeout(() => setActiveIdx(null), i * s.flashTime + s.flashTime * 0.6));
    });
    timersRef.current.push(setTimeout(() => { setPhase('input'); }, indices.length * s.flashTime + 200));
  };

  const handleCellClick = (idx) => {
    if (gameState !== 'playing' || phase !== 'input' || paused) return;
    if (remaining.includes(idx)) {
      sounds.correctHit();
      setTapped([...tapped, idx]);
      const nr = remaining.filter(r => r !== idx);
      setRemaining(nr);
      if (nr.length === 0) {
        setScore(score + Math.round(100 * s.mult));
        setCorrectCount(correctCount + 1);
        if (round < totalRounds) { setRound(round + 1); setTimeout(generateRound, 500); } else endGame();
      }
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
  };

  const endGame = async () => {
    clearTimers();
    sounds.gameEnd();
    const totalTime = Date.now() - startTimeRef.current;
    await saveGameResult({ game_type: 23, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Date.now() - startTimeRef.current;
    return <ResultsScreen gameTitle={t('memoryMatrix')} gameResult={{ game_type: 23, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-indigo-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2"><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div className="mb-6 text-center"><p className="text-lg font-semibold text-slate-700">{phase === 'show' ? '💡 Memorize the cells...' : `Repeat the pattern!`}</p></div>
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${s.gridSize}, 1fr)` }}>
          {Array.from({ length: total }).map((_, i) => {
            const isLit = activeIdx === i;
            const isTapped = tapped.includes(i);
            return <button key={i} onClick={() => handleCellClick(i)} className={`aspect-square rounded-2xl border-4 transition-all ${isLit ? 'border-indigo-500 scale-105' : 'border-slate-200'} ${isTapped ? 'bg-indigo-400' : isLit ? 'bg-indigo-500' : 'bg-slate-100'}`} />;
          })}
        </div>
        <div className="flex justify-around text-center"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={23} />
    </div>
  );
}