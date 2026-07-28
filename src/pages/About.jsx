import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, Users, Sparkles, Gamepad2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg mb-4">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">About LoopyBrain</h1>
          <p className="text-slate-600 text-lg">Train your brain while having fun!</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-xl space-y-5 text-slate-700 leading-relaxed"
        >
          <div className="flex items-start gap-3">
            <Gamepad2 className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
            <p>
              LoopyBrain is a fun and fast-paced cognitive training app designed to boost your
              reflexes, memory, and mental agility through shape and color matching challenges.
              With <strong>36 unique games</strong> across four core categories — Attention,
              Tracking, Memory, and Processing Speed — every session is a new adventure for your
              brain. Whether you're quickly tapping the right color, memorizing growing sequences,
              or racing against the clock to spot the odd shape, each game is crafted to be
              engaging, rewarding, and endlessly replayable.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
            <p>
              LoopyBrain is built for <strong>everyone</strong> — from kids discovering the joy of
              brain games to adults looking for a quick mental workout. Its cheerful, kid-friendly
              design makes it especially great for young learners, while the progressive difficulty
              levels (Easy, Medium, Hard, Expert) ensure that older players are always challenged.
              Families can create multiple profiles, compete on leaderboards, track progress over
              time, and earn coins, badges, and achievements together.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-pink-500 shrink-0 mt-0.5" />
            <p>
              Players earn XP, level up, collect cosmetic items like avatars and sound packs from
              the in-app store, and complete daily challenges to build streaks. The app also
              features detailed statistics with colorful charts, so players can watch their reaction
              times and accuracy improve session after session.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Trophy className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
            <p>
              LoopyBrain is developed by <strong>Zoltan F. and Janos A.</strong>, two creators
              passionate about combining education and entertainment. They believe that cognitive
              growth should feel like play, not homework — and LoopyBrain is their answer to making
              brain training something kids and adults look forward to every day.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Target className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
            <p>
              Our mission is simple: help people of all ages sharpen their minds, build better
              reflexes, and develop stronger memory skills — all through games that are genuinely
              fun to play. We're constantly adding new games, features, and improvements based on
              player feedback. Thank you for being part of the LoopyBrain community!
            </p>
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <Link to="/">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Back to Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}