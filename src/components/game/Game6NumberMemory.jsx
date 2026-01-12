import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game6NumberMemory({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown'); // countdown, showing, recalling, feedback, finished
  const [countdown, setCountdown] = useState(3);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showTime, setShowTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const difficultySettings = {
    1: { startLength: 3, time: 180, showDuration: 2000, maxLength: 8 },
    2: { startLength: 4, time: 150, showDuration: 1500, maxLength: 10 },
    3: { startLength: 5, time: 120, showDuration: 1000, maxLength: 12 },
    4: { startLength: 6, time: 90, showDuration: 800, maxLength: 15 },
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
    if (gameState === 'showing' && showTime > 0) {
      const timer = setTimeout(() => setShowTime(showTime - 100), 100);
      return () => clearTimeout(timer);
    } else if (gameState === 'showing' && showTime === 0) {
      setGameState('recalling');
      setRoundStartTime(Date.now());
    }
  }, [showTime, gameState]);

  const generateSequence = (length) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 10));
    }
    setSequence(newSequence);
    setShowTime(settings.showDuration);
    setUserInput('');
  };

  const handleSubmit = () => {
    if (gameState !== 'recalling' || paused) return;

    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    const correct = userInput === sequence.join('');
    
    if (correct) {
      sounds.correctHit();
      const points = sequence.length * 50;
      setScore(score + points);
      setCorrectCount(correctCount + 1);
      setFeedbackMessage('✓ Correct!');
      
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
    } else {
      sounds.wrongHit();
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 20));
      setFeedbackMessage(`✗ Wrong! It was: ${sequence.join('')}`);
      
      setTimeout(() => {
        if (wrongCount + 1 >= 3) {
          endGame();
        } else {
          setGameState('showing');
          generateSequence(sequence.length);
          setFeedbackMessage('');
        }
      }, 2000);
    }
    
    setGameState('feedback');
  };

  const endGame = async () => {
    sounds.gameEnd();
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;

    // Save game result
    await saveGameResult({
      game_type: 6,
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
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    return (
      <ResultsScreen
        gameTitle={t('numberMemory')}
        gameResult={{
          game_type: 6,
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {t('level')} {level}
            </p>
            <p className="text-lg font-semibold text-blue-600">
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

        {/* Countdown */}
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

        {/* Paused Overlay */}
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

        {/* Instructions */}
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            {gameState === 'showing' ? '👀 Memorize the numbers!' : '🧠 Enter the sequence!'}
          </p>
        </div>

        {/* Number Display / Input */}
        <div className="mb-8 min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === 'showing' && (
              <motion.div
                key="showing"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <div className="text-7xl font-black text-blue-600 tracking-widest">
                  {sequence.join(' ')}
                </div>
              </motion.div>
            )}

            {gameState === 'recalling' && (
              <motion.div
                key="recalling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md"
              >
                <Input
                  type="text"
                  value={userInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= sequence.length) {
                      setUserInput(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}
                  placeholder="Type the numbers..."
                  className="text-5xl text-center font-bold tracking-widest"
                  autoFocus
                />
                <Button 
                  onClick={handleSubmit}
                  className="w-full mt-4 text-xl py-6 bg-blue-600 hover:bg-blue-700"
                  disabled={userInput.length !== sequence.length}
                >
                  Submit
                </Button>
              </motion.div>
            )}

            {gameState === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <div className={`text-5xl font-black ${feedbackMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                  {feedbackMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">✓ {correctCount}</p>
            <p className="text-sm text-slate-600">{t('correct')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">✗ {wrongCount}</p>
            <p className="text-sm text-slate-600">{t('wrong')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{sequence.length}</p>
            <p className="text-sm text-slate-600">Digits</p>
          </div>
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        gameId={6}
      />
    </div>
  );
}