import React from 'react';
import { motion } from 'framer-motion';
import { Circle, Square, Triangle, Star } from 'lucide-react';

const shapeComponents = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  star: Star,
};

const colorStyles = {
  yellow: 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]',
  blue: 'text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]',
  green: 'text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]',
  red: 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]',
};

export default function ShapeDisplay({ shape, color, size = 'large' }) {
  const ShapeIcon = shapeComponents[shape];
  
  if (!ShapeIcon) return null;

  const sizeClass = size === 'large' ? 'w-40 h-40' : size === 'medium' ? 'w-24 h-24' : 'w-12 h-12';

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="flex items-center justify-center"
    >
      <ShapeIcon 
        className={`${sizeClass} ${colorStyles[color]}`} 
        strokeWidth={1.5}
        fill="currentColor"
      />
    </motion.div>
  );
}

export { shapeComponents, colorStyles };