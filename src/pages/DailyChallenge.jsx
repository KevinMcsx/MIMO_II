import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Star, Trophy, ChevronLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Game1ColorReaction from '../components/game/Game1ColorReaction';
import Game2ColorShape from '../components/game/Game2ColorShape';
import Game3Memory from '../components/game/Game3Memory';
import Game4ProChallenge from '../components/game/Game4ProChallenge';
import { useTranslation } from '../components/utils/translations';

export default function DailyChallenge() {
  const t = useTranslation();
  const [playing, setPlaying] = useState(false);
  const playerName = localStorage.getItem('mimoPlayerName');
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();
  
  const gameNames = [t('colorReaction'), t('colorShape'), t('memoryMatch'), t('proChallenge')];
  const difficultyNames = [t('easy'), t('medium'), t('hard'), t('expert')];

  // Redirect to game if no player name
  useEffect(() => {
    if (!playerName) {
      window.location.href = createPageUrl('Game');
    }
  }, [playerName]);

  const { data: challenge } = useQuery({
    queryKey: ['dailyChallenge', today],
    queryFn: async () => {
      const challenges = await base44.entities.DailyChallenge.filter({ date: today }, '-created_date', 1);
      if (challenges.length > 0) return challenges[0];
      
      // Generate today's challenge
      const gameType = Math.floor(Math.random() * 4) + 1;
      const difficulty = Math.floor(Math.random() * 4) + 1;
      const targetScore = 10 + (difficulty * 10) + (gameType * 5);
      
      return await base44.entities.DailyChallenge.create({
        date: today,
        game_type: gameType,
        difficulty: difficulty,
        target_score: targetScore,
        reward_stars: difficulty,
      });
    },
  });

  const { data: completion } = useQuery({
    queryKey: ['challengeCompletion', today, playerName],
    queryFn: async () => {
      if (!playerName) return null;
      const completions = await base44.entities.ChallengeCompletion.filter(
        { challenge_date: today, player_name: playerName },
        '-created_date',
        1
      );
      return completions.length > 0 ? completions[0] : null;
    },
    enabled: !!playerName,
  });

  const completeMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ChallengeCompletion.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challengeCompletion']);
    },
  });

  const handleGameEnd = async (finalScore) => {
    if (!challenge || completion) return;

    const completed = finalScore >= challenge.target_score;
    
    await completeMutation.mutateAsync({
      challenge_date: today,
      player_name: playerName,
      completed: completed,
      score: finalScore,
      stars_earned: completed ? challenge.reward_stars : 0,
    });

    setPlaying(false);
  };

  const renderGame = () => {
    if (!challenge) return null;
    
    const gameProps = {
      difficulty: challenge.difficulty,
      onMainMenu: () => setPlaying(false),
      playerName: playerName,
      onGameEnd: handleGameEnd,
    };

    switch (challenge.game_type) {
      case 1: return <Game1ColorReaction {...gameProps} />;
      case 2: return <Game2ColorShape {...gameProps} />;
      case 3: return <Game3Memory {...gameProps} />;
      case 4: return <Game4ProChallenge {...gameProps} />;
      default: return null;
    }
  };

  if (playing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100">
        <div className="relative bg-[url('https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 to-pink-900/60" />
          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
            {renderGame()}
          </div>
        </div>
      </div>
    );
  }

  if (!playerName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Link to={createPageUrl('Game')}>
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="w-5 h-5 mr-2" />
            {t('backToGame')}
          </Button>
        </Link>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-slate-800 mb-2">📅 {t('dailyChallenge')}</h1>
          <p className="text-slate-600 text-lg">{t('completeTodaysChallenge')}</p>
        </motion.div>

        {challenge && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 border-4 border-slate-300 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {gameNames[challenge.game_type - 1]}
                  </p>
                  <p className="text-slate-600">{difficultyNames[challenge.difficulty - 1]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(challenge.reward_stars)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-6">
              <p className="text-slate-700 text-center text-lg">
                <span className="font-bold">{t('targetScore')}:</span>{' '}
                <span className="text-3xl font-black text-purple-600">{challenge.target_score}</span>
              </p>
            </div>

            {completion ? (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-4 ${
                    completion.completed
                      ? 'bg-green-100 border-2 border-green-400'
                      : 'bg-slate-100 border-2 border-slate-300'
                  }`}
                >
                  {completion.completed ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div className="text-left">
                        <p className="font-black text-green-700 text-xl">{t('challengeComplete')}</p>
                        <p className="text-green-600">{t('score')}: {completion.score}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-8 h-8 text-slate-500" />
                      <div className="text-left">
                        <p className="font-black text-slate-700 text-xl">{t('challengeAttempted')}</p>
                        <p className="text-slate-600">{t('score')}: {completion.score} ({t('targetScore')}: {challenge.target_score})</p>
                      </div>
                    </>
                  )}
                </motion.div>
                <p className="text-slate-500">{t('comeBackTomorrow')}</p>
              </div>
            ) : (
              <Button
                onClick={() => setPlaying(true)}
                className="w-full h-14 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {t('startChallenge')}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}