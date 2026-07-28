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