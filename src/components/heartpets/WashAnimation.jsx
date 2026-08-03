import React from 'react';
import { motion } from 'framer-motion';

// A satisfying multi-stage wash sequence rendered over the pet stage:
// water → bubbles → scrub → sparkle shine (~2.2s total).
export default function WashAnimation() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {/* soft water wash overlay */}
      <motion.div
        className="absolute inset-0 bg-sky-300/30 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.35, 0] }}
        transition={{ duration: 2.2, times: [0, 0.2, 0.6, 1] }}
      />

      {/* phase 1: water drops */}
      {[...Array(7)].map((_, i) => (
        <motion.span
          key={`drop-${i}`}
          className="absolute text-2xl"
          style={{ left: `${15 + i * 11}%` }}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 150, opacity: [0, 1, 0], scale: [1, 1, 0.5] }}
          transition={{ duration: 0.7, delay: i * 0.06, ease: 'easeIn' }}
        >
          💧
        </motion.span>
      ))}

      {/* phase 2: bubbles rising + wobble */}
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={`bubble-${i}`}
          className="absolute text-2xl"
          style={{ left: `${10 + i * 10}%`, bottom: '10%' }}
          initial={{ y: 10, opacity: 0, scale: 0.5 }}
          animate={{
            y: -120 - (i % 3) * 30,
            x: [0, 12, -8, 6, 0],
            opacity: [0, 1, 1, 0.8, 0],
            scale: [0.5, 1, 1.1, 1, 1.3],
          }}
          transition={{ duration: 1.6, delay: 0.3 + i * 0.08, ease: 'easeOut' }}
        >
          🫧
        </motion.span>
      ))}

      {/* phase 3: scrubbing sponge */}
      <motion.span
        className="absolute text-4xl top-1/2"
        initial={{ x: -60, y: -20, opacity: 0, rotate: -20 }}
        animate={{
          x: [-60, 60, -50, 50, 0],
          y: [-20, -30, -20, -30, -20],
          opacity: [0, 1, 1, 1, 0],
          rotate: [-20, 15, -15, 10, 0],
        }}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeInOut' }}
      >
        🧽
      </motion.span>

      {/* phase 4: sparkle shine burst */}
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={`sparkle-${i}`}
          className="absolute text-3xl"
          style={{ left: `${30 + i * 12}%`, top: '40%' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.7, delay: 1.5 + i * 0.1, ease: 'easeOut' }}
        >
          ✨
        </motion.span>
      ))}

      {/* "Sparkling!" banner */}
      <motion.div
        className="absolute inset-x-0 bottom-6 flex justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.9, delay: 1.5, times: [0, 0.3, 0.5, 1] }}
      >
        <span className="bg-white/90 text-sky-600 font-black text-sm px-4 py-1 rounded-full shadow-lg">
          ✨ Sparkling clean! ✨
        </span>
      </motion.div>
    </div>
  );
}