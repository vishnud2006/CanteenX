import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  ArrowRight,
  Zap,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getBreakTimingAdvice } from '../../services/queueIntelligence';
import { playClickSound } from '../../utils/sound';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    cartTotalAmount,
    cartTotalCount,
    cartMaxPrepTime,
    updateCartQuantity,
    removeFromCart,
    placeReservation,
    queueMetrics,
    breakMinutesLeft,
    currentUser
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'Campus Wallet' | 'UPI / GPay' | 'Counter Cash'>('Campus Wallet');
  const [specialNote, setSpecialNote] = useState<string>('');

  if (!isCartOpen) return null;

  const estimatedTotalWait = cartMaxPrepTime + queueMetrics.queueDelayMinutes;
  const timingAdvice = getBreakTimingAdvice(estimatedTotalWait, breakMinutesLeft);

  const walletBalance = currentUser ? currentUser.walletBalance : 350;
  const isWalletSufficient = walletBalance >= cartTotalAmount;

  const handleCheckout = () => {
    playClickSound();
    placeReservation(paymentMethod, specialNote);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white">Your Order</h2>
            <span className="bg-orange-500/20 text-orange-400 font-mono text-xs font-bold px-2 py-0.5 rounded-full">
              {cartTotalCount} items
            </span>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsCartOpen(false);
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <p className="text-4xl">🛒</p>
            <p className="text-sm font-bold text-white">Your cart is empty</p>
            <p className="text-xs text-slate-400">Add delicious meals from the menu or AI suggestions.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Items List */}
            <div className="space-y-2.5">
              {cart.map(item => (
                <div
                  key={item.foodId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 truncate">
                    <h3 className="text-xs font-bold text-white truncate">{item.foodName}</h3>
                    <p className="font-mono text-xs font-extrabold text-orange-400 mt-0.5">
                      ₹{item.price * item.quantity} <span className="text-[10px] text-slate-500 font-normal">(₹{item.price} each)</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-xs text-white w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.foodId, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.foodId)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SMART ORDER TIMING ESTIMATE (LIVE QUEUE INTELLIGENCE) */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              timingAdvice.status === 'good'
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : timingAdvice.status === 'tight'
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                    Live Timing Estimate
                  </h4>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  timingAdvice.status === 'good' ? 'bg-emerald-500/20 text-emerald-300' : timingAdvice.status === 'tight' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {timingAdvice.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400">Prep Time</p>
                  <p className="font-mono font-bold text-white mt-0.5">~{cartMaxPrepTime} min</p>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400">Queue Delay</p>
                  <p className="font-mono font-bold text-orange-400 mt-0.5">+{queueMetrics.queueDelayMinutes} min</p>
                </div>
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-400">Total Ready</p>
                  <p className="font-mono font-black text-emerald-400 mt-0.5">~{estimatedTotalWait} min</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Remaining Break:</span>
                <span className="font-mono font-bold text-white">{breakMinutesLeft} minutes</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {timingAdvice.explanation}
              </p>
            </div>

            {/* Special Instruction Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Special Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Extra spicy, no onions, less ice..."
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-300">Payment Option</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Campus Wallet', label: 'Wallet', icon: <Wallet className="w-3.5 h-3.5" /> },
                  { id: 'UPI / GPay', label: 'UPI / QR', icon: <Zap className="w-3.5 h-3.5" /> },
                  { id: 'Counter Cash', label: 'Counter Cash', icon: <Clock className="w-3.5 h-3.5" /> }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      playClickSound();
                      setPaymentMethod(opt.id as any);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === opt.id
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'Campus Wallet' && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Available Balance:</span>
                  <span className={`font-mono font-bold ${isWalletSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{walletBalance} {isWalletSufficient ? '(Sufficient)' : '(Insufficient)'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drawer Footer Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-semibold">Total Amount:</span>
              <span className="text-xl font-black text-white font-mono">₹{cartTotalAmount}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={paymentMethod === 'Campus Wallet' && !isWalletSufficient}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 disabled:opacity-40 text-white rounded-2xl font-extrabold text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <span>Confirm Food Reservation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
