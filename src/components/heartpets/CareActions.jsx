import React from 'react';
import { motion } from 'framer-motion';
import { CARE_ACTIONS } from './petEngine';

export default function CareActions({ onCare, disabled, isSleeping }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CARE_ACTIONS.map((action) => {
        const sleeping = action.id === 'sleep' && isSleeping;
        return (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.9 }}
            disabled={disabled}
            onClick={() => onCare(action)}
            className={`flex flex-col items-center gap-1 rounded-2xl p-3 shadow-md border transition-colors disabled:opacity-40 ${
              sleeping
                ? 'bg-indigo-200 border-indigo-400 ring-2 ring-indigo-300'
                : 'bg-white/90 border-purple-100 hover:border-purple-300'
            }`}
          >
            <span className="text-3xl">{sleeping ? '⏰' : action.icon}</span>
            <span className="text-xs font-semibold text-purple-800">{sleeping ? 'Wake' : action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}