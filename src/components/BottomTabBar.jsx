import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Gamepad2, Calendar, BarChart3, Trophy, User } from 'lucide-react';
import { useTranslation } from '@/components/utils/translations';

// Sticky bottom tab bar — mobile viewports only (hidden on md+).
export default function BottomTabBar() {
  const t = useTranslation();
  const { pathname } = useLocation();

  const tabs = [
    { to: '/', label: 'Games', icon: Gamepad2, active: pathname === '/' || pathname.startsWith('/Game') },
    { to: '/DailyChallenge', label: t('daily'), icon: Calendar, active: pathname.startsWith('/DailyChallenge') },
    { to: '/Statistics', label: t('statisticsTitle'), icon: BarChart3, active: pathname.startsWith('/Statistics') },
    { to: '/Leaderboard', label: t('leaderboard'), icon: Trophy, active: pathname.startsWith('/Leaderboard') },
    { to: '/Profile', label: t('profile'), icon: User, active: pathname.startsWith('/Profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] safe-bottom no-select">
      <div className="flex items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon, active }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
              active ? 'text-purple-600' : 'text-slate-500'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-semibold truncate px-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}