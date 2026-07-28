import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function Game32HigherLower({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [numA, setNumA] = useState(null);
  const [numB, setNumB] = useState(null);
  const [revealB, setRevealB] = useState(false);

  const ds = { 1: { rounds: 12, maxNum: 50, mult: 1 }, 2: { rounds: 15, maxNum: 80, mult: 1.5 }, 3: { rounds: 18, maxNum: 99, mult: 2 }, 4: { rounds: 20, maxNum: 99, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); generateRound(); }
  }, [countdown, gameState]);

  const generateRound = () => {
    const a = rand(1, s.maxNum);
    let b; do { b = rand(1, s.maxNum); } while (b === a);
    setNumA(a); setNumB(b); setRevealB(false);
  };

  const handleAnswer = (saidHigher) => {
    if (gameState !== 'playing' || paused || revealB) return;
    setRevealB(true);
    const isHigher = numB > numA;
    if (isHigher === saidHigher) {
      sounds.correctHit();
      setScore(score + Math.round(100 * s.mult));
      setCorrectCount(correctCount + 1);
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
    setTimeout(() => { if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame(); }, 800);
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = round * 2000;
    await saveGameResult({ game_type: 32, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    return <ResultsScreen gameTitle={t('higherLower')} gameResult={{ game_type: 32, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: round * 2000 }} stats={{ totalTime: round * 2000, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-rose-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2"><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div className="mb-4 text-center"><p className="text-sm font-semibold text-slate-500 uppercase">Is the second number higher or lower?</p></div>
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center"><p className="text-xs text-slate-400 mb-1">First</p><div className="w-24 h-24 bg-rose-50 rounded-2xl border-2 border-rose-200 flex items-center justify-center text-4xl font-black text-slate-800">{numA}</div></div>
          <span className="text-2xl text-slate-300">→</span>
          <div className="text-center"><p className="text-xs text-slate-400 mb-1">Second</p><div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-4xl font-black ${revealB ? 'bg-rose-100 border-rose-400 text-rose-700' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>{revealB ? numB : '?'}</div></div>
        </div>
        {gameState === 'playing' && !revealB && (
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => handleAnswer(true)} className="h-16 text-xl font-bold bg-green-500 hover:bg-green-600"><ArrowUp className="w-6 h-6 mr-2" /> Higher</Button>
            <Button onClick={() => handleAnswer(false)} className="h-16 text-xl font-bold bg-red-500 hover:bg-red-600"><ArrowDown className="w-6 h-6 mr-2" /> Lower</Button>
          </div>
        )}
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={32} />
    </div>
  );
}