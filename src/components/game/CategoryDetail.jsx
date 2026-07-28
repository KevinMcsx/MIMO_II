import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Info, Trophy, TrendingUp, Gauge } from 'lucide-react';
import { getCategoryById, getGamesByCategory, getDifficultyStyle } from '@/lib/gameCatalog';
import { getBestScore, getImprovement, hasPlayed } from '@/lib/gameScores';
import { useTranslation } from '../utils/translations';
import TutorialModal from './TutorialModal';

export default function CategoryDetail({ categoryId, onSelect, onBack }) {
  const t = useTranslation();
  const [tutorialGame, setTutorialGame] = useState(null);

  const category = getCategoryById(categoryId);
  if (!category) return null;

  const games = getGamesByCategory(categoryId);

  return (
    <div className="w-full max-w-3xl px-2">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/60 hover:bg-white/80 backdrop-blur-sm text-slate-700 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className={`flex items-center gap-2 ${category.iconBgClass} px-3 py-1.5 rounded-xl`}>
          <category.Icon className={`w-5 h-5 ${category.iconTextClass}`} strokeWidth={2} />
          <h1 className={`text-lg sm:text-xl font-bold ${category.textClass}`}>
            {t(category.nameKey)}
          </h1>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        {category.description}
      </p>

      {/* Games grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {games.map((game, index) => {
          const best = getBestScore(game.gameId);
          const improvement = getImprovement(game.gameId);
          const played = hasPlayed(game.gameId);
          const diffStyle = getDifficultyStyle(game.difficulty);

          return (
            <motion.div
              key={game.gameId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className={`
                relative flex flex-col rounded-2xl p-4 sm:p-5
                bg-white/90 backdrop-blur-sm
                border-2 ${category.borderClass}
                shadow-sm
              `}
            >
              {/* Info button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTutorialGame(game.gameId);
                }}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="How to play"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Title + description */}
              <h3 className={`text-base sm:text-lg font-bold ${category.textClass} pr-8 mb-1`}>
                {game.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                {game.description}
              </p>

              {/* Difficulty + Skill */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${diffStyle.bg} ${diffStyle.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />
                  {game.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  <Gauge className="w-3 h-3" />
                  {game.skill}
                </span>
              </div>

              {/* Best score + improvement */}
              <div className="flex items-center gap-3 mb-3 min-h-[28px]">
                {played ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-slate-700">
                        Best: {best?.toLocaleString()}
                      </span>
                    </div>
                    {improvement > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">
                          +{improvement}%
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">No score yet</span>
                )}
              </div>

              {/* Play button */}
              <button
                onClick={() => onSelect(game.gameId)}
                className={`mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm ${category.accentClass} hover:opacity-90 transition-opacity`}
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Play
              </button>
            </motion.div>
          );
        })}
      </div>

      <TutorialModal
        isOpen={tutorialGame !== null}
        onClose={() => setTutorialGame(null)}
        gameId={tutorialGame}
      />
    </div>
  );
}