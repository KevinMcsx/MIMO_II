import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ColorButtons from './ColorButtons';
import ShapeButtons from './ShapeButtons';
import ShapeDisplay from './ShapeDisplay';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { sounds } from '../utils/sounds';
import { saveGameResult } from './GameResultSaver';
import { useTranslation } from '../utils/translations';

const COLORS = ['yellow', 'green', 'blue', 'red'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];

const SHAPE_COUNTS = { 1: 20, 2: 40, 3: 60, 4: 80 };

export default function Game2ColorShape({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [currentShape, setCurrentShape] = useState(null);
  const [currentColor, setCurrentColor] = useState(null);
  const [shapeColors, setShapeColors] = useState({});
  const [targetType, setTargetType] = useState(null); // 'color' or 'shape'
  const [shapeIndex, setShapeIndex] = useState(0);
  const [activeColorKey, setActiveColorKey] = useState(null);
  const [activeShapeKey, setActiveShapeKey] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [pausedState, setPausedState] = useState(null);
  const [stats, setStats] = useState({
    reactionTimes: [],
    correctHits: 0,
    wrongHits: 0,
    correctShapes: 0,
    wrongShapes: 0,
    startTime: null,
    totalTime: 0,
  });
  
  const shapeStartTime = useRef(null);
  const totalShapes = SHAPE_COUNTS[difficulty] || 20;

  // Generate random colors for shape buttons
  const generateShapeColors = useCallback(() => {
    const colors = {};
    SHAPES.forEach(shape => {
      colors[shape] = COLORS[Math.floor(Math.random() * COLORS.length)];
    });
    return colors;
  }, []);

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
      generateNewRound();
    }
  }, [countdown, gameState]);

  const generateNewRound = useCallback(() => {
    const newShapeColors = generateShapeColors();
    setShapeColors(newShapeColors);
    
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    setCurrentShape(shape);
    setCurrentColor(color);
    
    // Determine if shape button color matches displayed shape color
    const shapeButtonColor = newShapeColors[shape];
    const shouldPressShape = shapeButtonColor === color;
    setTargetType(shouldPressShape ? 'shape' : 'color');
    
    shapeStartTime.current = Date.now();
  }, [generateShapeColors]);

  const processAnswer = useCallback((isCorrect, isShapeButton) => {
    const reactionTime = Date.now() - shapeStartTime.current;

    if (isCorrect) {
      sounds.correctHit();
    } else {
      sounds.wrongHit();
    }

    setStats(prev => {
      const newStats = {
        ...prev,
        reactionTimes: [...prev.reactionTimes, reactionTime],
      };
      
      if (isShapeButton) {
        newStats.correctShapes = prev.correctShapes + (isCorrect ? 1 : 0);
        newStats.wrongShapes = prev.wrongShapes + (isCorrect ? 0 : 1);
      } else {
        newStats.correctHits = prev.correctHits + (isCorrect ? 1 : 0);
        newStats.wrongHits = prev.wrongHits + (isCorrect ? 0 : 1);
      }
      
      return newStats;
    });

    // Next shape or end game
    if (shapeIndex + 1 >= totalShapes) {
      sounds.gameEnd();
      const finalTime = Date.now() - stats.startTime;
      const finalAvgReactionTime = [...stats.reactionTimes, reactionTime].reduce((a, b) => a + b, 0) / (stats.reactionTimes.length + 1);
      const finalCorrectHits = stats.correctHits + (isCorrect && !isShapeButton ? 1 : 0);
      const finalWrongHits = stats.wrongHits + (!isCorrect && !isShapeButton ? 1 : 0);
      const finalCorrectShapes = stats.correctShapes + (isCorrect && isShapeButton ? 1 : 0);
      const finalWrongShapes = stats.wrongShapes + (!isCorrect && isShapeButton ? 1 : 0);
      
      setStats(prev => ({
        ...prev,
        totalTime: finalTime,
      }));
      
      // Save result
      saveGameResult({
        game_type: 2,
        difficulty: difficulty,
        total_time: finalTime,
        avg_reaction_time: finalAvgReactionTime,
        correct_hits: finalCorrectHits,
        wrong_hits: finalWrongHits,
        correct_shapes: finalCorrectShapes,
        wrong_shapes: finalWrongShapes,
        score: finalCorrectHits + finalCorrectShapes,
        player_name: playerName || 'Player',
      });
      
      setGameState('finished');
    } else {
      setShapeIndex(prev => prev + 1);
      setTimeout(generateNewRound, 300);
    }
    
    setCurrentShape(null);
    setCurrentColor(null);
  }, [shapeIndex, totalShapes, generateNewRound]);

  const handleColorPress = useCallback((pressedColor) => {
    if (gameState !== 'playing' || !currentColor) return;

    const keyMap = { yellow: '1', green: '2', blue: '3', red: '4' };
    setActiveColorKey(keyMap[pressedColor]);
    setTimeout(() => setActiveColorKey(null), 150);

    // If target is shape, pressing color is wrong
    if (targetType === 'shape') {
      processAnswer(false, false);
      return;
    }

    const isCorrect = pressedColor === currentColor;
    processAnswer(isCorrect, false);
  }, [gameState, currentColor, targetType, processAnswer]);

  const handleShapePress = useCallback((pressedShape) => {
    if (gameState !== 'playing' || !currentShape) return;

    const keyMap = { circle: 'q', square: 'w', triangle: 'e', star: 'r' };
    setActiveShapeKey(keyMap[pressedShape]);
    setTimeout(() => setActiveShapeKey(null), 150);

    // If target is color, pressing shape is wrong
    if (targetType === 'color') {
      processAnswer(false, true);
      return;
    }

    const isCorrect = pressedShape === currentShape;
    processAnswer(isCorrect, true);
  }, [gameState, currentShape, targetType, processAnswer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const colorMap = { '1': 'yellow', '2': 'green', '3': 'blue', '4': 'red' };
      const shapeMap = { 'q': 'circle', 'w': 'square', 'e': 'triangle', 'r': 'star' };
      
      if (colorMap[e.key]) {
        handleColorPress(colorMap[e.key]);
      } else if (shapeMap[e.key.toLowerCase()]) {
        handleShapePress(shapeMap[e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleColorPress, handleShapePress]);

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
          correctShapes: stats.correctShapes,
          wrongShapes: stats.wrongShapes,
          totalAttempts: stats.correctHits + stats.wrongHits + stats.correctShapes + stats.wrongShapes,
          showShapeStats: true,
        }}
        gameTitle={`Color + Shape - ${['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}`}
        gameResult={{
          game_type: 2,
          difficulty,
          score: stats.correctHits + stats.correctShapes,
          correct_hits: stats.correctHits + stats.correctShapes,
          avg_reaction_time: avgReactionTime,
        }}
        playerName={playerName}
        onPlayAgain={() => {
          setGameState('countdown');
          setCountdown(3);
          setShapeIndex(0);
          setStats({ 
            reactionTimes: [], 
            correctHits: 0, 
            wrongHits: 0, 
            correctShapes: 0,
            wrongShapes: 0,
            startTime: null, 
            totalTime: 0 
          });
        }}
        onMainMenu={onMainMenu}
      />
    );
  }

  const handleShowTutorial = () => {
    if (gameState === 'playing') {
      setPausedState({
        gameState,
        currentShape,
        currentColor,
        shapeStartTime: shapeStartTime.current,
      });
      setGameState('paused');
    }
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    if (pausedState) {
      setGameState(pausedState.gameState);
      setCurrentShape(pausedState.currentShape);
      setCurrentColor(pausedState.currentColor);
      shapeStartTime.current = Date.now() - (Date.now() - pausedState.shapeStartTime);
      setPausedState(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <TutorialModal
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        gameId={2}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-slate-400">
          <span className="text-3xl font-bold text-white">{shapeIndex}</span>
          <span className="text-xl">/{totalShapes}</span>
        </div>
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-white">{t('colorShape')}</h2>
          <p className="text-slate-400">{[t('easy'), t('medium'), t('hard'), t('expert')][difficulty - 1]}</p>
        </div>
        <div className="text-right flex items-start gap-2">
          <Button
            onClick={handleShowTutorial}
            variant="ghost"
            size="icon"
            className="bg-white/10 hover:bg-white/20"
          >
            <Info className="w-5 h-5 text-white" />
          </Button>
          <div className="text-sm">
            <p className="text-green-400">✓ {stats.correctHits + stats.correctShapes}</p>
            <p className="text-red-400">✗ {stats.wrongHits + stats.wrongShapes}</p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-2xl h-64 bg-slate-800/50 rounded-3xl border border-slate-700 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black text-white"
            >
              {countdown || t('go')}
            </motion.div>
          ) : currentShape && currentColor ? (
            <ShapeDisplay key={`${currentShape}-${shapeIndex}`} shape={currentShape} color={currentColor} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-500 text-xl"
            >
              {t('getReady')}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rule Reminder */}
      <div className="bg-slate-800/30 rounded-xl p-4 max-w-2xl w-full text-center">
        <p className="text-slate-300 text-sm">
          {t('colorShapeRule')}
        </p>
      </div>

      {/* Shape Buttons */}
      <div className="space-y-2">
        <p className="text-center text-slate-400 text-sm">{t('shapeButtons')}</p>
        <ShapeButtons
          activeKey={activeShapeKey}
          onPress={handleShapePress}
          disabled={gameState !== 'playing'}
          shapeColors={shapeColors}
        />
      </div>

      {/* Color Buttons */}
      <div className="space-y-2">
        <p className="text-center text-slate-400 text-sm">{t('colorButtons')}</p>
        <ColorButtons
          activeKey={activeColorKey}
          onPress={handleColorPress}
          disabled={gameState !== 'playing'}
        />
      </div>
    </div>
  );
}