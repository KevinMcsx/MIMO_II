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
  const shapeMap = {
    circle: (
      <div 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          backgroundColor: color 
        }} 
      />
    ),
    square: (
      <div 
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: color 
        }} 
      />
    ),
    triangle: (
      <div 
        style={{ 
          width: 0, 
          height: 0, 
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`
        }} 
      />
    ),
    star: (
      <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>
    ),
  };
  return <div className="flex items-center justify-center">{shapeMap[shape]}</div>;
};

export default function Game5PatternRecognition({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown'); // countdown, playing, finished
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
  const [oddOneIndex, setOddOneIndex] = useState(null);

  const difficultySettings = {
    1: { gridSize: 3, time: 180, rounds: 15, scoreMultiplier: 1 },
    2: { gridSize: 4, time: 150, rounds: 20, scoreMultiplier: 1.5 },
    3: { gridSize: 4, time: 120, rounds: 25, scoreMultiplier: 2 },
    4: { gridSize: 5, time: 90, rounds: 30, scoreMultiplier: 3 },
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
    const gridSize = settings.gridSize;
    const totalItems = gridSize * gridSize;
    
    // Choose what makes one item different
    const differenceType = Math.random() > 0.5 ? 'shape' : 'color';
    
    // Choose common attributes
    const commonShape = shapes[Math.floor(Math.random() * shapes.length)];
    const commonColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Choose different attribute
    let oddShape = commonShape;
    let oddColor = commonColor;
    
    if (differenceType === 'shape') {
      const otherShapes = shapes.filter(s => s !== commonShape);
      oddShape = otherShapes[Math.floor(Math.random() * otherShapes.length)];
    } else {
      const otherColors = colors.filter(c => c !== commonColor);
      oddColor = otherColors[Math.floor(Math.random() * otherColors.length)];
    }
    
    // Generate grid
    const newGrid = [];
    const oddIndex = Math.floor(Math.random() * totalItems);
    
    for (let i = 0; i < totalItems; i++) {
      if (i === oddIndex) {
        newGrid.push({ shape: oddShape, color: oddColor, isOdd: true });
      } else {
        newGrid.push({ shape: commonShape, color: commonColor, isOdd: false });
      }
    }
    
    setGrid(newGrid);
    setOddOneIndex(oddIndex);
    setRoundStartTime(Date.now());
  };

  const handleItemClick = (index) => {
    if (gameState !== 'playing' || paused) return;

    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    if (index === oddOneIndex) {
      sounds.correctHit();
      const points = Math.round(100 * settings.scoreMultiplier);
      setScore(score + points);
      setCorrectCount(correctCount + 1);
      
      if (round < totalRounds) {
        setRound(round + 1);
        generateRound();
      } else {
        endGame();
      }
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;

    // Save game result
    await saveGameResult({
      game_type: 5,
      difficulty,
      total_time: totalTime,
      avg_reaction_time: avgReactionTime,
      correct_hits: correctCount,
      wrong_hits: wrongCount,
      score,
      player_name: playerName,
    });
    
    setGameState('finished');
  };

  const togglePause = () => {
    setPaused(!paused);
    sounds.buttonPress();
  };

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    const totalAttempts = correctCount + wrongCount;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    return (
      <ResultsScreen
        gameTitle={t('patternRecognition')}
        gameResult={{
          game_type: 5,
          difficulty,
          score,
          avg_reaction_time: avgReactionTime,
          correct_hits: correctCount,
          wrong_hits: wrongCount,
          total_time: totalTime,
        }}
        stats={{
          totalTime,
          avgReactionTime,
          correctHits: correctCount,
          wrongHits: wrongCount,
          totalAttempts,
        }}
        onPlayAgain={() => window.location.reload()}
        onMainMenu={onMainMenu}
        playerName={playerName}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {t('round')} {round}/{totalRounds}
            </p>
            <p className="text-lg font-semibold text-purple-600">
              {t('score')}: {score}
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-xl font-bold text-slate-700">
              ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
            <Button onClick={togglePause} size="icon" variant="ghost">
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"
            >
              <div className="text-9xl font-black text-white drop-shadow-lg">
                {countdown}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paused Overlay */}
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePause}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"
            >
              <div className="text-center">
                <Play className="w-24 h-24 text-white mx-auto mb-4" />
                <p className="text-3xl font-bold text-white">PAUSED</p>
                <p className="text-lg text-white/80 mt-2">Click to resume</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            🎯 Find the odd one out!
          </p>
        </div>

        {/* Grid */}
        {gameState === 'playing' && (
          <div 
            className="grid gap-4 mb-6"
            style={{ 
              gridTemplateColumns: `repeat(${settings.gridSize}, 1fr)`,
            }}
          >
            {grid.map((item, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleItemClick(index)}
                className="aspect-square bg-slate-100 rounded-2xl border-4 border-slate-300 hover:border-purple-500 hover:shadow-lg transition-all flex items-center justify-center"
              >
                <ShapeIcon shape={item.shape} color={item.color} size={settings.gridSize === 5 ? 40 : 60} />
              </motion.button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">✓ {correctCount}</p>
            <p className="text-sm text-slate-600">{t('correct')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p>
            <p className="text-sm text-slate-600">{t('wrong')}</p>
          </div>
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        gameId={5}
      />
    </div>
  );
}