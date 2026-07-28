import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const colors = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Game21QuickColor({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStart, setRoundStart] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [targetColor, setTargetColor] = useState(null);

  const ds = { 1: { rounds: 15, mult: 1 }, 2: { rounds: 20, mult: 1.5 }, 3: { rounds: 25, mult: 2 }, 4: { rounds: 30, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); generateRound(); }
  }, [countdown, gameState]);

  const generateRound = () => { setTargetColor(rand(colors)); setRoundStart(Date.now()); };

  const handleAnswer = (hex) => {
    if (gameState !== 'playing' || paused) return;
    const rt = Date.now() - roundStart;
    setReactionTimes([...reactionTimes, rt]);
    if (hex === targetColor) {
      sounds.correctHit();
      setScore(score + Math.round(100 * s.mult));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
    if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
  };

  const endGame = async () => {
    sounds.gameEnd();
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    const totalTime = avg * totalRounds;
    await saveGameResult({ game_type: 21, difficulty, total_time: totalTime, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const avg = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    return <ResultsScreen gameTitle={t('quickColor')} gameResult={{ game_type: 21, difficulty, score, avg_reaction_time: avg, correct_hits: correctCount, wrong_hits: wrongCount, total_time: avg * totalRounds }} stats={{ totalTime: avg * totalRounds, avgReactionTime: avg, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-cyan-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2"><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <p className="mb-4 text-center text-sm font-semibold text-slate-500 uppercase">Tap the matching color</p>
        <div className="flex justify-center mb-8">
          {targetColor && <motion.div key={round} initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-28 h-28 rounded-full shadow-lg" style={{ backgroundColor: targetColor }} />}
        </div>
        {gameState === 'playing' && (
          <div className="grid grid-cols-4 gap-3">
            {colors.map(c => <button key={c} onClick={() => handleAnswer(c)} className="h-16 rounded-xl shadow hover:scale-105 transition-transform" style={{ backgroundColor: c }} />)}
          </div>
        )}
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={21} />
    </div>
  );
}