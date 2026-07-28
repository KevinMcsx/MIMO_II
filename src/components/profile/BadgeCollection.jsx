import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { getAllLocalScores } from '@/lib/gameScores';
import { useTranslation } from '../utils/translations';

const ACHIEVEMENT_BADGES = [
  { id: 'first_game', emoji: '🎮', name: 'First Steps', desc: 'Play your first game', color: 'from-blue-400 to-cyan-400', check: (s) => s.totalGames >= 1 },
  { id: 'ten_games', emoji: '🎯', name: 'Getting Started', desc: 'Play 10 games', color: 'from-green-400 to-emerald-400', check: (s) => s.totalGames >= 10 },
  { id: 'fifty_games', emoji: '🏆', name: 'Dedicated', desc: 'Play 50 games', color: 'from-yellow-400 to-orange-400', check: (s) => s.totalGames >= 50 },
  { id: 'score_500', emoji: '⭐', name: 'Star Player', desc: 'Score 500 points', color: 'from-purple-400 to-pink-400', check: (s) => s.bestScore >= 500 },
  { id: 'score_1000', emoji: '🌟', name: 'Rising Star', desc: 'Score 1,000 points', color: 'from-pink-400 to-rose-400', check: (s) => s.bestScore >= 1000 },
  { id: 'score_5000', emoji: '💫', name: 'Superstar', desc: 'Score 5,000 points', color: 'from-indigo-400 to-purple-400', check: (s) => s.bestScore >= 5000 },
  { id: 'streak_3', emoji: '🔥', name: 'On Fire', desc: '3-day streak', color: 'from-orange-400 to-red-400', check: (s) => s.longestStreak >= 3 },
  { id: 'streak_7', emoji: '🌈', name: 'Rainbow Warrior', desc: '7-day streak', color: 'from-cyan-400 to-blue-400', check: (s) => s.longestStreak >= 7 },
  { id: 'streak_14', emoji: '👑', name: 'Unstoppable', desc: '14-day streak', color: 'from-yellow-400 to-amber-400', check: (s) => s.longestStreak >= 14 },
  { id: 'accuracy_80', emoji: '🎖️', name: 'Sharp Shooter', desc: '80% accuracy', color: 'from-green-400 to-teal-400', check: (s) => s.bestAccuracy >= 80 },
  { id: 'accuracy_90', emoji: '🏅', name: 'Pinpoint', desc: '90% accuracy', color: 'from-teal-400 to-cyan-400', check: (s) => s.bestAccuracy >= 90 },
  { id: 'speed_500', emoji: '⚡', name: 'Quick Draw', desc: 'React under 500ms', color: 'from-yellow-400 to-orange-400', check: (s) => s.bestReaction > 0 && s.bestReaction <= 500 },
  { id: 'speed_300', emoji: '🚀', name: 'Speed Demon', desc: 'React under 300ms', color: 'from-red-400 to-pink-400', check: (s) => s.bestReaction > 0 && s.bestReaction <= 300 },
  { id: 'level_5', emoji: '🎖️', name: 'Level 5 Hero', desc: 'Reach level 5', color: 'from-purple-400 to-indigo-400', check: (s) => s.level >= 5 },
  { id: 'level_10', emoji: '🏅', name: 'Level 10 Master', desc: 'Reach level 10', color: 'from-amber-400 to-yellow-400', check: (s) => s.level >= 10 },
];

function computeStats(playerName, level) {
  const scores = getAllLocalScores();
  const playerScores = scores.filter(s => !playerName || s.player_name === playerName);

  const totalGames = playerScores.length;
  const bestScore = totalGames > 0 ? Math.max(...playerScores.map(s => s.score || 0)) : 0;
  const reactionScores = playerScores.filter(s => s.avg_reaction_time > 0);
  const bestReaction = reactionScores.length > 0 ? Math.min(...reactionScores.map(s => s.avg_reaction_time)) : 0;

  let bestAccuracy = 0;
  playerScores.forEach(s => {
    const total = (s.correct_hits || 0) + (s.wrong_hits || 0);
    if (total > 0) {
      const acc = (s.correct_hits / total) * 100;
      if (acc > bestAccuracy) bestAccuracy = acc;
    }
  });

  let longestStreak = 0;
  try {
    const stored = localStorage.getItem(`loopybrain_play_dates_${playerName}`);
    const dates = stored ? JSON.parse(stored) : [];
    if (dates.length > 0) {
      const sorted = [...dates].sort();
      let current = 1;
      longestStreak = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          current++;
          longestStreak = Math.max(longestStreak, current);
        } else if (diff > 1) {
          current = 1;
        }
      }
    }
  } catch { /* ignore */ }

  return { totalGames, bestScore, bestReaction, bestAccuracy, longestStreak, level };
}

export default function BadgeCollection({ playerName, level = 1 }) {
  const t = useTranslation();
  const stats = computeStats(playerName, level);
  const earnedCount = ACHIEVEMENT_BADGES.filter(b => b.check(stats)).length;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 mb-6 border-2 border-purple-200 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
          <span className="text-2xl">🏅</span>
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800">{t('achievements')}</h3>
          <p className="text-sm text-slate-500">{earnedCount} / {ACHIEVEMENT_BADGES.length} {t('badgesEarned')}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {ACHIEVEMENT_BADGES.map((badge, i) => {
          const earned = badge.check(stats);
          return (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 14 }}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2
                ${earned
                  ? `bg-gradient-to-br ${badge.color} border-white/50 shadow-lg`
                  : 'bg-slate-100 border-slate-200 opacity-60'}
              `}
            >
              {earned ? (
                <span className="text-3xl sm:text-4xl drop-shadow-sm">{badge.emoji}</span>
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
              )}
              <p className={`text-xs font-black text-center leading-tight ${earned ? 'text-white drop-shadow-sm' : 'text-slate-400'}`}>
                {badge.name}
              </p>
              <p className={`text-[10px] text-center leading-tight hidden sm:block ${earned ? 'text-white/80' : 'text-slate-400'}`}>
                {badge.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}