import React from 'react';
import { HomeScreen } from '../student/HomeScreen';
import { StaffDashboard } from '../staff/StaffDashboard';

export const SplitScreenView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 max-w-7xl mx-auto">
      {/* Student App Screen */}
      <div className="border border-slate-800 rounded-3xl p-4 bg-slate-950/60 shadow-2xl relative overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-3 rounded-2xl mb-4 flex items-center justify-between">
          <span className="font-extrabold text-xs text-orange-400">📱 STUDENT PERSPECTIVE</span>
          <span className="text-[10px] text-slate-400 font-mono">Live Ordering & QR</span>
        </div>
        <HomeScreen />
      </div>

      {/* Kitchen Staff Dashboard Screen */}
      <div className="border border-slate-800 rounded-3xl p-4 bg-slate-950/60 shadow-2xl relative overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-800 p-3 rounded-2xl mb-4 flex items-center justify-between">
          <span className="font-extrabold text-xs text-emerald-400">👨‍🍳 KITCHEN DISPLAY (KDS)</span>
          <span className="text-[10px] text-slate-400 font-mono">Live Queue & Verification</span>
        </div>
        <StaffDashboard />
      </div>
    </div>
  );
};
