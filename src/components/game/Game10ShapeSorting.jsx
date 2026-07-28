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
const shapeNames = { circle: 'CIRCLE', square: 'SQUARE', triangle: 'TRIANGLE', star: 'STAR' };
const colorNames = { '#FFD700': 'YELLOW', '#00D4FF': 'BLUE', '#00FF85': 'GREEN', '#FF4444': 'RED' };

const ShapeIcon = ({ shape, color, size = 100 }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game10ShapeSorting({ difficulty, onMainMenu, playerName }) {
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
  const [currentShape, setCurrentShape] = useState(null);
  const [rule, setRule] = useState(null);

  const difficultySettings = {
    1: { time: 60, rounds: 20, ruleType: 'shape', scoreMultiplier: 1 },
    2: { time: 60, rounds: 25, ruleType: 'color', scoreMultiplier: 1.5 },
    3: { time: 50, rounds: 30, ruleType: 'either', scoreMultiplier: 2 },
    4: { time: 40, rounds: 35, ruleType: 'either', scoreMultiplier: 3 },
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
    const type = settings.ruleType === 'either' ? (Math.random() > 0.5 ? 'shape' : 'color') : settings.ruleType;
    const pool = type === 'shape' ? shapes : colors;
    const value = pool[Math.floor(Math.random() * pool.length)];
    const label = type === 'shape' ? shapeNames[value] : colorNames[value];
    setRule({ type, value, label });

    const s = shapes[Math.floor(Math.random() * shapes.length)];
    const c = colors[Math.floor(Math.random() * colors.length)];
    setCurrentShape({ shape: s, color: c });
    setRoundStartTime(Date.now());
  };

  const isMatch = () => {
    if (!rule || !currentShape) return false;
    return rule.type === 'shape' ? currentShape.shape === rule.value : currentShape.color === rule.value;
  };

  const handleAnswer = (saidMatch) => {
    if (gameState !== 'playing' || paused) return;
    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    if (saidMatch === isMatch()) {
      sounds.correctHit();
      setScore(score + Math.round(100 * settings.scoreMultiplier));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }

    if (round < totalRounds) {
      setRound(round + 1);
      generateRound();
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avgReactionTime = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    await saveGameResult({
      game_type: 10, difficulty, total_time: totalTime, avg_reaction_time: avgReactionTime,
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
        gameTitle={t('shapeSorting')}
        gameResult={{ game_type: 10, difficulty, score, avg_reaction_time: avgReactionTime, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }}
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
            <p className="text-lg font-semibold text-cyan-600">{t('score')}: {score}</p>
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

        {rule && (
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500 font-semibold uppercase tracking-wide">Rule</p>
            <p className="text-2xl font-black text-slate-800">Is it {rule.label}?</p>
          </div>
        )}

        {gameState === 'playing' && currentShape && (
          <div className="flex justify-center mb-8">
            <motion.div key={round} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-40 h-40 bg-slate-100 rounded-3xl border-4 border-slate-300 flex items-center justify-center">
              <ShapeIcon shape={currentShape.shape} color={currentShape.color} size={100} />
            </motion.div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAnswer(true)} className="h-16 text-xl font-bold bg-green-500 hover:bg-green-600">
              <Check className="w-6 h-6 mr-2" /> {t('correct')}
            </Button>
            <Button onClick={() => handleAnswer(false)} className="h-16 text-xl font-bold bg-red-500 hover:bg-red-600">
              <X className="w-6 h-6 mr-2" /> {t('wrong')}
            </Button>
          </div>
        )}

        <div className="flex justify-around text-center mt-6">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={10} />
    </div>
  );
}