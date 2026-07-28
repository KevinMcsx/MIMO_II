import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { useTranslation } from '../utils/translations';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const getPlayDates = (playerName) => {
  try {
    const stored = localStorage.getItem(`loopybrain_play_dates_${playerName}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const formatDate = (d) => d.toISOString().split('T')[0];

function calculateStreak(dates) {
  if (!dates || dates.length === 0) return 0;

  const sorted = [...dates].sort();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from today; if not played today, start from yesterday
  let cursor = new Date(today);
  if (!dates.includes(formatDate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (dates.includes(formatDate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateLongestStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const sorted = [...dates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return longest;
}

export default function DailyStreakTracker({ playerName }) {
  const t = useTranslation();

  const playDates = getPlayDates(playerName);
  const currentStreak = calculateStreak(playDates);
  const longestStreak = calculateLongestStreak(playDates);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const playedOn = (d) => playDates.includes(formatDate(d));
  const isToday = (d) => formatDate(d) === formatDate(today);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 mb-6 border-2 border-orange-200 shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12 }}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            currentStreak > 0
              ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-lg'
              : 'bg-slate-200'
          }`}
        >
          <Flame
            className={`w-7 h-7 ${currentStreak > 0 ? 'text-white' : 'text-slate-400'}`}
            fill={currentStreak > 0 ? 'currentColor' : 'none'}
            strokeWidth={2}
          />
        </motion.div>
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            🔥 {t('dailyStreak')}
          </h3>
          <p className="text-sm text-slate-500">
            {currentStreak} {t('daysInARow')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-yellow-100 border-2 border-yellow-300 rounded-full px-3 py-1.5">
          <Trophy className="w-4 h-4 text-yellow-600" fill="currentColor" />
          <span className="text-sm font-black text-yellow-700">{longestStreak}</span>
        </div>
      </div>

      {/* 7-day calendar */}
      <div className="flex justify-between gap-1.5 sm:gap-2">
        {last7Days.map((d, i) => {
          const played = playedOn(d);
          const todayFlag = isToday(d);
          return (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs font-bold text-slate-400">
                {DAY_LABELS[d.getDay()]}
              </span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 200, damping: 14 }}
                className={`
                  w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-black
                  ${played
                    ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-300'}
                  ${todayFlag ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                `}
              >
                {played ? '⭐' : d.getDate()}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}