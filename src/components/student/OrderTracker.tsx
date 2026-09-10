import React from 'react';
import {
  QrCode,
  RotateCcw,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { playClickSound } from '../../utils/sound';

export const OrderTracker: React.FC = () => {
  const {
    studentOrders,
    currentCollege,
    setActiveQRModalOrder,
    reorderPastOrder,
    setActiveView,
    queueMetrics
  } = useApp();

  const activeOrders = studentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = studentOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const statusSteps: { id: OrderStatus; label: string }[] = [
    { id: 'received', label: 'Received' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready for Pickup' },
    { id: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'confirmed': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Order Status & Tracking</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentCollege.collegeName} • Live Queue Intelligence
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-2 self-start sm:self-auto text-xs font-mono font-bold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span>Canteen Load: {queueMetrics.kitchenLoadPercent}%</span>
        </div>
      </div>

      {/* ACTIVE ORDERS SECTION */}
      {activeOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">No active orders right now</h3>
          <p className="text-xs text-slate-400">Order from today&apos;s menu to track live preparation and get your pickup QR.</p>
          <button
            onClick={() => {
              playClickSound();
              setActiveView('menu');
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md inline-flex items-center gap-1.5"
          >
            <span>Browse Today&apos;s Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {activeOrders.map(order => {
            const currentStepIdx = getStepIndex(order.status);
            const isReady = order.status === 'ready';
            const ordersAhead = Math.max(1, queueMetrics.waitingCount);

            return (
              <div
                key={order.orderId}
                className={`rounded-3xl p-5 sm:p-6 border shadow-2xl space-y-4 transition-all ${
                  isReady
                    ? 'bg-gradient-to-br from-emerald-950/90 via-slate-900 to-emerald-950/90 border-emerald-500/60 shadow-emerald-950/40'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                {/* Order Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-orange-400">
                      #{order.orderId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className={`text-xs font-black px-3 py-1 rounded-xl capitalize ${
                    isReady
                      ? 'bg-emerald-500 text-white animate-pulse shadow-md'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {isReady ? '🎉 Ready for Pickup' : order.status}
                  </span>
                </div>

                {/* Items & Queue Status Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Ordered Items</p>
                    <p className="text-xs font-extrabold text-white mt-0.5">
                      {order.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-orange-400 mt-1">
                      Total: ₹{order.totalAmount} • {order.paymentMethod}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Queue Status</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">
                        {isReady ? 'Packed at Counter #2' : `Estimated queue: ~${ordersAhead} orders ahead`}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Canteen: {queueMetrics.rushLevel === 'high' ? '🔴 High Rush' : queueMetrics.rushLevel === 'moderate' ? '🟡 Moderate Rush' : '🟢 Low Crowd'}
                    </p>
                  </div>
                </div>

                {/* 5-Step Visual Progress Stepper */}
                <div className="pt-2 space-y-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-800 -z-0" />
                    <div
                      className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gradient-to-r from-orange-500 to-emerald-500 -z-0 transition-all duration-500"
                      style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                    />

                    {statusSteps.map((step, idx) => {
                      const isPassed = currentStepIdx >= idx;
                      const isCurrent = currentStepIdx === idx;

                      return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 scale-110 shadow-lg'
                              : isPassed
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isPassed && !isCurrent ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center ${
                            isCurrent ? 'text-orange-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Ready Alert & Show QR Button */}
                {isReady ? (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveQRModalOrder(order);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all animate-bounce-soft"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>Show Pickup QR Code at Counter</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        setActiveQRModalOrder(order);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <QrCode className="w-4 h-4 text-orange-400" />
                      <span>View Order QR Pass</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* COMPLETED / PAST ORDERS SECTION */}
      {pastOrders.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            PAST ORDERS
          </h2>

          <div className="space-y-2.5">
            {pastOrders.map(order => (
              <div
                key={order.orderId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">#{order.orderId}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(order.orderTime).toLocaleDateString()}
                    </span>
                    <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-white font-semibold mt-1">
                    {order.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-mono text-sm font-extrabold text-white">
                    ₹{order.totalAmount}
                  </span>
                  <button
                    onClick={() => reorderPastOrder(order)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
