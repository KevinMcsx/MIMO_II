import React from 'react';
import { motion } from 'framer-motion';

const buttons = [
  { key: '1', color: 'yellow', bg: 'bg-yellow-400', glow: 'shadow-yellow-400/50', label: '🟡', keyLabel: '1' },
  { key: '2', color: 'green', bg: 'bg-green-500', glow: 'shadow-green-500/50', label: '🟢', keyLabel: '2' },
  { key: '3', color: 'blue', bg: 'bg-blue-500', glow: 'shadow-blue-500/50', label: '🔵', keyLabel: '3' },
  { key: '4', color: 'red', bg: 'bg-red-500', glow: 'shadow-red-500/50', label: '🔴', keyLabel: '4' },
];

export default function ColorButtons({ activeKey, onPress, disabled, showLabels = true }) {
  return (
    <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
      {buttons.map((btn) => (
        <motion.button
          key={btn.key}
          onClick={() => !disabled && onPress(btn.color)}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: activeKey === btn.key ? 1.1 : 1,
            boxShadow: activeKey === btn.key ? `0 0 30px 10px` : '0 0 15px 3px',
          }}
          className={`
            w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl ${btn.bg} 
            shadow-lg ${btn.glow}
            flex flex-col items-center justify-center
            border-2 sm:border-4 border-white/30
            transition-all duration-100
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
          `}
        >
          <span className="text-2xl sm:text-3xl">{btn.label}</span>
          {showLabels && (
            <span className="text-[10px] sm:text-xs font-bold text-white/80 mt-0.5 sm:mt-1">Key: {btn.keyLabel}</span>
          )}
        </motion.button>
      ))}
    </div>
  );
}

export { buttons as colorButtonsConfig };