import React from 'react';
import { AVATARS, FRAMES, BADGES } from './CosmeticData';

export default function PlayerAvatar({ 
  avatar = 'default', 
  frame = 'default', 
  badge = null, 
  size = 'md',
  showBadge = true 
}) {
  const avatarData = AVATARS[avatar] || AVATARS.default;
  const frameData = FRAMES[frame] || FRAMES.default;
  const badgeData = badge ? BADGES[badge] : null;

  const sizes = {
    sm: { container: 'w-12 h-12', emoji: 'text-2xl', badge: 'w-5 h-5 text-xs' },
    md: { container: 'w-16 h-16', emoji: 'text-3xl', badge: 'w-6 h-6 text-sm' },
    lg: { container: 'w-24 h-24', emoji: 'text-5xl', badge: 'w-8 h-8 text-lg' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="relative inline-block">
      <div className={`
        ${s.container} rounded-full ${avatarData.color} 
        flex items-center justify-center
        ${frameData.border} ${frameData.shadow}
        ${avatarData.animated ? 'animate-bounce' : ''}
      `}>
        <span className={s.emoji}>{avatarData.emoji}</span>
      </div>
      {showBadge && badgeData && (
        <div className={`
          absolute -bottom-1 -right-1 
          ${s.badge} rounded-full bg-white 
          flex items-center justify-center
          border-2 border-white shadow-lg
        `}>
          <span className={badgeData.color}>{badgeData.emoji}</span>
        </div>
      )}
    </div>
  );
}