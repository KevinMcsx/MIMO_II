import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getPlayerProfile } from '../components/game/PlayerProgressManager';
import LevelDisplay from '../components/game/LevelDisplay';
import PlayerAvatar from '../components/profile/PlayerAvatar';
import { AVATARS, BADGES, FRAMES, THEMES } from '../components/profile/CosmeticData';

export default function Profile() {
  const playerName = localStorage.getItem('mimoPlayerName') || 'Player';
  const [activeTab, setActiveTab] = useState('avatars');

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['playerProfile', playerName],
    queryFn: () => getPlayerProfile(playerName),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates) => base44.entities.PlayerProfile.update(profile.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
    },
  });

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-slate-800">Loading...</div>
      </div>
    );
  }

  const equipAvatar = (avatarId) => {
    updateProfileMutation.mutate({ equipped_avatar: avatarId });
  };

  const equipBadge = (badgeId) => {
    updateProfileMutation.mutate({ equipped_badge: badgeId });
  };

  const equipFrame = (frameId) => {
    updateProfileMutation.mutate({ equipped_frame: frameId });
  };

  const equipTheme = (themeId) => {
    updateProfileMutation.mutate({ cosmetic_theme: themeId });
  };

  const currentTheme = THEMES[profile.cosmetic_theme] || THEMES.default;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.gradient} p-6`}>
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Game')}>
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Game
          </Button>
        </Link>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-black text-slate-800 mb-2">👤 Player Profile</h1>
          <p className="text-slate-600 text-lg">{playerName}</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-6 border-2 border-slate-200 shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <PlayerAvatar 
              avatar={profile.equipped_avatar}
              frame={profile.equipped_frame}
              badge={profile.equipped_badge}
              size="lg"
            />
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 mb-2">{playerName}</h2>
              <LevelDisplay level={profile.level} xp={profile.xp} />
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { id: 'avatars', label: '😊 Avatars' },
            { id: 'badges', label: '🏅 Badges' },
            { id: 'frames', label: '🖼️ Frames' },
            { id: 'themes', label: '🎨 Themes' },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={activeTab === tab.id ? 'bg-purple-600' : ''}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Cosmetics Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200"
        >
          {activeTab === 'avatars' && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(AVATARS).map(([id, avatar]) => {
                const isUnlocked = profile.unlocked_avatars.includes(id);
                const isEquipped = profile.equipped_avatar === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                    onClick={() => isUnlocked && equipAvatar(id)}
                    className={`
                      relative p-4 rounded-xl border-2 flex flex-col items-center gap-2
                      ${isEquipped ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600' : 'border-slate-200'}
                      ${!isUnlocked && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {!isUnlocked && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-slate-400" />
                    )}
                    <div className={`w-16 h-16 rounded-full ${avatar.color} flex items-center justify-center text-4xl`}>
                      {avatar.emoji}
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{avatar.name}</p>
                    {isEquipped && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(BADGES).map(([id, badge]) => {
                const isUnlocked = profile.unlocked_badges.includes(id);
                const isEquipped = profile.equipped_badge === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                    onClick={() => isUnlocked && equipBadge(id)}
                    className={`
                      relative p-4 rounded-xl border-2 flex flex-col items-center gap-2
                      ${isEquipped ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600' : 'border-slate-200'}
                      ${!isUnlocked && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {!isUnlocked && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-slate-400" />
                    )}
                    <div className="text-5xl">{badge.emoji}</div>
                    <p className="text-xs font-semibold text-slate-700">{badge.name}</p>
                    {isEquipped && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {activeTab === 'frames' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(FRAMES).map(([id, frame]) => {
                const isUnlocked = profile.unlocked_frames.includes(id);
                const isEquipped = profile.equipped_frame === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                    onClick={() => isUnlocked && equipFrame(id)}
                    className={`
                      relative p-4 rounded-xl border-2 flex flex-col items-center gap-3
                      ${isEquipped ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600' : 'border-slate-200'}
                      ${!isUnlocked && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {!isUnlocked && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-slate-400" />
                    )}
                    <div className={`w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center ${frame.border} ${frame.shadow}`}>
                      <Star className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{frame.name}</p>
                    {isEquipped && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(THEMES).map(([id, theme]) => {
                const isUnlocked = profile.unlocked_themes.includes(id);
                const isEquipped = profile.cosmetic_theme === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: isUnlocked ? 1.02 : 1 }}
                    whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
                    onClick={() => isUnlocked && equipTheme(id)}
                    className={`
                      relative p-6 rounded-xl border-2 flex items-center gap-4
                      ${isEquipped ? 'border-purple-600 ring-2 ring-purple-600' : 'border-slate-200'}
                      ${!isUnlocked && 'opacity-50 cursor-not-allowed'}
                    `}
                  >
                    {!isUnlocked && (
                      <Lock className="absolute top-2 right-2 w-4 h-4 text-slate-400" />
                    )}
                    <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${theme.gradient}`} />
                    <div className="text-left">
                      <p className="font-bold text-lg text-slate-800">{theme.name}</p>
                      <p className="text-xs text-slate-500">Background Theme</p>
                    </div>
                    {isEquipped && (
                      <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✓
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}