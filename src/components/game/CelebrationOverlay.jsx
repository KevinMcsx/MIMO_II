import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';

const COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#f87171'];
const STAR_COLORS = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#a78bfa'];

export default function CelebrationOverlay({ show }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!show || firedRef.current) return;
    firedRef.current = true;

    // Central burst
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.55 },
      colors: COLORS,
      zIndex: 9999,
    });

    // Left + right side bursts
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: COLORS,
        zIndex: 9999,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: COLORS,
        zIndex: 9999,
      });
    }, 250);

    // Gentle confetti rain for ~2.5s
    const end = Date.now() + 2500;
    const tick = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.85 },
        colors: COLORS,
        zIndex: 9999,
        scalar: 0.85,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.85 },
        colors: COLORS,
        zIndex: 9999,
        scalar: 0.85,
      });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: `${(i / 14) * 100}vw`,
            y: '-10vh',
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            y: '110vh',
            rotate: 360 * (i % 2 === 0 ? 1 : -1),
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.8,
            delay: i * 0.12,
            ease: 'easeIn',
          }}
          className="absolute"
        >
          <Star
            className="w-6 h-6 sm:w-8 sm:h-8"
            fill="currentColor"
            strokeWidth={0}
          />
        </motion.div>
      ))}
    </div>
  );
}