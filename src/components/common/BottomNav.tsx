import React from 'react';
import {
  Home,
  UtensilsCrossed,
  Sparkles,
  Receipt,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import { playClickSound } from '../../utils/sound';

export const BottomNav: React.FC = () => {
  const { activeView, setActiveView, activeOrder } = useApp();

  const navItems: { id: AppView; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'menu',
      label: 'Menu',
      icon: <UtensilsCrossed className="w-5 h-5" />
    },
    {
      id: 'ai',
      label: 'AI Crave',
      icon: <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />,
      badge: <span className="bg-orange-500 text-[9px] font-extrabold px-1 rounded-full text-white">AI</span>
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Receipt className="w-5 h-5" />,
      badge: activeOrder ? (
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping absolute top-1 right-3" />
      ) : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 md:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playClickSound();
                setActiveView(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-0.5 shadow-sm shadow-orange-500/80" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
