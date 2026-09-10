import React, { useState } from 'react';
import {
  X,
  Scan,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QRVerificationResult } from '../../types';
import { playClickSound, playSuccessChime } from '../../utils/sound';

export const QRScannerModal: React.FC = () => {
  const {
    isAdminScannerOpen,
    setIsAdminScannerOpen,
    verifyQRPickup,
    confirmQRPickup,
    staffOrders,
    currentCollege
  } = useApp();

  const [manualCode, setManualCode] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<QRVerificationResult | null>(null);

  if (!isAdminScannerOpen) return null;

  const handleVerify = (payload: string) => {
    playClickSound();
    const result = verifyQRPickup(payload);
    setVerificationResult(result);
    if (result.valid) {
      playSuccessChime();
    }
  };

  const handleConfirmHandover = () => {
    if (!verificationResult?.order) return;
    confirmQRPickup(verificationResult.order.orderId);
    setVerificationResult(null);
    setManualCode('');
    setIsAdminScannerOpen(false);
  };

  const readyOrders = staffOrders.filter(o => o.status === 'ready');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-extrabold text-white">Canteen QR Scanner</h3>
              <p className="text-[11px] text-slate-400 font-mono">Counter: {currentCollege.shortName} ({currentCollege.collegeId})</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setIsAdminScannerOpen(false);
              setVerificationResult(null);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Alert / Result Box */}
        {verificationResult ? (
          <div className={`p-4 rounded-2xl border space-y-3 ${
            verificationResult.valid
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
              : verificationResult.errorType === 'WRONG_COLLEGE'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200 animate-pulse'
              : 'bg-amber-950/60 border-amber-500 text-amber-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {verificationResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="text-xs font-black uppercase tracking-wide">
                  {verificationResult.valid ? 'VALID PICKUP PASS' : 'VERIFICATION FAILED'}
                </h4>
                <p className="text-xs mt-1 leading-relaxed">{verificationResult.message}</p>
              </div>
            </div>

            {/* Order Details Preview */}
            {verificationResult.order && (
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between font-mono">
                  <span>Order ID:</span>
                  <span className="text-orange-400 font-bold">#{verificationResult.order.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Student Name:</span>
                  <span className="text-white font-bold">{verificationResult.order.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="text-slate-200 truncate max-w-[200px]">
                    {verificationResult.order.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
                  </span>
                </div>
              </div>
            )}

            {/* Action Button */}
            {verificationResult.valid && (
              <button
                onClick={handleConfirmHandover}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Food Handover & Complete Order</span>
              </button>
            )}

            {!verificationResult.valid && (
              <button
                onClick={() => setVerificationResult(null)}
                className="w-full py-2 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl"
              >
                Try Another Code
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Scanner Frame */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center space-y-3 relative overflow-hidden">
              <div className="w-40 h-40 border-2 border-dashed border-emerald-500/60 rounded-2xl mx-auto flex items-center justify-center relative">
                <Scan className="w-12 h-12 text-emerald-400 animate-pulse" />
                {/* Scanning laser bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-lg shadow-emerald-400 animate-bounce" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Point student camera QR code or enter numeric code
              </p>
            </div>

            {/* Manual Code Entry */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Enter Order ID / 4-Digit Pickup Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 8472 or CX-1047"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  onClick={() => handleVerify(manualCode)}
                  disabled={!manualCode.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Quick 1-Click Ready Orders Simulator */}
            {readyOrders.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <p className="text-[10px] text-slate-400 uppercase font-bold">1-Click Test Scan Ready Orders:</p>
                <div className="flex flex-wrap gap-1.5">
                  {readyOrders.map(ro => (
                    <button
                      key={ro.orderId}
                      onClick={() => handleVerify(ro.pickupToken)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-emerald-950 border border-slate-800 hover:border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-300"
                    >
                      Scan #{ro.orderId} ({ro.studentName.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
