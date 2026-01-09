import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Shapes, Brain, Zap } from 'lucide-react';

const games = [
  {
    id: 1,
    color: 'yellow',
    title: 'Color Reaction',
    description: 'React to colors as fast as possible!',
    Icon: Palette,
    bg: 'from-yellow-500 to-yellow-600',
    glow: 'shadow-yellow-500/50',
    key: '1',
  },
  {
    id: 2,
    color: 'green',
    title: 'Color + Shape',
    description: 'Match colors and shapes together!',
    Icon: Shapes,
    bg: 'from-green-500 to-green-600',
    glow: 'shadow-green-500/50',
    key: '3',
  },
  {
    id: 3,
    color: 'blue',
    title: 'Memory Match',
    description: 'Find matching pairs of cards!',
    Icon: Brain,
    bg: 'from-blue-500 to-blue-600',
    glow: 'shadow-blue-500/50',
    key: '2',
  },
  {
    id: 4,
    color: 'red',
    title: 'Pro Challenge',
    description: 'Ultimate speed challenge mode!',
    Icon: Zap,
    bg: 'from-red-500 to-red-600',
    glow: 'shadow-red-500/50',
    key: '4',
  },
];

export default function GameSelection({ onSelect, activeKey }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-8"
    >
      <motion.h1
        initial={{ y: -30 }}
        animate={{ y: 0 }}
        className="text-5xl font-black text-white tracking-tight text-center"
      >
        Choose a Game!
      </motion.h1>
      
      <p className="text-xl text-slate-400 text-center">
        Press the color button or click to select
      </p>

      <div className="grid grid-cols-2 gap-6 max-w-2xl w-full px-4">
        {games.map((game, index) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(game.id)}
            className={`
              relative overflow-hidden rounded-3xl p-6
              bg-gradient-to-br ${game.bg}
              shadow-xl ${game.glow}
              border-4 border-white/20
              transition-all duration-200
              ${activeKey === game.key ? 'ring-4 ring-white scale-105' : ''}
            `}
          >
            <div className="absolute top-2 right-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold text-white">
              Key: {game.key}
            </div>
            <game.Icon className="w-16 h-16 text-white/90 mb-4" strokeWidth={1.5} />
            <h3 className="text-2xl font-bold text-white mb-2">{game.title}</h3>
            <p className="text-white/80 text-sm">{game.description}</p>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-4 mt-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-400/20 rounded-full">
          <span className="text-2xl">🟡</span>
          <span className="text-yellow-400 font-bold">1</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full">
          <span className="text-2xl">🔵</span>
          <span className="text-blue-400 font-bold">2</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
          <span className="text-2xl">🟢</span>
          <span className="text-green-400 font-bold">3</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
          <span className="text-2xl">🔴</span>
          <span className="text-red-400 font-bold">4</span>
        </div>
      </div>
    </motion.div>
  );
}

export { games };