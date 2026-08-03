import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { CREATURES, STAGE_NAMES } from './petEngine';

export default function CollectionGallery({ open, collection, onClose }) {
  const total = CREATURES.length;
  const discovered = CREATURES.filter((c) => (collection[c.id]?.adopted)).length;
  const legendary = CREATURES.filter((c) => (collection[c.id]?.maxStage || 0) >= 4).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-b from-rose-50 to-purple-50 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black text-purple-900">📚 Companion Collection</h2>
              <button onClick={onClose} className="text-purple-500 hover:text-purple-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-purple-500 mb-4 font-semibold">
              {discovered}/{total} discovered · {legendary} legendary ✨
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CREATURES.map((c) => {
                const entry = collection[c.id] || { adopted: false, maxStage: 0 };
                const isLegendary = entry.maxStage >= 4;
                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl p-3 border border-white/40 shadow-md bg-gradient-to-br ${c.color} ${
                      entry.adopted ? '' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-4xl drop-shadow">
                        {c.stages[entry.maxStage] || c.stages[0]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white text-sm truncate">{c.name}</div>
                        <div className="text-[10px] text-white/80 capitalize">{c.personality}</div>
                      </div>
                      {isLegendary && (
                        <span className="text-[9px] bg-yellow-300 text-yellow-900 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          ✨ Legendary
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between mt-3 bg-white/30 rounded-xl p-2">
                      {c.stages.map((emoji, i) => {
                        const reached = i <= entry.maxStage;
                        return (
                          <div key={i} className="flex flex-col items-center gap-0.5">
                            <span className={`text-lg ${reached ? '' : 'opacity-50'}`}>
                              {reached ? emoji : '🔒'}
                            </span>
                            <span className="text-[8px] text-white/90 font-semibold">{STAGE_NAMES[i]}</span>
                          </div>
                        );
                      })}
                    </div>

                    {!entry.adopted && (
                      <p className="text-center text-[10px] text-white/90 mt-2 font-semibold">
                        Not yet discovered
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-purple-400 mt-4">
              Evolve your companions to Legendary to complete your collection!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}