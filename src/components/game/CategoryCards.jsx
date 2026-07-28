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
        className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-center mb-1 drop-shadow-[0_3px_0_rgba(0,0,0,0.2)]"
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
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 14 }}
              whileHover={{ scale: 1.05, rotate: -1.5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat.id)}
              className={`
                relative flex flex-col items-start text-left
                rounded-[1.75rem] p-5 sm:p-6
                ${cat.bgClass}
                border-4 border-white/50
                shadow-2xl ${cat.cardShadow}
                transition-all duration-200
                ${isActive ? 'ring-4 ring-white scale-[1.05]' : ''}
                overflow-hidden
              `}
            >
              {/* Big decorative shapes */}
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/15 rounded-full" />
              <div className="absolute -bottom-10 -left-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute top-1/2 right-4 w-3 h-3 bg-white/25 rounded-full" />
              <div className="absolute bottom-12 right-8 w-2 h-2 bg-white/30 rounded-full" />
              <div className="absolute top-16 left-1/2 w-4 h-4 bg-white/10 rounded-full" />

              {/* Number badge */}
              <div className="absolute top-4 right-4 w-9 h-9 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 relative z-10">
                <span className="text-base font-black text-white drop-shadow-sm">{index + 1}</span>
              </div>

              {/* Icon + emoji header */}
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${cat.iconBgClass} flex items-center justify-center backdrop-blur-sm border-2 border-white/30`}>
                  <cat.Icon className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.5} />
                </div>
                <div className="text-4xl sm:text-5xl drop-shadow-sm">{cat.emoji}</div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow-[0_2px_0_rgba(0,0,0,0.15)] relative z-10">
                {t(cat.nameKey)}
              </h2>
              <div className="inline-flex items-center gap-1 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full mb-3 relative z-10 border border-white/20">
                <span className="text-xs font-black text-white">
                  🎯 {gameIds.length} {t('gamesLabel')}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-white/95 mb-4 leading-relaxed font-semibold relative z-10">
                {t(cat.descKey)}
              </p>

              {/* Progress bar */}
              <div className="w-full relative z-10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-black text-white/90 uppercase tracking-wide">
                    ⭐ {t('progressLabel')}
                  </span>
                  <span className="text-sm font-black text-white drop-shadow-sm">
                    {progress.played}/{progress.total}
                  </span>
                </div>
                <div className="w-full h-4 bg-white/25 rounded-full overflow-hidden border-2 border-white/20">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500 flex items-center justify-end pr-1.5"
                    style={{ width: `${Math.max(progress.percentage, 10)}%` }}
                  >
                    {progress.percentage > 18 && (
                      <span className="text-[10px] font-black text-slate-700">
                        {progress.percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Let's go button */}
              <div className="mt-4 flex items-center gap-1.5 bg-white text-slate-700 px-5 py-2.5 rounded-full font-black text-sm relative z-10 self-start shadow-lg hover:scale-105 transition-transform">
                {t('letsPlay')}
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}