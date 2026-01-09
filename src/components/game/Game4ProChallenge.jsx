import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Square, Triangle, Star, Heart } from 'lucide-react';
import ColorButtons from './ColorButtons';
import ShapeButtons from './ShapeButtons';
import ResultsScreen from './ResultsScreen';
import { sounds } from '../utils/sounds';
import { saveGameResult } from './GameResultSaver';

const COLORS = ['yellow', 'green', 'blue', 'red'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];

const LANE_CONFIG = {
  1: { type: 'color', duration: 120000, speed: 4000 },
  2: { type: 'shape', duration: 180000, speed: 4000 },
  3: { type: 'mixed', duration: 300000, speed: 3000 },
  4: { type: 'mixed', duration: Infinity, speed: 4000, speedIncrease: true, maxMisses: 5 },
};

const colorClasses = {
  yellow: 'text-yellow-400 bg-yellow-400',
  blue: 'text-blue-500 bg-blue-500',
  green: 'text-green-500 bg-green-500',
  red: 'text-red-500 bg-red-500',
};

const ShapeIcon = ({ shape, size = 'w-10 h-10', color }) => {
  const icons = { circle: Circle, square: Square, triangle: Triangle, star: Star };
  const Icon = icons[shape];
  const colorClass = colorClasses[color]?.split(' ')[0] || 'text-white';
  return Icon ? <Icon className={`${size} ${colorClass}`} strokeWidth={2} fill="currentColor" /> : null;
};

export default function Game4ProChallenge({ difficulty, onMainMenu, playerName }) {
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [lanes, setLanes] = useState([[], [], [], []]);
  const [lives, setLives] = useState(difficulty === 4 ? 5 : Infinity);
  const [score, setScore] = useState(0);
  const [activeColorKey, setActiveColorKey] = useState(null);
  const [activeShapeKey, setActiveShapeKey] = useState(null);
  const [shapeColors, setShapeColors] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stats, setStats] = useState({
    reactionTimes: [],
    correctHits: 0,
    wrongHits: 0,
    startTime: null,
    totalTime: 0,
  });

  const config = LANE_CONFIG[difficulty];
  const gameLoopRef = useRef(null);
  const spawnRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastSpeedIncreaseRef = useRef(0);
  const currentSpeedRef = useRef(config.speed);

  // Generate shape colors for buttons
  useEffect(() => {
    const colors = {};
    SHAPES.forEach((shape, i) => {
      colors[shape] = COLORS[i];
    });
    setShapeColors(colors);
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
      const now = Date.now();
      setStats(prev => ({ ...prev, startTime: now }));
      startTimeRef.current = now;
    }
  }, [countdown, gameState]);

  // Spawn items
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnItem = () => {
      const laneIndex = Math.floor(Math.random() * 4);
      const itemId = Date.now() + Math.random();
      
      let item;
      if (config.type === 'color') {
        item = { id: itemId, type: 'color', color: COLORS[laneIndex], lane: laneIndex, y: 0, spawnTime: Date.now() };
      } else if (config.type === 'shape') {
        item = { id: itemId, type: 'shape', shape: SHAPES[laneIndex], lane: laneIndex, y: 0, spawnTime: Date.now() };
      } else {
        // Mixed
        const isColor = Math.random() > 0.5;
        if (isColor) {
          item = { id: itemId, type: 'color', color: COLORS[laneIndex], lane: laneIndex, y: 0, spawnTime: Date.now() };
        } else {
          item = { id: itemId, type: 'shape', shape: SHAPES[laneIndex], color: COLORS[Math.floor(Math.random() * 4)], lane: laneIndex, y: 0, spawnTime: Date.now() };
        }
      }

      setLanes(prev => {
        const newLanes = [...prev];
        newLanes[laneIndex] = [...newLanes[laneIndex], item];
        return newLanes;
      });
      sounds.itemSpawn();
    };

    const spawnInterval = Math.max(800, currentSpeedRef.current / 3);
    spawnRef.current = setInterval(spawnItem, spawnInterval);

    return () => clearInterval(spawnRef.current);
  }, [gameState, config.type]);

  // Game loop - move items
  useEffect(() => {
    if (gameState !== 'playing') return;

    const moveItems = () => {
      const now = Date.now();
      setElapsedTime(now - startTimeRef.current);

      // Speed increase for expert mode
      if (config.speedIncrease) {
        const elapsed = now - startTimeRef.current;
        const intervals = Math.floor(elapsed / 30000);
        if (intervals > lastSpeedIncreaseRef.current) {
          currentSpeedRef.current = Math.max(1500, currentSpeedRef.current - 300);
          lastSpeedIncreaseRef.current = intervals;
        }
      }

      setLanes(prev => {
        return prev.map((lane, laneIndex) => {
          return lane.map(item => ({
            ...item,
            y: ((now - item.spawnTime) / currentSpeedRef.current) * 100,
          })).filter(item => {
            if (item.y >= 100) {
              // Missed item
              if (difficulty === 4) {
                sounds.loseLife();
                setLives(l => l - 1);
              } else {
                sounds.wrongHit();
              }
              setStats(s => ({ ...s, wrongHits: s.wrongHits + 1 }));
              return false;
            }
            return true;
          });
        });
      });

      // Check time limit
      if (config.duration !== Infinity && now - startTimeRef.current >= config.duration) {
        endGame();
      }
    };

    gameLoopRef.current = setInterval(moveItems, 16);

    return () => clearInterval(gameLoopRef.current);
  }, [gameState, config.duration, config.speedIncrease, difficulty]);

  // Check lives
  useEffect(() => {
    if (lives <= 0 && gameState === 'playing') {
      endGame();
    }
  }, [lives, gameState]);

  const endGame = useCallback(() => {
    clearInterval(gameLoopRef.current);
    clearInterval(spawnRef.current);
    sounds.gameEnd();
    
    const finalTime = Date.now() - stats.startTime;
    const finalAvgReactionTime = stats.reactionTimes.length > 0
      ? stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length
      : 0;
    
    setStats(prev => ({
      ...prev,
      totalTime: finalTime,
    }));
    
    // Save result
    saveGameResult({
      game_type: 4,
      difficulty: difficulty,
      total_time: finalTime,
      avg_reaction_time: finalAvgReactionTime,
      correct_hits: stats.correctHits,
      wrong_hits: stats.wrongHits,
      score: score,
      player_name: playerName || 'Player',
    });
    
    setGameState('finished');
  }, [stats, score, difficulty, playerName]);

  const hitItem = useCallback((laneIndex, itemType, value) => {
    setLanes(prev => {
      const lane = prev[laneIndex];
      const itemIndex = lane.findIndex(item => {
        if (itemType === 'color') {
          return item.type === 'color' && item.color === value && item.y > 60;
        } else {
          return item.type === 'shape' && item.shape === value && item.y > 60;
        }
      });

      if (itemIndex !== -1) {
        const item = lane[itemIndex];
        const reactionTime = Date.now() - item.spawnTime;

        sounds.itemHit();
        setStats(s => ({
          ...s,
          reactionTimes: [...s.reactionTimes, reactionTime],
          correctHits: s.correctHits + 1,
        }));
        setScore(s => s + Math.floor(100 - item.y));

        const newLanes = [...prev];
        newLanes[laneIndex] = lane.filter((_, i) => i !== itemIndex);
        return newLanes;
      }
      return prev;
    });
  }, []);

  const handleColorPress = useCallback((pressedColor) => {
    if (gameState !== 'playing') return;

    const keyMap = { yellow: '1', green: '2', blue: '3', red: '4' };
    setActiveColorKey(keyMap[pressedColor]);
    setTimeout(() => setActiveColorKey(null), 100);

    const laneIndex = COLORS.indexOf(pressedColor);
    if (laneIndex !== -1) {
      hitItem(laneIndex, 'color', pressedColor);
    }
  }, [gameState, hitItem]);

  const handleShapePress = useCallback((pressedShape) => {
    if (gameState !== 'playing') return;

    const keyMap = { circle: 'q', square: 'w', triangle: 'e', star: 'r' };
    setActiveShapeKey(keyMap[pressedShape]);
    setTimeout(() => setActiveShapeKey(null), 100);

    const laneIndex = SHAPES.indexOf(pressedShape);
    if (laneIndex !== -1) {
      hitItem(laneIndex, 'shape', pressedShape);
    }
  }, [gameState, hitItem]);

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

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const remainingTime = config.duration !== Infinity 
    ? Math.max(0, config.duration - elapsedTime)
    : null;

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
        gameTitle={`Pro Challenge - ${['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}`}
        onPlayAgain={() => {
          setGameState('countdown');
          setCountdown(3);
          setLanes([[], [], [], []]);
          setLives(difficulty === 4 ? 5 : Infinity);
          setScore(0);
          setElapsedTime(0);
          currentSpeedRef.current = config.speed;
          lastSpeedIncreaseRef.current = 0;
          setStats({ reactionTimes: [], correctHits: 0, wrongHits: 0, startTime: null, totalTime: 0 });
        }}
        onMainMenu={onMainMenu}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-3xl">
        <div className="text-slate-400">
          <span className="text-xl">Score: </span>
          <span className="text-3xl font-bold text-white">{score}</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Pro Challenge</h2>
          <p className="text-slate-400">{['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}</p>
        </div>
        <div className="text-right">
          {difficulty === 4 ? (
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} 
                />
              ))}
            </div>
          ) : (
            <p className="text-2xl font-bold text-yellow-400">{formatTime(remainingTime || 0)}</p>
          )}
        </div>
      </div>

      {/* Game Area - 4 Lanes */}
      <div className="w-full max-w-3xl h-80 bg-slate-800/50 rounded-3xl border border-slate-700 flex overflow-hidden">
        <AnimatePresence>
          {gameState === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="w-full flex items-center justify-center text-9xl font-black text-white"
            >
              {countdown || 'GO!'}
            </motion.div>
          ) : (
            lanes.map((lane, laneIndex) => (
              <div
                key={laneIndex}
                className="flex-1 relative border-r border-slate-700 last:border-r-0"
              >
                {/* Lane label */}
                <div className={`absolute bottom-0 left-0 right-0 h-12 ${colorClasses[COLORS[laneIndex]]?.split(' ')[1]} opacity-30`} />
                
                {/* Hit zone indicator */}
                <div className="absolute bottom-12 left-0 right-0 h-1 bg-white/30" />
                
                {/* Items */}
                {lane.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{ top: `${item.y}%` }}
                  >
                    {item.type === 'color' ? (
                      <div className={`w-12 h-12 rounded-full ${colorClasses[item.color]?.split(' ')[1]} shadow-lg`} />
                    ) : (
                      <ShapeIcon shape={item.shape} color={item.color} />
                    )}
                  </motion.div>
                ))}
              </div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/30 rounded-xl p-3 max-w-lg w-full text-center">
        <p className="text-slate-300 text-sm">
          Press buttons when items reach the <span className="text-white font-bold">bottom zone</span>!
        </p>
      </div>

      {/* Buttons */}
      {(config.type === 'shape' || config.type === 'mixed') && (
        <ShapeButtons
          activeKey={activeShapeKey}
          onPress={handleShapePress}
          disabled={gameState !== 'playing'}
          shapeColors={shapeColors}
        />
      )}
      
      {(config.type === 'color' || config.type === 'mixed') && (
        <ColorButtons
          activeKey={activeColorKey}
          onPress={handleColorPress}
          disabled={gameState !== 'playing'}
        />
      )}
    </div>
  );
}