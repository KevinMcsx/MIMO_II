import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Circle, Square, Triangle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../utils/translations';
import { getTutorialText } from './TutorialContent';

const ShapeIcon = ({ shape, className }) => {
  const icons = { circle: Circle, square: Square, triangle: Triangle, star: Star };
  const Icon = icons[shape];
  return Icon ? <Icon className={className} /> : null;
};

export default function TutorialModal({ isOpen, onClose, gameId }) {
  const t = useTranslation();
  
  const tutorials = {
    1: {
      title: t('colorReaction'),
      steps: [
        {
          title: '🎯 ' + t('objective'),
          description: t('game1Tutorial1'),
          visual: (
            <div className="flex items-center gap-4 justify-center my-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl flex items-center justify-center">
                <Circle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-3xl sm:text-4xl">→</span>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-400 rounded-2xl flex items-center justify-center text-2xl">
                🟡
              </div>
            </div>
          )
        },
        {
          title: '⌨️ ' + t('controls'),
          description: t('game1Tutorial2'),
          visual: (
            <div className="grid grid-cols-4 gap-2 my-4">
              {[
                { key: '1', emoji: '🟡', color: 'bg-yellow-400' },
                { key: '2', emoji: '🟢', color: 'bg-green-500' },
                { key: '3', emoji: '🔵', color: 'bg-blue-500' },
                { key: '4', emoji: '🔴', color: 'bg-red-500' }
              ].map(btn => (
                <div key={btn.key} className={`${btn.color} rounded-xl p-3 sm:p-4 text-center`}>
                  <div className="text-2xl sm:text-3xl mb-1">{btn.emoji}</div>
                  <div className="text-white font-bold text-sm sm:text-base">Key {btn.key}</div>
                </div>
              ))}
            </div>
          )
        },
        {
          title: '⚡ ' + t('tips'),
          description: t('game1Tutorial3')
        }
      ]
    },
    2: {
      title: t('colorShape'),
      steps: [
        {
          title: '🎯 ' + t('objective'),
          description: t('game2Tutorial1'),
          visual: (
            <div className="space-y-3 my-4">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-600 rounded-2xl flex items-center justify-center">
                  <Circle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 fill-blue-500" />
                </div>
                <span className="text-2xl">+</span>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Circle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <span className="text-2xl">→</span>
                <div className="px-3 py-2 bg-green-500 rounded-lg text-white font-bold">✓ Match!</div>
              </div>
            </div>
          )
        },
        {
          title: '🧠 ' + t('rules'),
          description: t('game2Tutorial2'),
          visual: (
            <div className="bg-slate-100 rounded-xl p-4 my-4 text-sm sm:text-base">
              <div className="font-bold mb-2">{t('ifMatch')}:</div>
              <div className="ml-4 mb-3">✓ {t('pressShapeButton')}</div>
              <div className="font-bold mb-2">{t('ifNoMatch')}:</div>
              <div className="ml-4">✓ {t('pressColorButton')}</div>
            </div>
          )
        },
        {
          title: '⚡ ' + t('tips'),
          description: t('game2Tutorial3')
        }
      ]
    },
    3: {
      title: t('memoryMatch'),
      steps: [
        {
          title: '🎯 ' + t('objective'),
          description: t('game3Tutorial1'),
          visual: (
            <div className="grid grid-cols-4 gap-2 my-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg" />
              ))}
            </div>
          )
        },
        {
          title: '⌨️ ' + t('controls'),
          description: t('game3Tutorial2'),
          visual: (
            <div className="bg-slate-100 rounded-xl p-4 my-4 text-sm sm:text-base">
              <div className="space-y-2">
                <div>• <kbd className="px-2 py-1 bg-white rounded shadow">↑↓←→</kbd> {t('arrowsToMove')}</div>
                <div>• <kbd className="px-2 py-1 bg-white rounded shadow">Space</kbd> / <kbd className="px-2 py-1 bg-white rounded shadow">Enter</kbd> {t('toSelect')}</div>
                <div>• {t('clickCards')}</div>
              </div>
            </div>
          )
        },
        {
          title: '⚡ ' + t('tips'),
          description: t('game3Tutorial3')
        }
      ]
    },
    4: {
      title: t('proChallenge'),
      steps: [
        {
          title: '🎯 ' + t('objective'),
          description: t('game4Tutorial1'),
          visual: (
            <div className="flex gap-2 my-4 justify-center">
              {['yellow', 'blue', 'green', 'red'].map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="text-2xl">↓</div>
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-${color}-500 rounded-xl`} />
                  <div className="text-xs sm:text-sm font-bold">{t('lane')} {i + 1}</div>
                </div>
              ))}
            </div>
          )
        },
        {
          title: '🎮 ' + t('gameplay'),
          description: t('game4Tutorial2'),
          visual: (
            <div className="bg-slate-100 rounded-xl p-4 my-4 text-sm sm:text-base">
              <div className="space-y-2">
                <div>• {t('lane')} 1: {t('colorMatching')}</div>
                <div>• {t('lane')} 2: {t('colorMatching')}</div>
                <div>• {t('lane')} 3: {t('shapeMatching')}</div>
                <div>• {t('lane')} 4: {t('colorShapeCombo')}</div>
              </div>
            </div>
          )
        },
        {
          title: '⚡ ' + t('tips'),
          description: t('game4Tutorial3')
        }
      ]
    },
    5: {
      title: t('patternRecognition'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(5, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(5, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(5, 'tips') },
      ],
    },
    6: {
      title: t('numberMemory'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(6, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(6, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(6, 'tips') },
      ],
    },
    9: {
      title: t('patternPrediction'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(9, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(9, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(9, 'tips') },
      ],
    },
    10: {
      title: t('shapeSorting'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(10, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(10, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(10, 'tips') },
      ],
    },
    11: {
      title: t('twinHunt'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(11, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(11, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(11, 'tips') },
      ],
    },
    12: {
      title: t('quickCount'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(12, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(12, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(12, 'tips') },
      ],
    },
    13: {
      title: t('speedMatch'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(13, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(13, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(13, 'tips') },
      ],
    },
    14: {
      title: t('lightTrack'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(14, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(14, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(14, 'tips') },
      ],
    },
    15: {
      title: t('colorInvaders'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(15, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(15, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(15, 'tips') },
      ],
    },
    16: {
      title: t('reverseSequence'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(16, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(16, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(16, 'tips') },
      ],
    },
    17: {
      title: t('visualSearch'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(17, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(17, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(17, 'tips') },
      ],
    },
    18: {
      title: t('stroopColor'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(18, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(18, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(18, 'tips') },
      ],
    },
    19: {
      title: t('reactionTarget'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(19, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(19, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(19, 'tips') },
      ],
    },
    20: {
      title: t('speedTap'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(20, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(20, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(20, 'tips') },
      ],
    },
    21: {
      title: t('quickColor'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(21, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(21, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(21, 'tips') },
      ],
    },
    22: {
      title: t('goNoGo'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(22, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(22, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(22, 'tips') },
      ],
    },
    23: {
      title: t('memoryMatrix'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(23, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(23, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(23, 'tips') },
      ],
    },
    24: {
      title: t('shapeStack'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(24, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(24, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(24, 'tips') },
      ],
    },
    25: {
      title: t('nBack'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(25, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(25, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(25, 'tips') },
      ],
    },
    26: {
      title: t('oddColor'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(26, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(26, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(26, 'tips') },
      ],
    },
    27: {
      title: t('oddSize'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(27, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(27, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(27, 'tips') },
      ],
    },
    28: {
      title: t('spotDifference'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(28, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(28, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(28, 'tips') },
      ],
    },
    29: {
      title: t('findMax'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(29, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(29, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(29, 'tips') },
      ],
    },
    30: {
      title: t('tapOrder'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(30, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(30, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(30, 'tips') },
      ],
    },
    31: {
      title: t('mathFlash'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(31, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(31, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(31, 'tips') },
      ],
    },
    32: {
      title: t('higherLower'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(32, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(32, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(32, 'tips') },
      ],
    },
    33: {
      title: t('numberSequence'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(33, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(33, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(33, 'tips') },
      ],
    },
    34: {
      title: t('evenOdd'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(34, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(34, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(34, 'tips') },
      ],
    },
    35: {
      title: t('colorSort'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(35, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(35, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(35, 'tips') },
      ],
    },
    36: {
      title: t('shapeMatch'),
      steps: [
        { title: '🎯 ' + t('objective'), description: getTutorialText(36, 'objective') },
        { title: '⌨️ ' + t('controls'), description: getTutorialText(36, 'controls') },
        { title: '⚡ ' + t('tips'), description: getTutorialText(36, 'tips') },
      ],
    }
  };

  const tutorial = tutorials[gameId];
  if (!tutorial) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h2 className="text-2xl sm:text-3xl font-black mb-1">{t('howToPlay')}</h2>
              <p className="text-base sm:text-lg opacity-90">{tutorial.title}</p>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {tutorial.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-slate-200 rounded-xl p-4 sm:p-5"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 mb-3">{step.description}</p>
                  {step.visual && <div>{step.visual}</div>}
                </motion.div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-slate-50 p-4 sm:p-6 rounded-b-2xl sm:rounded-b-3xl border-t-2 border-slate-200">
              <Button
                onClick={onClose}
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {t('gotIt')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}