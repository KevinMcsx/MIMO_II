import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { getCurrentLevelProgress } from './ProgressionSystem';
import { useTranslation } from '../utils/translations';

export default function LevelDisplay({ level, xp, compact = false }) {
  const t = useTranslation();
  const progress = getCurrentLevelProgress(xp, level);
  
  if (compact) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
        <span className="font-bold text-xs sm:text-sm">{t('level')} {level}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 shadow-lg border border-purple-300 sm:border-2 max-w-[180px] sm:max-w-none">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-base">
            {level}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs sm:text-base">{t('level')} {level}</p>
            <p className="text-[10px] sm:text-xs text-slate-600">{progress.current} / {progress.needed} XP</p>
          </div>
        </div>
        <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
        />
      </div>
      <p className="text-[10px] sm:text-xs text-slate-500 text-center mt-0.5 sm:mt-1">{progress.percentage}% {t('toNextLevel')}</p>
    </div>
  );
}