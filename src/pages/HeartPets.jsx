import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CREATURES, STAGE_NAMES, applyDecay, applyCare, applyTouch, calcMood,
} from '@/components/heartpets/petEngine';
import { heartbeat } from '@/components/heartpets/heartbeat';
import PetDisplay from '@/components/heartpets/PetDisplay';
import StatsPanel from '@/components/heartpets/StatsPanel';
import CareActions from '@/components/heartpets/CareActions';
import CreatureSelect from '@/components/heartpets/CreatureSelect';
import DailyReward from '@/components/heartpets/DailyReward';

const STORAGE_KEY = 'heartpets_state';
const SETTINGS_KEY = 'heartpets_settings';
const DAILY_KEY = 'heartpets_daily';

function loadPet() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return applyDecay(JSON.parse(raw)); } catch { return null; }
}

function getDailyInfo() {
  const raw = localStorage.getItem(DAILY_KEY);
  if (!raw) return { last: null, streak: 0 };
  try { return JSON.parse(raw); } catch { return { last: null, streak: 0 }; }
}

export default function HeartPets() {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDaily, setShowDaily] = useState(false);
  const [dailyInfo, setDailyInfo] = useState(getDailyInfo());
  const [heartbeatOn, setHeartbeatOn] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const [actionAnim, setActionAnim] = useState(null);
  const [evolveFlash, setEvolveFlash] = useState(false);
  const prevStage = useRef(null);
  const lastTouch = useRef(0);

  // Load on mount
  useEffect(() => {
    setPet(loadPet());
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    setHeartbeatOn(s.heartbeatOn !== false);
    setLoading(false);
  }, []);

  // Daily reward check
  useEffect(() => {
    if (!pet) return;
    const today = new Date().toDateString();
    if (dailyInfo.last !== today) setShowDaily(true);
  }, [pet]);

  // Auto-save every 30s
  useEffect(() => {
    if (!pet) return;
    const id = setInterval(() => {
      setPet(p => { const d = applyDecay(p); localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); return d; });
    }, 30000);
    return () => clearInterval(id);
  }, [pet?.creatureId]);

  // Save on unmount
  useEffect(() => {
    return () => { const cur = loadPet(); if (cur) localStorage.setItem(STORAGE_KEY, JSON.stringify(cur)); };
  }, []);

  // Stat tick for live display
  useEffect(() => {
    if (!pet) return;
    const id = setInterval(() => setPet(p => p ? applyDecay(p) : p), 5000);
    return () => clearInterval(id);
  }, [pet?.creatureId]);

  // Evolution flash
  useEffect(() => {
    if (prevStage.current != null && pet && pet.stage > prevStage.current) {
      setEvolveFlash(true);
      heartbeat.playEffect('play');
      setTimeout(() => setEvolveFlash(false), 2000);
    }
    if (pet) prevStage.current = pet.stage;
  }, [pet?.stage]);

  // Heartbeat control
  useEffect(() => {
    if (!audioReady || !heartbeatOn || !pet || pet.stage === 0) {
      heartbeat.stop();
      return;
    }
    heartbeat.setVolume(0.25);
    heartbeat.start(calcMood(pet.stats));
    return () => heartbeat.stop();
  }, [audioReady, heartbeatOn, pet?.stage, pet?.stats?.happiness, pet?.stats?.energy, pet?.stats?.health]);

  const handleAdopt = (creatureId, name) => {
    const CREATURE = CREATURES.find(c => c.id === creatureId);
    const newPet = {
      creatureId, name: name || CREATURE.name,
      stage: 0,
      stats: { hunger: 80, thirst: 80, happiness: 80, energy: 80, cleanliness: 80, health: 100, intelligence: 10, affection: 10 },
      xp: 0, level: 1, coins: 50, lastUpdated: Date.now(), bornAt: Date.now(), careCount: 0,
    };
    setPet(newPet);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPet));
    setAudioReady(true);
    heartbeat.unlock();
  };

  const handleTouch = () => {
    setAudioReady(true);
    heartbeat.unlock();
    heartbeat.playVoice(pet.creatureId);
    const now = Date.now();
    if (now - lastTouch.current < 1500) return; // small cooldown
    lastTouch.current = now;
    setPet(prev => {
      const updated = applyTouch(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActionAnim({ id: 'pet', icon: '💕' });
    setTimeout(() => setActionAnim(null), 500);
  };

  const handleCare = (action) => {
    setAudioReady(true);
    heartbeat.unlock();
    setPet(prev => {
      const updated = applyCare(prev, action);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActionAnim(action);
    heartbeat.playEffect(action.id);
    setTimeout(() => setActionAnim(null), 600);
  };

  const handleClaimDaily = (reward) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = dailyInfo.last === yesterday ? dailyInfo.streak + 1 : 1;
    const info = { last: today, streak: newStreak };
    setDailyInfo(info);
    localStorage.setItem(DAILY_KEY, JSON.stringify(info));
    setPet(prev => {
      const updated = { ...prev, coins: prev.coins + reward.coins };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setShowDaily(false);
  };

  const handleReset = () => {
    if (!confirm('Release your companion and start over? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setPet(null);
    prevStage.current = null;
  };

  const toggleHeartbeat = () => {
    setAudioReady(true);
    heartbeat.unlock();
    const v = !heartbeatOn;
    setHeartbeatOn(v);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ heartbeatOn: v }));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-rose-50">
      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>;
  }

  if (!pet) return <CreatureSelect onAdopt={handleAdopt} />;

  const mood = calcMood(pet.stats);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-sky-50 p-4 pb-10`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/Game">
            <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-100">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="text-lg font-black text-purple-900 flex items-center gap-1">
            <Heart className="w-4 h-4 fill-purple-500" /> HeartPets
          </h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={toggleHeartbeat} className="text-purple-700 hover:bg-purple-100">
              {heartbeatOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset} className="text-purple-700 hover:bg-purple-100">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Evolution flash */}
        {evolveFlash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center mb-2"
          >
            <span className="inline-block bg-gradient-to-r from-yellow-400 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              ✨ Evolved into {STAGE_NAMES[pet.stage]}! ✨
            </span>
          </motion.div>
        )}

        {/* Pet */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <PetDisplay pet={pet} mood={mood} actionAnim={actionAnim} onTouch={handleTouch} />
        </motion.div>

        {pet.stage > 0 && (
          <p className="text-center text-xs text-purple-400 mt-2">👆 Tap your companion to hear its voice</p>
        )}

        {/* Stats */}
        <div className="mt-4">
          <StatsPanel pet={pet} />
        </div>

        {/* Care actions */}
        <div className="mt-4">
          <CareActions onCare={handleCare} disabled={false} />
        </div>

        <p className="text-center text-xs text-purple-400 mt-4">
          Care for your companion daily · Saves offline automatically
        </p>
      </div>

      <DailyReward show={showDaily} onClaim={handleClaimDaily} streak={dailyInfo.streak} />
    </div>
  );
}