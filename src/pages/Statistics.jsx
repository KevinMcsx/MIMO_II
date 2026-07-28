import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, Legend } from 'recharts';
import { TrendingUp, Target, Clock, Zap, ChevronLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../components/utils/translations';
import { getAllResults } from '../components/game/GameResultSaver';
import { toast } from 'sonner';

export default function Statistics() {
  const t = useTranslation();
  const currentPlayerName = localStorage.getItem('loopybrainPlayerName') || 'Player';
  const [selectedPlayer, setSelectedPlayer] = useState(currentPlayerName);
  const [selectedGame, setSelectedGame] = useState(null);
  
  const gameNames = [t('colorReaction'), t('colorShape'), t('memoryMatch'), t('proChallenge'), t('patternRecognition'), t('numberMemory')];
  const difficultyNames = [t('easy'), t('medium'), t('hard'), t('expert')];

  const { data: allScores = [] } = useQuery({
    queryKey: ['allScores'],
    queryFn: getAllResults,
  });

  // Get unique players
  const uniquePlayers = [...new Set(allScores.map(s => s.player_name))].filter(Boolean);

  // Filter scores
  const filteredScores = allScores.filter(score => {
    const playerMatch = !selectedPlayer || score.player_name === selectedPlayer;
    const gameMatch = !selectedGame || score.game_type === selectedGame;
    return playerMatch && gameMatch;
  });

  // Calculate stats
  const totalGames = filteredScores.length;
  const avgScore = totalGames > 0 ? Math.round(filteredScores.reduce((sum, s) => sum + (s.score || 0), 0) / totalGames) : 0;
  const bestScore = totalGames > 0 ? Math.max(...filteredScores.map(s => s.score || 0)) : 0;
  const avgReaction = totalGames > 0 ? Math.round(filteredScores.reduce((sum, s) => sum + (s.avg_reaction_time || 0), 0) / totalGames) : 0;
  const bestReaction = totalGames > 0 ? Math.min(...filteredScores.filter(s => s.avg_reaction_time > 0).map(s => s.avg_reaction_time || Infinity)) : 0;

  // Win/Loss ratios by game (score > 0 considered a win for simplicity)
  const winLossByGame = gameNames.map((name, i) => {
    const gameScores = filteredScores.filter(s => s.game_type === i + 1);
    const wins = gameScores.filter(s => s.score > 500).length; // Threshold for "win"
    const losses = gameScores.length - wins;
    return {
      name: name.split(' ')[0],
      wins,
      losses,
      total: gameScores.length,
      winRate: gameScores.length > 0 ? ((wins / gameScores.length) * 100).toFixed(1) : 0,
    };
  }).filter(g => g.total > 0);

  // Average score over time (chronological)
  const scoreOverTime = filteredScores
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .reduce((acc, score, idx, arr) => {
      const date = new Date(score.created_date).toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.scores.push(score.score);
      } else {
        acc.push({ date, scores: [score.score] });
      }
      return acc;
    }, [])
    .map(d => ({
      date: d.date,
      avgScore: Math.round(d.scores.reduce((sum, s) => sum + s, 0) / d.scores.length),
      games: d.scores.length,
    }))
    .slice(-15); // Last 15 days

  // Accuracy trends (correct hits / total hits)
  const accuracyTrends = filteredScores
    .filter(s => s.correct_hits !== undefined && s.wrong_hits !== undefined)
    .slice(0, 20)
    .reverse()
    .map((s, i) => {
      const total = (s.correct_hits || 0) + (s.wrong_hits || 0);
      const accuracy = total > 0 ? ((s.correct_hits / total) * 100).toFixed(1) : 0;
      return {
        game: `#${i + 1}`,
        accuracy: parseFloat(accuracy),
        correct: s.correct_hits,
        wrong: s.wrong_hits,
      };
    });

  // Overall accuracy
  const totalCorrect = filteredScores.reduce((sum, s) => sum + (s.correct_hits || 0), 0);
  const totalWrong = filteredScores.reduce((sum, s) => sum + (s.wrong_hits || 0), 0);
  const totalHits = totalCorrect + totalWrong;
  const overallAccuracy = totalHits > 0 ? ((totalCorrect / totalHits) * 100).toFixed(1) : 0;

  // Performance by difficulty
  const difficultyPerformance = difficultyNames.map((name, i) => {
    const diffScores = filteredScores.filter(s => s.difficulty === i + 1);
    return {
      name,
      avgScore: diffScores.length > 0 ? Math.round(diffScores.reduce((sum, s) => sum + (s.score || 0), 0) / diffScores.length) : 0,
      games: diffScores.length,
    };
  }).filter(d => d.games > 0);

  // Games by type
  const gamesByType = gameNames.map((name, i) => ({
    name: name.split(' ')[0],
    games: filteredScores.filter(s => s.game_type === i + 1).length,
  }));

  // Reaction time progression
  const reactionProgression = filteredScores.slice(0, 20).reverse().map((s, i) => ({
    game: `#${i + 1}`,
    reaction: s.avg_reaction_time || 0,
  }));

  // Stats by player
  const playerStats = uniquePlayers.map(player => {
    const playerScores = allScores.filter(s => s.player_name === player);
    const gameFilter = selectedGame ? playerScores.filter(s => s.game_type === selectedGame) : playerScores;
    return {
      name: player,
      games: gameFilter.length,
      avgScore: gameFilter.length > 0 ? Math.round(gameFilter.reduce((sum, s) => sum + (s.score || 0), 0) / gameFilter.length) : 0,
      bestScore: gameFilter.length > 0 ? Math.max(...gameFilter.map(s => s.score || 0)) : 0,
      avgReaction: gameFilter.length > 0 ? Math.round(gameFilter.reduce((sum, s) => sum + (s.avg_reaction_time || 0), 0) / gameFilter.length) : 0,
    };
  }).filter(p => p.games > 0).sort((a, b) => b.avgScore - a.avgScore);

  const downloadStats = () => {
    // CSV Header
    let csv = 'Player Name,Game Type,Difficulty,Score,Avg Reaction Time (ms),Correct Hits,Wrong Hits,Total Time (ms),Date\n';

    // CSV Data Rows
    filteredScores.forEach((score) => {
      const row = [
        score.player_name,
        gameNames[score.game_type - 1],
        difficultyNames[score.difficulty - 1],
        score.score,
        (score.avg_reaction_time || 0).toFixed(0),
        score.correct_hits || 0,
        score.wrong_hits || 0,
        score.total_time || 0,
        new Date(score.created_date).toLocaleString()
      ];
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loopybrain-statistics-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Link to={createPageUrl('Game')}>
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="w-5 h-5 mr-2" />
            {t('backToGame')}
          </Button>
        </Link>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-black text-slate-800 mb-2">📊 {t('statisticsTitle')}</h1>
          <p className="text-slate-600 text-lg">{t('gamePerformance')}</p>
          <div className="flex gap-3 mt-3 justify-center">
            <Button
              onClick={downloadStats}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('downloadRecords')}
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <select
            value={selectedPlayer || ''}
            onChange={(e) => setSelectedPlayer(e.target.value || null)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-purple-300 font-semibold text-purple-700"
          >
            <option value="">{t('allPlayers')}</option>
            {uniquePlayers.map((player) => (
              <option key={player} value={player}>{player}</option>
            ))}
          </select>

          <select
            value={selectedGame || ''}
            onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-blue-300 font-semibold text-blue-700"
          >
            <option value="">{t('allGames')}</option>
            {gameNames.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-black text-slate-800">{totalGames}</p>
            <p className="text-slate-600 text-sm">{t('gamesPlayed')}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-black text-slate-800">{bestScore}</p>
            <p className="text-slate-600 text-sm">{t('bestScore')}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-black text-slate-800">{avgScore}</p>
            <p className="text-slate-600 text-sm">{t('avgScore')}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-3xl font-black text-slate-800">{avgReaction}ms</p>
            <p className="text-slate-600 text-sm">{t('avgReaction')}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Zap className="w-8 h-8 mx-auto mb-2 text-green-500 fill-green-500" />
            <p className="text-3xl font-black text-slate-800">{bestReaction === Infinity ? 0 : bestReaction.toFixed(0)}ms</p>
            <p className="text-slate-600 text-sm">{t('bestReaction')}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 text-center"
          >
            <Target className="w-8 h-8 mx-auto mb-2 text-pink-500" />
            <p className="text-3xl font-black text-slate-800">{overallAccuracy}%</p>
            <p className="text-slate-600 text-sm">Accuracy</p>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('gamesByType')}</h3>
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
            <h3 className="text-xl font-bold text-slate-800 mb-4">Win Rate by Game Mode</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={winLossByGame}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" fill="#10b981" name="Wins" radius={[8, 8, 0, 0]} />
                <Bar dataKey="losses" fill="#ef4444" name="Losses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">📈 Average Score Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={scoreOverTime}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={3} fill="url(#scoreGradient)" name="Avg Score" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-300"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">🎯 Accuracy Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={accuracyTrends}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                <XAxis dataKey="game" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="url(#accuracyGradient)" strokeWidth={4} name="Accuracy %" dot={{ fill: '#f59e0b', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">⚡ {t('reactionProgression')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reactionProgression}>
                <defs>
                  <linearGradient id="reactionGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis dataKey="game" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reaction" stroke="url(#reactionGradient)" strokeWidth={4} name="Reaction (ms)" dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">Performance by Difficulty</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={difficultyPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgScore" fill="#ec4899" radius={[8, 8, 0, 0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Player Comparison */}
        {!selectedPlayer && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('playerRankings')}</h3>
            <div className="space-y-2">
              {playerStats.slice(0, 10).map((player, i) => (
                <div key={player.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      i === 0 ? 'bg-yellow-400 text-white' : 
                      i === 1 ? 'bg-slate-400 text-white' : 
                      i === 2 ? 'bg-amber-600 text-white' : 
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.games} games played</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">{player.avgScore}</p>
                    <p className="text-xs text-slate-500">Avg: {player.avgReaction}ms</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Games */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 border-2 border-slate-200"
        >
          <h3 className="text-xl font-bold text-slate-800 mb-4">{t('recentGames')}</h3>
          <div className="space-y-2">
            {filteredScores.slice(0, 10).map((score, i) => (
              <div key={score.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">
                    {gameNames[score.game_type - 1]} - {difficultyNames[score.difficulty - 1]}
                  </p>
                  <p className="text-xs text-slate-500">
                    {score.player_name} • {new Date(score.created_date).toLocaleDateString()}
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