import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Smile, Flame, Skull, ArrowLeft, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../utils/translations';



const gameDescriptions = {
  1: {
    1: '20 shapes • Color buttons only',
    2: '40 shapes • Color buttons only',
    3: '60 shapes • Color buttons only',
    4: '80 shapes • Color buttons only',
  },
  2: {
    1: '20 shapes • Color + Shape buttons',
    2: '40 shapes • Color + Shape buttons',
    3: '60 shapes • Color + Shape buttons',
    4: '80 shapes • Color + Shape buttons',
  },
  3: {
    1: '4 cards • Colors only • 10 rounds',
    2: '6 cards • Shapes only • 10 rounds',
    3: '8 cards • Colored shapes • 10 rounds',
    4: '8 cards • Mixed colors • 10 rounds',
  },
  4: {
    1: '2 min • Slow colors',
    2: '3 min • Slow shapes',
    3: '5 min • Fast mixed',
    4: 'Endless • Speed increases • 5 lives',
  },
  9: {
    1: 'Shapes only • No timer • 10 rounds',
    2: 'Shapes + colors • No timer • 12 rounds',
    3: 'Longer patterns • 2 min • 15 rounds',
    4: 'Expert speed • 75s • 20 rounds',
  },
  10: {
    1: 'Sort by shape • 60s • 20 rounds',
    2: 'Sort by color • 60s • 25 rounds',
    3: 'Shape or color • 50s • 30 rounds',
    4: 'Mixed rules • 40s • 35 rounds',
  },
  11: {
    1: '3×3 grid • 35s • 10 rounds',
    2: '4×4 grid • 40s • 12 rounds',
    3: '4×4 grid • 30s • 15 rounds',
    4: '4×4 grid • 20s • 18 rounds',
  },
  12: {
    1: '3×3 flash • 3s • 10 rounds',
    2: '4×4 flash • 2.5s • 12 rounds',
    3: '4×4 flash • 2s • 15 rounds',
    4: '5×5 flash • 1.5s • 18 rounds',
  },
  13: {
    1: 'Match color • 60s • 20 rounds',
    2: 'Match shape • 60s • 25 rounds',
    3: 'Color or shape • 50s • 30 rounds',
    4: 'Color and shape • 40s • 35 rounds',
  },
  14: {
    1: '3×3 • 3 steps • 8 rounds',
    2: '3×3 • 4 steps • 10 rounds',
    3: '4×4 • 5 steps • 12 rounds',
    4: '4×4 • 6 steps • 15 rounds',
  },
  15: {
    1: '3×3 • 30s • slow spawn',
    2: '3×3 • 35s • medium spawn',
    3: '4×4 • 40s • fast spawn',
    4: '4×4 • 45s • rapid spawn',
  },
  16: {
    1: '3 shapes • 8 rounds',
    2: '4 shapes • 10 rounds',
    3: '5 shapes • 12 rounds',
    4: '6 shapes • 15 rounds',
  },
  17: {
    1: '4×4 grid • 5s/round',
    2: '5×5 grid • 4s/round',
    3: '5×5 grid • 3s/round',
    4: '6×6 grid • 3s/round',
  },
  18: {
    1: 'Low conflict • 60s • 20 rounds',
    2: 'Med conflict • 60s • 25 rounds',
    3: 'Full conflict • 50s • 30 rounds',
    4: 'Full conflict • 40s • 35 rounds',
  },
  19: {
    1: '10 rounds • slow dots',
    2: '12 rounds • medium',
    3: '15 rounds • fast',
    4: '18 rounds • very fast',
  },
  20: {
    1: '20s • big dots',
    2: '25s • medium dots',
    3: '30s • small dots',
    4: '35s • tiny dots',
  },
  21: {
    1: '15 rounds • 4 colors',
    2: '20 rounds • 4 colors',
    3: '25 rounds • 4 colors',
    4: '30 rounds • 4 colors',
  },
  22: {
    1: '30s • slow • low conflict',
    2: '35s • medium',
    3: '40s • high conflict',
    4: '45s • full conflict',
  },
  23: {
    1: '3×3 • 3 cells • 8 rounds',
    2: '4×4 • 4 cells • 10 rounds',
    3: '4×4 • 5 cells • 12 rounds',
    4: '5×5 • 6 cells • 15 rounds',
  },
  24: {
    1: '3 shapes • 8 rounds',
    2: '4 shapes • 10 rounds',
    3: '5 shapes • 12 rounds',
    4: '6 shapes • 15 rounds',
  },
  25: {
    1: '1-back • 12 rounds',
    2: '2-back • 14 rounds',
    3: '2-back • 16 rounds',
    4: '3-back • 18 rounds',
  },
  26: {
    1: '3×3 • 10 rounds',
    2: '4×4 • 12 rounds',
    3: '4×4 • 14 rounds',
    4: '5×5 • 16 rounds',
  },
  27: {
    1: '3×3 • 10 rounds',
    2: '4×4 • 12 rounds',
    3: '4×4 • 14 rounds',
    4: '5×5 • 16 rounds',
  },
  28: {
    1: '3×3 • 8 rounds',
    2: '3×3 • 10 rounds',
    3: '4×4 • 12 rounds',
    4: '4×4 • 14 rounds',
  },
  29: {
    1: '4×4 • 10 rounds',
    2: '5×5 • 12 rounds',
    3: '5×5 • 14 rounds',
    4: '6×6 • 16 rounds',
  },
  30: {
    1: '9 numbers • 8 rounds',
    2: '12 numbers • 10 rounds',
    3: '16 numbers • 12 rounds',
    4: '20 numbers • 14 rounds',
  },
  31: {
    1: '+/- • 12 rounds',
    2: '+/- • 15 rounds',
    3: '+/-/× • 18 rounds',
    4: '+/-/× • 20 rounds',
  },
  32: {
    1: '12 rounds • 1-50',
    2: '15 rounds • 1-80',
    3: '18 rounds • 1-99',
    4: '20 rounds • 1-99',
  },
  33: {
    1: '10 rounds • easy steps',
    2: '12 rounds',
    3: '14 rounds',
    4: '16 rounds • big steps',
  },
  34: {
    1: '15 rounds • 1-20',
    2: '18 rounds • 1-50',
    3: '20 rounds • 1-99',
    4: '25 rounds • 1-999',
  },
  35: {
    1: '15 rounds • 5s',
    2: '18 rounds • 4s',
    3: '22 rounds • 3s',
    4: '25 rounds • 3s',
  },
  36: {
    1: '12 rounds • 6s',
    2: '15 rounds • 5s',
    3: '18 rounds • 4s',
    4: '20 rounds • 3s',
  },
};

export default function DifficultySelection({ gameId, onSelect, onBack, activeKey, unlockedDifficulties = [1, 2, 3, 4] }) {
  const t = useTranslation();
  
  const difficulties = [
    {
      id: 1,
      color: 'yellow',
      title: t('easy'),
      Icon: Baby,
      bg: 'from-yellow-500 to-yellow-600',
      glow: 'shadow-yellow-500/50',
      key: '1',
    },
    {
      id: 2,
      color: 'green',
      title: t('medium'),
      Icon: Smile,
      bg: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/50',
      key: '2',
    },
    {
      id: 3,
      color: 'blue',
      title: t('hard'),
      Icon: Flame,
      bg: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      key: '3',
    },
    {
      id: 4,
      color: 'red',
      title: t('expert'),
      Icon: Skull,
      bg: 'from-red-500 to-red-600',
      glow: 'shadow-red-500/50',
      key: '4',
    },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 sm:gap-6 md:gap-8 w-full max-w-4xl px-2 sm:px-4"
    >
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-2 left-2 sm:top-4 sm:left-4 text-slate-700 hover:text-slate-900 font-semibold bg-white/50 hover:bg-white/70 h-8 sm:h-10 text-xs sm:text-sm"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
        {t('back')}
      </Button>

      <motion.h1
        initial={{ y: -30 }}
        animate={{ y: 0 }}
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight text-center drop-shadow-lg"
      >
        {t('chooseDifficulty')}
      </motion.h1>
      
      <p className="text-sm sm:text-lg md:text-xl text-slate-700 font-semibold text-center drop-shadow-sm">
        {t('useKeys')} 1-4 {t('keysToSelect')}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-6 w-full max-w-2xl">
        {difficulties.map((diff, index) => (
          <motion.button
            key={diff.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(diff.id)}
            className={`
              relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6
              bg-gradient-to-br ${diff.bg}
              shadow-lg sm:shadow-xl ${diff.glow}
              border-2 sm:border-3 md:border-4 border-white/20
              transition-all duration-200
              ${activeKey === diff.key ? 'ring-2 sm:ring-4 ring-white scale-105' : ''}
            `}
          >
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/20 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-1">
              <Keyboard className="w-2 h-2 sm:w-3 sm:h-3" />
              {diff.key}
            </div>
            <diff.Icon className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white/90 mb-2 sm:mb-3" strokeWidth={1.5} />
            <h3 className="text-sm sm:text-lg md:text-2xl font-bold text-white mb-1 sm:mb-2">{diff.title}</h3>
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">{gameDescriptions[gameId]?.[diff.id]}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-4 flex-wrap justify-center">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-yellow-400/20 rounded-full">
          <span className="text-sm sm:text-lg md:text-2xl">🟡</span>
          <span className="text-yellow-400 font-bold text-xs sm:text-sm">{t('easy')}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-green-500/20 rounded-full">
          <span className="text-sm sm:text-lg md:text-2xl">🟢</span>
          <span className="text-green-400 font-bold text-xs sm:text-sm">{t('medium')}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-blue-500/20 rounded-full">
          <span className="text-sm sm:text-lg md:text-2xl">🔵</span>
          <span className="text-blue-400 font-bold text-xs sm:text-sm">{t('hard')}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-red-500/20 rounded-full">
          <span className="text-sm sm:text-lg md:text-2xl">🔴</span>
          <span className="text-red-400 font-bold text-xs sm:text-sm">{t('expert')}</span>
        </div>
      </div>
    </motion.div>
  );
}