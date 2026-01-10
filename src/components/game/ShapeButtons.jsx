import React from 'react';
import { motion } from 'framer-motion';
import { Circle, Square, Triangle, Star } from 'lucide-react';

const shapes = [
  { key: 'q', shape: 'circle', Icon: Circle, label: '◯', keyLabel: 'Q' },
  { key: 'w', shape: 'square', Icon: Square, label: '□', keyLabel: 'W' },
  { key: 'e', shape: 'triangle', Icon: Triangle, label: '△', keyLabel: 'E' },
  { key: 'r', shape: 'star', Icon: Star, label: '★', keyLabel: 'R' },
];

const colorMap = {
  yellow: { bg: 'bg-yellow-400', border: 'border-yellow-300', glow: 'shadow-yellow-400/50' },
  blue: { bg: 'bg-blue-500', border: 'border-blue-400', glow: 'shadow-blue-500/50' },
  green: { bg: 'bg-green-500', border: 'border-green-400', glow: 'shadow-green-500/50' },
  red: { bg: 'bg-red-500', border: 'border-red-400', glow: 'shadow-red-500/50' },
};

export default function ShapeButtons({ activeKey, onPress, disabled, shapeColors = {} }) {
  return (
    <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
      {shapes.map((btn) => {
        const buttonColor = shapeColors[btn.shape] || 'slate';
        const colorStyle = colorMap[buttonColor] || { bg: 'bg-slate-600', border: 'border-slate-500', glow: 'shadow-slate-500/50' };
        
        return (
          <motion.button
            key={btn.key}
            onClick={() => !disabled && onPress(btn.shape)}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: activeKey === btn.key ? 1.1 : 1,
              boxShadow: activeKey === btn.key ? `0 0 30px 10px` : '0 0 15px 3px',
            }}
            className={`
              w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl ${colorStyle.bg}
              shadow-lg ${colorStyle.glow}
              flex flex-col items-center justify-center
              border-2 sm:border-4 ${colorStyle.border}
              transition-all duration-100
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
          >
            <btn.Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs font-bold text-white/80 mt-0.5 sm:mt-1">Key: {btn.keyLabel}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export { shapes as shapeButtonsConfig };