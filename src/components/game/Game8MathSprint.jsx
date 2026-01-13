import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game8MathSprint({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [streak, setStreak] = useState(0);

  const difficultySettings = {
    1: { time: 120, maxNum: 10, operations: ['+', '-'], rounds: 20 },
    2: { time: 120, maxNum: 20, operations: ['+', '-', '×'], rounds: 25 },
    3: { time: 120, maxNum: 50, operations: ['+', '-', '×'], rounds: 30 },
    4: { time: 90, maxNum: 100, operations: ['+', '-', '×', '÷'], rounds: 35 },
  };

  const settings = difficultySettings[difficulty];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      generateProblem();
    }
  }, [countdown, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && !paused && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, gameState, paused]);

  const generateProblem = () => {
    const operation = settings.operations[Math.floor(Math.random() * settings.operations.length)];
    let num1, num2, correctAnswer;

    if (operation === '÷') {
      num2 = Math.floor(Math.random() * (settings.maxNum / 5)) + 2;
      correctAnswer = Math.floor(Math.random() * (settings.maxNum / num2)) + 1;
      num1 = num2 * correctAnswer;
    } else {
      num1 = Math.floor(Math.random() * settings.maxNum) + 1;
      num2 = Math.floor(Math.random() * settings.maxNum) + 1;
      
      switch (operation) {
        case '+':
          correctAnswer = num1 + num2;
          break;
        case '-':
          if (num2 > num1) [num1, num2] = [num2, num1];
          correctAnswer = num1 - num2;
          break;
        case '×':
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
          correctAnswer = num1 * num2;
          break;
      }
    }

    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = correctAnswer + offset;
      if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !wrongAnswers.includes(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
      }
    }

    const allAnswers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    setCurrentProblem({ num1, num2, operation, correctAnswer });
    setAnswers(allAnswers);
    setRoundStartTime(Date.now());
  };

  const handleAnswer = (answer) => {
    if (gameState !== 'playing' || paused) return;

    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    if (answer === currentProblem.correctAnswer) {
      sounds.correctHit();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = Math.min(newStreak * 10, 100);
      setScore(score + 100 + bonus);
      setCorrectCount(correctCount + 1);
      
      if (correctCount + 1 >= settings.rounds) {
        endGame();
      } else {
        generateProblem();
      }
    } else {
      sounds.wrongHit();
      setStreak(0);
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 25));
      generateProblem();
    }
  };

  const endGame = async () => {
    sounds.gameEnd();
    
    const avgReactionTime = reactionTimes.length > 0 
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
      : 0;
    const totalTime = (settings.time - timeLeft) * 1000;

    await saveGameResult({
      game_type: 8,
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
        gameTitle={t('mathSprint')}
        gameResult={{
          game_type: 8,
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
              {correctCount}/{settings.rounds}
            </p>
            <p className="text-lg font-semibold text-orange-600">
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

        {streak > 2 && (
          <div className="mb-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold"
            >
              🔥 {streak} Streak! +{Math.min(streak * 10, 100)} Bonus
            </motion.div>
          </div>
        )}

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            🧮 Solve the problem!
          </p>
        </div>

        {currentProblem && gameState === 'playing' && (
          <motion.div
            key={`${currentProblem.num1}-${currentProblem.num2}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-8 text-center">
              <div className="text-6xl font-black text-slate-800 mb-8">
                {currentProblem.num1} {currentProblem.operation} {currentProblem.num2} = ?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {answers.map((answer, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(answer)}
                  className="py-8 text-4xl font-bold bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {answer}
                </motion.button>
              ))}
            </div>
          </motion.div>
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
        </div>
      </div>

      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        gameId={8}
      />
    </div>
  );
}