import React from 'react';
import { motion } from 'framer-motion';

// A satisfying, rewarding wash sequence rendered over the pet stage (~2.4s):
// foam ring → water → bubbles → scrub → shake-off droplets → sparkle gleam → happy face + reward.
export default function WashAnimation() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* soft water wash tint */}
      <motion.div
        className="absolute inset-0 bg-sky-300/25 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.45, 0.35, 0] }}
        transition={{ duration: 2.4, times: [0, 0.2, 0.65, 1] }}
      />

      {/* phase 0: foamy soap ring blooming around the pet */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[2px]"
        initial={{ width: 0, height: 0, opacity: 0 }}
        animate={{ width: 190, height: 190, opacity: [0, 0.9, 0.6, 0] }}
        transition={{ duration: 1.8, delay: 0.1, times: [0, 0.25, 0.7, 1] }}
      />

      {/* phase 1: water drops streaming down */}
      {[...Array(9)].map((_, i) => (
        <motion.span
          key={`drop-${i}`}
          className="absolute text-2xl"
          style={{ left: `${8 + i * 9}%` }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 170, opacity: [0, 1, 0], scale: [1, 1, 0.5] }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: 'easeIn' }}
        >
          💧
        </motion.span>
      ))}

      {/* phase 2: bubbles rising + wobble + pop */}
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={`bubble-${i}`}
          className="absolute text-2xl"
          style={{ left: `${8 + i * 9}%`, bottom: '12%' }}
          initial={{ y: 10, opacity: 0, scale: 0.5 }}
          animate={{
            y: -140 - (i % 3) * 30,
            x: [0, 14, -10, 8, 0],
            opacity: [0, 1, 1, 0.8, 0],
            scale: [0.5, 1, 1.15, 1, 1.4],
          }}
          transition={{ duration: 1.7, delay: 0.25 + i * 0.07, ease: 'easeOut' }}
        >
          🫧
        </motion.span>
      ))}

      {/* phase 3: scrubbing sponge with little motion lines */}
      <motion.span
        className="absolute text-4xl top-1/2"
        initial={{ x: -70, y: -20, opacity: 0, rotate: -20 }}
        animate={{
          x: [-70, 70, -55, 55, 0],
          y: [-20, -32, -20, -32, -20],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-20, 15, -15, 10, 0],
        }}
        transition={{ duration: 1.3, delay: 0.5, ease: 'easeInOut' }}
      >
        🧽
      </motion.span>

      {/* phase 3.5: shake-off — droplets flying outward in all directions */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.span
            key={`shake-${i}`}
            className="absolute left-1/2 top-1/2 text-xl"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: Math.cos(angle) * 90,
              y: Math.sin(angle) * 70 - 10,
              opacity: [0, 1, 0],
              scale: [0.4, 1, 0.6],
            }}
            transition={{ duration: 0.6, delay: 1.35 + i * 0.03, ease: 'easeOut' }}
          >
            💧
          </motion.span>
        );
      })}

      {/* phase 4: rotating gleam sweep + sparkle burst */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-center"
        initial={{ rotate: 0, opacity: 0 }}
        animate={{ rotate: 220, opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.9, delay: 1.4, ease: 'easeOut' }}
        style={{
          width: 200, height: 200,
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.6) 30deg, transparent 60deg)',
          borderRadius: '50%',
        }}
      />
      {[...Array(7)].map((_, i) => (
        <motion.span
          key={`sparkle-${i}`}
          className="absolute text-3xl"
          style={{ left: `${22 + i * 9}%`, top: `${28 + (i % 2) * 22}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, delay: 1.5 + i * 0.08, ease: 'easeOut' }}
        >
          ✨
        </motion.span>
      ))}

      {/* happy reaction face */}
      <motion.span
        className="absolute left-1/2 top-[28%] -translate-x-1/2 text-4xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1, delay: 1.6, times: [0, 0.3, 0.5, 1] }}
      >
        😻
      </motion.span>

      {/* floating "+12 Happiness" reward popup */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2"
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: -70, opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1] }}
        transition={{ duration: 1.3, delay: 1.7, ease: 'easeOut' }}
      >
        <span className="bg-white/95 text-pink-500 font-black text-sm px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
          +12 💕
        </span>
      </motion.div>

      {/* "Sparkling!" banner */}
      <motion.div
        className="absolute inset-x-0 bottom-5 flex justify-center"
        initial={{ scale: 0, opacity: 0, y: 10 }}
        animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 1, 0], y: [10, 0, 0, -8] }}
        transition={{ duration: 1.1, delay: 1.55, times: [0, 0.3, 0.5, 1] }}
      >
        <span className="bg-white/95 text-sky-600 font-black text-sm px-4 py-1.5 rounded-full shadow-lg">
          ✨ Sparkling clean! ✨
        </span>
      </motion.div>
    </div>
  );
}