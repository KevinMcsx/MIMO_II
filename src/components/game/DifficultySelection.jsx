import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Smile, Flame, Skull, ArrowLeft } from 'lucide-react';
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
      className="flex flex-col items-center gap-8"
    >
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-4 left-4 text-slate-700 hover:text-slate-900 font-semibold bg-white/50 hover:bg-white/70"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t('back')}
      </Button>

      <motion.h1
        initial={{ y: -30 }}
        animate={{ y: 0 }}
        className="text-5xl font-black text-white tracking-tight text-center drop-shadow-lg"
      >
        {t('chooseDifficulty')}
      </motion.h1>
      
      <p className="text-xl text-slate-700 font-semibold text-center drop-shadow-sm">
        {t('useKeys')} 1-4 {t('keysToSelect')}
      </p>

      <div className="grid grid-cols-2 gap-6 max-w-2xl w-full px-4">
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
              relative overflow-hidden rounded-3xl p-6
              bg-gradient-to-br ${diff.bg}
              shadow-xl ${diff.glow}
              border-4 border-white/20
              transition-all duration-200
              ${activeKey === diff.key ? 'ring-4 ring-white scale-105' : ''}
            `}
          >
            <div className="absolute top-2 right-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">
              Key: {diff.key}
            </div>
            <diff.Icon className="w-14 h-14 text-white/90 mb-3" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-white mb-2">{diff.title}</h3>
            <p className="text-white/80 text-sm">{gameDescriptions[gameId]?.[diff.id]}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/20 rounded-full">
          <span className="text-2xl">🟡</span>
          <span className="text-yellow-400 font-bold">{t('easy')}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
          <span className="text-2xl">🟢</span>
          <span className="text-green-400 font-bold">{t('medium')}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full">
          <span className="text-2xl">🔵</span>
          <span className="text-blue-400 font-bold">{t('hard')}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
          <span className="text-2xl">🔴</span>
          <span className="text-red-400 font-bold">{t('expert')}</span>
        </div>
      </div>
    </motion.div>
  );
}