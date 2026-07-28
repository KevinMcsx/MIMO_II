import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle, Check, X } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const shapes = ['circle', 'square', 'triangle', 'star'];
const colors = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ShapeIcon = ({ shape, color, size = 80 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game13SpeedMatch({ difficulty, onMainMenu, playerName }) {
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
  const [prevShape, setPrevShape] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);

  const difficultySettings = {
    1: { time: 60, rounds: 20, matchType: 'color', scoreMultiplier: 1 },
    2: { time: 60, rounds: 25, matchType: 'shape', scoreMultiplier: 1.5 },
    3: { time: 50, rounds: 30, matchType: 'either', scoreMultiplier: 2 },
    4: { time: 40, rounds: 35, matchType: 'both', scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;
  const ruleText = { color: 'Match if same COLOR', shape: 'Match if same SHAPE', either: 'Match if same COLOR or SHAPE', both: 'Match if same COLOR and SHAPE' }[settings.matchType];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tm = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      generateRound();
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

  const isMatch = () => {
    if (!prevShape || !currentShape) return false;
    switch (settings.matchType) {
      case 'color': return prevShape.color === currentShape.color;
      case 'shape': return prevShape.shape === currentShape.shape;
      case 'either': return prevShape.color === currentShape.color || prevShape.shape === currentShape.shape;
      case 'both': return prevShape.color === currentShape.color && prevShape.shape === currentShape.shape;
      default: return false;
    }
  };

  const generateRound = () => {
    const prev = currentShape || { shape: rand(shapes), color: rand(colors) };
    setPrevShape(prev);
    setCurrentShape({ shape: rand(shapes), color: rand(colors) });
    setRoundStartTime(Date.now());
  };

  const handleAnswer = (saidMatch) => {
    if (gameState !== 'playing' || paused) return;
    const rt = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, rt]);
    if (saidMatch === isMatch()) {
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
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    await saveGameResult({ game_type: 13, difficulty, total_time: totalTime, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    const totalAttempts = correctCount + wrongCount;
    return <ResultsScreen gameTitle={t('speedMatch')} gameResult={{ game_type: 13, difficulty, score, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: avg, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p>
            <p className="text-lg font-semibold text-amber-600">{t('score')}: {score}</p>
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

        <div className="mb-4 text-center">
          <p className="text-sm font-semibold text-slate-500">{ruleText}</p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Previous</p>
            <div className="w-20 h-20 bg-slate-100 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
              {prevShape && <ShapeIcon shape={prevShape.shape} color={prevShape.color} size={50} />}
            </div>
          </div>
          <span className="text-2xl text-slate-400">vs</span>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Current</p>
            <motion.div key={round} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-amber-400 flex items-center justify-center">
              {currentShape && <ShapeIcon shape={currentShape.shape} color={currentShape.color} size={64} />}
            </motion.div>
          </div>
        </div>

        {gameState === 'playing' && (
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAnswer(true)} className="h-16 text-xl font-bold bg-green-500 hover:bg-green-600"><Check className="w-6 h-6 mr-2" /> Match</Button>
            <Button onClick={() => handleAnswer(false)} className="h-16 text-xl font-bold bg-red-500 hover:bg-red-600"><X className="w-6 h-6 mr-2" /> Different</Button>
          </div>
        )}

        <div className="flex justify-around text-center mt-6">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={13} />
    </div>
  );
}