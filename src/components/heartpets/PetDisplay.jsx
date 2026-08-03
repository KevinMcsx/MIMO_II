import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATURES, STAGE_NAMES, MOOD_INFO } from './petEngine';
import ActionEffect from './ActionEffect';

export default function PetDisplay({ pet, mood, actionAnim, onTouch }) {
  const creature = CREATURES.find(c => c.id === pet.creatureId) || CREATURES[0];
  const stageEmoji = creature.stages[pet.stage] || creature.emoji;
  const moodInfo = MOOD_INFO[mood] || MOOD_INFO.relaxed;
  const isEgg = pet.stage === 0;

  return (
    <div className={`relative w-full aspect-square max-w-xs mx-auto rounded-3xl bg-gradient-to-br ${creature.color} flex items-center justify-center overflow-hidden shadow-2xl`}>
      {/* soft glow */}
      <div className="absolute inset-0 bg-white/10 rounded-3xl" />

      {/* floating sparkle ambiance */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/40 text-lg"
          initial={{ x: 20 + i * 40, y: -10, opacity: 0 }}
          animate={{ y: [260, -10], opacity: [0, 0.8, 0] }}
          transition={{ duration: 4, delay: i * 0.6, repeat: Infinity, repeatDelay: 1 }}
        >
          ✨
        </motion.div>
      ))}

      {/* the creature */}
      <motion.button
        onClick={onTouch}
        disabled={isEgg}
        whileTap={{ scale: 0.85 }}
        animate={
          isEgg
            ? { rotate: [-3, 3, -3] }
            : { y: [0, -10, 0], rotate: [0, 2, -2, 0] }
        }
        transition={{ duration: isEgg ? 0.8 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 cursor-pointer disabled:cursor-default"
        aria-label="Pet your companion"
      >
        <span className="text-[7rem] leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)] block">
          {stageEmoji}
        </span>
      </motion.button>

      {/* action effect */}
      <AnimatePresence>
        {actionAnim && (
          <motion.div
            key={actionAnim.id + Date.now()}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-20"
          >
            <ActionEffect action={actionAnim} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* mood badge */}
      {!isEgg && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
          <span className="text-lg">{moodInfo.emoji}</span>
          <span className="text-xs font-semibold text-slate-700">{moodInfo.label}</span>
        </div>
      )}
    </div>
  );
}