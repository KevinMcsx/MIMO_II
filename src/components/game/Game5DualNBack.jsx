import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';

const COLORS = ['#FFD700', '#10B981', '#3B82F6', '#EF4444'];
const SHAPES = ['●', '■', '▲', '★'];

const ShapeIcon = ({ shape, color }) => (
  <div className="text-6xl" style={{ color }}>{shape}</div>
);

export default function Game5DualNBack({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [sequence, setSequence] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [nBack, setNBack] = useState(1);
  const [score, setScore] = useState(0);
  const [positionHits, setPositionHits] = useState(0);
  const [positionMisses, setPositionMisses] = useState(0);
  const [shapeHits, setShapeHits] = useState(0);
  const [shapeMisses, setShapeMisses] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [paused, setPaused] = useState(false);

  const sequenceLength = difficulty === 1 ? 20 : difficulty === 2 ? 25 : difficulty === 3 ? 30 : 40;
  const itemDuration = difficulty === 1 ? 2500 : difficulty === 2 ? 2000 : difficulty === 3 ? 1500 : 1200;

  useEffect(() => {
    const nValue = difficulty;
    setNBack(nValue);
  }, [difficulty]);

  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
          sounds.countdown();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        sounds.gameStart();
        initGame();
      }
    }
  }, [countdown, gameState]);

  const initGame = () => {
    const newSequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSequence.push({
        position: Math.floor(Math.random() * 9),
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    setSequence(newSequence);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing' && currentIndex >= 0 && currentIndex < sequenceLength && !paused) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        if (currentIndex + 1 >= sequenceLength) {
          endGame();
        }
      }, itemDuration);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gameState, paused]);

  const checkMatch = (type) => {
    if (currentIndex < nBack) return;

    const current = sequence[currentIndex];
    const nBackItem = sequence[currentIndex - nBack];

    if (type === 'position') {
      if (current.position === nBackItem.position) {
        setPositionHits(prev => prev + 1);
        setScore(prev => prev + 10);
        sounds.correctHit();
      } else {
        setPositionMisses(prev => prev + 1);
        sounds.wrongHit();
      }
    } else if (type === 'shape') {
      if (current.shape === nBackItem.shape) {
        setShapeHits(prev => prev + 1);
        setScore(prev => prev + 10);
        sounds.correctHit();
      } else {
        setShapeMisses(prev => prev + 1);
        sounds.wrongHit();
      }
    }
  };

  const endGame = () => {
    const totalTime = Date.now() - startTime;
    setGameState('finished');
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing' || paused) return;
      
      if (e.key === 'a' || e.key === 'A') {
        checkMatch('position');
      } else if (e.key === 'l' || e.key === 'L') {
        checkMatch('shape');
      } else if (e.key === 'Escape') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentIndex, paused]);

  if (showTutorial) {
    return <TutorialModal isOpen={true} onClose={() => setShowTutorial(false)} gameId={5} />;
  }

  if (gameState === 'finished') {
    const totalTime = Date.now() - startTime;
    const totalAttempts = positionHits + positionMisses + shapeHits + shapeMisses;
    const accuracy = totalAttempts > 0 ? ((positionHits + shapeHits) / totalAttempts * 100).toFixed(1) : 0;

    return (
      <ResultsScreen
        gameType={5}
        difficulty={difficulty}
        score={score}
        stats={{
          total_time: totalTime,
          position_hits: positionHits,
          position_misses: positionMisses,
          shape_hits: shapeHits,
          shape_misses: shapeMisses,
          accuracy: accuracy,
          n_back: nBack,
        }}
        onPlayAgain={() => window.location.reload()}
        onMainMenu={onMainMenu}
        playerName={playerName}
      />
    );
  }

  const currentItem = sequence[currentIndex];
  const gridPositions = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="relative">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-3xl mx-auto border-4 border-purple-300">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onMainMenu} variant="ghost" size="sm">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('mainMenu')}
          </Button>
          <div className="flex gap-2 items-center">
            <div className="text-2xl font-bold text-purple-600">
              {t('score')}: {score}
            </div>
            <Button onClick={togglePause} variant="ghost" size="sm">
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button onClick={() => setShowTutorial(true)} variant="outline" size="sm">
              ?
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {gameState === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-center py-20"
            >
              <div className="text-8xl font-black text-purple-600">
                {countdown > 0 ? countdown : t('go')}
              </div>
            </motion.div>
          )}

          {gameState === 'playing' && !paused && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-slate-700">
                  {nBack}-Back • {currentIndex + 1}/{sequenceLength}
                </p>
              </div>

              <div className="bg-slate-100 rounded-2xl p-8 mb-6">
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {gridPositions.map((pos) => (
                    <motion.div
                      key={pos}
                      className="aspect-square bg-white rounded-xl border-4 border-slate-300 flex items-center justify-center"
                      animate={{
                        borderColor: currentItem && currentItem.position === pos ? '#8B5CF6' : '#CBD5E1',
                        scale: currentItem && currentItem.position === pos ? 1.1 : 1,
                      }}
                    >
                      {currentItem && currentItem.position === pos && (
                        <ShapeIcon shape={currentItem.shape} color={currentItem.color} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => checkMatch('position')}
                  className="h-20 text-xl font-bold bg-blue-500 hover:bg-blue-600"
                >
                  Position Match
                  <div className="text-sm font-normal">(Press A)</div>
                </Button>
                <Button
                  onClick={() => checkMatch('shape')}
                  className="h-20 text-xl font-bold bg-green-500 hover:bg-green-600"
                >
                  Shape Match
                  <div className="text-sm font-normal">(Press L)</div>
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-slate-600">
                <p>Press when current item matches {nBack} step(s) back</p>
              </div>
            </motion.div>
          )}

          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-4xl font-bold text-slate-700 mb-4">Paused</div>
              <Button onClick={togglePause} size="lg">
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}