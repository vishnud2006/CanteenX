import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DietaryType } from '../../types';
import { calculateItemWaitTime, getBreakTimingAdvice } from '../../services/queueIntelligence';
import { playClickSound } from '../../utils/sound';

export const MenuScreen: React.FC = () => {
  const {
    collegeMenu,
    currentCollege,
    addToCart,
    queueMetrics,
    breakMinutesLeft
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<DietaryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Items', icon: '🍽️' },
    { id: 'ready_fast', label: 'Ready Fast ⚡', icon: '⚡' },
    { id: 'Breakfast', label: 'Breakfast', icon: '🥞' },
    { id: 'Snacks', label: 'Snacks', icon: '🥟' },
    { id: 'Meals', label: 'Meals', icon: '🍛' },
    { id: 'Beverages', label: 'Beverages', icon: '🧃' },
    { id: 'Desserts', label: 'Desserts', icon: '🍰' }
  ];

  const filteredItems = useMemo(() => {
    return collegeMenu.filter(item => {
      // Category filter
      if (selectedCategory === 'ready_fast') {
        const wait = calculateItemWaitTime(item, queueMetrics);
        if (wait.totalEstimatedReady > 6) return false;
      } else if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter !== 'all') {
        if (dietaryFilter === 'veg' && item.dietaryType !== 'veg' && item.dietaryType !== 'vegan') return false;
        if (dietaryFilter === 'vegan' && item.dietaryType !== 'vegan') return false;
        if (dietaryFilter === 'non-veg' && item.dietaryType !== 'non-veg' && item.dietaryType !== 'egg') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedCategory === 'ready_fast') {
        const waitA = calculateItemWaitTime(a, queueMetrics).totalEstimatedReady;
        const waitB = calculateItemWaitTime(b, queueMetrics).totalEstimatedReady;
        return waitA - waitB;
      }
      return b.popularity - a.popularity;
    });
  }, [collegeMenu, selectedCategory, dietaryFilter, searchQuery, queueMetrics]);

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Canteen Menu
            </h1>
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded-lg">
              {currentCollege.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time availability and live queue wait times
          </p>
        </div>

        {/* Live Queue Status Pill */}
        <div className={`px-3 py-1.5 rounded-2xl border text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto ${
          queueMetrics.rushLevel === 'high'
            ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            : queueMetrics.rushLevel === 'moderate'
            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-ping ${
            queueMetrics.rushLevel === 'high' ? 'bg-rose-400' : queueMetrics.rushLevel === 'moderate' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          <span>Queue Delay: +{queueMetrics.queueDelayMinutes}m ({queueMetrics.activeOrdersCount} orders)</span>
        </div>
      </div>

      {/* Search and Dietary Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, ingredients, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>

        {/* Dietary Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'veg', label: '🥬 Veg' },
            { id: 'non-veg', label: '🍗 Non-Veg' },
            { id: 'vegan', label: '🌱 Vegan' }
          ].map(d => (
            <button
              key={d.id}
              onClick={() => {
                playClickSound();
                setDietaryFilter(d.id as any);
              }}
              className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 border ${
                dietaryFilter === d.id
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Scrollable Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              playClickSound();
              setSelectedCategory(cat.id);
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Menu Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <p className="text-3xl">🔍</p>
          <p className="text-sm font-bold text-white">No items found</p>
          <p className="text-xs text-slate-400">Try changing your filters or searching for something else.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const wait = calculateItemWaitTime(item, queueMetrics);
            const advice = getBreakTimingAdvice(wait.totalEstimatedReady, breakMinutesLeft);

            return (
              <div
                key={item.id}
                className={`bg-slate-900 border rounded-3xl p-4 flex flex-col justify-between transition-all hover:border-slate-700 shadow-lg ${
                  !item.isAvailable ? 'opacity-60 border-slate-800' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-800 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-extrabold text-white">
                          {item.name}
                        </h3>
                        <span className="font-mono text-xs sm:text-sm font-black text-orange-400">
                          ₹{item.price}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.dietaryType === 'veg' ? 'bg-emerald-500/20 text-emerald-400' : item.dietaryType === 'vegan' ? 'bg-teal-500/20 text-teal-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {item.dietaryType.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Stock: {item.availableQuantity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Wait Intelligence Section on Card */}
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400">Prep: {item.preparationTime}m</span>
                      <span className="text-slate-500">+</span>
                      <span className="text-slate-400">Queue: {wait.queueDelay}m</span>
                      <span className="text-slate-500">=</span>
                      <strong className="text-orange-400 font-black">~{wait.totalEstimatedReady} min ready</strong>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      advice.status === 'good'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : advice.status === 'tight'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {advice.label}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {item.isAvailable ? '✓ Ready to Order' : '❌ Currently Sold Out'}
                  </span>

                  <button
                    onClick={() => addToCart(item, 1)}
                    disabled={!item.isAvailable || item.availableQuantity <= 0}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
