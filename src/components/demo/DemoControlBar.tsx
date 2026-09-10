import React from 'react';
import {
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playClickSound } from '../../utils/sound';

export const DemoControlBar: React.FC = () => {
  const {
    colleges,
    currentCollege,
    switchCollege,
    runHackathonDemoScenario,
    setSimulatedRushMode,
    resetDemoData,
    queueMetrics
  } = useApp();

  return (
    <div className="bg-slate-950/95 border-b border-orange-500/30 text-xs px-4 py-2 sticky top-0 z-50 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon 1-Click Demo Trigger */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-extrabold text-[11px] text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30">
            HACKATHON DEMO
          </span>

          <button
            onClick={() => {
              playClickSound();
              runHackathonDemoScenario();
            }}
            className="px-3 py-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 hover:brightness-110 text-white font-black rounded-lg shadow-md flex items-center gap-1.5 transition-all"
            title="Sets 10m break, High Rush, and triggers AI timing recommendation"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            <span>1-Click Live Queue Demo</span>
          </button>
        </div>

        {/* Center: Simulated Rush Level Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">Simulate Rush:</span>
          {[
            { id: 'low', label: '🟢 Low' },
            { id: 'moderate', label: '🟡 Moderate' },
            { id: 'high', label: '🔴 High Rush' }
          ].map(rush => (
            <button
              key={rush.id}
              onClick={() => {
                playClickSound();
                setSimulatedRushMode(rush.id as any);
              }}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                queueMetrics.rushLevel === rush.id
                  ? 'bg-orange-500 text-white border-orange-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {rush.label}
            </button>
          ))}
        </div>

        {/* Right: Quick Role & College Switchers */}
        <div className="flex items-center gap-2">
          {/* College */}
          <select
            value={currentCollege.collegeId}
            onChange={(e) => {
              playClickSound();
              switchCollege(e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
          >
            {colleges.map(c => (
              <option key={c.collegeId} value={c.collegeId}>
                {c.shortName} ({c.collegeId})
              </option>
            ))}
          </select>

          {/* Reset Demo */}
          <button
            onClick={() => {
              playClickSound();
              resetDemoData();
            }}
            className="p-1 text-slate-400 hover:text-white"
            title="Reset Demo State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
