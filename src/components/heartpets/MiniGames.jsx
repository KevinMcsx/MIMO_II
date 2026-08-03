import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TreatCatchGame from './TreatCatchGame';
import HideSeekGame from './HideSeekGame';

const GAMES = [
  { id: 'treatcatch', name: 'Treat Catch', icon: '🦴', desc: 'Catch falling treats!' },
  { id: 'hideseek', name: 'Hide & Seek', icon: '🌳', desc: 'Track your pet!' },
];

export default function MiniGames({ open, petEmoji, onReward, onClose }) {
  const [active, setActive] = useState(null);

  const handleReward = (coins) => {
    onReward(coins);
    setActive(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl relative"
          >
            <button onClick={onClose}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-black text-purple-900 text-xl text-center mb-1">🎮 Mini-Games</h2>
            <p className="text-xs text-purple-500 text-center mb-4">Play with your companion to earn bonus coins!</p>

            {!active ? (
              <div className="grid grid-cols-2 gap-3">
                {GAMES.map(g => (
                  <motion.button
                    key={g.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActive(g.id)}
                    className="flex flex-col items-center gap-2 bg-gradient-to-b from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-colors"
                  >
                    <span className="text-4xl">{g.icon}</span>
                    <span className="font-bold text-purple-800">{g.name}</span>
                    <span className="text-[11px] text-purple-400 text-center">{g.desc}</span>
                  </motion.button>
                ))}
              </div>
            ) : active === 'treatcatch' ? (
              <TreatCatchGame petEmoji={petEmoji} onReward={handleReward} onExit={() => setActive(null)} />
            ) : (
              <HideSeekGame petEmoji={petEmoji} onReward={handleReward} onExit={() => setActive(null)} />
            )}

            {active && (
              <p className="text-center text-xs text-purple-400 mt-3">Rewards add coins & a happiness boost</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}