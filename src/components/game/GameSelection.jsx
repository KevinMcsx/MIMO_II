import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Shapes, Brain, Zap, Keyboard, Info, TrendingUp, Filter, Copy, Hash } from 'lucide-react';
import { useTranslation } from '../utils/translations';
import TutorialModal from './TutorialModal';

export default function GameSelection({ onSelect, activeKey, unlockedGames = [1, 2, 3, 4] }) {
  const t = useTranslation();
  const [tutorialGame, setTutorialGame] = useState(null);
  
  const games = [
    {
      id: 1,
      color: 'yellow',
      title: t('colorReaction'),
      description: t('game1Desc'),
      Icon: Palette,
      bg: 'from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/50',
      key: '1',
    },
    {
      id: 2,
      color: 'green',
      title: t('colorShape'),
      description: t('game2Desc'),
      Icon: Shapes,
      bg: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/50',
      key: '3',
    },
    {
      id: 3,
      color: 'blue',
      title: t('memoryMatch'),
      description: t('game3Desc'),
      Icon: Brain,
      bg: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      key: '2',
    },
    {
      id: 4,
      color: 'red',
      title: t('proChallenge'),
      description: t('game4Desc'),
      Icon: Zap,
      bg: 'from-red-500 to-red-600',
      glow: 'shadow-red-500/50',
      key: '4',
    },
    {
      id: 5,
      color: 'purple',
      title: t('patternRecognition'),
      description: t('game5Desc'),
      Icon: Shapes,
      bg: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/50',
      key: '5',
    },
    {
      id: 6,
      color: 'indigo',
      title: t('numberMemory'),
      description: t('game6Desc'),
      Icon: Brain,
      bg: 'from-indigo-500 to-indigo-600',
      glow: 'shadow-indigo-500/50',
      key: '6',
    },
    {
      id: 7,
      color: 'teal',
      title: t('sequenceMemory'),
      description: t('game7Desc'),
      Icon: Shapes,
      bg: 'from-teal-500 to-teal-600',
      glow: 'shadow-teal-500/50',
      key: '7',
    },
    {
      id: 8,
      color: 'orange',
      title: t('juiceMaker'),
      description: t('game8Desc'),
      Icon: Zap,
      bg: 'from-orange-500 to-yellow-500',
      glow: 'shadow-orange-500/50',
      key: '8',
    },
    {
      id: 9,
      color: 'pink',
      title: t('patternPrediction'),
      description: t('game9Desc'),
      Icon: TrendingUp,
      bg: 'from-pink-500 to-rose-600',
      glow: 'shadow-pink-500/50',
      key: '9',
    },
    {
      id: 10,
      color: 'cyan',
      title: t('shapeSorting'),
      description: t('game10Desc'),
      Icon: Filter,
      bg: 'from-cyan-500 to-cyan-600',
      glow: 'shadow-cyan-500/50',
      key: '10',
    },
    {
      id: 11,
      color: 'lime',
      title: t('twinHunt'),
      description: t('game11Desc'),
      Icon: Copy,
      bg: 'from-lime-500 to-lime-600',
      glow: 'shadow-lime-500/50',
      key: '11',
    },
    {
      id: 12,
      color: 'fuchsia',
      title: t('quickCount'),
      description: t('game12Desc'),
      Icon: Hash,
      bg: 'from-fuchsia-500 to-fuchsia-600',
      glow: 'shadow-fuchsia-500/50',
      key: '12',
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 sm:gap-6 md:gap-8 w-full max-w-4xl px-2 sm:px-4"
    >
      <motion.h1
        initial={{ y: -30 }}
        animate={{ y: 0 }}
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight text-center drop-shadow-lg"
      >
        {t('chooseGame')}
      </motion.h1>
      
      <p className="text-sm sm:text-lg md:text-xl text-slate-700 font-semibold text-center drop-shadow-sm">
        {t('useKeys')} 1-9 {t('keysToSelect')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 w-full max-w-4xl">
        {games.map((game, index) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(game.id)}
            className={`
              relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6
              bg-gradient-to-br ${game.bg}
              shadow-lg sm:shadow-xl ${game.glow}
              border-2 sm:border-3 md:border-4 border-white/20
              transition-all duration-200
              ${activeKey === game.key ? 'ring-2 sm:ring-4 ring-white scale-105' : ''}
            `}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTutorialGame(game.id);
              }}
              className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-white/30 hover:bg-white/40 p-1.5 sm:p-2 rounded-full transition-colors z-10"
              aria-label="How to play"
            >
              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </button>
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-1">
              <Keyboard className="w-2 h-2 sm:w-3 sm:h-3" />
              {game.key}
            </div>
            <game.Icon className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white/90 mb-2 sm:mb-3 md:mb-4" strokeWidth={1.5} />
            <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-white mb-1 sm:mb-2">{game.title}</h3>
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">{game.description}</p>
          </motion.button>
        ))}
      </div>

      <TutorialModal
        isOpen={tutorialGame !== null}
        onClose={() => setTutorialGame(null)}
        gameId={tutorialGame}
      />
      </motion.div>
      );
      }