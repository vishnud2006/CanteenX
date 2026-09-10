import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { Order } from '../../types';
import { getCollegeById } from '../../data/colleges';
import { playClickSound, playSuccessChime } from '../../utils/sound';

interface PickupQRModalProps {
  order: Order;
  onClose: () => void;
  onViewDetails?: () => void;
}

export const PickupQRModal: React.FC<PickupQRModalProps> = ({ order, onClose, onViewDetails }) => {
  const college = getCollegeById(order.collegeId);
  const collegeName = college ? college.collegeName : order.collegeId;

  // Cryptographic JSON payload for the QR scanner
  const qrPayload = JSON.stringify({
    orderId: order.orderId,
    collegeId: order.collegeId,
    token: order.pickupToken,
    code: order.pickupCode,
    studentId: order.studentId
  });

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(order.pickupCode);
      playSuccessChime();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-orange-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-center relative animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              SECURE PICKUP PASS
            </h3>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Info & College Pill */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="font-mono text-xl font-black text-white">#{order.orderId}</span>
            <span className="bg-orange-500 text-white font-black text-[10px] px-2 py-0.5 rounded font-mono">
              {order.collegeId}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium truncate">
            {collegeName}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl ring-4 ring-orange-500/20 mx-auto">
          <QRCodeSVG
            value={qrPayload}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Numeric 4-Digit Code Backup */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold uppercase">
            Numeric Pickup Code (Show at Counter)
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-2xl font-black tracking-widest text-orange-400">
              {order.pickupCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-1 text-slate-500 hover:text-orange-400"
              title="Copy Code"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Student Name & Items Summary */}
        <div className="text-xs text-slate-300 space-y-0.5">
          <p className="font-bold text-white">{order.studentName}</p>
          <p className="text-slate-400 truncate">
            {order.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          {onViewDetails && (
            <button
              onClick={() => {
                playClickSound();
                onViewDetails();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl"
            >
              View Order Tracker
            </button>
          )}

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-extrabold rounded-xl shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
