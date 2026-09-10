import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playClickSound } from '../../utils/sound';

export const InventoryManager: React.FC = () => {
  const {
    collegeMenu,
    currentCollege,
    updateItemStock,
    toggleItemAvailability
  } = useApp();

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-extrabold text-white">Live Inventory & Stock Manager</h2>
          <p className="text-xs text-slate-400">Manage real-time portion availability for {currentCollege.shortName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {collegeMenu.map(item => (
          <div
            key={item.id}
            className={`bg-slate-900 border rounded-2xl p-4 flex items-center justify-between gap-3 ${
              !item.isAvailable ? 'opacity-60 border-slate-800' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
              />
              <div>
                <h3 className="text-xs font-bold text-white">{item.name}</h3>
                <p className="text-xs font-mono font-extrabold text-orange-400">₹{item.price}</p>
                <p className="text-[10px] text-slate-400">Prep: ~{item.preparationTime}m</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playClickSound();
                    updateItemStock(item.id, -1);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-950 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>

                <span className="font-mono font-bold text-xs text-white w-8 text-center bg-slate-950 py-1 rounded-md border border-slate-800">
                  {item.availableQuantity}
                </span>

                <button
                  onClick={() => {
                    playClickSound();
                    updateItemStock(item.id, 5);
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-950 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  toggleItemAvailability(item.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  item.isAvailable
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {item.isAvailable ? 'In Stock' : 'Mark Sold Out'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
