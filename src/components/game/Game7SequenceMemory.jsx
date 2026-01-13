import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

const colors = ['#FFD700', '#00D4FF', '#00FF85', '#FF4444', '#9333EA', '#F97316'];
const colorNames = ['Yellow', 'Blue', 'Green', 'Red', 'Purple', 'Orange'];

export default function Game7SequenceMemory({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [showingIndex, setShowingIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const difficultySettings = {
    1: { startLength: 3, time: 180, showSpeed: 1000, maxLength: 8 },
    2: { startLength: 4, time: 150, showSpeed: 800, maxLength: 10 },
    3: { startLength: 5, time: 120, showSpeed: 600, maxLength: 12 },
    4: { startLength: 6, time: 90, showSpeed: 400, maxLength: 15 },
  };

  const settings = difficultySettings[difficulty];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('showing');
      setTimeLeft(settings.time);
      generateSequence(settings.startLength);
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'recalling' && !paused && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'recalling' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, paused]);

  useEffect(() => {
    if (gameState === 'showing' && showingIndex < sequence.length) {
      const timer = setTimeout(() => {
        sounds.buttonPress();
        setShowingIndex(showingIndex + 1);
      }, settings.showSpeed);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showingIndex === sequence.length) {
      setTimeout(() => {
        setGameState('recalling');
        setRoundStartTime(Date.now());
        setShowingIndex(-1);
      }, 500);
    }
  }, [showingIndex, gameState, sequence]);

  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * colors.length));
    }
    setSequence(newSequence);
    setUserSequence([]);
    setShowingIndex(0);
  };

  const handleColorClick = (colorIndex) => {
    if (gameState !== 'recalling' || paused) return;

    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    const currentIndex = newUserSequence.length - 1;
    if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 30));
      setFeedbackMessage(`✗ Wrong! Correct was: ${sequence.map(i => colorNames[i]).join(' → ')}`);
      setGameState('feedback');
      
      setTimeout(() => {
        if (wrongCount + 1 >= 3) {
          endGame();
        } else {
          setGameState('showing');
          generateSequence(sequence.length);
          setFeedbackMessage('');
        }
      }, 2500);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      const reactionTime = Date.now() - roundStartTime;
      setReactionTimes([...reactionTimes, reactionTime]);
      
      sounds.correctHit();
      const points = sequence.length * 100;
      setScore(score + points);
      setCorrectCount(correctCount + 1);
      setFeedbackMessage('✓ Perfect!');
      setGameState('feedback');
      
      setTimeout(() => {
        const newLength = Math.min(sequence.length + 1, settings.maxLength);
        if (newLength <= settings.maxLength) {
          setLevel(level + 1);
          setGameState('showing');
          generateSequence(newLength);
          setFeedbackMessage('');
        } else {
          endGame();
        }
      }, 1000);
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;

    await saveGameResult({
      game_type: 7,
      difficulty,
      total_time: totalTime,
      avg_reaction_time: avgReactionTime,
      correct_hits: correctCount,
      wrong_hits: wrongCount,
      score,
      player_name: playerName,
    });
    
    setGameState('finished');
  };

  const togglePause = () => {
    setPaused(!paused);
    sounds.buttonPress();
  };

  if (gameState === 'finished') {
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;
    const totalAttempts = correctCount + wrongCount;

    return (
      <ResultsScreen
        gameTitle={t('sequenceMemory')}
        gameResult={{
          game_type: 7,
          difficulty,
          score,
          avg_reaction_time: avgReactionTime,
          correct_hits: correctCount,
          wrong_hits: wrongCount,
          total_time: totalTime,
        }}
        stats={{
          totalTime,
          avgReactionTime,
          correctHits: correctCount,
          wrongHits: wrongCount,
          totalAttempts,
        }}
        onPlayAgain={() => window.location.reload()}
        onMainMenu={onMainMenu}
        playerName={playerName}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {t('level')} {level}
            </p>
            <p className="text-lg font-semibold text-indigo-600">
              {t('score')}: {score}
            </p>
          </div>
          <div className="flex gap-2">
            <p className="text-xl font-bold text-slate-700">
              ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </p>
            <Button onClick={togglePause} size="icon" variant="ghost">
              {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </Button>
            <Button onClick={() => setShowTutorial(true)} size="icon" variant="ghost">
              <HelpCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {gameState === 'countdown' && countdown > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-3xl"
            >
              <div className="text-9xl font-black text-white drop-shadow-lg">
                {countdown}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePause}
              className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl cursor-pointer z-50"
            >
              <div className="text-center">
                <Play className="w-24 h-24 text-white mx-auto mb-4" />
                <p className="text-3xl font-bold text-white">PAUSED</p>
                <p className="text-lg text-white/80 mt-2">Click to resume</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            {gameState === 'showing' ? '👀 Watch the sequence!' : '🧠 Repeat the sequence!'}
          </p>
        </div>

        <div className="mb-8 min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'showing' && showingIndex < sequence.length && (
              <motion.div
                key={`show-${showingIndex}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-32 h-32 rounded-full"
                style={{ backgroundColor: colors[sequence[showingIndex]] }}
              />
            )}

            {gameState === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <div className={`text-4xl font-black ${feedbackMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedbackMessage}
                </div>
              </motion.div>
            )}

            {gameState === 'recalling' && (
              <motion.div
                key="recall"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 flex-wrap justify-center"
              >
                {userSequence.map((colorIdx, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full"
                    style={{ backgroundColor: colors[colorIdx] }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {gameState === 'recalling' && (
          <div className="grid grid-cols-3 gap-4">
            {colors.map((color, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorClick(idx)}
                className="h-20 rounded-xl shadow-lg transition-all"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        <div className="flex justify-around text-center mt-6">
          <div>
            <p className="text-2xl font-bold text-green-600">✓ {correctCount}</p>
            <p className="text-sm text-slate-600">{t('correct')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p>
            <p className="text-sm text-slate-600">{t('wrong')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">{sequence.length}</p>
            <p className="text-sm text-slate-600">Length</p>
          </div>
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        gameId={7}
      />
    </div>
  );
}