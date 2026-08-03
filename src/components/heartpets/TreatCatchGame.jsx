import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DURATION = 15;
const GOOD = ['🦴', '🐟', '🥕', '🍖', '🧀', '🍪'];

export default function TreatCatchGame({ petEmoji, onReward, onExit }) {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [done, setDone] = useState(false);
  const [petX, setPetXState] = useState(50);
  const [flash, setFlash] = useState(null); // 'good' | 'bad' | null
  const petXRef = useRef(50);
  const idRef = useRef(0);
  const flashTimer = useRef(null);

  const setPetX = (v) => {
    const c = Math.max(8, Math.min(92, v));
    petXRef.current = c;
    setPetXState(c);
  };

  const move = (dir) => setPetX(petXRef.current + dir * 14);

  // keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') move(-1);
      else if (e.key === 'ArrowRight') move(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const showFlash = (type) => {
    setFlash(type);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 250);
  };

  // main loop: move + collisions
  useEffect(() => {
    const loop = setInterval(() => {
      setItems(prev => {
        const next = [];
        for (const it of prev) {
          const y = it.y + 1.6;
          if (y >= 88) {
            const caught = Math.abs(it.x - petXRef.current) < 9;
            if (caught) {
              if (it.good) { setScore(s => s + 1); showFlash('good'); }
              else { setScore(s => s - 1); showFlash('bad'); }
            } else if (y < 100) {
              next.push({ ...it, y });
            }
          } else {
            next.push({ ...it, y });
          }
        }
        return next;
      });
    }, 45);
    return () => clearInterval(loop);
  }, []);

  // spawner
  useEffect(() => {
    const sp = setInterval(() => {
      setItems(prev => [...prev, {
        id: idRef.current++,
        x: 8 + Math.random() * 84,
        y: 0,
        good: Math.random() > 0.25,
        emoji: GOOD[Math.floor(Math.random() * GOOD.length)],
      }]);
    }, 650);
    return () => clearInterval(sp);
  }, []);

  // timer
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) { clearInterval(t); setDone(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const reward = Math.max(0, score) * 3;
  const claim = () => { onReward(reward); onExit(); };

  return (
    <div className="text-center select-none">
      <h3 className="font-black text-purple-900 text-lg mb-1">🦴 Treat Catch</h3>
      <p className="text-xs text-purple-500 mb-3">Move your pet to catch treats — avoid the 💩!</p>

      <div className="flex items-center justify-between text-sm font-bold text-purple-800 mb-2">
        <span>⏱ {time}s</span>
        <span>🎯 {score}</span>
      </div>

      <div className="relative w-full h-64 bg-gradient-to-b from-sky-100 to-emerald-200 rounded-2xl overflow-hidden border-2 border-emerald-300">
        {/* falling items */}
        {items.map(it => (
          <span key={it.id} className="absolute text-2xl"
            style={{ left: `${it.x}%`, top: `${it.y}%`, transform: 'translate(-50%,-50%)' }}>
            {it.good ? it.emoji : '💩'}
          </span>
        ))}

        {/* pet catcher */}
        <motion.div className="absolute bottom-1 text-4xl"
          animate={{ left: `${petX}%` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          style={{ transform: 'translateX(-50%)' }}>
          {petEmoji}
        </motion.div>

        {/* flash feedback */}
        {flash && (
          <div className={`absolute inset-x-0 top-8 text-center text-2xl font-black ${
            flash === 'good' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {flash === 'good' ? 'Yum! +1' : 'Yuck! -1'}
          </div>
        )}

        {done && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70">
            <span className="text-4xl">🏆</span>
            <p className="font-bold text-purple-900">You scored {score}!</p>
            <p className="text-sm text-yellow-600 font-black">+{reward} 🪙</p>
            <Button onClick={claim} className="bg-purple-600 hover:bg-purple-700 text-white">Claim reward</Button>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="flex gap-3 mt-3">
        <Button variant="outline" className="flex-1 py-6 border-purple-200 text-purple-700"
          onClick={() => move(-1)}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button variant="outline" className="flex-1 py-6 border-purple-200 text-purple-700"
          onClick={() => move(1)}>
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
      <p className="text-[11px] text-purple-400 mt-2">Use the arrows or your keyboard ← →</p>
    </div>
  );
}