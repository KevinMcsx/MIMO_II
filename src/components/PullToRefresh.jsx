import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 65;
const MAX_PULL = 100;

// Custom touch pull-to-refresh gesture (touch devices only — desktop unaffected).
export default function PullToRefresh({ onRefresh, children, className }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);

  const handleTouchStart = (e) => {
    startY.current = !refreshing && window.scrollY <= 0 ? e.touches[0].clientY : null;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    setPull(dy > 0 ? Math.min(MAX_PULL, dy * 0.5) : 0);
  };

  const handleTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const height = refreshing ? THRESHOLD : pull;
  const progress = Math.min(1, pull / THRESHOLD);

  return (
    <div className={className} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{ height, transition: startY.current === null ? 'height 0.2s ease' : 'none' }}
      >
        <RefreshCw
          className={`w-5 h-5 text-purple-500 ${refreshing ? 'animate-spin' : ''}`}
          style={{ opacity: refreshing ? 1 : progress, transform: `rotate(${progress * 300}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}