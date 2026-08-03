import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const DAY_REWARDS = [
  { icon: '🪙', label: '50 Coins', coins: 50 },
  { icon: '🍎', label: 'Food Bundle', coins: 20 },
  { icon: '🎩', label: 'Accessory', coins: 30 },
  { icon: '🪙', label: '100 Coins', coins: 100 },
  { icon: '🍬', label: 'Special Treat', coins: 40 },
  { icon: '💎', label: 'Rare Item', coins: 60 },
  { icon: '🎁', label: 'Mystery Reward', coins: 80 },
];

export default function DailyReward({ show, onClaim, streak }) {
  const day = Math.min(streak, 6);
  const reward = DAY_REWARDS[day];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl"
          >
            <h2 className="text-2xl font-black text-purple-900 mb-1">Daily Reward!</h2>
            <p className="text-purple-500 text-sm mb-4">Day {streak} streak 🔥</p>

            <motion.div
              animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-6xl mb-3"
            >
              {reward.icon}
            </motion.div>
            <p className="font-bold text-lg text-purple-800 mb-4">{reward.label}</p>

            <div className="flex justify-center gap-1 mb-4">
              {DAY_REWARDS.slice(0, 7).map((r, i) => (
                <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  i < streak ? 'bg-green-400 text-white' : i === streak ? 'bg-purple-500 text-white' : 'bg-slate-100'
                }`}>
                  {i < streak ? '✓' : i + 1}
                </div>
              ))}
            </div>

            <Button onClick={() => onClaim(reward)} className="w-full bg-purple-600 hover:bg-purple-700">
              Claim Reward
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}