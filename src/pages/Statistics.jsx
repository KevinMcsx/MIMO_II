import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Clock, Zap, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const gameNames = ['Color Reaction', 'Color + Shape', 'Memory Match', 'Pro Challenge'];
const difficultyNames = ['Easy', 'Medium', 'Hard', 'Expert'];

export default function Statistics() {
  const playerName = localStorage.getItem('mimoPlayerName') || 'Player';

  const { data: myScores = [] } = useQuery({
    queryKey: ['myScores', playerName],
    queryFn: () => base44.entities.GameScore.filter({ player_name: playerName }, '-created_date', 100),
  });

  // Calculate stats
  const totalGames = myScores.length;
  const avgScore = totalGames > 0 ? Math.round(myScores.reduce((sum, s) => sum + (s.score || 0), 0) / totalGames) : 0;
  const bestScore = totalGames > 0 ? Math.max(...myScores.map(s => s.score || 0)) : 0;
  const avgReaction = totalGames > 0 ? Math.round(myScores.reduce((sum, s) => sum + (s.avg_reaction_time || 0), 0) / totalGames) : 0;

  // Games by type
  const gamesByType = gameNames.map((name, i) => ({
    name: name.split(' ')[0],
    games: myScores.filter(s => s.game_type === i + 1).length,
  }));

  // Score progression (last 10 games)
  const recentScores = myScores.slice(0, 10).reverse().map((s, i) => ({
    game: `#${i + 1}`,
    score: s.score || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('Game')}>
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Game
          </Button>
        </Link>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-slate-800 mb-2">📊 Your Statistics</h1>
          <p className="text-slate-600 text-lg">{playerName}'s Performance</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-black text-slate-800">{totalGames}</p>
            <p className="text-slate-600 text-sm">Games Played</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-black text-slate-800">{bestScore}</p>
            <p className="text-slate-600 text-sm">Best Score</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-black text-slate-800">{avgScore}</p>
            <p className="text-slate-600 text-sm">Avg Score</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-black text-slate-800">{avgReaction}ms</p>
            <p className="text-slate-600 text-sm">Avg Reaction</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Games by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gamesByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="games" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Score Progression</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recentScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Games */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 bg-white rounded-2xl p-6 border-2 border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Games</h3>
          <div className="space-y-2">
            {myScores.slice(0, 5).map((score, i) => (
              <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">
                    {gameNames[score.game_type - 1]} - {difficultyNames[score.difficulty - 1]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(score.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{score.score}</p>
                  <p className="text-xs text-slate-500">{(score.avg_reaction_time || 0).toFixed(0)}ms</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}