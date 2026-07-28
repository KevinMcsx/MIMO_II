import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game30TapOrder({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [grid, setGrid] = useState([]);
  const [expected, setExpected] = useState(1);
  const [done, setDone] = useState([]);
  const startTimeRef = React.useRef(0);

  const ds = { 1: { count: 9, rounds: 8, mult: 1 }, 2: { count: 12, rounds: 10, mult: 1.5 }, 3: { count: 16, rounds: 12, mult: 2 }, 4: { count: 20, rounds: 14, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); startTimeRef.current = Date.now(); generateRound(); }
  }, [countdown, gameState]);

  const generateRound = () => {
    const nums = Array.from({ length: s.count }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
    setGrid(nums);
    setExpected(1);
    setDone([]);
  };

  const cols = s.count <= 9 ? 3 : s.count <= 12 ? 4 : s.count <= 16 ? 4 : 5;

  const handleClick = (val) => {
    if (gameState !== 'playing' || paused) return;
    if (val === expected) {
      sounds.correctHit();
      setDone([...done, val]);
      const ne = expected + 1;
      if (ne > s.count) {
        setScore(score + Math.round(100 * s.mult));
        setCorrectCount(correctCount + 1);
        if (round < totalRounds) { setRound(round + 1); setTimeout(generateRound, 400); } else endGame();
      } else {
        setExpected(ne);
      }
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = Date.now() - startTimeRef.current;
    await saveGameResult({ game_type: 30, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Date.now() - startTimeRef.current;
    return <ResultsScreen gameTitle={t('tapOrder')} gameResult={{ game_type: 30, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-fuchsia-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2 items-center"><p className="text-sm font-bold text-slate-500">Next: {expected}</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div className="mb-4 text-center"><p className="text-sm font-semibold text-slate-500 uppercase">Tap numbers in order: 1 → {s.count}</p></div>
        {gameState === 'playing' && (
          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {grid.map((val, i) => <button key={i} onClick={() => handleClick(val)} className={`aspect-square rounded-lg border flex items-center justify-center text-lg font-bold transition-all ${done.includes(val) ? 'bg-fuchsia-200 border-fuchsia-300 text-fuchsia-300' : 'bg-fuchsia-50 border-fuchsia-200 hover:border-fuchsia-400 text-slate-700'}`}>{val}</button>)}
          </div>
        )}
        <div className="flex justify-around text-center"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={30} />
    </div>
  );
}