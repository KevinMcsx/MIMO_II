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
  { id: 'orange', name: 'Orange', color: '#FF8C00', emoji: '🍊' },
  { id: 'apple', name: 'Apple', color: '#FF4444', emoji: '🍎' },
  { id: 'grape', name: 'Grape', color: '#9333EA', emoji: '🍇' },
  { id: 'lemon', name: 'Lemon', color: '#FFD700', emoji: '🍋' },
  { id: 'strawberry', name: 'Strawberry', color: '#FF1493', emoji: '🍓' },
  { id: 'kiwi', name: 'Kiwi', color: '#00FF85', emoji: '🥝' },
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
  
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedCup, setSelectedCup] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);

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
      generateInitialOrders();
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

  const initializeMachines = () => {
    const machinesList = [];
    for (let i = 0; i < settings.machines; i++) {
      machinesList.push({
        id: i,
        state: 'empty', // empty, filling, filled
        cup: null,
        ingredients: [],
        fillLevel: 0,
        fillStartTime: null,
        assignedOrder: null,
      });
    }
    setMachines(machinesList);
  };

  const generateInitialOrders = () => {
    const initialOrders = [];
    for (let i = 0; i < settings.machines; i++) {
      initialOrders.push(generateOrder(i));
    }
    setOrders(initialOrders);
  };

  const generateOrder = (id) => {
    const numIngredients = Math.floor(Math.random() * settings.maxIngredients) + 1;
    const orderIngredients = [];
    const availableIngredients = [...ingredients];
    
    for (let i = 0; i < numIngredients; i++) {
      const randomIndex = Math.floor(Math.random() * availableIngredients.length);
      orderIngredients.push(availableIngredients[randomIndex]);
      availableIngredients.splice(randomIndex, 1);
    }
    
    const cupSize = Math.random() > 0.5 ? 'medium' : 'big';
    
    return {
      id,
      ingredients: orderIngredients,
      cup: cupSize,
      createdAt: Date.now(),
    };
  };

  useEffect(() => {
    if (gameState !== 'playing' || paused) return;

    const interval = setInterval(() => {
      setMachines(prevMachines => 
        prevMachines.map(machine => {
          if (machine.state === 'filling') {
            const elapsed = Date.now() - machine.fillStartTime;
            const fillTime = machine.cup === 'medium' ? 8000 : 12000;
            const newLevel = Math.min((elapsed / fillTime) * 100, 100);
            
            return { ...machine, fillLevel: newLevel };
          }
          return machine;
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, paused]);

  const handleMachineSelect = (machineId) => {
    const machine = machines[machineId];
    
    if (machine.state === 'filled') {
      // Complete the order
      completeOrder(machineId);
    } else if (machine.state === 'empty') {
      // Select this machine to prepare order
      setSelectedMachine(machineId);
      setSelectedCup(null);
      setSelectedIngredients([]);
    } else if (machine.state === 'filling') {
      // Stop filling and check if complete
      stopFilling(machineId);
    }
  };

  const handleCupSelect = (cupSize) => {
    if (selectedMachine === null) return;
    setSelectedCup(cupSize);
  };

  const handleIngredientSelect = (ingredient) => {
    if (selectedMachine === null || !selectedCup) return;
    
    const machine = machines[selectedMachine];
    if (machine.state !== 'empty') return;

    if (selectedIngredients.find(ing => ing.id === ingredient.id)) {
      setSelectedIngredients(selectedIngredients.filter(ing => ing.id !== ingredient.id));
    } else {
      if (selectedIngredients.length < settings.maxIngredients) {
        setSelectedIngredients([...selectedIngredients, ingredient]);
      }
    }
  };

  const startFilling = () => {
    if (selectedMachine === null || !selectedCup || selectedIngredients.length === 0) return;

    const newMachines = [...machines];
    newMachines[selectedMachine] = {
      ...newMachines[selectedMachine],
      state: 'filling',
      cup: selectedCup,
      ingredients: selectedIngredients,
      fillStartTime: Date.now(),
      fillLevel: 0,
    };
    
    setMachines(newMachines);
    setSelectedMachine(null);
    setSelectedCup(null);
    setSelectedIngredients([]);
    sounds.buttonPress();
  };

  const stopFilling = (machineId) => {
    const machine = machines[machineId];
    const targetLevel = 90;
    const tolerance = 15;
    
    if (machine.fillLevel >= (targetLevel - tolerance) && machine.fillLevel <= 100) {
      const newMachines = [...machines];
      newMachines[machineId] = {
        ...newMachines[machineId],
        state: 'filled',
        fillLevel: machine.fillLevel,
      };
      setMachines(newMachines);
      sounds.correctHit();
    } else {
      // Failed - reset machine
      const newMachines = [...machines];
      newMachines[machineId] = {
        ...newMachines[machineId],
        state: 'empty',
        cup: null,
        ingredients: [],
        fillLevel: 0,
        fillStartTime: null,
      };
      setMachines(newMachines);
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 50));
      sounds.wrongHit();
    }
  };

  const completeOrder = (machineId) => {
    const machine = machines[machineId];
    
    // Find matching order
    const matchingOrderIndex = orders.findIndex(order => {
      if (order.cup !== machine.cup) return false;
      if (order.ingredients.length !== machine.ingredients.length) return false;
      
      return order.ingredients.every(orderIng => 
        machine.ingredients.some(machineIng => machineIng.id === orderIng.id)
      );
    });

    if (matchingOrderIndex !== -1) {
      const reactionTime = Date.now() - orders[matchingOrderIndex].createdAt;
      setReactionTimes([...reactionTimes, reactionTime]);
      
      sounds.correctHit();
      const accuracyBonus = Math.floor((100 - Math.abs(machine.fillLevel - 90)) * 2);
      setScore(score + 100 + accuracyBonus);
      setCorrectCount(correctCount + 1);
      
      // Remove completed order and add new one if needed
      const newOrders = [...orders];
      newOrders.splice(matchingOrderIndex, 1);
      
      if (correctCount + 1 < settings.totalOrders) {
        newOrders.push(generateOrder(Date.now()));
      }
      
      setOrders(newOrders);
      
      if (correctCount + 1 >= settings.totalOrders) {
        endGame();
      }
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 50));
    }

    // Reset machine
    const newMachines = [...machines];
    newMachines[machineId] = {
      ...newMachines[machineId],
      state: 'empty',
      cup: null,
      ingredients: [],
      fillLevel: 0,
      fillStartTime: null,
    };
    setMachines(newMachines);
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
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-6xl w-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xl font-bold text-slate-800">
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

        {/* Orders Queue */}
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-700 mb-2">📋 Current Orders:</p>
          <div className="flex gap-3 flex-wrap">
            {orders.map((order) => (
              <div key={order.id} className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-3 border-2 border-orange-300 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{order.cup === 'medium' ? '🥤' : '🥛'}</span>
                  <span className="text-xs font-bold text-slate-700">{order.cup === 'medium' ? 'Medium (8s)' : 'Big (12s)'}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {order.ingredients.map((ing, idx) => (
                    <span key={idx} className="text-lg">{ing.emoji}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machines */}
        <div className={`grid gap-3 mb-4 ${settings.machines === 2 ? 'grid-cols-2' : settings.machines === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {machines.map((machine) => (
            <motion.button
              key={machine.id}
              onClick={() => handleMachineSelect(machine.id)}
              className={`relative bg-gradient-to-b from-slate-200 to-slate-300 rounded-2xl p-4 border-4 transition-all ${
                selectedMachine === machine.id 
                  ? 'border-orange-500 shadow-lg scale-105' 
                  : machine.state === 'filled'
                  ? 'border-green-500 shadow-lg'
                  : 'border-slate-400 hover:border-orange-300'
              }`}
            >
              <p className="text-xs font-bold text-slate-600 mb-2">Machine {machine.id + 1}</p>
              
              {/* Juice Machine Visual */}
              <div className="relative bg-slate-100 rounded-xl h-32 border-2 border-slate-400 overflow-hidden">
                {machine.state !== 'empty' && (
                  <>
                    {/* Fill Progress */}
                    <motion.div
                      className="absolute bottom-0 w-full"
                      style={{ 
                        height: `${machine.fillLevel}%`,
                        background: machine.ingredients.length > 1 
                          ? `linear-gradient(to top, ${machine.ingredients[0]?.color || '#FF8C00'}, ${machine.ingredients[machine.ingredients.length - 1]?.color || '#FFD700'})`
                          : machine.ingredients[0]?.color || '#FF8C00'
                      }}
                    />
                    
                    {/* Target Level Indicator */}
                    {machine.state === 'filling' && (
                      <div className="absolute w-full" style={{ bottom: '85%' }}>
                        <div className="h-1 bg-green-500 opacity-50" />
                      </div>
                    )}
                    
                    {/* Cup */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-3xl">
                      {machine.cup === 'medium' ? '🥤' : '🥛'}
                    </div>

                    {/* Ingredients Display */}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {machine.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-sm">{ing.emoji}</span>
                      ))}
                    </div>
                  </>
                )}
                
                {machine.state === 'empty' && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
                    {selectedMachine === machine.id ? 'Selected' : 'Click to Select'}
                  </div>
                )}

                {machine.state === 'filled' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                )}
              </div>

              <p className="text-xs font-bold text-slate-600 mt-1">
                {machine.state === 'empty' ? 'Empty' : machine.state === 'filling' ? 'Filling...' : 'Ready!'}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Control Panel */}
        <div className="bg-slate-100 rounded-2xl p-4 border-2 border-slate-300">
          <div className="flex gap-4">
            {/* Cup Selection */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Select Cup Size:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCupSelect('medium')}
                  disabled={selectedMachine === null}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCup === 'medium'
                      ? 'bg-orange-500 text-white scale-105'
                      : 'bg-white text-slate-700 hover:bg-orange-100'
                  } ${selectedMachine === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🥤 Medium (8s)
                </button>
                <button
                  onClick={() => handleCupSelect('big')}
                  disabled={selectedMachine === null}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCup === 'big'
                      ? 'bg-orange-500 text-white scale-105'
                      : 'bg-white text-slate-700 hover:bg-orange-100'
                  } ${selectedMachine === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  🥛 Big (12s)
                </button>
              </div>
            </div>

            {/* Ingredients Selection */}
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-700 mb-2">Select Ingredients (max {settings.maxIngredients}):</p>
              <div className="flex gap-2 flex-wrap">
                {ingredients.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => handleIngredientSelect(ing)}
                    disabled={selectedMachine === null || !selectedCup}
                    className={`px-3 py-2 rounded-lg font-bold transition-all ${
                      selectedIngredients.find(i => i.id === ing.id)
                        ? 'bg-gradient-to-r scale-105 text-white'
                        : 'bg-white text-slate-700 hover:scale-105'
                    } ${selectedMachine === null || !selectedCup ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      background: selectedIngredients.find(i => i.id === ing.id)
                        ? ing.color
                        : 'white'
                    }}
                  >
                    <span className="text-lg">{ing.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="flex items-end">
              <Button
                onClick={startFilling}
                disabled={selectedMachine === null || !selectedCup || selectedIngredients.length === 0}
                className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                START
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-around text-center mt-4">
          <div>
            <p className="text-xl font-bold text-green-600">✓ {correctCount}</p>
            <p className="text-xs text-slate-600">{t('correct')}</p>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">✗ {wrongCount}</p>
            <p className="text-xs text-slate-600">{t('wrong')}</p>
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