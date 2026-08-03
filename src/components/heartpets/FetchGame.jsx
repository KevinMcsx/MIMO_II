import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const DURATION = 10;

export default function FetchGame({ onReward, onExit }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hits, setHits] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [done, setDone] = useState(false);

  const moveBall = useCallback(() => {
    setPos({ x: 8 + Math.random() * 84, y: 12 + Math.random() * 70 });
  }, []);

  useEffect(() => {
    moveBall();
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) { clearInterval(id); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [moveBall]);

  const handleTap = () => {
    if (done) return;
    setHits(h => h + 1);
    moveBall();
  };

  const reward = hits * 2;
  const claim = () => { onReward(reward); onExit(); };

  return (
    <div className="text-center">
      <h3 className="font-black text-purple-900 text-lg mb-1">🎾 Fetch</h3>
      <p className="text-xs text-purple-500 mb-3">Tap the ball as many times as you can!</p>

      <div className="flex items-center justify-between text-sm font-bold text-purple-800 mb-2">
        <span>⏱ {time}s</span>
        <span>🎯 {hits}</span>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-b from-emerald-100 to-green-200 rounded-2xl overflow-hidden border-2 border-green-300">
        {!done ? (
          <motion.button
            onClick={handleTap}
            whileTap={{ scale: 0.7 }}
            className="absolute text-4xl"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            🎾
          </motion.button>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60">
            <span className="text-4xl">🏆</span>
            <p className="font-bold text-purple-900">You caught {hits} balls!</p>
            <p className="text-sm text-yellow-600 font-black">+{reward} 🪙</p>
            <Button onClick={claim} className="bg-purple-600 hover:bg-purple-700 text-white">Claim reward</Button>
          </div>
        )}
      </div>
    </div>
  );
}