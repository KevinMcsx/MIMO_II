import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ChevronLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlayerAvatar from '../components/profile/PlayerAvatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../components/utils/translations';

export default function Leaderboard() {
  const t = useTranslation();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const playerName = localStorage.getItem('loopybrainPlayerName') || '';
  
  const gameNames = [t('colorReaction'), t('colorShape'), t('memoryMatch'), t('proChallenge'), t('patternRecognition'), t('numberMemory'), t('sequenceMemory'), t('juiceMaker'), t('patternPrediction'), t('shapeSorting'), t('twinHunt'), t('quickCount')];
  const difficultyNames = [t('easy'), t('medium'), t('hard'), t('expert')];

  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke('saveScoreToDrive', { syncAll: true });
      const count = res?.synced ?? 0;
      toast({ title: t('syncComplete').replace('{count}', count) });
    } catch (e) {
      toast({ title: t('syncFailed'), variant: 'destructive' });
    } finally {
      setSyncing(false);
    }
  };

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const getPlayerProfile = (name) => allProfiles.find(p => p.player_name === name);

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['leaderboard', selectedGame, selectedDifficulty, timeFilter],
    queryFn: async () => {
      const filters = {};
      if (selectedGame) filters.game_type = selectedGame;
      if (selectedDifficulty) filters.difficulty = selectedDifficulty;
      
      const allScores = await base44.entities.GameScore.filter(filters, '-score', 500);
      
      // Filter by time
      if (timeFilter !== 'all-time') {
        const now = new Date();
        const cutoffDate = new Date();
        
        if (timeFilter === 'daily') {
          cutoffDate.setHours(0, 0, 0, 0);
        } else if (timeFilter === 'weekly') {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (timeFilter === 'monthly') {
          cutoffDate.setMonth(now.getMonth() - 1);
        }
        
        return allScores.filter(score => new Date(score.created_date) >= cutoffDate).slice(0, 50);
      }
      
      return allScores.slice(0, 50);
    },
  });

  const getMedalIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-8 h-8 text-yellow-400" />;
    if (rank === 1) return <Medal className="w-7 h-7 text-slate-300" />;
    if (rank === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Link to={createPageUrl('Game')}>
            <Button variant="ghost">
              <ChevronLeft className="w-5 h-5 mr-2" />
              {t('backToGame')}
            </Button>
          </Link>
          <Button variant="outline" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {t('syncToSheet')}
          </Button>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-slate-800 mb-2">🏆 {t('leaderboard')}</h1>
          <p className="text-slate-600 text-lg">{t('topPlayers')}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-purple-300 font-semibold text-purple-700"
          >
            <option value="daily">{t('daily')}</option>
            <option value="weekly">{t('weekly')}</option>
            <option value="monthly">{t('monthly')}</option>
            <option value="all-time">{t('allTime')}</option>
          </select>

          <select
            value={selectedGame || ''}
            onChange={(e) => setSelectedGame(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-slate-300 font-semibold"
          >
            <option value="">{t('allGames')}</option>
            {gameNames.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty || ''}
            onChange={(e) => setSelectedDifficulty(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 rounded-lg bg-white border-2 border-slate-300 font-semibold"
          >
            <option value="">{t('allDifficulties')}</option>
            {difficultyNames.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No scores yet!</div>
          ) : (
            scores.map((score, index) => {
              const isCurrentPlayer = score.player_name === playerName;
              const playerProfile = getPlayerProfile(score.player_name);
              return (
              <motion.div
                key={score.id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center gap-4 p-4 rounded-xl border-2 relative
                  ${isCurrentPlayer ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-400 ring-2 ring-purple-400' : 
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' : 
                    'bg-white border-slate-200'}
                `}
              >
                {isCurrentPlayer && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {t('you').toUpperCase()}
                  </div>
                )}
                <div className="w-12 flex justify-center">
                  {getMedalIcon(index) || (
                    <span className="text-2xl font-bold text-slate-400">#{index + 1}</span>
                  )}
                </div>

                {playerProfile && (
                  <PlayerAvatar 
                    avatar={playerProfile.equipped_avatar}
                    frame={playerProfile.equipped_frame}
                    badge={playerProfile.equipped_badge}
                    size="sm"
                  />
                )}

                <div className="flex-1">
                  <p className="font-bold text-lg text-slate-800">{score.player_name}</p>
                  <p className="text-sm text-slate-500">
                    {gameNames[score.game_type - 1]} • {difficultyNames[score.difficulty - 1]}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-purple-600">{score.score}</p>
                  <p className="text-xs text-slate-500">
                    {(score.avg_reaction_time || 0).toFixed(0)}ms avg
                  </p>
                </div>
              </motion.div>
            );
            })
          )}
        </div>
      </div>
    </div>
  );
}