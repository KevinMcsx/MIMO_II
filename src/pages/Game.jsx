import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Trophy, BarChart3, Calendar, User, LogOut, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import GameSelection from '../components/game/GameSelection';
import CategoryCards from '../components/game/CategoryCards';
import CategoryDetail from '../components/game/CategoryDetail';
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
import Game8JuiceMaker from '../components/game/Game8JuiceMaker';
import Game9PatternPrediction from '../components/game/Game9PatternPrediction';
import Game10ShapeSorting from '../components/game/Game10ShapeSorting';
import Game11TwinHunt from '../components/game/Game11TwinHunt';
import Game12QuickCount from '../components/game/Game12QuickCount';
import Game13SpeedMatch from '../components/game/Game13SpeedMatch';
import Game14LightTrack from '../components/game/Game14LightTrack';
import Game15ColorInvaders from '../components/game/Game15ColorInvaders';
import Game16ReverseSequence from '../components/game/Game16ReverseSequence';
import Game17VisualSearch from '../components/game/Game17VisualSearch';
import Game18StroopColor from '../components/game/Game18StroopColor';
import Game19ReactionTarget from '../components/game/Game19ReactionTarget';
import Game20SpeedTap from '../components/game/Game20SpeedTap';
import Game21QuickColor from '../components/game/Game21QuickColor';
import Game22GoNoGo from '../components/game/Game22GoNoGo';
import Game23MemoryMatrix from '../components/game/Game23MemoryMatrix';
import Game24ShapeStack from '../components/game/Game24ShapeStack';
import Game25NBack from '../components/game/Game25NBack';
import Game26OddColor from '../components/game/Game26OddColor';
import Game27OddSize from '../components/game/Game27OddSize';
import Game28SpotDifference from '../components/game/Game28SpotDifference';
import Game29FindMax from '../components/game/Game29FindMax';
import Game30TapOrder from '../components/game/Game30TapOrder';
import Game31MathFlash from '../components/game/Game31MathFlash';
import Game32HigherLower from '../components/game/Game32HigherLower';
import Game33NumberSequence from '../components/game/Game33NumberSequence';
import Game34EvenOdd from '../components/game/Game34EvenOdd';
import Game35ColorSort from '../components/game/Game35ColorSort';
import Game36ShapeMatch from '../components/game/Game36ShapeMatch';
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
  const [selectedCategory, setSelectedCategory] = useState(null);
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
      const keyToCategory = { '1': 'attention', '2': 'tracking', '3': 'memory', '4': 'speed' };
      const keyToDifficulty = { '1': 1, '2': 3, '3': 2, '4': 4 };

      if (screen === 'gameSelect' && keyToCategory[e.key]) {
        setActiveKey(e.key);
        setTimeout(() => {
          setSelectedCategory(keyToCategory[e.key]);
          setScreen('categoryDetail');
          setActiveKey(null);
        }, 200);
      } else if (screen === 'categoryDetail' && e.key === 'Escape') {
        setScreen('gameSelect');
        setSelectedCategory(null);
      } else if (screen === 'difficultySelect' && keyToDifficulty[e.key]) {
        setActiveKey(e.key);
        setTimeout(() => {
          setSelectedDifficulty(keyToDifficulty[e.key]);
          setScreen('playing');
          setActiveKey(null);
        }, 200);
      } else if (e.key === 'Escape' && screen === 'difficultySelect') {
        setScreen('categoryDetail');
        setSelectedGame(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen]);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setScreen('categoryDetail');
  };

  const handleBackToCategories = () => {
    setScreen('gameSelect');
    setSelectedCategory(null);
  };

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
    setSelectedCategory(null);
    refetchProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('loopybrainPlayerName');
    setPlayerName('');
    setScreen('nameEntry');
  };

  const handleSwitchProfile = (name) => {
    localStorage.setItem('loopybrainPlayerName', name);
    setPlayerName(name);
    setScreen('gameSelect');
    refetchProfile();
  };

  const getAllProfiles = () => {
    try {
      const PROFILE_STORAGE_KEY = 'loopybrain_player_profiles';
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      const profiles = stored ? JSON.parse(stored) : {};
      return Object.keys(profiles).filter(name => name !== playerName);
    } catch {
      return [];
    }
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
        return <Game8JuiceMaker difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 9:
        return <Game9PatternPrediction difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 10:
        return <Game10ShapeSorting difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 11:
        return <Game11TwinHunt difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 12:
        return <Game12QuickCount difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 13:
        return <Game13SpeedMatch difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 14:
        return <Game14LightTrack difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 15:
        return <Game15ColorInvaders difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 16:
        return <Game16ReverseSequence difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 17:
        return <Game17VisualSearch difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 18:
        return <Game18StroopColor difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 19:
        return <Game19ReactionTarget difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 20:
        return <Game20SpeedTap difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 21:
        return <Game21QuickColor difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 22:
        return <Game22GoNoGo difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 23:
        return <Game23MemoryMatrix difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 24:
        return <Game24ShapeStack difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 25:
        return <Game25NBack difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 26:
        return <Game26OddColor difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 27:
        return <Game27OddSize difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 28:
        return <Game28SpotDifference difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 29:
        return <Game29FindMax difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 30:
        return <Game30TapOrder difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 31:
        return <Game31MathFlash difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 32:
        return <Game32HigherLower difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 33:
        return <Game33NumberSequence difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 34:
        return <Game34EvenOdd difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 35:
        return <Game35ColorSort difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
      case 36:
        return <Game36ShapeMatch difficulty={selectedDifficulty} onMainMenu={handleMainMenu} playerName={playerName} />;
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 backdrop-blur-sm h-8 w-8 sm:h-10 sm:w-10">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <Link to={createPageUrl('Profile')}>
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                {t('profile')}
              </DropdownMenuItem>
            </Link>

            {getAllProfiles().length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                  <Users className="w-3 h-3 inline mr-1" />
                  {t('switchProfile')}
                </div>
                {getAllProfiles().map((name) => (
                  <DropdownMenuItem key={name} onClick={() => handleSwitchProfile(name)}>
                    <span className="ml-6 text-sm">{name}</span>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pb-40 sm:pb-48">
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
              <CategoryCards
                onSelect={handleCategorySelect}
                activeKey={activeKey}
              />
            </motion.div>
          )}

          {screen === 'categoryDetail' && (
            <motion.div
              key="categoryDetail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl"
            >
              <CategoryDetail
                categoryId={selectedCategory}
                onSelect={handleGameSelect}
                onBack={handleBackToCategories}
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
                  setScreen('categoryDetail');
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

        {/* Footer hints */}
        {screen === 'difficultySelect' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 sm:bottom-8 left-0 right-0 px-4"
          >
            <div className="text-center mb-3">
              <p className="text-slate-700 text-xs sm:text-sm font-medium drop-shadow-sm">
                {t('useKeys')} <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">1</span> 
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">2</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">3</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">4</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">5</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">6</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">7</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded mx-0.5 sm:mx-1 text-xs sm:text-sm">8</span>
                <span className="text-white font-mono bg-slate-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">9</span> {t('keysToSelect')}
              </p>
            </div>

            <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
              <div className="flex items-center gap-1 px-2 py-1 bg-yellow-400/20 rounded-full">
                <span className="text-sm sm:text-base">🟡</span>
                <span className="text-yellow-400 font-bold text-xs">1</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full">
                <span className="text-sm sm:text-base">🔵</span>
                <span className="text-blue-400 font-bold text-xs">2</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                <span className="text-sm sm:text-base">🟢</span>
                <span className="text-green-400 font-bold text-xs">3</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-red-500/20 rounded-full">
                <span className="text-sm sm:text-base">🔴</span>
                <span className="text-red-400 font-bold text-xs">4</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                <span className="text-sm sm:text-base">🟣</span>
                <span className="text-purple-400 font-bold text-xs">5</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 rounded-full">
                <span className="text-sm sm:text-base">🔢</span>
                <span className="text-indigo-400 font-bold text-xs">6</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-teal-500/20 rounded-full">
                <span className="text-sm sm:text-base">🎯</span>
                <span className="text-teal-400 font-bold text-xs">7</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
                <span className="text-sm sm:text-base">🧃</span>
                <span className="text-orange-400 font-bold text-xs">8</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 rounded-full">
                <span className="text-sm sm:text-base">🔮</span>
                <span className="text-pink-400 font-bold text-xs">9</span>
              </div>
            </div>
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