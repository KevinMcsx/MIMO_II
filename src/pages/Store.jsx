import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingBag, Coins, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getPlayerProfile } from '../components/game/PlayerProgressManager';
import { AVATARS, SOUND_PACKS, CURSORS } from '../components/profile/CosmeticData';
import { toast } from 'sonner';

export default function Store() {
  const playerName = localStorage.getItem('mimoPlayerName') || 'Player';
  const [activeTab, setActiveTab] = useState('avatars');

  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['playerProfile', playerName],
    queryFn: () => getPlayerProfile(playerName),
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ itemType, itemId, price }) => {
      const currentCoins = profile.coins || 0;
      if (currentCoins < price) {
        throw new Error('Not enough coins');
      }

      const updates = { coins: currentCoins - price };
      
      if (itemType === 'avatar') {
        updates.unlocked_avatars = [...(profile.unlocked_avatars || ['default']), itemId];
      } else if (itemType === 'sound_pack') {
        updates.unlocked_sound_packs = [...(profile.unlocked_sound_packs || ['default']), itemId];
      } else if (itemType === 'cursor') {
        updates.unlocked_cursors = [...(profile.unlocked_cursors || ['default']), itemId];
      }

      return base44.entities.PlayerProfile.update(profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerProfile'] });
      toast.success('Item purchased successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Purchase failed');
    },
  });

  const handlePurchase = (itemType, itemId, price) => {
    purchaseMutation.mutate({ itemType, itemId, price });
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-slate-800">Loading...</div>
      </div>
    );
  }

  const purchasableAvatars = Object.entries(AVATARS).filter(([id, avatar]) => avatar.price);
  const purchasableSoundPacks = Object.entries(SOUND_PACKS).filter(([id, pack]) => pack.price);
  const purchasableCursors = Object.entries(CURSORS).filter(([id, cursor]) => cursor.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
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
          <h1 className="text-5xl font-black text-slate-800 mb-2">🛍️ Cosmetic Store</h1>
          <p className="text-slate-600 text-lg">Use coins to unlock exclusive items</p>
          
          <div className="inline-flex items-center gap-2 mt-4 bg-yellow-100 border-2 border-yellow-300 rounded-full px-6 py-3">
            <Coins className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-black text-yellow-700">{profile.coins || 0}</span>
            <span className="text-slate-600">Coins</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { id: 'avatars', label: '😊 Avatars', count: purchasableAvatars.length },
            { id: 'sounds', label: '🎵 Sounds', count: purchasableSoundPacks.length },
            { id: 'cursors', label: '✨ Cursors', count: purchasableCursors.length },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              className={activeTab === tab.id ? 'bg-purple-600' : ''}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>

        {/* Store Items */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {activeTab === 'avatars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasableAvatars.map(([id, avatar]) => {
                const isOwned = (profile.unlocked_avatars || ['default']).includes(id);
                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 flex items-center gap-4"
                  >
                    <div className={`w-20 h-20 rounded-full ${avatar.color} flex items-center justify-center text-4xl ${avatar.animated ? 'animate-bounce' : ''}`}>
                      {avatar.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800">{avatar.name}</h3>
                      <p className="text-sm text-slate-500">{avatar.animated ? '✨ Animated' : 'Static Avatar'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-yellow-700">{avatar.price}</span>
                      </div>
                    </div>
                    {isOwned ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Check className="w-5 h-5" />
                        Owned
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePurchase('avatar', id, avatar.price)}
                        disabled={profile.coins < avatar.price}
                        className="bg-purple-600"
                      >
                        {profile.coins < avatar.price ? <Lock className="w-4 h-4" /> : 'Buy'}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasableSoundPacks.map(([id, pack]) => {
                const isOwned = (profile.unlocked_sound_packs || ['default']).includes(id);
                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-3xl">
                      {pack.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800">{pack.name}</h3>
                      <p className="text-sm text-slate-500">{pack.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-yellow-700">{pack.price}</span>
                      </div>
                    </div>
                    {isOwned ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Check className="w-5 h-5" />
                        Owned
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePurchase('sound_pack', id, pack.price)}
                        disabled={profile.coins < pack.price}
                        className="bg-purple-600"
                      >
                        {profile.coins < pack.price ? <Lock className="w-4 h-4" /> : 'Buy'}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {activeTab === 'cursors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasableCursors.map(([id, cursor]) => {
                const isOwned = (profile.unlocked_cursors || ['default']).includes(id);
                return (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-200 flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-3xl">
                      {cursor.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800">{cursor.name}</h3>
                      <p className="text-sm text-slate-500">{cursor.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="font-bold text-yellow-700">{cursor.price}</span>
                      </div>
                    </div>
                    {isOwned ? (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <Check className="w-5 h-5" />
                        Owned
                      </div>
                    ) : (
                      <Button
                        onClick={() => handlePurchase('cursor', id, cursor.price)}
                        disabled={profile.coins < cursor.price}
                        className="bg-purple-600"
                      >
                        {profile.coins < cursor.price ? <Lock className="w-4 h-4" /> : 'Buy'}
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-semibold">💡 Tip: Earn coins by playing games! Score higher to earn more coins.</p>
        </div>
      </div>
    </div>
  );
}