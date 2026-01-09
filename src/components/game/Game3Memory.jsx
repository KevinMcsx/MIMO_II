import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Square, Triangle, Star } from 'lucide-react';
import ResultsScreen from './ResultsScreen';

const COLORS = ['yellow', 'blue', 'green', 'red'];
const SHAPES = ['circle', 'square', 'triangle', 'star'];

const CARD_COUNTS = { 1: 4, 2: 6, 3: 8, 4: 8 };
const ROUNDS = 10;

const colorClasses = {
  yellow: 'bg-yellow-400 border-yellow-300',
  blue: 'bg-blue-500 border-blue-400',
  green: 'bg-green-500 border-green-400',
  red: 'bg-red-500 border-red-400',
};

const ShapeIcon = ({ shape, size = 'w-12 h-12' }) => {
  const icons = { circle: Circle, square: Square, triangle: Triangle, star: Star };
  const Icon = icons[shape];
  return Icon ? <Icon className={`${size} text-white`} strokeWidth={2} fill="currentColor" /> : null;
};

export default function Game3Memory({ difficulty, onMainMenu }) {
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [stats, setStats] = useState({
    pairTimes: [],
    startTime: null,
    totalTime: 0,
    roundStartTime: null,
  });
  
  const cardCount = CARD_COUNTS[difficulty] || 4;

  const generateCards = useCallback(() => {
    const pairs = cardCount / 2;
    let cardPairs = [];

    for (let i = 0; i < pairs; i++) {
      let cardValue;
      
      if (difficulty === 1) {
        // Easy: Colors only
        cardValue = { type: 'color', color: COLORS[i % COLORS.length] };
      } else if (difficulty === 2) {
        // Medium: Shapes only (no color)
        cardValue = { type: 'shape', shape: SHAPES[i % SHAPES.length] };
      } else if (difficulty === 3) {
        // Hard: Colored shapes (same color per shape)
        cardValue = { 
          type: 'coloredShape', 
          shape: SHAPES[i % SHAPES.length], 
          color: COLORS[i % COLORS.length] 
        };
      } else {
        // Expert: Colored shapes with mixed colors
        cardValue = { 
          type: 'coloredShape', 
          shape: SHAPES[i % SHAPES.length], 
          color: COLORS[Math.floor(Math.random() * COLORS.length)] 
        };
      }
      
      cardPairs.push({ ...cardValue, id: i * 2 });
      cardPairs.push({ ...cardValue, id: i * 2 + 1 });
    }

    // Shuffle
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }

    return cardPairs;
  }, [cardCount, difficulty]);

  // Countdown
  useEffect(() => {
    if (gameState !== 'countdown') return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
      const now = Date.now();
      setStats(prev => ({ ...prev, startTime: now, roundStartTime: now }));
      setCards(generateCards());
    }
  }, [countdown, gameState, generateCards]);

  const cardsMatch = (card1, card2) => {
    if (card1.type !== card2.type) return false;
    if (card1.type === 'color') return card1.color === card2.color;
    if (card1.type === 'shape') return card1.shape === card2.shape;
    return card1.shape === card2.shape && card1.color === card2.color;
  };

  const handleCardSelect = useCallback((cardId) => {
    if (gameState !== 'playing') return;
    if (matchedPairs.includes(cardId)) return;
    if (selectedCards.includes(cardId)) return;
    if (selectedCards.length >= 2) return;

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const card1 = cards.find(c => c.id === newSelected[0]);
      const card2 = cards.find(c => c.id === newSelected[1]);

      setTimeout(() => {
        if (cardsMatch(card1, card2)) {
          const pairTime = Date.now() - stats.roundStartTime;
          setMatchedPairs(prev => [...prev, newSelected[0], newSelected[1]]);
          setStats(prev => ({
            ...prev,
            pairTimes: [...prev.pairTimes, pairTime],
          }));

          // Check if round complete
          if (matchedPairs.length + 2 >= cardCount) {
            if (currentRound >= ROUNDS) {
              setStats(prev => ({
                ...prev,
                totalTime: Date.now() - prev.startTime,
              }));
              setGameState('finished');
            } else {
              setCurrentRound(prev => prev + 1);
              setMatchedPairs([]);
              setCards(generateCards());
              setStats(prev => ({ ...prev, roundStartTime: Date.now() }));
            }
          }
        }
        setSelectedCards([]);
      }, 600);
    }
  }, [gameState, selectedCards, cards, matchedPairs, cardCount, currentRound, stats.roundStartTime, generateCards]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;

      const cols = cardCount <= 4 ? 2 : cardCount <= 6 ? 3 : 4;
      
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          setSelectedIndex(prev => Math.min(cards.length - 1, prev + 1));
          break;
        case 'ArrowUp':
          setSelectedIndex(prev => Math.max(0, prev - cols));
          break;
        case 'ArrowDown':
          setSelectedIndex(prev => Math.min(cards.length - 1, prev + cols));
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (cards[selectedIndex]) {
            handleCardSelect(cards[selectedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedIndex, cards, cardCount, handleCardSelect]);

  const avgPairTime = stats.pairTimes.length > 0
    ? stats.pairTimes.reduce((a, b) => a + b, 0) / stats.pairTimes.length
    : 0;

  if (gameState === 'finished') {
    return (
      <ResultsScreen
        stats={{
          totalTime: stats.totalTime,
          avgReactionTime: avgPairTime,
          correctHits: stats.pairTimes.length,
          wrongHits: 0,
          totalAttempts: stats.pairTimes.length,
        }}
        gameTitle={`Memory Match - ${['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}`}
        onPlayAgain={() => {
          setGameState('countdown');
          setCountdown(3);
          setCurrentRound(1);
          setMatchedPairs([]);
          setSelectedCards([]);
          setSelectedIndex(0);
          setStats({ pairTimes: [], startTime: null, totalTime: 0, roundStartTime: null });
        }}
        onMainMenu={onMainMenu}
      />
    );
  }

  const cols = cardCount <= 4 ? 2 : cardCount <= 6 ? 3 : 4;

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-slate-400">
          <span className="text-3xl font-bold text-white">{currentRound}</span>
          <span className="text-xl">/{ROUNDS}</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Memory Match</h2>
          <p className="text-slate-400">{['Easy', 'Medium', 'Hard', 'Expert'][difficulty - 1]}</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-sm">Pairs Found</p>
          <p className="text-2xl font-bold text-green-400">{matchedPairs.length / 2}/{cardCount / 2}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-2xl min-h-[320px] bg-slate-800/50 rounded-3xl border border-slate-700 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {gameState === 'countdown' ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black text-white"
            >
              {countdown || 'GO!'}
            </motion.div>
          ) : (
            <div 
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {cards.map((card, index) => {
                const isFlipped = selectedCards.includes(card.id);
                const isMatched = matchedPairs.includes(card.id);
                const isSelected = index === selectedIndex;

                return (
                  <motion.button
                    key={card.id}
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ 
                      scale: isMatched ? 0 : 1, 
                      rotateY: isFlipped || isMatched ? 0 : 180,
                    }}
                    whileHover={{ scale: isMatched ? 0 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCardSelect(card.id)}
                    className={`
                      w-20 h-24 rounded-xl border-4 
                      flex items-center justify-center
                      transition-all duration-200
                      ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900' : ''}
                      ${isMatched ? 'opacity-0' : ''}
                      ${isFlipped 
                        ? card.type === 'color' 
                          ? colorClasses[card.color]
                          : card.type === 'shape'
                            ? 'bg-slate-600 border-slate-500'
                            : colorClasses[card.color]
                        : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                      }
                    `}
                    style={{ perspective: '1000px' }}
                  >
                    {isFlipped && !isMatched && (
                      <>
                        {card.type === 'color' && (
                          <span className="text-4xl">
                            {card.color === 'yellow' && '🟡'}
                            {card.color === 'blue' && '🔵'}
                            {card.color === 'green' && '🟢'}
                            {card.color === 'red' && '🔴'}
                          </span>
                        )}
                        {card.type === 'shape' && <ShapeIcon shape={card.shape} />}
                        {card.type === 'coloredShape' && <ShapeIcon shape={card.shape} />}
                      </>
                    )}
                    {!isFlipped && !isMatched && (
                      <span className="text-3xl text-slate-500">?</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/30 rounded-xl p-4 max-w-lg w-full text-center">
        <p className="text-slate-300 text-sm">
          Use <span className="text-white font-bold">Arrow Keys</span> to navigate, 
          <span className="text-white font-bold"> Space/Enter</span> to flip
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Find matching pairs!
        </p>
      </div>
    </div>
  );
}