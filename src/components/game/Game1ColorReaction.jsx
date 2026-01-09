import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorButtons from './ColorButtons';
import ShapeDisplay from './ShapeDisplay';
import ResultsScreen from './ResultsScreen';
import { sounds } from '../utils/sounds';
import { saveGameResult } from './GameResultSaver';

const COLORS = ['yellow', 'blue', 'green', 'red'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];

const SHAPE_COUNTS = { 1: 20, 2: 40, 3: 60, 4: 80 };

export default function Game1ColorReaction({ difficulty, onMainMenu, playerName }) {
  const [gameState, setGameState] = useState('countdown'); // countdown, playing, finished
  const [countdown, setCountdown] = useState(3);
  const [currentShape, setCurrentShape] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const [shapeIndex, setShapeIndex] = useState(0);
  const [activeKey, setActiveKey] = useState(null);
  const [stats, setStats] = useState({
    reactionTimes: [],
    correctHits: 0,
    wrongHits: 0,
    startTime: null,
    totalTime: 0,
  });
  
  const shapeStartTime = useRef(null);
  const totalShapes = SHAPE_COUNTS[difficulty] || 20;

  // Countdown
  useEffect(() => {
    if (gameState !== 'countdown') return;
    
    if (countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      sounds.gameStart();
      setGameState('playing');
      setStats(prev => ({ ...prev, startTime: Date.now() }));
      generateNewShape();
    }
  }, [countdown, gameState]);

  const generateNewShape = useCallback(() => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    setCurrentShape(shape);
    setCurrentColor(color);
    shapeStartTime.current = Date.now();
  }, []);

  const handleColorPress = useCallback((pressedColor) => {
    if (gameState !== 'playing' || !currentColor) return;

    const reactionTime = Date.now() - shapeStartTime.current;
    const isCorrect = pressedColor === currentColor;

    if (isCorrect) {
      sounds.correctHit();
    } else {
      sounds.wrongHit();
    }

    setStats(prev => ({
      ...prev,
      reactionTimes: [...prev.reactionTimes, reactionTime],
      correctHits: prev.correctHits + (isCorrect ? 1 : 0),
      wrongHits: prev.wrongHits + (isCorrect ? 0 : 1),
    }));

    // Visual feedback
    const keyMap = { yellow: '1', blue: '2', green: '3', red: '4' };
    setActiveKey(keyMap[pressedColor]);
    setTimeout(() => setActiveKey(null), 150);

    // Next shape or end game
    if (shapeIndex + 1 >= totalShapes) {
      sounds.gameEnd();
      const finalTime = Date.now() - stats.startTime;
      const finalAvgReactionTime = [...stats.reactionTimes, reactionTime].reduce((a, b) => a + b, 0) / (stats.reactionTimes.length + 1);
      
      setStats(prev => ({
        ...prev,
        totalTime: finalTime,
      }));
      
      // Save result
      saveGameResult({
        game_type: 1,
        difficulty: difficulty,
        total_time: finalTime,
        avg_reaction_time: finalAvgReactionTime,
        correct_hits: stats.correctHits + (isCorrect ? 1 : 0),
        wrong_hits: stats.wrongHits + (isCorrect ? 0 : 1),
        score: stats.correctHits + (isCorrect ? 1 : 0),
        player_name: playerName || 'Player',
      });
      
      setGameState('finished');
    } else {
      setShapeIndex(prev => prev + 1);
      setTimeout(generateNewShape, 300);
    }
    
    setCurrentShape(null);
    setCurrentColor(null);
  }, [gameState, currentColor, shapeIndex, totalShapes, generateNewShape]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = { '1': 'yellow', '2': 'blue', '3': 'green', '4': 'red' };
      if (keyMap[e.key]) {
        handleColorPress(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleColorPress]);

  const avgReactionTime = stats.reactionTimes.length > 0
    ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length
    : 0;

  if (gameState === 'finished') {
    return (
      <ResultsScreen
        stats={{
          totalTime: stats.totalTime,
          avgReactionTime,
          correctHits: stats.correctHits,
          wrongHits: stats.wrongHits,
          totalAttempts: stats.correctHits + stats.wrongHits,
        }}
        gameTitle={`Color Reaction - ${['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}`}
        onPlayAgain={() => {
          setGameState('countdown');
          setCountdown(3);
          setShapeIndex(0);
          setStats({ reactionTimes: [], correctHits: 0, wrongHits: 0, startTime: null, totalTime: 0 });
        }}
        onMainMenu={onMainMenu}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-slate-400">
          <span className="text-3xl font-bold text-white">{shapeIndex}</span>
          <span className="text-xl">/{totalShapes}</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Color Reaction</h2>
          <p className="text-slate-400">{['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">Correct</p>
          <p className="text-2xl font-bold text-green-400">{stats.correctHits}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-2xl h-80 bg-slate-800/50 rounded-3xl border border-slate-700 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black text-white"
            >
              {countdown || 'GO!'}
            </motion.div>
          ) : currentShape && currentColor ? (
            <ShapeDisplay key={`${currentShape}-${shapeIndex}`} shape={currentShape} color={currentColor} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-500 text-xl"
            >
              Get ready...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <p className="text-slate-400 text-center">
        Press the button matching the <span className="text-white font-bold">COLOR</span> of the shape!
      </p>

      {/* Buttons */}
      <ColorButtons
        activeKey={activeKey}
        onPress={handleColorPress}
        disabled={gameState !== 'playing'}
      />
    </div>
  );
}