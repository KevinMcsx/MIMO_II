import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, ChevronLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PlayerAvatar from '../components/profile/PlayerAvatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PullToRefresh from '@/components/PullToRefresh';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTranslation } from '../components/utils/translations';

export default function Leaderboard() {
  const t = useTranslation();
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all-time');
  const playerName = localStorage.getItem('loopybrainPlayerName') || '';
  
  const gameNames = [t('colorReaction'), t('colorShape'), t('memoryMatch'), t('proChallenge'), t('patternRecognition'), t('numberMemory'), t('sequenceMemory'), t('juiceMaker'), t('patternPrediction'), t('shapeSorting'), t('twinHunt'), t('quickCount'), t('speedMatch'), t('lightTrack'), t('colorInvaders'), t('reverseSequence'), t('visualSearch'), t('stroopColor'), t('reactionTarget'), t('speedTap'), t('quickColor'), t('goNoGo'), t('memoryMatrix'), t('shapeStack'), t('nBack'), t('oddColor'), t('oddSize'), t('spotDifference'), t('findMax'), t('tapOrder'), t('mathFlash'), t('higherLower'), t('numberSequence'), t('evenOdd'), t('colorSort'), t('shapeMatch')];
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

  const { data: allProfiles = [], refetch: refetchProfiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const getPlayerProfile = (name) => allProfiles.find(p => p.player_name === name);

  const { data: scores = [], isLoading, refetch: refetchScores } = useQuery({
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6 pb-24 md:pb-6 safe-top">
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
          <h1 className="text-5xl font-black text-slate-800 dark:text-slate-100 mb-2">🏆 {t('leaderboard')}</h1>
          <p className="text-slate-600 text-lg">{t('topPlayers')}</p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-500 rounded-lg font-semibold text-purple-700 dark:text-purple-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t('daily')}</SelectItem>
              <SelectItem value="weekly">{t('weekly')}</SelectItem>
              <SelectItem value="monthly">{t('monthly')}</SelectItem>
              <SelectItem value="all-time">{t('allTime')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedGame != null ? String(selectedGame) : 'all'}
            onValueChange={(v) => setSelectedGame(v === 'all' ? null : Number(v))}
          >
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allGames')}</SelectItem>
              {gameNames.map((name, i) => (
                <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDifficulty != null ? String(selectedDifficulty) : 'all'}
            onValueChange={(v) => setSelectedDifficulty(v === 'all' ? null : Number(v))}
          >
            <SelectTrigger className="w-[170px] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDifficulties')}</SelectItem>
              {difficultyNames.map((name, i) => (
                <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leaderboard */}
        <PullToRefresh onRefresh={async () => { await Promise.all([refetchScores(), refetchProfiles()]); }}>
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading...</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">No scores yet!</div>
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
                  ${isCurrentPlayer ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 border-purple-400 dark:border-purple-500 ring-2 ring-purple-400' : 
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 border-yellow-300 dark:border-yellow-600' : 
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}
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
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{score.player_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {gameNames[score.game_type - 1]} • {difficultyNames[score.difficulty - 1]}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-purple-600">{score.score}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(score.avg_reaction_time || 0).toFixed(0)}ms avg
                  </p>
                </div>
              </motion.div>
            );
            })
          )}
        </div>
        </PullToRefresh>
      </div>
    </div>
  );
}