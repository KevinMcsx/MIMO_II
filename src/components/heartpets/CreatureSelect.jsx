import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CREATURES, STAGE_NAMES } from './petEngine';
import { Button } from '@/components/ui/button';

export default function CreatureSelect({ onAdopt }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-sky-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <h1 className="text-3xl font-black text-purple-900">HeartPets</h1>
          <p className="text-purple-500 mt-1">Adopt your mythical companion</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {CREATURES.map(c => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelected(c)}
              className={`flex flex-col items-center gap-1 p-4 rounded-2xl bg-white/90 border-2 transition-colors ${
                selected?.id === c.id ? 'border-purple-500 shadow-lg' : 'border-transparent'
              }`}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-md`}>
                {c.emoji}
              </div>
              <span className="text-sm font-bold text-purple-800 mt-1">{c.name}</span>
              <span className="text-xs text-purple-400 capitalize">{c.personality}</span>
            </motion.button>
          ))}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/90 rounded-2xl p-4 shadow-lg border border-purple-100">
            <p className="text-sm text-purple-600 mb-1">Evolves: {STAGE_NAMES.join(' → ')}</p>
            <div className="flex gap-2 mt-2">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Name your companion"
                maxLength={14}
                className="flex-1 px-3 py-2 rounded-xl border border-purple-200 text-sm focus:outline-none focus:border-purple-400"
              />
              <Button
                onClick={() => onAdopt(selected.id, name.trim())}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Adopt 🥚
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}