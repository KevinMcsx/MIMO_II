import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const ingredients = [
  { name: 'Orange', color: '#FF8C00', emoji: '🍊' },
  { name: 'Apple', color: '#FF4444', emoji: '🍎' },
  { name: 'Grape', color: '#9333EA', emoji: '🍇' },
  { name: 'Lemon', color: '#FFD700', emoji: '🍋' },
  { name: 'Strawberry', color: '#FF1493', emoji: '🍓' },
  { name: 'Kiwi', color: '#00FF85', emoji: '🥝' },
];

export default function Game8JuiceMaker({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [currentOrder, setCurrentOrder] = useState(null);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [fillLevel, setFillLevel] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const fillTimerRef = useRef(null);
  const orderStartTimeRef = useRef(null);

  const difficultySettings = {
    1: { machines: 2, maxIngredients: 2, time: 120, totalOrders: 15 },
    2: { machines: 3, maxIngredients: 3, time: 180, totalOrders: 20 },
    3: { machines: 4, maxIngredients: 4, time: 240, totalOrders: 25 },
    4: { machines: 4, maxIngredients: 4, time: 300, totalOrders: 30 },
  };

  const settings = difficultySettings[difficulty];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      initializeMachines();
      generateOrder();
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

  useEffect(() => {
    if (isFilling && !paused) {
      const cupFillTime = selectedMachine?.cup === 'medium' ? 3000 : 5000;
      const increment = 100 / (cupFillTime / 50);
      
      fillTimerRef.current = setInterval(() => {
        setFillLevel(prev => {
          const newLevel = prev + increment;
          if (newLevel >= 100) {
            handleOverfill();
            return 100;
          }
          return newLevel;
        });
      }, 50);

      return () => clearInterval(fillTimerRef.current);
    } else {
      if (fillTimerRef.current) {
        clearInterval(fillTimerRef.current);
      }
    }
  }, [isFilling, paused, selectedMachine]);

  const initializeMachines = () => {
    const machinesList = [];
    for (let i = 0; i < settings.machines; i++) {
      machinesList.push({
        id: i,
        busy: false,
        cup: null,
        ingredients: [],
        fillLevel: 0,
      });
    }
    setMachines(machinesList);
  };

  const generateOrder = () => {
    const numIngredients = Math.floor(Math.random() * settings.maxIngredients) + 1;
    const orderIngredients = [];
    const availableIngredients = [...ingredients];
    
    for (let i = 0; i < numIngredients; i++) {
      const randomIndex = Math.floor(Math.random() * availableIngredients.length);
      orderIngredients.push(availableIngredients[randomIndex]);
      availableIngredients.splice(randomIndex, 1);
    }
    
    const cupSize = Math.random() > 0.5 ? 'medium' : 'big';
    
    setCurrentOrder({
      ingredients: orderIngredients,
      cup: cupSize,
    });
    
    orderStartTimeRef.current = Date.now();
  };

  const handleMachineSelect = (machineId) => {
    if (isFilling || !currentOrder) return;
    
    const machine = machines[machineId];
    if (machine.busy) return;

    setSelectedMachine({
      id: machineId,
      cup: currentOrder.cup,
      ingredients: currentOrder.ingredients,
    });
    
    setFillLevel(0);
  };

  const handleStartFilling = () => {
    if (!selectedMachine || isFilling) return;
    setIsFilling(true);
    sounds.buttonPress();
  };

  const handleStopFilling = () => {
    if (!isFilling) return;
    
    setIsFilling(false);
    clearInterval(fillTimerRef.current);
    
    const targetLevel = 90;
    const tolerance = 15;
    const isCorrectLevel = fillLevel >= (targetLevel - tolerance) && fillLevel <= (targetLevel + tolerance);
    
    if (isCorrectLevel) {
      const reactionTime = Date.now() - orderStartTimeRef.current;
      setReactionTimes([...reactionTimes, reactionTime]);
      
      sounds.correctHit();
      const accuracyBonus = Math.floor((100 - Math.abs(fillLevel - targetLevel)) * 2);
      setScore(score + 100 + accuracyBonus);
      setCorrectCount(correctCount + 1);
      
      if (correctCount + 1 >= settings.totalOrders) {
        endGame();
      } else {
        resetMachine();
        generateOrder();
      }
    } else {
      handleOverfill();
    }
  };

  const handleOverfill = () => {
    setIsFilling(false);
    clearInterval(fillTimerRef.current);
    
    sounds.wrongHit();
    setWrongCount(wrongCount + 1);
    setScore(Math.max(0, score - 50));
    
    resetMachine();
    generateOrder();
  };

  const resetMachine = () => {
    setSelectedMachine(null);
    setFillLevel(0);
  };

  const endGame = async () => {
    sounds.gameEnd();
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;

    await saveGameResult({
      game_type: 8,
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

    return (
      <ResultsScreen
        gameTitle={t('juiceMaker')}
        gameResult={{
          game_type: 8,
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
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              Orders: {correctCount}/{settings.totalOrders}
            </p>
            <p className="text-lg font-semibold text-orange-600">
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

        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl z-50"
            >
              <div className="text-9xl font-black text-white drop-shadow-lg">
                {countdown}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Current Order */}
        {currentOrder && (
          <div className="mb-6 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-6 border-2 border-orange-300">
            <p className="text-lg font-bold text-slate-800 mb-3">📋 Current Order:</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <span className="text-2xl">{currentOrder.cup === 'medium' ? '🥤' : '🥛'}</span>
                <span className="font-bold text-slate-700">{currentOrder.cup === 'medium' ? 'Medium (3s)' : 'Big (5s)'}</span>
              </div>
              <div className="flex gap-2">
                {currentOrder.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                    <span className="text-2xl">{ing.emoji}</span>
                    <span className="text-sm font-semibold" style={{ color: ing.color }}>{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Machines */}
        <div className={`grid gap-4 mb-6 ${settings.machines === 2 ? 'grid-cols-2' : settings.machines === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {machines.map((machine) => (
            <motion.button
              key={machine.id}
              onClick={() => handleMachineSelect(machine.id)}
              className={`relative bg-gradient-to-b from-slate-200 to-slate-300 rounded-2xl p-6 border-4 transition-all ${
                selectedMachine?.id === machine.id 
                  ? 'border-orange-500 shadow-lg scale-105' 
                  : 'border-slate-400 hover:border-orange-300'
              }`}
              disabled={machine.busy}
            >
              <p className="text-sm font-bold text-slate-600 mb-2">Machine {machine.id + 1}</p>
              
              {/* Juice Machine Visual */}
              <div className="relative bg-slate-100 rounded-xl h-32 border-2 border-slate-400 overflow-hidden">
                {selectedMachine?.id === machine.id && (
                  <>
                    {/* Fill Progress */}
                    <motion.div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-orange-400 to-yellow-400"
                      style={{ 
                        height: `${fillLevel}%`,
                        background: `linear-gradient(to top, ${selectedMachine.ingredients[0]?.color || '#FF8C00'}, ${selectedMachine.ingredients[selectedMachine.ingredients.length - 1]?.color || '#FFD700'})`
                      }}
                    />
                    
                    {/* Target Level Indicator */}
                    <div className="absolute w-full" style={{ bottom: '85%' }}>
                      <div className="h-1 bg-green-500 opacity-50" />
                    </div>
                    
                    {/* Cup */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-4xl">
                      {selectedMachine.cup === 'medium' ? '🥤' : '🥛'}
                    </div>
                  </>
                )}
                
                {!selectedMachine || selectedMachine.id !== machine.id && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    Click to Select
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Control Button */}
        {selectedMachine && (
          <div className="text-center mb-4">
            {!isFilling ? (
              <Button
                onClick={handleStartFilling}
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                START FILLING
              </Button>
            ) : (
              <Button
                onClick={handleStopFilling}
                className="px-12 py-6 text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse"
              >
                STOP!
              </Button>
            )}
          </div>
        )}

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
        gameId={8}
      />
    </div>
  );
}