import React from 'react';
import { motion } from 'framer-motion';
import { CARE_ACTIONS } from './petEngine';

export default function CareActions({ onCare, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CARE_ACTIONS.map(action => (
        <motion.button
          key={action.id}
          whileTap={{ scale: 0.9 }}
          disabled={disabled}
          onClick={() => onCare(action)}
          className="flex flex-col items-center gap-1 bg-white/90 rounded-2xl p-3 shadow-md border border-purple-100 hover:border-purple-300 transition-colors disabled:opacity-40"
        >
          <span className="text-3xl">{action.icon}</span>
          <span className="text-xs font-semibold text-purple-800">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}