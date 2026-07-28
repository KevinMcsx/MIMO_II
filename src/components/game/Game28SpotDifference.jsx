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

export default function Game28SpotDifference({ difficulty, onMainMenu, playerName }) {
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
  const [gridA, setGridA] = useState([]);
  const [gridB, setGridB] = useState([]);
  const [diffIdx, setDiffIdx] = useState(-1);
  const [shape, setShape] = useState('circle');

  const ds = { 1: { gridSize: 3, rounds: 8, roundTime: 8, mult: 1 }, 2: { gridSize: 3, rounds: 10, roundTime: 7, mult: 1.5 }, 3: { gridSize: 4, rounds: 12, roundTime: 6, mult: 2 }, 4: { gridSize: 4, rounds: 14, roundTime: 5, mult: 3 } };
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
    const a = Array.from({ length: total }, () => ({ color: rand(colors) }));
    const b = a.map(c => ({ color: c.color }));
    const idx = Math.floor(Math.random() * total);
    let nc; do { nc = rand(colors); } while (nc === b[idx].color);
    b[idx] = { color: nc };
    setGridA(a); setGridB(b); setDiffIdx(idx); setShape(sh);
    setRoundTime(s.roundTime);
  };

  const handleClick = (idx) => {
    if (gameState !== 'playing' || paused) return;
    if (idx === diffIdx) {
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
    await saveGameResult({ game_type: 28, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Math.round(round * s.roundTime * 1000);
    return <ResultsScreen gameTitle={t('spotDifference')} gameResult={{ game_type: 28, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  const cell = (item, idx, clickable) => (
    <button key={idx} onClick={clickable ? () => handleClick(idx) : undefined} className={`aspect-square rounded-lg border border-slate-200 flex items-center justify-center transition-all ${clickable ? 'bg-slate-50 hover:border-red-400' : 'bg-slate-100'}`}>
      <ShapeIcon shape={shape} color={item.color} size={s.gridSize === 4 ? 26 : 34} />
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-4">
          <div><p className="text-xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-red-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2 items-center"><p className="text-xl font-bold text-slate-700">⏱️ {roundTime}s</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        {gameState === 'playing' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1 text-center">Reference</p>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${s.gridSize}, 1fr)` }}>{gridA.map((item, i) => cell(item, i, false))}</div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1 text-center">Find the difference ↓</p>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${s.gridSize}, 1fr)` }}>{gridB.map((item, i) => cell(item, i, true))}</div>
            </div>
          </div>
        )}
        <div className="flex justify-around text-center mt-4"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={28} />
    </div>
  );
}