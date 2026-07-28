import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import ShapeIcon from './ShapeIcon';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const shapes = ['circle', 'square', 'triangle', 'star'];
const colors = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Game27OddSize({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [roundTime, setRoundTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [grid, setGrid] = useState([]);
  const [oddIdx, setOddIdx] = useState(-1);

  const ds = { 1: { gridSize: 3, rounds: 10, roundTime: 6, baseSize: 42, diff: 14, mult: 1 }, 2: { gridSize: 4, rounds: 12, roundTime: 5, baseSize: 38, diff: 12, mult: 1.5 }, 3: { gridSize: 4, rounds: 14, roundTime: 4, baseSize: 36, diff: 10, mult: 2 }, 4: { gridSize: 5, rounds: 16, roundTime: 3, baseSize: 30, diff: 8, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;
  const total = s.gridSize * s.gridSize;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); generateRound(); }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && roundTime > 0) { const tm = setTimeout(() => setRoundTime(roundTime - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'playing' && roundTime === 0 && !paused) { sounds.wrongHit(); setWrongCount(wrongCount + 1); if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame(); }
  }, [roundTime, gameState, paused]);

  const generateRound = () => {
    const sh = rand(shapes);
    const color = rand(colors);
    const idx = Math.floor(Math.random() * total);
    const bigger = Math.random() < 0.5;
    const variantSize = bigger ? s.baseSize + s.diff : s.baseSize - s.diff;
    setGrid(Array.from({ length: total }, (_, i) => ({ shape: sh, color, size: i === idx ? variantSize : s.baseSize })));
    setOddIdx(idx);
    setRoundTime(s.roundTime);
  };

  const handleClick = (idx) => {
    if (gameState !== 'playing' || paused) return;
    if (idx === oddIdx) {
      sounds.correctHit();
      setScore(score + Math.round(100 * s.mult));
      setCorrectCount(correctCount + 1);
      if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = Math.round(round * s.roundTime * 1000);
    await saveGameResult({ game_type: 27, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Math.round(round * s.roundTime * 1000);
    return <ResultsScreen gameTitle={t('oddSize')} gameResult={{ game_type: 27, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-lime-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2 items-center"><p className="text-xl font-bold text-slate-700">⏱️ {roundTime}s</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div className="mb-4 text-center"><p className="text-sm font-semibold text-slate-500 uppercase">Find the different size</p></div>
        {gameState === 'playing' && (
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${s.gridSize}, 1fr)` }}>
            {grid.map((item, i) => <button key={i} onClick={() => handleClick(i)} className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 hover:border-lime-400 flex items-center justify-center transition-all"><ShapeIcon shape={item.shape} color={item.color} size={item.size} /></button>)}
          </div>
        )}
        <div className="flex justify-around text-center"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={27} />
    </div>
  );
}