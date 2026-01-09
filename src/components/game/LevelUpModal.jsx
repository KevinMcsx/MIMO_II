import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LevelUpModal({ show, newLevel, newUnlocks, onClose }) {
  if (!show) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-3xl p-8 max-w-md w-full text-white shadow-2xl relative overflow-hidden"
        >
          {/* Sparkle effects */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full">
                <Trophy className="w-16 h-16 text-yellow-300 fill-yellow-300" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-center mb-2"
            >
              LEVEL UP!
            </motion.h2>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-6"
            >
              <p className="text-6xl font-black mb-2">{newLevel}</p>
              <p className="text-white/80">You're getting stronger!</p>
            </motion.div>
            
            {newUnlocks.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-lg">New Unlocks!</h3>
                </div>
                <div className="space-y-2">
                  {newUnlocks.map((unlock, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="flex items-center gap-2 text-sm bg-white/10 rounded-lg p-2"
                    >
                      <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                      <span>{unlock.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            <Button
              onClick={onClose}
              className="w-full bg-white text-purple-600 hover:bg-white/90 font-bold py-3 rounded-xl"
            >
              Awesome!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}