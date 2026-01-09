import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameSelection from '../components/game/GameSelection';
import DifficultySelection from '../components/game/DifficultySelection';
import Game1ColorReaction from '../components/game/Game1ColorReaction';
import Game2ColorShape from '../components/game/Game2ColorShape';
import Game3Memory from '../components/game/Game3Memory';
import Game4ProChallenge from '../components/game/Game4ProChallenge';

export default function Game() {
  const [screen, setScreen] = useState('gameSelect'); // gameSelect, difficultySelect, playing
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [activeKey, setActiveKey] = useState(null);

  // Keyboard handling for menus
  useEffect(() => {
    if (screen === 'playing') return;

    const handleKeyDown = (e) => {
      const keyToGame = { '1': 1, '2': 3, '3': 2, '4': 4 };
      const keyToDifficulty = { '1': 1, '2': 3, '3': 2, '4': 4 };

      if (screen === 'gameSelect' && keyToGame[e.key]) {
        setActiveKey(e.key);
        setTimeout(() => {
          setSelectedGame(keyToGame[e.key]);
          setScreen('difficultySelect');
          setActiveKey(null);
        }, 200);
      } else if (screen === 'difficultySelect' && keyToDifficulty[e.key]) {
        setActiveKey(e.key);
        setTimeout(() => {
          setSelectedDifficulty(keyToDifficulty[e.key]);
          setScreen('playing');
          setActiveKey(null);
        }, 200);
      } else if (e.key === 'Escape' && screen === 'difficultySelect') {
        setScreen('gameSelect');
        setSelectedGame(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
    setScreen('difficultySelect');
  };

  const handleDifficultySelect = (difficultyId) => {
    setSelectedDifficulty(difficultyId);
    setScreen('playing');
  };

  const handleMainMenu = () => {
    setScreen('gameSelect');
    setSelectedGame(null);
    setSelectedDifficulty(null);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 1:
        return <Game1ColorReaction difficulty={selectedDifficulty} onMainMenu={handleMainMenu} />;
      case 2:
        return <Game2ColorShape difficulty={selectedDifficulty} onMainMenu={handleMainMenu} />;
      case 3:
        return <Game3Memory difficulty={selectedDifficulty} onMainMenu={handleMainMenu} />;
      case 4:
        return <Game4ProChallenge difficulty={selectedDifficulty} onMainMenu={handleMainMenu} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {screen === 'gameSelect' && (
            <motion.div
              key="gameSelect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GameSelection onSelect={handleGameSelect} activeKey={activeKey} />
            </motion.div>
          )}

          {screen === 'difficultySelect' && (
            <motion.div
              key="difficultySelect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              <DifficultySelection
                gameId={selectedGame}
                onSelect={handleDifficultySelect}
                onBack={() => {
                  setScreen('gameSelect');
                  setSelectedGame(null);
                }}
                activeKey={activeKey}
              />
            </motion.div>
          )}

          {screen === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl"
            >
              {renderGame()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hint */}
        {screen !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-slate-500 text-sm">
              Use <span className="text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">1</span> 
              <span className="text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded mx-1">2</span>
              <span className="text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded mx-1">3</span>
              <span className="text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded">4</span> keys to select
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}