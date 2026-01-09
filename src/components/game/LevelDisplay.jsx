import React from 'react';
import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { getCurrentLevelProgress } from './ProgressionSystem';

export default function LevelDisplay({ level, xp, compact = false }) {
  const progress = getCurrentLevelProgress(xp, level);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-full">
        <Star className="w-4 h-4 fill-white" />
        <span className="font-bold text-sm">Level {level}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-purple-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
            {level}
          </div>
          <div>
            <p className="font-bold text-slate-800">Level {level}</p>
            <p className="text-xs text-slate-600">{progress.current} / {progress.needed} XP</p>
          </div>
        </div>
        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
        />
      </div>
      <p className="text-xs text-slate-500 text-center mt-1">{progress.percentage}% to next level</p>
    </div>
  );
}