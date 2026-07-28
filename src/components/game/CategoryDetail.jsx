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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/70 hover:bg-white/90 backdrop-blur-sm text-slate-700 font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          Back
        </button>
      </div>

      {/* Category title card */}
      <div className={`flex items-center gap-3 rounded-[1.5rem] p-4 sm:p-5 mb-5 ${category.bgClass} border-4 border-white/50 shadow-2xl ${category.cardShadow} overflow-hidden relative`}>
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/15 rounded-full" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 bg-white/10 rounded-full" />
        <div className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl ${category.iconBgClass} flex items-center justify-center backdrop-blur-sm border-2 border-white/30 relative z-10`}>
          <category.Icon className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-4xl sm:text-5xl relative z-10 drop-shadow-sm">{category.emoji}</div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]">
            {t(category.nameKey)}
          </h1>
          <p className="text-xs sm:text-sm text-white/95 font-semibold leading-snug">
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
              initial={{ opacity: 0, y: 30, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 16 }}
              whileHover={{ scale: 1.04 }}
              className={`
                relative flex flex-col rounded-[1.5rem] p-4 sm:p-5
                ${category.bgClass}
                border-4 border-white/50
                shadow-xl
                overflow-hidden
              `}
            >
              {/* Decorative shapes */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-white/10 rounded-full" />

              {/* Info button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTutorialGame(game.gameId);
                }}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/30 hover:bg-white/50 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-2 border-white/40 relative z-10"
                aria-label="How to play"
              >
                <Info className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>

              {/* Title */}
              <h3 className={`text-base sm:text-lg font-black text-white pr-10 mb-1 mt-1 drop-shadow-sm relative z-10`}>
                {game.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-3 font-medium relative z-10">
                {game.description}
              </p>

              {/* Difficulty + Skill badges */}
              <div className="flex flex-wrap gap-2 mb-3 relative z-10">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${diffStyle.bg} ${diffStyle.text} shadow-sm`}>
                  <span>{diffStyle.emoji}</span>
                  {game.difficulty}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/30 backdrop-blur-sm text-white border border-white/20">
                  <Sparkles className="w-3 h-3" />
                  {game.skill}
                </span>
              </div>

              {/* Best score + improvement */}
              <div className="flex items-center gap-2 mb-3 min-h-[24px] flex-wrap relative z-10">
                {played ? (
                  <>
                    <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                      <Trophy className="w-3.5 h-3.5 text-white" fill="currentColor" />
                      <span className="text-xs font-black text-white">
                        Best: {best?.toLocaleString()}
                      </span>
                    </div>
                    {improvement > 0 && (
                      <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                        <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                        <span className="text-xs font-black text-white">
                          +{improvement}%!
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-white/80 font-bold flex items-center gap-1">
                    🌟 Be the first to score!
                  </span>
                )}
              </div>

              {/* Play button */}
              <button
                onClick={() => onSelect(game.gameId)}
                className={`mt-auto flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-slate-700 font-black text-base hover:scale-[1.03] active:scale-95 transition-transform shadow-lg relative z-10`}
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