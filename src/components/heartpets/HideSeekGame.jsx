import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const ROUNDS = 3;

export default function HideSeekGame({ petEmoji, onReward, onExit }) {
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [hidden, setHidden] = useState(0);
  const [order, setOrder] = useState([0, 1, 2]);
  const [reveal, setReveal] = useState(true);
  const [shuffling, setShuffling] = useState(false);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  const startRound = () => {
    const hide = Math.floor(Math.random() * 3);
    setHidden(hide);
    setReveal(true);
    setPicked(null);
    setShuffling(false);
    timer.current = setTimeout(() => {
      setReveal(false);
      setShuffling(true);
      let swaps = 0;
      const id = setInterval(() => {
        setOrder(o => {
          const a = Math.floor(Math.random() * 3);
          const b = Math.floor(Math.random() * 3);
          if (a === b) return o;
          const n = [...o]; [n[a], n[b]] = [n[b], n[a]]; return n;
        });
        swaps++;
        if (swaps >= 5) { clearInterval(id); setShuffling(false); }
      }, 220);
    }, 1100);
  };

  useEffect(() => {
    startRound();
    return () => clearTimeout(timer.current);
  }, []);

  const pick = (cardId) => {
    if (reveal || shuffling || picked != null || done) return;
    setPicked(cardId);
    if (cardId === hidden) setCorrect(c => c + 1);
    setTimeout(() => {
      if (round + 1 >= ROUNDS) setDone(true);
      else { setRound(r => r + 1); startRound(); }
    }, 1100);
  };

  const reward = correct * 5;
  const claim = () => { onReward(reward); onExit(); };

  return (
    <div className="text-center">
      <h3 className="font-black text-purple-900 text-lg mb-1">🌳 Hide &amp; Seek</h3>
      <p className="text-xs text-purple-500 mb-3">
        {reveal ? 'Watch where your pet hides…' : shuffling ? 'Shuffling…' : 'Where is it now?'}
      </p>

      <div className="flex justify-between text-sm font-bold text-purple-800 mb-2">
        <span>Round {Math.min(round + 1, ROUNDS)}/{ROUNDS}</span>
        <span>🎯 {correct}</span>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-b from-lime-100 to-green-200 rounded-2xl overflow-hidden border-2 border-green-300 flex items-center justify-center">
        <AnimatePresence>
          {done ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60">
              <span className="text-4xl">🏆</span>
              <p className="font-bold text-purple-900">Found {correct}/{ROUNDS}!</p>
              <p className="text-sm text-yellow-600 font-black">+{reward} 🪙</p>
              <Button onClick={claim} className="bg-purple-600 hover:bg-purple-700 text-white">Claim reward</Button>
            </motion.div>
          ) : (
            <div className="flex gap-4">
              {order.map((cardId) => {
                const showPet = (reveal || picked != null) && cardId === hidden;
                const isPicked = picked === cardId;
                return (
                  <motion.button
                    key={cardId}
                    layout
                    onClick={() => pick(cardId)}
                    whileTap={{ scale: 0.92 }}
                    className={`relative w-16 h-24 rounded-2xl flex items-end justify-center pb-2 text-3xl shadow-lg border-2 transition-colors ${
                      isPicked
                        ? cardId === hidden ? 'bg-emerald-200 border-emerald-400' : 'bg-rose-200 border-rose-400'
                        : 'bg-green-300 border-green-500'
                    }`}
                  >
                    <span>{showPet ? petEmoji : '🌳'}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}