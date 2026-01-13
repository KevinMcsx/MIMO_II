import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Trophy, BarChart3, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameSelection from '../components/game/GameSelection';
import DifficultySelection from '../components/game/DifficultySelection';
import LanguageSelector from '../components/game/LanguageSelector';
import TutorialModal from '../components/game/TutorialModal';
import { useTranslation } from '../components/utils/translations';
import Game1ColorReaction from '../components/game/Game1ColorReaction';
import Game2ColorShape from '../components/game/Game2ColorShape';
import Game3Memory from '../components/game/Game3Memory';
import Game4ProChallenge from '../components/game/Game4ProChallenge';
import Game5PatternRecognition from '../components/game/Game5PatternRecognition';
import Game6NumberMemory from '../components/game/Game6NumberMemory';
import Game7SequenceMemory from '../components/game/Game7SequenceMemory';
import Game8MathSprint from '../components/game/Game8MathSprint';
import NameEntry from '../components/game/NameEntry';
import LevelDisplay from '../components/game/LevelDisplay';
import { sounds } from '../components/utils/sounds';
import { getPlayerProfile } from '../components/game/PlayerProgressManager';
import { useQuery } from '@tanstack/react-query';

export default function Game() {
  const t = useTranslation();
  const [screen, setScreen] = useState('nameEntry'); // nameEntry, gameSelect, difficultySelect, playing
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [activeKey, setActiveKey] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playerName, setPlayerName] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { data: playerProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['playerProfile', playerName],
    queryFn: () => getPlayerProfile(playerName),
    enabled: !!playerName,
  });

  useEffect(() => {
    setSoundEnabled(sounds.loadSoundPreference());
    const savedName = localStorage.getItem('loopybrainPlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setScreen('gameSelect');
    }
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    sounds.setSoundEnabled(newState);
    sounds.buttonPress();
  };

  const handleNameSubmit = (name) => {
    setPlayerName(name);
    localStorage.setItem('loopybrainPlayerName', name);
    setScreen('gameSelect');
  };

  // Keyboard handling for menus
  useEffect(() => {
    if (screen === 'playing') return;

    const handleKeyDown = (e) => {
      const keyToGame = { '1': 1, '2': 3, '3': 2, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8 };
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
    
    // Check if this is first time playing this game
    const tutorialKey = `loopybrain_tutorial_game${selectedGame}`;
    const hasSeenTutorial = localStorage.getItem(tutorialKey);
    
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem(tutorialKey, 'true');
    } else {
      setScreen('playing');
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setScreen('playing');
  };

  const handleMainMenu = () => {
    setScreen('gameSelect');
    setSelectedGame(null);
    setSelectedDifficulty(null);
    refetchProfile();
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 1:
        return <Game1ColorReaction difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 2:
        return <Game2ColorShape difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 3:
        return <Game3Memory difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 4:
        return <Game4ProChallenge difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 5:
        return <Game5PatternRecognition difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 6:
        return <Game6NumberMemory difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 7:
        return <Game7SequenceMemory difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 8:
        return <Game8MathSprint difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6960edafe7400f149624e055/0cbaa8d79_MIMOBackground.png)',
        }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Top Navigation */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
        {playerProfile && screen !== 'nameEntry' && (
          <LevelDisplay level={playerProfile.level} xp={playerProfile.xp} compact={false} />
        )}
      </div>

      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 flex flex-wrap gap-1 sm:gap-2 justify-end max-w-[50%] sm:max-w-none">
        <LanguageSelector />
        <Link to={createPageUrl('Profile')}>
          <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </Button>
        </Link>
        <Link to={createPageUrl('DailyChallenge')}>
          <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </Button>
        </Link>
        <Link to={createPageUrl('Statistics')}>
          <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </Button>
        </Link>
        <Link to={createPageUrl('Leaderboard')}>
          <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          </Button>
        </Link>
        <Button
          onClick={toggleSound}
          variant="ghost"
          size="icon"
          className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {screen === 'nameEntry' && (
            <motion.div
              key="nameEntry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NameEntry onSubmit={handleNameSubmit} />
            </motion.div>
          )}

          {screen === 'gameSelect' && (
            <motion.div
              key="gameSelect"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GameSelection 
                onSelect={handleGameSelect} 
                activeKey={activeKey}
                unlockedGames={playerProfile?.unlocked_games || [1]}
              />
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
                unlockedDifficulties={playerProfile?.unlocked_difficulties?.[selectedGame] || [1]}
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
            className="absolute bottom-4 sm:bottom-8 text-center px-2"
          >
            <p className="text-slate-700 text-xs sm:text-sm font-medium drop-shadow-sm">
              {t('useKeys')} <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">1</span> 
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">2</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">3</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">4</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">5</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">6</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">7</span>
              <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">8</span> {t('keysToSelect')}
            </p>
            </motion.div>
            )}

            <TutorialModal
            isOpen={showTutorial}
            onClose={handleTutorialClose}
            gameId={selectedGame}
            />
            </div>
            </div>
            );
            }