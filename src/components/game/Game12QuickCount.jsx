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

const ShapeIcon = ({ shape, color, size = 48 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game12QuickCount({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [phase, setPhase] = useState('show');
  const [grid, setGrid] = useState([]);
  const [target, setTarget] = useState(null);
  const [actualCount, setActualCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [flashLeft, setFlashLeft] = useState(0);
  const startTimeRef = useRef(0);

  const difficultySettings = {
    1: { gridSize: 3, flash: 3, rounds: 10, optionCount: 4, scoreMultiplier: 1 },
    2: { gridSize: 4, flash: 2.5, rounds: 12, optionCount: 4, scoreMultiplier: 1.5 },
    3: { gridSize: 4, flash: 2, rounds: 15, optionCount: 6, scoreMultiplier: 2 },
    4: { gridSize: 5, flash: 1.5, rounds: 18, optionCount: 6, scoreMultiplier: 3 },
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
      startTimeRef.current = Date.now();
      generateRound();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && phase === 'show' && !paused && flashLeft > 0) {
      const timer = setTimeout(() => setFlashLeft(flashLeft - 1), 100);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && phase === 'show' && flashLeft <= 0 && !paused) {
      setPhase('answer');
      setRoundStartTime(Date.now());
    }
  }, [flashLeft, gameState, phase, paused]);

  const generateRound = () => {
    const totalItems = settings.gridSize * settings.gridSize;
    const tgShape = shapes[Math.floor(Math.random() * shapes.length)];
    const tgColor = colors[Math.floor(Math.random() * colors.length)];
    setTarget({ shape: tgShape, color: tgColor });

    const maxTargets = Math.min(totalItems - 1, 8);
    const count = Math.floor(Math.random() * maxTargets) + 1;
    setActualCount(count);

    const newGrid = [];
    for (let i = 0; i < count; i++) newGrid.push({ shape: tgShape, color: tgColor });
    while (newGrid.length < totalItems) {
      let s, c;
      do {
        s = shapes[Math.floor(Math.random() * shapes.length)];
        c = colors[Math.floor(Math.random() * colors.length)];
      } while (s === tgShape && c === tgColor);
      newGrid.push({ shape: s, color: c });
    }
    setGrid(newGrid.sort(() => Math.random() - 0.5));

    const opts = new Set([count]);
    while (opts.size < settings.optionCount) {
      opts.add(Math.max(0, Math.floor(Math.random() * (maxTargets + 2))));
    }
    setOptions([...opts].sort(() => Math.random() - 0.5));
    setPhase('show');
    setFlashLeft(Math.round(settings.flash * 10));
  };

  const handleAnswer = (value) => {
    if (gameState !== 'playing' || phase !== 'answer' || paused) return;
    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    if (value === actualCount) {
      sounds.correctHit();
      setScore(score + Math.round(100 * settings.scoreMultiplier));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }

    if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avgReactionTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = Date.now() - startTimeRef.current;
    await saveGameResult({
      game_type: 12, difficulty, total_time: totalTime, avg_reaction_time: avgReactionTime,
      correct_hits: correctCount, wrong_hits: wrongCount,
      correct_shapes: correctCount, wrong_shapes: wrongCount,
      score, player_name: playerName,
    });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = Date.now() - startTimeRef.current;
    const totalAttempts = correctCount + wrongCount;
    return (
      <ResultsScreen
        gameTitle={t('quickCount')}
        gameResult={{ game_type: 12, difficulty, score, avg_reaction_time: avgReactionTime, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }}
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
            <p className="text-lg font-semibold text-fuchsia-600">{t('score')}: {score}</p>
          </div>
          <div className="flex gap-2 items-center">
            {phase === 'show' && <p className="text-xl font-bold text-fuchsia-600">👁️ {Math.ceil(flashLeft / 10)}</p>}
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

        {target && (
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Count the</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <ShapeIcon shape={target.shape} color={target.color} size={40} />
              <p className="text-xl font-black text-slate-800">{target.shape.toUpperCase()}s</p>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)` }}>
            {grid.map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="aspect-square bg-slate-100 rounded-xl border-2 border-slate-300 flex items-center justify-center"
              >
                {phase === 'show' ? (
                  <ShapeIcon shape={item.shape} color={item.color} size={settings.gridSize === 5 ? 32 : 44} />
                ) : (
                  <span className="text-2xl font-bold text-slate-400">?</span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {gameState === 'playing' && phase === 'answer' && (
          <div className="grid grid-cols-3 gap-3">
            {options.map((opt) => (
              <Button key={opt} onClick={() => handleAnswer(opt)} className="h-14 text-xl font-bold bg-fuchsia-500 hover:bg-fuchsia-600">
                {opt}
              </Button>
            ))}
          </div>
        )}

        <div className="flex justify-around text-center mt-6">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={12} />
    </div>
  );
}