import React, { useState, useEffect } from 'react';
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

const ShapeIcon = ({ shape, color, size = 40 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game17VisualSearch({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [roundTime, setRoundTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [grid, setGrid] = useState([]);
  const [target, setTarget] = useState(null);

  const difficultySettings = {
    1: { gridSize: 4, rounds: 12, roundTime: 5, scoreMultiplier: 1 },
    2: { gridSize: 5, rounds: 12, roundTime: 4, scoreMultiplier: 1.5 },
    3: { gridSize: 5, rounds: 15, roundTime: 3, scoreMultiplier: 2 },
    4: { gridSize: 6, rounds: 15, roundTime: 3, scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;
  const total = settings.gridSize * settings.gridSize;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tm = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      generateRound();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && roundTime > 0) {
      const tm = setTimeout(() => setRoundTime(roundTime - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'playing' && roundTime === 0 && !paused) {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
    }
  }, [roundTime, gameState, paused]);

  const generateRound = () => {
    const tg = { shape: rand(shapes), color: rand(colors) };
    setTarget(tg);
    const targetIdx = Math.floor(Math.random() * total);
    const newGrid = [];
    for (let i = 0; i < total; i++) {
      if (i === targetIdx) { newGrid.push(tg); }
      else {
        let s, c;
        do { s = rand(shapes); c = rand(colors); } while (s === tg.shape && c === tg.color);
        newGrid.push({ shape: s, color: c });
      }
    }
    setGrid(newGrid);
    setRoundTime(settings.roundTime);
    setRoundStartTime(Date.now());
  };

  const handleItemClick = (idx) => {
    if (gameState !== 'playing' || paused) return;
    const item = grid[idx];
    if (item.shape === target.shape && item.color === target.color) {
      sounds.correctHit();
      setReactionTimes([...reactionTimes, Date.now() - roundStartTime]);
      setScore(score + Math.round(100 * settings.scoreMultiplier));
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
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = Math.round(round * settings.roundTime * 1000);
    await saveGameResult({ game_type: 17, difficulty, total_time: totalTime, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = Math.round(round * settings.roundTime * 1000);
    const totalAttempts = correctCount + wrongCount;
    return <ResultsScreen gameTitle={t('visualSearch')} gameResult={{ game_type: 17, difficulty, score, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: avg, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p>
            <p className="text-lg font-semibold text-violet-600">{t('score')}: {score}</p>
          </div>
          <div className="flex gap-2 items-center">
            <p className="text-xl font-bold text-slate-700">⏱️ {roundTime}s</p>
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

        {target && (
          <div className="mb-4 text-center">
            <p className="text-sm text-slate-500 font-semibold uppercase">Find this</p>
            <div className="flex justify-center mt-1"><ShapeIcon shape={target.shape} color={target.color} size={40} /></div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="grid gap-2 mb-6" style={{ gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)` }}>
            {grid.map((item, i) => (
              <button key={i} onClick={() => handleItemClick(i)} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 hover:border-violet-400 flex items-center justify-center transition-all">
                <ShapeIcon shape={item.shape} color={item.color} size={settings.gridSize === 6 ? 26 : 34} />
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-around text-center">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={17} />
    </div>
  );
}