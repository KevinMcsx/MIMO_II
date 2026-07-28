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

const ShapeIcon = ({ shape, color, size = 60 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

const allCombos = () => {
  const combos = [];
  shapes.forEach(s => colors.forEach(c => combos.push({ shape: s, color: c })));
  return combos;
};
const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

export default function Game11TwinHunt({ difficulty, onMainMenu, playerName }) {
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
  const [grid, setGrid] = useState([]);
  const [firstPick, setFirstPick] = useState(null);

  const difficultySettings = {
    1: { gridSize: 3, time: 35, rounds: 10, scoreMultiplier: 1 },
    2: { gridSize: 4, time: 40, rounds: 12, scoreMultiplier: 1.5 },
    3: { gridSize: 4, time: 30, rounds: 15, scoreMultiplier: 2 },
    4: { gridSize: 4, time: 20, rounds: 18, scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      generateRound();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, paused]);

  const generateRound = () => {
    const totalItems = settings.gridSize * settings.gridSize;
    const combos = shuffle(allCombos());
    const uniques = combos.slice(0, totalItems - 1);
    const dupIndex = Math.floor(Math.random() * uniques.length);
    const newGrid = shuffle([...uniques, uniques[dupIndex]]);
    setGrid(newGrid);
    setFirstPick(null);
    setRoundStartTime(Date.now());
  };

  const handleItemClick = (index) => {
    if (gameState !== 'playing' || paused) return;
    if (firstPick === null) {
      setFirstPick(index);
      sounds.buttonPress();
      return;
    }
    if (firstPick === index) { setFirstPick(null); return; }

    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    const a = grid[firstPick], b = grid[index];
    if (a.shape === b.shape && a.color === b.color) {
      sounds.correctHit();
      setScore(score + Math.round(100 * settings.scoreMultiplier));
      setCorrectCount(correctCount + 1);
      if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
      setFirstPick(null);
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avgReactionTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    await saveGameResult({
      game_type: 11, difficulty, total_time: totalTime, avg_reaction_time: avgReactionTime,
      correct_hits: correctCount, wrong_hits: wrongCount,
      correct_shapes: correctCount, wrong_shapes: wrongCount,
      score, player_name: playerName,
    });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    const totalAttempts = correctCount + wrongCount;
    return (
      <ResultsScreen
        gameTitle={t('twinHunt')}
        gameResult={{ game_type: 11, difficulty, score, avg_reaction_time: avgReactionTime, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }}
        stats={{ totalTime, avgReactionTime, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }}
        onPlayAgain={() => window.location.reload()}
        onMainMenu={onMainMenu}
        playerName={playerName}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p>
            <p className="text-lg font-semibold text-lime-600">{t('score')}: {score}</p>
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
              <div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p><p className="text-lg text-white/80 mt-2">Click to resume</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">👯 Find the matching pair!</p>
        </div>

        {gameState === 'playing' && (
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)` }}>
            {grid.map((item, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleItemClick(index)}
                className={`aspect-square bg-slate-100 rounded-2xl border-4 transition-all flex items-center justify-center ${firstPick === index ? 'border-lime-500 shadow-lg scale-105' : 'border-slate-300 hover:border-lime-400'}`}
              >
                <ShapeIcon shape={item.shape} color={item.color} size={settings.gridSize === 4 ? 48 : 60} />
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex justify-around text-center">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={11} />
    </div>
  );
}