import React, { useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  ChevronRight,
  Building2,
  Lock,
  Edit3,
  Phone,
  Mail,
  QrCode,
  Check,
  X,
  Camera,
  Heart,
  HelpCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodCategory } from '../../types';
import { playClickSound, playSuccessChime } from '../../utils/sound';

export const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    currentCollege,
    logout,
    studentOrders,
    activeOrder,
    setActiveQRModalOrder,
    setActiveView,
    updateProfile
  } = useApp();

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);

  // Edit Personal Information Form state
  const [editName, setEditName] = useState<string>(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState<string>(currentUser?.phoneNumber || '');

  // Edit Preferences Form state
  const [editDiet, setEditDiet] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>(currentUser?.dietaryPreference || 'veg');
  const [editBudget, setEditBudget] = useState<number>(currentUser?.budget || 60);
  const [editFavoriteCategories, setEditFavoriteCategories] = useState<FoodCategory[]>(
    currentUser?.favoriteCategories || ['Breakfast' as FoodCategory, 'Snacks' as FoodCategory]
  );

  // Sync state when currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditPhone(currentUser.phoneNumber || '');
      setEditDiet(currentUser.dietaryPreference || 'veg');
      setEditBudget(currentUser.budget || 60);
      setEditFavoriteCategories(currentUser.favoriteCategories || ['Breakfast' as FoodCategory, 'Snacks' as FoodCategory]);
    }
  }, [currentUser]);

  // Student metrics
  const totalOrders = studentOrders.length;
  const activeOrdersCount = studentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = studentOrders.filter(o => o.status === 'completed').length;

  const studentName = currentUser ? currentUser.name : 'Student';
  const studentEmail = currentUser ? currentUser.email : '';
  const studentId = currentUser ? currentUser.id : '';
  const studentPhone = currentUser?.phoneNumber || 'Not provided';
  const dietaryPref = currentUser?.dietaryPreference || 'veg';
  const typicalBudget = currentUser?.budget || 60;
  const favoriteCategories = currentUser?.favoriteCategories || ['Breakfast', 'Snacks'];

  const availableCategories: { label: string; value: FoodCategory; icon: string }[] = [
    { label: 'Breakfast', value: 'Breakfast' as FoodCategory, icon: '🥞' },
    { label: 'Snacks', value: 'Snacks' as FoodCategory, icon: '🥟' },
    { label: 'Meals', value: 'Meals' as FoodCategory, icon: '🍛' },
    { label: 'Beverages', value: 'Beverages' as FoodCategory, icon: '🧃' },
    { label: 'Desserts', value: 'Desserts' as FoodCategory, icon: '🍰' }
  ];

  const handleToggleCategory = (cat: FoodCategory) => {
    playClickSound();
    setEditFavoriteCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    await updateProfile({
      name: editName,
      phoneNumber: editPhone
    });

    setIsEditModalOpen(false);
    playSuccessChime();
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    await updateProfile({
      dietaryPreference: editDiet,
      budget: editBudget,
      favoriteCategories: editFavoriteCategories
    });

    setIsPreferencesModalOpen(false);
    playSuccessChime();
  };

  const handleLogoutConfirm = () => {
    playClickSound();
    setIsLogoutConfirmOpen(false);
    logout();
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. PROFILE HEADER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar with Camera/Edit Badge */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/25 ring-4 ring-orange-500/20">
                {studentName.charAt(0)}
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setIsEditModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-800 text-orange-400 border border-slate-700 hover:bg-slate-700 flex items-center justify-center shadow-md transition-transform hover:scale-110"
                title="Change Avatar / Edit Details"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Name, Student ID & College */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  {studentName}
                </h1>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs font-mono text-orange-400 font-bold mt-0.5">
                {studentId}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentCollege.collegeName}
              </p>
            </div>
          </div>

          {/* Quick Edit Profile Button */}
          <button
            onClick={() => {
              playClickSound();
              setIsEditModalOpen(true);
            }}
            className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-750 text-orange-400 border border-slate-700 hover:border-orange-500/40 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE ORDER / READY PICKUP PASS ALERT */}
      {/* ========================================================================= */}
      {activeOrder ? (
        <div className={`rounded-3xl p-5 border transition-all shadow-xl ${
          activeOrder.status === 'ready'
            ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-500/60 shadow-emerald-950/30'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                ACTIVE ORDER
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
                  Paid ₹{activeOrder.totalAmount}
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
      ) : (
        /* Empty State: No active order */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-800 text-slate-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">No active orders</p>
              <p className="text-[11px] text-slate-400">Hungry? Order delicious food from {currentCollege.shortName} canteen.</p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setActiveView('menu');
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 shadow-sm flex-shrink-0"
          >
            <span>Browse Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PERSONAL INFORMATION CARD */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            PERSONAL INFORMATION
          </h2>
          <button
            onClick={() => {
              playClickSound();
              setIsEditModalOpen(true);
            }}
            className="text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Full Name */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Name</p>
            <p className="text-xs font-extrabold text-white mt-0.5">{studentName}</p>
          </div>

          {/* Mobile Number */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Mobile</p>
              <p className="text-xs font-mono font-bold text-white mt-0.5">{studentPhone}</p>
            </div>
            <Phone className="w-4 h-4 text-slate-500" />
          </div>

          {/* Email Address (Read-Only) */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Email</p>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{studentEmail}</p>
            </div>
            <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
          </div>

          {/* Student ID (Locked / Read-Only) */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Student ID</p>
                <span className="text-[9px] text-slate-500 font-mono bg-slate-800 px-1 rounded">Read-Only</span>
              </div>
              <p className="text-xs font-mono font-black text-orange-400 mt-0.5">{studentId}</p>
            </div>
            <Lock className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. COLLEGE INFORMATION CARD (LOCKED) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              COLLEGE
            </h2>
          </div>
          <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" />
            Locked
          </span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-white">{currentCollege.collegeName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{currentCollege.location}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">College ID</p>
              <p className="font-mono text-sm font-black text-orange-400">{currentCollege.collegeId}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>College information is locked after registration.</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FOOD PREFERENCES CARD */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              FOOD PREFERENCES
            </h2>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setIsPreferencesModalOpen(true);
            }}
            className="text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Preferences</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dietary Preference */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Dietary Preference</p>
            <p className="text-xs font-bold text-white mt-1 capitalize">
              {dietaryPref === 'veg' ? '🥬 Vegetarian' : dietaryPref === 'vegan' ? '🌱 100% Vegan' : dietaryPref === 'non-veg' ? '🍗 Non-Vegetarian' : '🍽️ No Preference (All)'}
            </p>
          </div>

          {/* Favorite Categories */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Favorite Categories</p>
            <p className="text-xs font-bold text-white mt-1 truncate">
              {favoriteCategories && favoriteCategories.length > 0
                ? favoriteCategories.join(' • ')
                : 'South Indian • Snacks'}
            </p>
          </div>

          {/* Typical Budget */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Typical Budget</p>
            <p className="text-xs font-mono font-black text-orange-400 mt-1">
              ₹{typicalBudget}
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>Used by CanteenX AI to personalize recommendations to your taste and budget.</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MY ORDERS SUMMARY CARD */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              MY ORDERS
            </h2>
          </div>
          <button
            onClick={() => {
              playClickSound();
              setActiveView('orders');
            }}
            className="text-xs font-extrabold text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View Order History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Column Summary Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Orders</p>
            <p className="font-mono text-lg font-black text-white mt-0.5">{totalOrders}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Active</p>
            <p className="font-mono text-lg font-black text-orange-400 mt-0.5">{activeOrdersCount}</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Completed</p>
            <p className="font-mono text-lg font-black text-emerald-400 mt-0.5">{completedOrdersCount}</p>
          </div>
        </div>

        {/* Recent 2 orders list */}
        {studentOrders.length === 0 ? (
          <div className="p-6 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-xs text-slate-400">No orders placed yet.</p>
            <button
              onClick={() => {
                playClickSound();
                setActiveView('menu');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-orange-400 text-xs font-bold rounded-xl"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {studentOrders.slice(0, 2).map(order => (
              <div
                key={order.orderId}
                onClick={() => {
                  playClickSound();
                  setActiveView('orders');
                }}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">#{order.orderId}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(order.orderTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-semibold mt-1">
                    {order.items.map(i => `${i.foodName} × ${i.quantity}`).join(', ')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-extrabold text-white">₹{order.totalAmount}</span>
                  <span className={`block text-[10px] font-extrabold uppercase mt-0.5 ${
                    order.status === 'ready' ? 'text-emerald-400' : order.status === 'completed' ? 'text-slate-400' : 'text-amber-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. ACCOUNT SETTINGS & LOGOUT */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3 shadow-lg">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
          ACCOUNT
        </h2>

        <div className="space-y-1.5">
          <button
            onClick={() => {
              playClickSound();
              setIsEditModalOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <Edit3 className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">Edit Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveView('orders');
            }}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">My Orders</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsPreferencesModalOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">Food Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsHelpModalOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-bold text-white">Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              playClickSound();
              setIsLogoutConfirmOpen(true);
            }}
            className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3 text-rose-400">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold">Logout</span>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PERSONAL INFORMATION MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <h3 className="text-base font-extrabold text-white">Edit Profile</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonalInfo} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Locked Read-Only Notice Box */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Student ID:</span>
                  <span className="text-slate-200 font-bold">{studentId} (Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span>College ID:</span>
                  <span className="text-slate-200 font-bold">{currentCollege.collegeId} (Locked)</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-slate-200 truncate max-w-[190px]">{studentEmail}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT FOOD PREFERENCES MODAL */}
      {/* ========================================================================= */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-orange-400" />
                <h3 className="text-base font-extrabold text-white">Food Preferences</h3>
              </div>
              <button
                onClick={() => setIsPreferencesModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4">
              {/* Dietary Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Dietary Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'veg', label: '🥬 Vegetarian' },
                    { id: 'non-veg', label: '🍗 Non-Vegetarian' },
                    { id: 'vegan', label: '🌱 100% Vegan' },
                    { id: 'all', label: '🍽️ No Preference' }
                  ].map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setEditDiet(d.id as any)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                        editDiet === d.id
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Categories Multi-Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Favorite Categories</label>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map(cat => {
                    const isSelected = editFavoriteCategories.includes(cat.value);
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => handleToggleCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typical Budget Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Typical Budget</span>
                  <span className="font-mono text-orange-400 font-extrabold text-sm">₹{editBudget}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[30, 50, 70, 100].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setEditBudget(b)}
                      className={`py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all border ${
                        editBudget === b
                          ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      ₹{b}{b === 100 ? '+' : ''}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={20}
                  max={200}
                  step={5}
                  value={editBudget}
                  onChange={(e) => setEditBudget(Number(e.target.value))}
                  className="w-full accent-orange-500 mt-1"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreferencesModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HELP & SUPPORT MODAL */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-extrabold text-white">Help & Support</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>{currentCollege.collegeName} Canteen</span>
                </p>
                <p className="text-slate-400">Location: Ground Floor, Main Campus Cafeteria</p>
                <p className="text-slate-400 font-mono">Operating Hours: 8:00 AM – 6:00 PM</p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <p className="font-bold text-white">How does QR Pickup work?</p>
                <p className="text-slate-400 leading-relaxed">
                  When your order status turns <strong>"Ready for Pickup"</strong>, open your order or tap <strong>Show Pickup QR</strong>. Present the QR code at the counter for instant verified pickup.
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <p className="font-bold text-white">Need to change college?</p>
                <p className="text-slate-400 leading-relaxed">
                  College information is locked after registration. If you transferred campuses, contact canteen support at <code>canteen.support@college.edu</code>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-extrabold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: LOGOUT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-white">Log Out Confirmation</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to log out of CanteenX? You will need your password to log back in.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
