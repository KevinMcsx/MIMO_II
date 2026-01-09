import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

export default function NameEntry({ onSubmit }) {
  const t = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-8 max-w-md w-full px-4"
    >
      <div className="text-center">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-4"
        >
          <User className="w-20 h-20 mx-auto text-slate-700 drop-shadow-lg" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
          Welcome to MIMO!
        </h1>
        <p className="text-xl text-slate-700 font-semibold drop-shadow-sm">
          Enter your name to start playing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <Input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-14 text-xl text-center bg-white/90 border-4 border-slate-700 focus:border-blue-500 transition-colors"
          maxLength={20}
          autoFocus
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          className="w-full h-14 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg disabled:opacity-50"
        >
          Let's Play!
        </Button>
      </form>
    </motion.div>
  );
}