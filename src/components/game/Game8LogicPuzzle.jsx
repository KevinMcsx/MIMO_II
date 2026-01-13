import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Pause, Play, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/sounds';
import ResultsScreen from './ResultsScreen';
import TutorialModal from './TutorialModal';
import { useTranslation } from '../utils/translations';
import { saveGameResult } from './GameResultSaver';

export default function Game8LogicPuzzle({ difficulty, onMainMenu, playerName }) {
  const t = useTranslation();
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [paused, setPaused] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [streak, setStreak] = useState(0);

  const difficultySettings = {
    1: { time: 120, rounds: 20, timePerPuzzle: 10 },
    2: { time: 120, rounds: 25, timePerPuzzle: 8 },
    3: { time: 120, rounds: 30, timePerPuzzle: 6 },
    4: { time: 90, rounds: 35, timePerPuzzle: 5 },
  };

  const settings = difficultySettings[difficulty];

  const puzzleTypes = [
    // Pattern logic
    () => {
      const patterns = [
        { sequence: [2, 4, 6, 8], answer: 10, options: [10, 12, 9, 11] },
        { sequence: [1, 3, 5, 7], answer: 9, options: [9, 8, 10, 11] },
        { sequence: [5, 10, 15, 20], answer: 25, options: [25, 30, 22, 24] },
        { sequence: [100, 90, 80, 70], answer: 60, options: [60, 50, 65, 55] },
        { sequence: [3, 6, 9, 12], answer: 15, options: [15, 18, 14, 16] },
        { sequence: [10, 20, 30, 40], answer: 50, options: [50, 60, 45, 55] },
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      return {
        type: 'pattern',
        question: `What comes next?\n${p.sequence.join(', ')}, ?`,
        correctAnswer: p.answer,
        options: p.options.sort(() => Math.random() - 0.5)
      };
    },
    
    // True/False logic
    () => {
      const statements = [
        { text: "If all cats are animals,\nand Tom is a cat,\nthen Tom is an animal", answer: true },
        { text: "If some birds can fly,\nand penguins are birds,\nthen penguins can fly", answer: false },
        { text: "If A > B and B > C,\nthen A > C", answer: true },
        { text: "If no dogs are cats,\nand Rex is a dog,\nthen Rex is not a cat", answer: true },
        { text: "If all squares are rectangles,\nand all rectangles have 4 sides,\nthen squares have 3 sides", answer: false },
        { text: "If X = 5 and Y = X + 2,\nthen Y = 7", answer: true },
        { text: "If today is Monday,\nthen yesterday was Sunday", answer: true },
        { text: "If 10 > 5 and 5 > 3,\nthen 3 > 10", answer: false },
      ];
      const s = statements[Math.floor(Math.random() * statements.length)];
      return {
        type: 'truefalse',
        question: s.text,
        correctAnswer: s.answer,
        options: ['TRUE', 'FALSE']
      };
    },

    // Comparison logic
    () => {
      const comparisons = [
        { text: "If A = 5, B = 3, C = 7\nWhich is largest?", answer: 'C', options: ['A', 'B', 'C'] },
        { text: "If X > Y and Y > Z\nWhich is smallest?", answer: 'Z', options: ['X', 'Y', 'Z'] },
        { text: "If P = Q and Q < R\nWhich is largest?", answer: 'R', options: ['P', 'Q', 'R'] },
        { text: "If 10 = A, 15 = B, 8 = C\nWhich is smallest?", answer: 'C', options: ['A', 'B', 'C'] },
      ];
      const c = comparisons[Math.floor(Math.random() * comparisons.length)];
      return {
        type: 'comparison',
        question: c.text,
        correctAnswer: c.answer,
        options: c.options.sort(() => Math.random() - 0.5)
      };
    },

    // Missing number in pattern
    () => {
      const patterns = [
        { text: "2, 4, ?, 8, 10", answer: 6, options: [5, 6, 7, 8] },
        { text: "10, 20, 30, ?, 50", answer: 40, options: [35, 40, 45, 50] },
        { text: "1, 1, 2, 3, 5, ?", answer: 8, options: [6, 7, 8, 9] },
        { text: "100, 50, 25, ?", answer: 12.5, options: [10, 12.5, 15, 20] },
        { text: "3, 9, 27, ?", answer: 81, options: [54, 72, 81, 90] },
      ];
      const p = patterns[Math.floor(Math.random() * patterns.length)];
      return {
        type: 'missing',
        question: `Find the missing number:\n${p.text}`,
        correctAnswer: p.answer,
        options: p.options.sort(() => Math.random() - 0.5)
      };
    }
  ];

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      sounds.countdown();
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      sounds.gameStart();
      setGameState('playing');
      setTimeLeft(settings.time);
      generatePuzzle();
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

  const generatePuzzle = () => {
    const puzzleGenerator = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];
    const puzzle = puzzleGenerator();
    setCurrentPuzzle(puzzle);
    setRoundStartTime(Date.now());
  };

  const handleAnswer = (answer) => {
    if (gameState !== 'playing' || paused) return;

    const reactionTime = Date.now() - roundStartTime;
    setReactionTimes([...reactionTimes, reactionTime]);

    const isCorrect = currentPuzzle.type === 'truefalse' 
      ? (answer === 'TRUE') === currentPuzzle.correctAnswer
      : answer === currentPuzzle.correctAnswer;

    if (isCorrect) {
      sounds.correctHit();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const bonus = Math.min(newStreak * 10, 100);
      setScore(score + 100 + bonus);
      setCorrectCount(correctCount + 1);
      
      if (correctCount + 1 >= settings.rounds) {
        endGame();
      } else {
        generatePuzzle();
      }
    } else {
      sounds.wrongHit();
      setStreak(0);
      setWrongCount(wrongCount + 1);
      setScore(Math.max(0, score - 25));
      generatePuzzle();
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
        gameTitle={t('logicPuzzle')}
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
            <p className="text-lg font-semibold text-purple-600">
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
              className="inline-block bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-2 rounded-full font-bold"
            >
              🔥 {streak} Streak! +{Math.min(streak * 10, 100)} Bonus
            </motion.div>
          </div>
        )}

        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            🧠 Solve the logic puzzle!
          </p>
        </div>

        {currentPuzzle && gameState === 'playing' && (
          <motion.div
            key={`puzzle-${correctCount}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="mb-8 text-center">
              <div className="text-3xl font-bold text-slate-800 mb-8 whitespace-pre-line min-h-[120px] flex items-center justify-center">
                {currentPuzzle.question}
              </div>
            </div>

            <div className={`grid gap-4 ${currentPuzzle.options.length === 2 ? 'grid-cols-2' : currentPuzzle.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {currentPuzzle.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(option)}
                  className="py-6 text-2xl font-bold bg-gradient-to-br from-purple-400 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {option}
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