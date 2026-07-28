import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default function Game31MathFlash({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [roundTime, setRoundTime] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [problem, setProblem] = useState(null);
  const [options, setOptions] = useState([]);

  const ds = { 1: { rounds: 12, maxNum: 10, ops: ['+', '-'], roundTime: 8, mult: 1 }, 2: { rounds: 15, maxNum: 20, ops: ['+', '-'], roundTime: 7, mult: 1.5 }, 3: { rounds: 18, maxNum: 12, ops: ['+', '-', '×'], roundTime: 6, mult: 2 }, 4: { rounds: 20, maxNum: 20, ops: ['+', '-', '×'], roundTime: 5, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); generateRound(); }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && roundTime > 0) { const tm = setTimeout(() => setRoundTime(roundTime - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'playing' && roundTime === 0 && !paused) { sounds.wrongHit(); setWrongCount(wrongCount + 1); if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame(); }
  }, [roundTime, gameState, paused]);

  const generateRound = () => {
    const op = s.ops[Math.floor(Math.random() * s.ops.length)];
    let a = rand(1, s.maxNum), b = rand(1, s.maxNum);
    if (op === '-' && b > a) [a, b] = [b, a];
    const result = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const opts = new Set([result]);
    while (opts.size < 4) { const d = result + rand(-5, 5); if (d >= 0 && d !== result) opts.add(d); }
    setProblem({ a, b, op, result });
    setOptions(shuffle([...opts]));
    setRoundTime(s.roundTime);
  };

  const handleAnswer = (val) => {
    if (gameState !== 'playing' || paused) return;
    if (val === problem.result) {
      sounds.correctHit();
      setScore(score + Math.round(100 * s.mult));
      setCorrectCount(correctCount + 1);
      if (round < totalRounds) { setRound(round + 1); generateRound(); } else endGame();
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    const totalTime = Math.round(round * s.roundTime * 1000);
    await saveGameResult({ game_type: 31, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Math.round(round * s.roundTime * 1000);
    return <ResultsScreen gameTitle={t('mathFlash')} gameResult={{ game_type: 31, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-emerald-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2 items-center"><p className="text-xl font-bold text-slate-700">⏱️ {roundTime}s</p><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        {problem && (
          <div className="flex justify-center mb-8">
            <div className="text-5xl sm:text-6xl font-black text-slate-800">{problem.a} {problem.op} {problem.b} = ?</div>
          </div>
        )}
        {gameState === 'playing' && (
          <div className="grid grid-cols-2 gap-4">
            {options.map((o, i) => <Button key={i} onClick={() => handleAnswer(o)} className="h-16 text-2xl font-bold" variant="outline">{o}</Button>)}
          </div>
        )}
        <div className="flex justify-around text-center mt-6"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={31} />
    </div>
  );
}