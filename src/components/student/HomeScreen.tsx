import React from 'react';
import {
  Sparkles,
  Clock,
  Plus,
  ShoppingBag,
  Zap,
  ChevronRight,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateItemWaitTime, getBreakTimingAdvice } from '../../services/queueIntelligence';
import { playClickSound } from '../../utils/sound';

export const HomeScreen: React.FC = () => {
  const {
    currentUser,
    currentCollege,
    collegeMenu,
    addToCart,
    addComboToCart,
    setActiveView,
    activeOrder,
    setActiveQRModalOrder,
    breakMinutesLeft,
    setBreakMinutesLeft,
    queueMetrics
  } = useApp();

  const studentName = currentUser ? currentUser.name.split(' ')[0] : 'Student';

  // Overall break timing advice based on canteen estimated wait
  const overallTimingAdvice = getBreakTimingAdvice(queueMetrics.estimatedWaitMax, breakMinutesLeft);

  // Best for Break recommendations (items that fit within budget and break time + queue)
  const budget = currentUser?.budget || 60;
  const breakFastPicks = collegeMenu
    .filter(item => item.isAvailable && item.availableQuantity > 0)
    .map(item => {
      const wait = calculateItemWaitTime(item, queueMetrics);
      const advice = getBreakTimingAdvice(wait.totalEstimatedReady, breakMinutesLeft);
      return { item, wait, advice };
    })
    .filter(p => p.wait.totalEstimatedReady <= breakMinutesLeft && p.item.price <= budget)
    .sort((a, b) => a.wait.totalEstimatedReady - b.wait.totalEstimatedReady)
    .slice(0, 3);

  // Quick combos
  const samosa = collegeMenu.find(i => i.name.includes('Samosa'));
  const lemonade = collegeMenu.find(i => i.name.includes('Lemon Juice'));

  const fastCombo = samosa && lemonade ? {
    title: 'Samosa + Fresh Lemon Juice',
    items: [samosa, lemonade],
    totalPrice: samosa.price + lemonade.price,
    totalTime: Math.max(samosa.preparationTime, lemonade.preparationTime) + queueMetrics.queueDelayMinutes
  } : null;

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* 1. GREETING & CAMPUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Good afternoon, {studentName} 👋
            </h1>
            <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono uppercase">
              {currentUser?.id || 'STUDENT'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentCollege.collegeName} • <span className="font-mono text-orange-400/90 font-bold">{currentCollege.collegeId}</span>
          </p>
        </div>

        {/* Quick Break Adjuster */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs font-bold text-slate-300 font-mono">{breakMinutesLeft}m break</span>
          <div className="flex gap-1 ml-1">
            {[10, 15, 20].map(mins => (
              <button
                key={mins}
                onClick={() => {
                  playClickSound();
                  setBreakMinutesLeft(mins);
                }}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold transition-all ${
                  breakMinutesLeft === mins
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. LIVE CANTEEN QUEUE STATUS CARD */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-xl relative overflow-hidden ${
        queueMetrics.rushLevel === 'high'
          ? 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/30'
          : queueMetrics.rushLevel === 'moderate'
          ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-950/30'
          : 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/30'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-3 h-3 rounded-full animate-ping ${
              queueMetrics.rushLevel === 'high' ? 'bg-rose-500' : queueMetrics.rushLevel === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                CURRENT CANTEEN STATUS
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-base sm:text-lg font-black tracking-tight ${
                  queueMetrics.rushLevel === 'high' ? 'text-rose-400' : queueMetrics.rushLevel === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {queueMetrics.rushLevel === 'high' ? '🔴 HIGH CANTEEN RUSH' : queueMetrics.rushLevel === 'moderate' ? '🟡 MODERATE RUSH' : '🟢 LOW CROWD'}
                </span>
                {queueMetrics.isPeakPeriod && (
                  <span className="text-[10px] font-extrabold bg-slate-950 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                    {queueMetrics.peakPeriod}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Timing recommendation badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 self-start sm:self-auto ${
            overallTimingAdvice.status === 'good'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : overallTimingAdvice.status === 'tight'
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}>
            <span>{overallTimingAdvice.label}</span>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Active Orders</p>
            <p className="font-mono text-lg font-black text-white mt-0.5">
              {queueMetrics.activeOrdersCount} <span className="text-xs font-normal text-slate-400">orders</span>
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Estimated Wait</p>
            <p className="font-mono text-lg font-black text-orange-400 mt-0.5">
              {queueMetrics.estimatedWaitMin}–{queueMetrics.estimatedWaitMax} <span className="text-xs font-normal text-slate-400">min</span>
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Kitchen Load</p>
            <p className="font-mono text-lg font-black text-amber-400 mt-0.5">
              {queueMetrics.kitchenLoadPercent}%
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Queue Delay</p>
            <p className="font-mono text-lg font-black text-slate-200 mt-0.5">
              +{queueMetrics.queueDelayMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </p>
          </div>
        </div>

        {/* Insight note & Fast foods CTA */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-300 leading-relaxed flex-1">
            {queueMetrics.insightMessage}
          </p>

          {queueMetrics.rushLevel === 'high' && (
            <button
              onClick={() => {
                playClickSound();
                setActiveView('menu');
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-1 shadow-md self-start sm:self-auto flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>View Fastest Foods</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. ACTIVE ORDER PASS (IF PRESENT) */}
      {activeOrder && (
        <div className={`rounded-3xl p-5 border transition-all shadow-xl ${
          activeOrder.status === 'ready'
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-500/60 shadow-emerald-950/30'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                YOUR ACTIVE ORDER
              </h2>
            </div>
            <span className="font-mono text-xs font-black text-orange-400">
              #{activeOrder.orderId}
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">
                {activeOrder.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${
                  activeOrder.status === 'ready'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {activeOrder.status === 'ready' ? '🟢 Ready for Pickup 🎉' : `🟡 ${activeOrder.status}`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Estimated ~{activeOrder.estimatedPickupTime}m
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeOrder.status === 'ready' ? (
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveQRModalOrder(activeOrder);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Show Pickup QR</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveView('orders');
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>Track Order</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. BEST FOR YOUR BREAK */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white">Best for your break ⚡</h2>
              <p className="text-[11px] text-slate-400">
                Calculated for your {breakMinutesLeft}m break & ₹{budget} budget taking queue delay (+{queueMetrics.queueDelayMinutes}m) into account
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setActiveView('ai');
            }}
            className="text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1 flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>
        </div>

        {/* Fast Picks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {breakFastPicks.map(({ item, wait, advice }) => (
            <div
              key={item.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-mono text-xs font-extrabold text-orange-400">
                    ₹{item.price}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-slate-300">
                    ⚡ ~{wait.totalEstimatedReady} min ready
                  </span>
                </div>

                <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                  ✓ {advice.explanation}
                </p>
              </div>

              <button
                onClick={() => {
                  addToCart(item, 1);
                }}
                className="w-full mt-3 py-2 bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          ))}
        </div>

        {/* Featured Fast Combo Card */}
        {fastCombo && (
          <div className="p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">{fastCombo.title}</span>
                  <span className="bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded font-mono">
                    ₹{fastCombo.totalPrice}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fastest food + beverage combo • Estimated ready in ~{fastCombo.totalTime} min
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                addComboToCart(fastCombo.items);
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1 self-start sm:self-auto"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Combo</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. TODAY'S MENU WITH LIVE WAIT TIMES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Today&apos;s Menu ({currentCollege.shortName})
            </h2>
            <p className="text-xs text-slate-400">
              Live wait times include kitchen preparation + current queue delay
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setActiveView('menu');
            }}
            className="text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View Full Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {collegeMenu.slice(0, 4).map(item => {
            const wait = calculateItemWaitTime(item, queueMetrics);
            const advice = getBreakTimingAdvice(wait.totalEstimatedReady, breakMinutesLeft);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex gap-3 items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.name}</h3>
                    <p className="font-mono text-xs font-extrabold text-orange-400 mt-0.5">₹{item.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                        ⚡ ~{wait.totalEstimatedReady} min ready
                      </span>
                      <span className={`text-[10px] font-bold ${
                        advice.status === 'good' ? 'text-emerald-400' : advice.status === 'tight' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {advice.status === 'good' ? '✓ In Time' : advice.status === 'tight' ? '⚠️ Tight' : '❌ Risky'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => addToCart(item, 1)}
                  className="p-2.5 bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 rounded-xl transition-all"
                  title="Add to Cart"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
