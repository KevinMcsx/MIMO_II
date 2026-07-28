import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const shapes = ['circle', 'square', 'triangle', 'star'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ShapeIcon = ({ shape, size = 70, color = '#475569' }) => {
  const map = {
    circle: <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />,
    square: <div style={{ width: size, height: size, backgroundColor: color }} />,
    triangle: <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />,
    star: <div style={{ fontSize: size, color, lineHeight: 1 }}>★</div>,
  };
  return <div className="flex items-center justify-center">{map[shape]}</div>;
};

export default function Game16ReverseSequence({ difficulty, onMainMenu, playerName }) {
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

  const difficultySettings = {
    1: { seqLen: 3, rounds: 8, speed: 800, scoreMultiplier: 1 },
    2: { seqLen: 4, rounds: 10, speed: 700, scoreMultiplier: 1.5 },
    3: { seqLen: 5, rounds: 12, speed: 600, scoreMultiplier: 2 },
    4: { seqLen: 6, rounds: 15, speed: 500, scoreMultiplier: 3 },
  };
  const settings = difficultySettings[difficulty];
  const totalRounds = settings.rounds;

  const clearTimers = () => { timersRef.current.forEach(clearTimeout); timersRef.current = []; };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const tm = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(tm);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      startTimeRef.current = Date.now();
      generateRound();
    }
  }, [countdown, gameState]);

  useEffect(() => () => clearTimers(), []);

  const generateRound = () => {
    clearTimers();
    const seq = Array.from({ length: settings.seqLen }, () => rand(shapes));
    setSequence(seq);
    setShowShape(null);
    setInputIndex(0);
    setPhase('show');

    seq.forEach((s, i) => {
      timersRef.current.push(setTimeout(() => { setShowShape(s); setShowStep(i); sounds.buttonPress(); }, i * settings.speed));
      timersRef.current.push(setTimeout(() => setShowShape(null), i * settings.speed + settings.speed * 0.7));
    });
    timersRef.current.push(setTimeout(() => { setPhase('input'); }, seq.length * settings.speed + 200));
  };

  const handleShapeClick = (shape) => {
    if (gameState !== 'playing' || phase !== 'input' || paused) return;
    const expected = sequence[sequence.length - 1 - inputIndex];
    if (shape === expected) {
      sounds.correctHit();
      const ni = inputIndex + 1;
      setInputIndex(ni);
      if (ni === sequence.length) {
        setScore(score + Math.round(100 * settings.scoreMultiplier));
        setCorrectCount(correctCount + 1);
        if (round < totalRounds) { setRound(round + 1); setTimeout(generateRound, 500); }
        else endGame();
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
    await saveGameResult({ game_type: 16, difficulty, total_time: totalTime, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, correct_shapes: correctCount, wrong_shapes: wrongCount, score, player_name: playerName });
    setGameState('finished');
  };

  const togglePause = () => { setPaused(!paused); sounds.buttonPress(); };

  if (gameState === 'finished') {
    const totalTime = Date.now() - startTimeRef.current;
    const totalAttempts = correctCount + wrongCount;
    return <ResultsScreen gameTitle={t('reverseSequence')} gameResult={{ game_type: 16, difficulty, score, avg_reaction_time: 0, correct_hits: correctCount, wrong_hits: wrongCount, total_time: totalTime }} stats={{ totalTime, avgReactionTime: 0, correctHits: correctCount, wrongHits: wrongCount, totalAttempts }} onPlayAgain={() => window.location.reload()} onMainMenu={onMainMenu} playerName={playerName} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">{t('round')} {round}/{totalRounds}</p>
            <p className="text-lg font-semibold text-sky-600">{t('score')}: {score}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={togglePause} size="icon" variant="ghost">{paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}</Button>
            <Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost"><HelpCircle className="w-5 h-5" /></Button>
          </div>
        </div>

        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl">
              <div className="text-9xl font-black text-white">{countdown}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={togglePause} className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50">
              <div className="text-center"><Play className="w-24 h-24 text-white mx-auto mb-4" /><p className="text-3xl font-bold text-white">PAUSED</p></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">{phase === 'show' ? '👀 Watch the sequence...' : `🔙 Tap it BACKWARDS (${inputIndex}/${sequence.length})`}</p>
        </div>

        {phase === 'show' && (
          <div className="flex justify-center items-center h-32 mb-6">
            {showShape ? <motion.div key={showStep} initial={{ scale: 0 }} animate={{ scale: 1 }}><ShapeIcon shape={showShape} size={90} /></motion.div> : <div className="w-24 h-24" />}
          </div>
        )}

        {phase === 'input' && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {shapes.map(s => (
              <button key={s} onClick={() => handleShapeClick(s)} className="aspect-square bg-slate-100 rounded-2xl border-2 border-slate-200 hover:border-sky-400 flex items-center justify-center transition-all">
                <ShapeIcon shape={s} size={56} />
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-around text-center">
          <div><p className="text-2xl font-bold text-green-600">✓ {correctCount}</p><p className="text-sm text-slate-600">{t('correct')}</p></div>
          <div><p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p><p className="text-sm text-slate-600">{t('wrong')}</p></div>
        </div>
      </div>
      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} gameId={16} />
    </div>
  );
}