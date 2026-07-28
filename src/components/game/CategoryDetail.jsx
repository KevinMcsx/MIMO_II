import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Info, Trophy, TrendingUp, Sparkles } from 'lucide-react';
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
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-sm text-slate-700 font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Category title card */}
      <div className={`flex items-center gap-3 rounded-3xl p-4 sm:p-5 mb-5 ${category.bgClass} border-4 ${category.borderClass} shadow-xl ${category.cardShadow} overflow-hidden relative`}>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${category.iconBgClass} flex items-center justify-center backdrop-blur-sm relative z-10`}>
          <category.Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-4xl sm:text-5xl relative z-10">{category.emoji}</div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">
            {t(category.nameKey)}
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium leading-snug">
            {category.description}
          </p>
        </div>
      </div>

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
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 18 }}
              whileHover={{ scale: 1.03 }}
              className={`
                relative flex flex-col rounded-3xl p-4 sm:p-5
                bg-white/95 backdrop-blur-sm
                border-4 ${category.borderClass}
                shadow-lg
                overflow-hidden
              `}
            >
              {/* Colorful top strip */}
              <div className={`absolute top-0 left-0 right-0 h-2 ${category.bgClass}`} />

              {/* Info button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTutorialGame(game.gameId);
                }}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                aria-label="How to play"
              >
                <Info className="w-4 h-4 text-amber-600" strokeWidth={2.5} />
              </button>

              {/* Title + description */}
              <h3 className={`text-base sm:text-lg font-black text-slate-800 pr-10 mb-1 mt-1`}>
                {game.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3 font-medium">
                {game.description}
              </p>

              {/* Difficulty + Skill badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${diffStyle.bg} ${diffStyle.text} shadow-sm`}>
                  <span>{diffStyle.emoji}</span>
                  {game.difficulty}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${category.iconBgClass} text-white`}>
                  <Sparkles className="w-3 h-3" />
                  {game.skill}
                </span>
              </div>

              {/* Best score + improvement */}
              <div className="flex items-center gap-3 mb-3 min-h-[24px]">
                {played ? (
                  <>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" fill="currentColor" />
                      <span className="text-xs font-black text-amber-700">
                        Best: {best?.toLocaleString()}
                      </span>
                    </div>
                    {improvement > 0 && (
                      <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                        <span className="text-xs font-black text-emerald-600">
                          +{improvement}% better!
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    🌟 Be the first to score!
                  </span>
                )}
              </div>

              {/* Play button */}
              <button
                onClick={() => onSelect(game.gameId)}
                className={`mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-black text-base ${category.accentClass} hover:scale-[1.02] active:scale-95 transition-transform shadow-md`}
              >
                <Play className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                Play!
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