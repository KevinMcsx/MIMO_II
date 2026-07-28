import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { categories, getGamesByCategory } from '@/lib/gameCatalog';
import { getCategoryProgress } from '@/lib/gameScores';
import { useTranslation } from '../utils/translations';

export default function CategoryCards({ onSelect, activeKey }) {
  const t = useTranslation();

  return (
    <div className="w-full max-w-3xl px-2">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-2 drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]"
      >
        {t('chooseGame')} 🎮
      </motion.h1>
      <p className="text-sm sm:text-base text-white/90 text-center mb-6 font-bold drop-shadow-sm">
        {t('useKeys')} 1–4 {t('keysToSelect')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
        {categories.map((cat, index) => {
          const gameIds = getGamesByCategory(cat.id).map(g => g.gameId);
          const progress = getCategoryProgress(gameIds);
          const isActive = activeKey === String(index + 1);

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.04, rotate: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(cat.id)}
              className={`
                relative flex flex-col items-start text-left
                rounded-3xl p-5 sm:p-6
                ${cat.bgClass}
                border-4 ${cat.borderClass}
                shadow-xl ${cat.cardShadow}
                transition-all duration-200
                ${isActive ? 'ring-4 ring-white scale-[1.04]' : ''}
                overflow-hidden
              `}
            >
              {/* Decorative bubbles */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-6 -left-2 w-16 h-16 bg-white/10 rounded-full" />

              {/* Icon + emoji header */}
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.iconBgClass} flex items-center justify-center backdrop-blur-sm`}>
                  <cat.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-3xl sm:text-4xl">{cat.emoji}</div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow-sm relative z-10">
                {t(cat.nameKey)}
              </h2>
              <div className="inline-flex items-center gap-1 bg-white/25 px-2.5 py-0.5 rounded-full mb-3 relative z-10">
                <span className="text-xs font-bold text-white">
                  {gameIds.length} games
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-white/90 mb-4 leading-relaxed font-medium relative z-10">
                {cat.description}
              </p>

              {/* Progress bar */}
              <div className="w-full relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-black text-white/80 uppercase tracking-wide">
                    ⭐ Progress
                  </span>
                  <span className="text-sm font-black text-white">
                    {progress.played}/{progress.total}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-white/25 rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500 flex items-center justify-end pr-1"
                    style={{ width: `${Math.max(progress.percentage, 8)}%` }}
                  >
                    {progress.percentage > 15 && (
                      <span className="text-[10px] font-black text-slate-700">
                        {progress.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Let's go button */}
              <div className="mt-4 flex items-center gap-1.5 bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-white font-black text-sm relative z-10 self-start">
                Let's Play!
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}