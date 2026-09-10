import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Wallet,
  Store,
  GraduationCap,
  Columns,
  BellRing,
  LogOut,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playClickSound } from '../../utils/sound';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    currentCollege,
    logout,
    cartTotalCount,
    setIsCartOpen,
    activeOrder,
    activeView,
    setActiveView,
    setActiveQRModalOrder,
    breakMinutesLeft,
    breakName
  } = useApp();

  const walletBalance = currentUser ? currentUser.walletBalance : 350;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner: Break Status & College Campus Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-2 text-xs flex-wrap border-b border-slate-800/60">
        {/* Active College Pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
          <span className="text-sm">{currentCollege.logo}</span>
          <span className="font-bold text-white truncate max-w-[160px] sm:max-w-xs">{currentCollege.collegeName}</span>
          <span className="text-[10px] font-mono text-orange-400 font-extrabold bg-orange-500/15 px-1.5 py-0.5 rounded">
            {currentCollege.collegeId}
          </span>
        </div>

        {/* Break & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Break indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-xl text-orange-300 font-medium">
            <Clock className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>{breakName}:</span>
            <span className="font-bold text-orange-400 font-mono">{breakMinutesLeft}m left</span>
          </div>

          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => {
                playClickSound();
                setCurrentRole('student');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'student'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setCurrentRole('staff');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'staff'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kitchen</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setCurrentRole('split');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                currentRole === 'split'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split Demo (Student + Kitchen)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
          </div>

          {/* User Logout Button */}
          {currentUser && (
            <button
              onClick={() => {
                playClickSound();
                logout();
              }}
              title="Sign Out"
              className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveView('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-orange-400/30">
            <span className="text-xl font-black text-white font-mono">⚡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-orange-200 bg-clip-text text-transparent">
                Canteen<span className="text-orange-500">X</span>
              </span>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                {currentCollege.shortName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Campus Food Platform</p>
          </div>
        </div>

        {/* Desktop Navigation Links (Tablet / Desktop) */}
        {currentRole === 'student' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            {[
              { id: 'home', label: 'Home' },
              { id: 'menu', label: 'Menu' },
              { id: 'ai', label: 'AI Crave' },
              { id: 'orders', label: 'Orders' },
              { id: 'profile', label: 'Profile' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setActiveView(item.id as any);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all ${
                  activeView === item.id
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Wallet */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Campus Wallet</p>
              <p className="text-xs font-bold text-slate-200 font-mono">₹{walletBalance}</p>
            </div>
          </div>

          {/* Quick AI Trigger */}
          {currentRole === 'student' && (
            <button
              onClick={() => {
                playClickSound();
                setActiveView('ai');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 hover:text-white hover:bg-orange-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="hidden md:inline">Ask AI Recommender</span>
              <span className="md:hidden">AI</span>
            </button>
          )}

          {/* Cart Button */}
          {currentRole === 'student' && (
            <button
              onClick={() => {
                playClickSound();
                setIsCartOpen(true);
              }}
              className="relative p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-200 hover:text-white transition-all shadow-sm"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-orange-400" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce-soft font-mono">
                  {cartTotalCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Active Order Banner */}
      {currentRole === 'student' && activeOrder && (
        <div
          onClick={() => {
            playClickSound();
            setActiveView('orders');
          }}
          className="bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-600/90 text-white px-4 py-2 text-xs font-medium flex items-center justify-between cursor-pointer hover:brightness-110 transition-all border-t border-orange-400/30 shadow-inner"
        >
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 animate-bounce text-yellow-200" />
            <span>
              Active Order <strong className="font-mono">#{activeOrder.orderId}</strong>:
            </span>
            <span className="capitalize font-bold bg-black/20 px-2 py-0.5 rounded">
              {activeOrder.status === 'ready' ? '🟢 Ready for Pickup!' : `🟡 ${activeOrder.status}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeOrder.status === 'ready' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setActiveQRModalOrder(activeOrder);
                }}
                className="px-2 py-0.5 bg-white text-orange-600 rounded text-[10px] font-black flex items-center gap-1 shadow"
              >
                <QrCode className="w-3 h-3" />
                <span>Show QR</span>
              </button>
            )}
            <span className="underline font-semibold flex items-center gap-1">
              Track live &rarr;
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
