import React from 'react';
import { motion } from 'framer-motion';
import { xpProgress, STAGE_NAMES } from './petEngine';

const STAT_CONFIG = [
  { key: 'hunger', label: 'Hunger', icon: '🍔', color: 'bg-orange-400' },
  { key: 'thirst', label: 'Thirst', icon: '💧', color: 'bg-sky-400' },
  { key: 'happiness', label: 'Happy', icon: '😊', color: 'bg-yellow-400' },
  { key: 'energy', label: 'Energy', icon: '⚡', color: 'bg-green-400' },
  { key: 'cleanliness', label: 'Clean', icon: '🛁', color: 'bg-cyan-400' },
  { key: 'health', label: 'Health', icon: '❤️', color: 'bg-rose-400' },
];

function StatBar({ stat }) {
  const v = Math.round(stat.value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-6 text-center">{stat.icon}</span>
      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${stat.color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-xs font-medium text-slate-500 w-7 text-right">{v}</span>
    </div>
  );
}

export default function StatsPanel({ pet }) {
  const xp = xpProgress(pet);
  return (
    <div className="bg-white/90 rounded-2xl p-4 shadow-lg border border-purple-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-purple-900 text-lg leading-tight">{pet.name}</h3>
          <p className="text-xs text-purple-500">{STAGE_NAMES[pet.stage]} · Lvl {pet.level}</p>
        </div>
        <div className="text-right">
          <span className="text-yellow-500 font-bold">🪙 {pet.coins}</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-purple-500 mb-1">
          <span>XP</span>
          <span>{xp.current}/{xp.need}</span>
        </div>
        <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            animate={{ width: `${xp.pct}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      <div className="space-y-2">
        {STAT_CONFIG.map(s => (
          <StatBar key={s.key} stat={{ ...s, value: pet.stats[s.key] }} />
        ))}
      </div>
    </div>
  );
}