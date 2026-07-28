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
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-2 drop-shadow-sm">
        {t('chooseGame')}
      </h1>
      <p className="text-sm sm:text-base text-slate-700 text-center mb-6 font-medium">
        {t('useKeys')} 1–4 {t('keysToSelect')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {categories.map((cat, index) => {
          const gameIds = getGamesByCategory(cat.id).map(g => g.gameId);
          const progress = getCategoryProgress(gameIds);
          const isActive = activeKey === String(index + 1);

          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(cat.id)}
              className={`
                relative flex flex-col items-start text-left
                rounded-2xl p-5 sm:p-6
                ${cat.bgClass} border-2 ${cat.borderClass}
                shadow-sm transition-all duration-200
                ${isActive ? 'ring-4 ring-white/70 scale-[1.02]' : ''}
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${cat.iconBgClass} flex items-center justify-center`}>
                  <cat.Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${cat.iconTextClass}`} strokeWidth={2} />
                </div>
                <div>
                  <h2 className={`text-lg sm:text-xl font-bold ${cat.textClass}`}>
                    {t(cat.nameKey)}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {gameIds.length} games
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                {cat.description}
              </p>

              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-slate-500">
                    Progress
                  </span>
                  <span className={`text-xs font-bold ${cat.textClass}`}>
                    {progress.played}/{progress.total}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.progressClass} rounded-full transition-all duration-500`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              <div className={`mt-4 flex items-center gap-1 text-sm font-bold ${cat.textClass}`}>
                Explore
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}