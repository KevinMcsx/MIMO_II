import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import ShapeIcon from './ShapeIcon';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const shapes = ['circle', 'square', 'triangle', 'star'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function Game24ShapeStack({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [phase, setPhase] = useState('show');
  const [sequence, setSequence] = useState([]);
  const [showShape, setShowShape] = useState(null);
  const [showStep, setShowStep] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const startTimeRef = useRef(0);
  const timersRef = useRef([]);

  const ds = { 1: { seqLen: 3, rounds: 8, speed: 800, mult: 1 }, 2: { seqLen: 4, rounds: 10, speed: 700, mult: 1.5 }, 3: { seqLen: 5, rounds: 12, speed: 600, mult: 2 }, 4: { seqLen: 6, rounds: 15, speed: 500, mult: 3 } };
  const s = ds[difficulty];
  const totalRounds = s.rounds;

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) { sounds.countdown(); const tm = setTimeout(() => setCountdown(countdown - 1), 1000); return () => clearTimeout(tm); }
    else if (gameState === 'countdown' && countdown === 0) { sounds.gameStart(); setGameState('playing'); startTimeRef.current = Date.now(); generateRound(); }
  }, [countdown, gameState]);

  useEffect(() => () => clearTimers(), []);

  const generateRound = () => {
    clearTimers();
    const seq = Array.from({ length: s.seqLen }, () => rand(shapes));
    setSequence(seq);
    setShowShape(null);
    setInputIndex(0);
    setPhase('show');
    seq.forEach((sh, i) => {
      timersRef.current.push(setTimeout(() => { setShowShape(sh); setShowStep(i); sounds.buttonPress(); }, i * s.speed));
      timersRef.current.push(setTimeout(() => setShowShape(null), i * s.speed + s.speed * 0.7));
    });
    timersRef.current.push(setTimeout(() => { setPhase('input'); }, seq.length * s.speed + 200));
  };

  const handleShapeClick = (shape) => {
    if (gameState !== 'playing' || phase !== 'input' || paused) return;
    if (shape === sequence[inputIndex]) {
      sounds.correctHit();
      const ni = inputIndex + 1;
      setInputIndex(ni);
      if (ni === sequence.length) {
        setScore(score + Math.round(100 * s.mult));
        setCorrectCount(correctCount + 1);
        if (round < totalRounds) { setRound(round + 1); setTimeout(generateRound, 500); } else endGame();
      }
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
      setTimeout(generateRound, 500);
    }
  };

  const endGame = async () => {
    clearTimers();
    sounds.gameEnd();
    const totalTime = Date.now() - startTimeRef.current;
    await saveGameResult({ game_type: 24, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Date.now() - startTimeRef.current;
    return <ResultsScreen gameTitle={t('shapeStack')} gameResult={{ game_type: 24, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts: correctCount + wrongCount }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div><p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p><p className="text-lg font-semibold text-teal-600">{t('score')}: {score}</p></div>
          <div className="flex gap-2"><Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button><Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button></div>
        </div>
        <AnimatePresence>{gameState === 'countdown' && countdown > 0 && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"><div className="text-9xl font-black text-white">{countdown}</div></motion.div>)}</AnimatePresence>
        <AnimatePresence>{paused && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"><div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div></motion.div>)}</AnimatePresence>
        <div className="mb-6 text-center"><p className="text-lg font-semibold text-slate-700">{phase === 'show' ? '👀 Watch the sequence...' : `Repeat it in order! (${inputIndex}/${sequence.length})`}</p></div>
        {phase === 'show' && (
          <div className="flex justify-center items-center h-32 mb-6">
            {showShape ? <motion.div key={showStep} initial={{ scale: 0 }} animate={{ scale: 1 }}><ShapeIcon shape={showShape} color="#475569" size={90} /></motion.div> : <div className="w-24 h-24" />}
          </div>
        )}
        {phase === 'input' && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {shapes.map(sh => <button key={sh} onClick={() => handleShapeClick(sh)} className="aspect-square bg-slate-100 rounded-2xl border-2 border-slate-200 hover:border-teal-400 flex items-center justify-center transition-all"><ShapeIcon shape={sh} color="#475569" size={56} /></button>)}
          </div>
        )}
        <div className="flex justify-around text-center"><div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div><div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div></div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={24} />
    </div>
  );
}