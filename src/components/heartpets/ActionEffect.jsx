import React from 'react';
import { motion } from 'framer-motion';

// Per-action particle effects rendered inside the pet stage.
const EFFECTS = {
  feed: { items: ['🍎', '🍌', '🥕'], react: '😋', type: 'fall' },
  water: { items: ['💧', '💧', '💧'], react: '🥤', type: 'fall' },
  clean: { items: ['🫧', '🫧', '🫧', '✨'], react: '🛁', type: 'rise' },
  sleep: { items: ['💤', '💤', '💤'], type: 'rise' },
  play: { items: ['🎾'], type: 'bounce' },
  pet: { items: ['💕', '💕', '💖'], react: '🥰', type: 'rise' },
};

export default function ActionEffect({ action }) {
  const e = EFFECTS[action.id] || { items: [action.icon], type: 'rise' };

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
      {e.type === 'fall' &&
        e.items.map((it, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{ y: -120, x: (i - 1) * 26, opacity: 0, scale: 0.6 }}
            animate={{ y: 10, opacity: [0, 1, 1, 0], scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeIn' }}
          >
            {it}
          </motion.span>
        ))}

      {e.type === 'rise' &&
        e.items.map((it, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{ y: 20, x: (i - 1) * 22, opacity: 0 }}
            animate={{ y: -90, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
          >
            {it}
          </motion.span>
        ))}

      {e.type === 'bounce' &&
        e.items.map((it, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl"
            initial={{ y: -40, x: -40, opacity: 0 }}
            animate={{ y: [10, -40, 10, -20, 10], x: [-40, 40, -20, 30, 10], opacity: [0, 1, 1, 1, 0] }}
            transition={{ duration: 0.7 }}
          >
            {it}
          </motion.span>
        ))}

      {/* pet reaction face */}
      {e.react && (
        <motion.span
          className="absolute text-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ top: '42%' }}
        >
          {e.react}
        </motion.span>
      )}
    </div>
  );
}