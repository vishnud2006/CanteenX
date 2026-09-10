import React, { useState } from 'react';
import {
  QrCode,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { playClickSound } from '../../utils/sound';

export const StaffDashboard: React.FC = () => {
  const {
    staffOrders,
    currentCollege,
    updateOrderStatus,
    setIsAdminScannerOpen,
    queueMetrics
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const filteredOrders = staffOrders.filter(o => {
    if (statusFilter === 'all') return o.status !== 'completed' && o.status !== 'cancelled';
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Staff Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Kitchen Display System (KDS)
            </h1>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded-lg uppercase">
              {currentCollege.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time order fulfillment & live queue load management
          </p>
        </div>

        <button
          onClick={() => {
            playClickSound();
            setIsAdminScannerOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4" />
          <span>Scan Student Pickup QR</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIVE CANTEEN LOAD KPI BANNER */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${
              queueMetrics.rushLevel === 'high' ? 'bg-rose-500/20 text-rose-400' : queueMetrics.rushLevel === 'moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">LIVE CANTEEN LOAD</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-2xl font-black text-white">
                  {queueMetrics.kitchenLoadPercent}%
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                  queueMetrics.rushLevel === 'high' ? 'bg-rose-500 text-white' : queueMetrics.rushLevel === 'moderate' ? 'bg-amber-500 text-black' : 'bg-emerald-500 text-white'
                }`}>
                  {queueMetrics.rushLevel === 'high' ? '🔴 HIGH RUSH' : queueMetrics.rushLevel === 'moderate' ? '🟡 MODERATE' : '🟢 LOW CROWD'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono text-slate-300">
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              Avg Wait: ~{queueMetrics.estimatedWaitMax} min
            </span>
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-orange-400 font-bold">
              {queueMetrics.peakPeriod}
            </span>
          </div>
        </div>

        {/* 4 Load Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Active Orders</p>
            <p className="font-mono text-xl font-black text-white mt-1">{queueMetrics.activeOrdersCount}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Preparing Now</p>
            <p className="font-mono text-xl font-black text-amber-400 mt-1">{queueMetrics.preparingCount}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Waiting in Queue</p>
            <p className="font-mono text-xl font-black text-orange-400 mt-1">{queueMetrics.waitingCount}</p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Station Delay</p>
            <p className="font-mono text-xl font-black text-slate-200 mt-1">+{queueMetrics.queueDelayMinutes}m</p>
          </div>
        </div>

        {/* Counter Load Breakdown */}
        <div className="pt-2 space-y-2">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
            Counter Workload Breakdown:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {queueMetrics.counterLoads.map(counter => (
              <div
                key={counter.category}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-white">{counter.category}</span>
                  <span className={`font-mono font-bold ${
                    counter.rushLevel === 'high' ? 'text-rose-400' : counter.rushLevel === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {counter.loadPercent}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      counter.rushLevel === 'high' ? 'bg-rose-500' : counter.rushLevel === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${counter.loadPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Insight Note */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>{queueMetrics.insightMessage}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORDER QUEUE STREAM & FULFILLMENT CARDS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Status Filter Buttons */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: `All Active (${staffOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})` },
              { id: 'received', label: 'Received' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'preparing', label: 'Preparing' },
              { id: 'ready', label: 'Ready for Pickup' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  playClickSound();
                  setStatusFilter(f.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  statusFilter === f.id
                    ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Cards Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
            <p className="text-3xl">👨‍🍳</p>
            <p className="text-sm font-bold text-white">No orders in this status</p>
            <p className="text-xs text-slate-400">All student orders for {currentCollege.shortName} are fulfilled!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map(order => (
              <div
                key={order.orderId}
                className={`bg-slate-900 border rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all ${
                  order.status === 'ready'
                    ? 'border-emerald-500/50 bg-slate-900/90'
                    : order.status === 'preparing'
                    ? 'border-amber-500/50 bg-slate-900/90'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-orange-400">
                          #{order.orderId}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {order.studentName}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {order.studentId} • {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                      order.status === 'ready'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : order.status === 'preparing'
                        ? 'bg-amber-500 text-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-1.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">
                          {item.quantity}× {item.foodName}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          ~{item.prepTime}m
                        </span>
                      </div>
                    ))}

                    {order.specialNote && (
                      <p className="text-[11px] text-amber-300/90 italic bg-amber-500/10 p-2 rounded-xl mt-2 border border-amber-500/20">
                        &ldquo;{order.specialNote}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Staff Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs font-mono font-bold text-slate-300">
                    Paid ₹{order.totalAmount}
                  </div>

                  <div className="flex gap-1.5">
                    {order.status === 'received' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        Confirm
                      </button>
                    )}

                    {(order.status === 'received' || order.status === 'confirmed') && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'preparing')}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm"
                      >
                        Start Cooking
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.orderId, 'ready')}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md animate-pulse"
                      >
                        Mark Ready 🎉
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => {
                          playClickSound();
                          setIsAdminScannerOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Verify Pickup</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
