import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function XPGainPopup({ show, xp }) {
  if (!show) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl border-4 border-white flex items-center gap-2">
          <Zap className="w-6 h-6 fill-white" />
          <span className="text-2xl font-black">+{xp} XP</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}