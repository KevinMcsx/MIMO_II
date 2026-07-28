import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const shapes = ['circle', 'square', 'triangle', 'star'];
const colors = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ShapeIcon = ({ shape, color, size = 44 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game15ColorInvaders({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [cells, setCells] = useState([]);
  const [targetColor, setTargetColor] = useState(null);
  const lifeTimers = useRef([]);

  const difficultySettings = {
    1: { time: 30, gridSize: 3, spawnEvery: 1200, life: 1000, scoreMultiplier: 1 },
    2: { time: 35, gridSize: 3, spawnEvery: 900, life: 800, scoreMultiplier: 1.5 },
    3: { time: 40, gridSize: 4, spawnEvery: 700, life: 700, scoreMultiplier: 2 },
    4: { time: 45, gridSize: 4, spawnEvery: 550, life: 600, scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const total = settings.gridSize * settings.gridSize;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tm = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setCells(Array(total).fill(null));
      setTargetColor(rand(colors));
      setTimeLeft(settings.time);
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

  useEffect(() => {
    if (gameState !== 'playing' || paused) return;
    const id = setInterval(() => {
      setCells(prev => {
        const empties = [];
        prev.forEach((c, i) => { if (!c) empties.push(i); });
        if (empties.length === 0) return prev;
        const idx = empties[Math.floor(Math.random() * empties.length)];
        const isTarget = Math.random() < 0.5;
        const color = isTarget ? targetColor : rand(colors.filter(c => c !== targetColor));
        const next = prev.slice();
        next[idx] = { shape: rand(shapes), color };
        lifeTimers.current.push(setTimeout(() => {
          setCells(p => { const n = p.slice(); n[idx] = null; return n; });
        }, settings.life));
        return next;
      });
    }, settings.spawnEvery);
    return () => clearInterval(id);
  }, [gameState, paused, targetColor]);

  useEffect(() => () => { lifeTimers.current.forEach(clearTimeout); }, []);

  const handleCellClick = (idx) => {
    if (gameState !== 'playing' || paused) return;
    const cell = cells[idx];
    if (!cell) return;
    if (cell.color === targetColor) {
      sounds.correctHit();
      setScore(score + Math.round(100 * settings.scoreMultiplier));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
    setCells(prev => { const n = prev.slice(); n[idx] = null; return n; });
  };

  const endGame = async () => {
    lifeTimers.current.forEach(clearTimeout);
    sounds.gameEnd();
    const totalTime = settings.time * 1000;
    await saveGameResult({ game_type: 15, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = settings.time * 1000;
    const totalAttempts = correctCount + wrongCount;
    return <ResultsScreen gameTitle={t('colorInvaders')} gameResult={{ game_type: 15, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-lg font-semibold text-rose-600">{t('score')}: {score}</p>
            <p className="text-sm text-slate-500">Tap only: <span className="inline-block w-4 h-4 rounded-full align-middle ml-1" style={{ backgroundColor: targetColor }} /></p>
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

        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)` }}>
          {cells.map((cell, i) => (
            <button key={i} onClick={() => handleCellClick(i)} className="aspect-square bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center hover:border-rose-400 transition-all">
              {cell && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><ShapeIcon shape={cell.shape} color={cell.color} size={settings.gridSize === 4 ? 36 : 48} /></motion.div>}
            </button>
          ))}
        </div>

        <div className="flex justify-around text-center mt-6">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={15} />
    </div>
  );
}