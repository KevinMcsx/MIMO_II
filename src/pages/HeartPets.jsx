import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

const SPEC = `# HeartPets: Mythical Companion

## Project Overview

Build a premium-quality mobile-first virtual pet game inspired by classic Tamagotchi devices, but modernized with beautiful visuals, deeper progression, relaxing audio, offline-first architecture, and fantasy creatures.

The application should function as a **Progressive Web App (PWA)** and feel like a native mobile game.

The primary emotional goal is to create a **calm, comforting, relaxing experience** where users develop a long-term bond with magical creatures. The experience should feel cozy, rewarding, stress-free, and emotionally engaging.

The game must be designed around daily care, nurturing, progression, collection, and discovery.

**This is not a competitive game. This is a relaxing companion experience.**

---

## Most Important Requirement: Offline-First Design

The application must continue functioning even if Base44 services are unavailable or if the user has no internet connection. Core gameplay must never depend on a server.

- 100% playable offline after installation
- Installable PWA with Service Worker enabled
- All game assets, images, sound effects, and animations cached locally
- Local notifications supported
- No mandatory login or account creation
- No internet required for gameplay
- IndexedDB used for persistence
- Automatic save every 30 seconds, on app close, and restore on startup
- Pet state, inventory, progress, and achievements stored locally

Optional: Cloud backup, Google/Apple login, export/import save file.

The game must remain fully playable if all cloud features are disabled.

---

## Core Concept

Players adopt magical creatures and raise them from eggs into legendary beings. Each creature has needs, emotions, personality traits, growth stages, and progression systems. The player becomes a caretaker, friend, mentor, and guardian. The creature reacts to player actions over time. The relationship should feel alive and meaningful.

---

## Creature Collection

**15 unique creatures.**

**Classic Animals:** Dog, Cat, Rabbit, Panda, Fox

**Fantasy Creatures:** Baby Dragon, Crystal Dragon, Water Dragon, Moon Fox, Light Owl, Cloud Cat, Shadow Wolf, Moss Golem, Star Bunny, Forest Spirit

Each creature requires unique artwork, animations, personality, sounds, and evolution path.

---

## Evolution System

Every creature evolves through multiple stages:

1. Egg
2. Baby
3. Young
4. Adult
5. Legendary

Evolution depends on happiness, health, intelligence, affection, time spent together, and activities completed.

**Examples:**
- Baby Dragon → Green Dragon → Crystal Dragon → Ancient Star Dragon
- Cloud Cat → Moon Cat → Celestial Cat → Cosmic Guardian

Players should be excited to discover rare evolutions.

---

## Creature Stats

Each creature has: Hunger, Thirst, Health, Happiness, Energy, Cleanliness, Intelligence, Affection, Mood, Experience, and Level.

Values decrease gradually over time. The creature should never feel overly punishing. This is a relaxing game — recovery should always be possible.

---

## Care Activities

Players can feed, give water, clean, brush, let sleep, visit healer, play games, read stories, train intelligence, hug, pet, and give treats.

Every activity includes animation, sound effect, stat changes, and emotional response.

---

## Mood System

Possible moods: Happy, Excited, Relaxed, Sleepy, Curious, Lonely, Sad, Sick, Playful, Proud.

Mood affects animations, facial expressions, sound reactions, and behavior. The creature should visibly communicate its emotional state.

---

## Heartbeat Relaxation System

A unique soothing heartbeat soundtrack:

- Slow calming heartbeat, 55–60 BPM
- High quality seamless audio loop
- Continuous playback across screens
- Dedicated volume slider

**Advanced behavior:**
- Sleeping → slower heartbeat
- Playing → slightly faster heartbeat
- Sick → slightly irregular heartbeat
- Happy → warm, steady heartbeat

The heartbeat should create emotional attachment and comfort.

---

## Audio Design

Every action has satisfying audio feedback: feeding, drinking, cleaning, sleeping, hugging, healing, evolution, coin collection, achievement unlock, button clicks, mini-game success/failure.

Separate controls: Master Volume, Heartbeat Volume, Effects Volume. All audio works offline.

---

## Mini Games

Five polished mini games:

1. **Memory Match** — improves intelligence
2. **Quick Tap** — improves reaction and happiness
3. **Catch Falling Stars** — improves happiness
4. **Pattern Repeat** — improves intelligence
5. **Maze Escape** — improves intelligence and affection

Mobile-friendly controls, offline functionality, local high scores, reward system, fast loading.

---

## Daily Reward System

| Day | Reward |
|-----|--------|
| 1 | Coins |
| 2 | Food |
| 3 | Accessory |
| 4 | Coins |
| 5 | Special Treat |
| 6 | Rare Item |
| 7 | Mystery Reward |

Track streaks locally. Must function offline.

---

## Leveling System

Creatures gain experience through care activities, mini games, daily interaction, and training.

Level rewards: accessories, backgrounds, decorations, animations, rare evolution items.

---

## Accessories

Unlockable cosmetic items (no gameplay effect):

- **Hats:** Wizard Hat, Crown, Pirate Hat, Flower Crown
- **Glasses:** Round Glasses, Star Glasses, Crystal Glasses
- **Scarves:** Winter Scarf, Royal Scarf, Magic Scarf
- **Wings:** Angel Wings, Dragon Wings, Crystal Wings

---

## Room Customization

Players customize the creature habitat.

**Themes:** Forest, Moon, Castle, Crystal Cave, Sky Kingdom, Underwater

**Decorations:** Plants, Lamps, Toys, Rugs, Statues, Magical artifacts

All customization saved locally.

---

## Achievement System

Examples: First Feeding, First Evolution, 7-Day Streak, 30-Day Streak, Master Caretaker, Happiness Expert, Legendary Companion, Mini Game Champion.

Unlock rewards and badges.

---

## Notification System

Local notifications only: hungry companion, needs rest, misses you, daily reward available. Must continue working offline with no server dependency.

---

## User Interface

**Visual style:** Cute, cozy, modern, magical, premium.

Large touch targets, mobile-first, responsive, accessible, smooth transitions. Light and Dark mode. Supports tablets and phones.

---

## Performance Requirements

- Load under 3 seconds
- Smooth animations, low battery consumption, minimal memory usage
- Offline asset caching, efficient save system

**Targets:** Android, iPhone, Tablet, Modern browsers.

---

## Data Model

Store locally via IndexedDB: creature, stats, history, inventory, coins, achievements, daily streak, settings, audio preferences, decorations, evolution history. Never rely on remote storage for core gameplay.

---

## Future Expansion Support

Architecture supports: more creatures, seasonal events, additional mini games, trading cards, cloud synchronization, friend system, new habitats, additional evolution branches.

---

## Final Product Goal

Create a production-ready virtual pet experience that combines the emotional attachment of classic Tamagotchi games with modern mobile UX, fantasy creature collection, relaxing heartbeat audio, deep progression systems, and a true offline-first architecture.

The finished application should feel polished, professional, emotionally engaging, calming, and capable of retaining users for months through daily care, creature evolution, collection goals, and meaningful companionship.
`;

export default function HeartPets() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-sky-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/Game">
            <Button variant="ghost" className="text-purple-700 hover:bg-purple-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-purple-600">
            <Heart className="w-5 h-5 fill-purple-400" />
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-6 sm:p-10"
        >
          <div className="max-w-none text-slate-700 text-sm sm:text-base leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-black text-purple-900 mb-4" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-purple-900 mt-8 mb-3 pb-2 border-b border-purple-200" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-purple-800 mt-5 mb-2" {...props} />,
                p: ({ node, ...props }) => <p className="my-3" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-purple-800" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc list-inside my-3 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-3 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-slate-700" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-6 border-purple-100" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-purple-300 bg-purple-50/50 pl-4 py-2 my-3 rounded-r" {...props} />,
                table: ({ node, ...props }) => <div className="overflow-x-auto my-3"><table className="w-full border-collapse text-sm" {...props} /></div>,
                th: ({ node, ...props }) => <th className="bg-purple-50 text-purple-800 font-semibold px-3 py-2 border border-purple-100 text-left" {...props} />,
                td: ({ node, ...props }) => <td className="px-3 py-2 border border-purple-100" {...props} />,
              }}
            >
              {SPEC}
            </ReactMarkdown>
          </div>

          <div className="mt-8 pt-6 border-t border-purple-100 text-center">
            <p className="text-sm text-slate-500">
              A project by Zoltan F. — crafted with care for calm, comforting companionship.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}