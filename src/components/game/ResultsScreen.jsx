import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Zap, RotateCcw, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadResultsAsText } from './GameResultSaver';

export default function ResultsScreen({ 
  stats, 
  onPlayAgain, 
  onMainMenu,
  gameTitle 
}) {
  const {
    totalTime = 0,
    avgReactionTime = 0,
    correctHits = 0,
    wrongHits = 0,
    totalAttempts = 0,
    correctShapes = 0,
    wrongShapes = 0,
    showShapeStats = false,
  } = stats;

  const accuracy = totalAttempts > 0 ? Math.round((correctHits / totalAttempts) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 p-8"
    >
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" />
      </motion.div>

      <h2 className="text-4xl font-black text-white tracking-tight">
        Game Complete!
      </h2>
      <p className="text-xl text-slate-400">{gameTitle}</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-5 h-5" />
            <span>Total Time</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(totalTime / 1000).toFixed(1)}s
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap className="w-5 h-5" />
            <span>Avg Reaction</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">
            {avgReactionTime.toFixed(0)}ms
          </p>
        </motion.div>

        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Target className="w-5 h-5" />
            <span>Accuracy</span>
          </div>
          <p className="text-3xl font-bold text-green-400">
            {accuracy}%
          </p>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
        >
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <span>✓/✗</span>
            <span>Colors</span>
          </div>
          <p className="text-3xl font-bold">
            <span className="text-green-400">{correctHits}</span>
            <span className="text-slate-500">/</span>
            <span className="text-red-400">{wrongHits}</span>
          </p>
        </motion.div>

        {showShapeStats && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="col-span-2 bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
          >
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <span>◯ □ △ ★</span>
              <span>Shapes</span>
            </div>
            <p className="text-3xl font-bold">
              <span className="text-green-400">{correctShapes}</span>
              <span className="text-slate-500"> correct / </span>
              <span className="text-red-400">{wrongShapes}</span>
              <span className="text-slate-500"> wrong</span>
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          onClick={onPlayAgain}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Play Again
        </Button>
        <Button
          onClick={onMainMenu}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg rounded-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Main Menu
        </Button>
      </div>

      <Button
        onClick={downloadResultsAsText}
        variant="ghost"
        className="mt-4 text-slate-400 hover:text-white"
      >
        <Download className="w-4 h-4 mr-2" />
        Download All Results as TXT
      </Button>
    </motion.div>
  );
}