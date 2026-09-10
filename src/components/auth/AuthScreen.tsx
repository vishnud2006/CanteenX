import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Phone,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChefHat
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { DEMO_COLLEGES } from '../../data/colleges';
import { playClickSound, playSuccessChime } from '../../utils/sound';

export const AuthScreen: React.FC = () => {
  const { login, loginStaff, signup } = useApp();

  // Mode: 'landing' | 'login' | 'signup' | 'staff_login'
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'signup' | 'staff_login'>('landing');

  // Sign up multi-step state: 1 = Personal Details, 2 = College Verification, 3 = Account Created Celebration
  const [signupStep, setSignupStep] = useState<number>(1);

  // Form Fields - Login
  const [loginIdentifier, setLoginIdentifier] = useState<string>('student@college.edu');
  const [loginPassword, setLoginPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Form Fields - Sign up
  const [name, setName] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // College selector & verification
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('BCE001');
  const [enteredCollegeId, setEnteredCollegeId] = useState<string>('');
  const [collegeSearch, setCollegeSearch] = useState<string>('');

  // Created User preview for celebration
  const [createdStudentId, setCreatedStudentId] = useState<string>('');
  const [createdStudentName, setCreatedStudentName] = useState<string>('');

  // Feedback & Validation Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);

  const selectedCollegeObj = DEMO_COLLEGES.find(c => c.collegeId === selectedCollegeId) || DEMO_COLLEGES[0];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setErrorMessage(null);

    const res = authMode === 'staff_login'
      ? await loginStaff(loginIdentifier, loginPassword)
      : await login(loginIdentifier, loginPassword);

    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please verify your credentials.');
    }
  };

  const handleSignupStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setErrorMessage(null);
    setErrorField(null);

    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Please enter your full name.');
      setErrorField('name');
      return;
    }

    const cleanMobile = mobileNumber.replace(/[\s\-\+]/g, '');
    if (!/^(91)?[6-9]\d{9}$/.test(cleanMobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number (starts with 6, 7, 8, or 9).');
      setErrorField('mobile');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      setErrorField('email');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setErrorField('password');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setErrorField('password');
      return;
    }

    setSignupStep(2);
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    setErrorMessage(null);

    const cleanEntered = enteredCollegeId.trim().toUpperCase();
    if (cleanEntered !== selectedCollegeObj.collegeId) {
      setErrorMessage(`The College ID you entered does not match "${selectedCollegeObj.collegeName}". Expected format: ${selectedCollegeObj.collegeId}.`);
      return;
    }

    const res = await signup(name, mobileNumber, email, password, confirmPassword, selectedCollegeId, cleanEntered);

    if (res.success && res.user) {
      setCreatedStudentId(res.user.id);
      setCreatedStudentName(res.user.name);
      setSignupStep(3);
      playSuccessChime();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check your information.');
    }
  };

  const filteredColleges = DEMO_COLLEGES.filter(c =>
    c.collegeName.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.collegeId.toLowerCase().includes(collegeSearch.toLowerCase()) ||
    c.shortName.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 shadow-xl shadow-orange-500/20 ring-4 ring-orange-500/20 mb-2">
            <span className="text-3xl font-black text-white font-mono">⚡</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Canteen<span className="text-orange-500">X</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Skip the queue. Pick up when it&apos;s ready.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: LANDING SCREEN */}
        {/* ========================================================================= */}
        {authMode === 'landing' && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            <div className="space-y-1.5 py-2">
              <h2 className="text-lg font-extrabold text-white">Welcome to Campus Dining</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Order hot meals, track live canteen queues, and pick up in seconds with verified digital QR passes.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  playClickSound();
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Log In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setAuthMode('signup');
                  setSignupStep(1);
                  setErrorMessage(null);
                }}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-2xl font-bold text-sm transition-all"
              >
                Create New Student Account
              </button>
            </div>

            {/* Quick Staff Login Link */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Canteen Kitchen Staff?</span>
              <button
                onClick={() => {
                  playClickSound();
                  setAuthMode('staff_login');
                  setLoginIdentifier('staff.bce@canteenx.edu');
                  setLoginPassword('staff123');
                  setErrorMessage(null);
                }}
                className="text-orange-400 hover:text-orange-300 font-extrabold flex items-center gap-1"
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Staff Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: LOGIN SCREEN */}
        {/* ========================================================================= */}
        {(authMode === 'login' || authMode === 'staff_login') && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  {authMode === 'staff_login' ? 'Kitchen Staff Login' : 'Student Login'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {authMode === 'staff_login' ? 'Enter staff credentials' : 'Use email, mobile number, or Student ID'}
                </p>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  setAuthMode('landing');
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Identifier */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>{authMode === 'staff_login' ? 'Staff Email' : 'Email / Mobile / Student ID'}</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={authMode === 'staff_login' ? 'staff.bce@canteenx.edu' : 'student@college.edu or 9876543210'}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                    <span>Password</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Fill Shortcuts */}
              <div className="pt-1">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Quick Demo Fill</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('student@college.edu');
                      setLoginPassword('password123');
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono"
                  >
                    Vishnu (BCE001)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('aarav@abc.edu');
                      setLoginPassword('password123');
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono"
                  >
                    Aarav (ABC001)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('staff.bce@canteenx.edu');
                      setLoginPassword('staff123');
                    }}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] text-emerald-400 font-mono"
                  >
                    BCE Chef
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-extrabold text-xs shadow-md transition-all mt-2"
              >
                {authMode === 'staff_login' ? 'Enter Kitchen Dashboard' : 'Log In'}
              </button>
            </form>

            <div className="pt-2 text-center">
              <button
                onClick={() => {
                  playClickSound();
                  setAuthMode('signup');
                  setSignupStep(1);
                  setErrorMessage(null);
                }}
                className="text-xs text-slate-400 hover:text-orange-400 font-medium"
              >
                Don&apos;t have an account? <strong className="text-orange-400 underline">Sign Up</strong>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: SIGN UP 3-STEP WIZARD */}
        {/* ========================================================================= */}
        {authMode === 'signup' && (
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-white">Student Registration</h2>
                <p className="text-[11px] text-slate-400">Step {signupStep} of 3: {signupStep === 1 ? 'Personal Details' : signupStep === 2 ? 'College Verification' : 'Account Created'}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map(step => (
                  <div
                    key={step}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      signupStep === step ? 'bg-orange-500 ring-2 ring-orange-500/30' : signupStep > step ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: PERSONAL DETAILS */}
            {signupStep === 1 && (
              <form onSubmit={handleSignupStep1} className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vishnu Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      errorField === 'name' ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-orange-400" />
                      <span>Mobile Number (10 Digits)</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">+91</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      errorField === 'mobile' ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                      errorField === 'email' ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Confirm</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('landing')}
                    className="w-1/3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5"
                  >
                    <span>Next: College Info</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: COLLEGE VERIFICATION */}
            {signupStep === 2 && (
              <form onSubmit={handleSignupStep2} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-orange-400" />
                    <span>Select Your College</span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search college name or code..."
                      value={collegeSearch}
                      onChange={(e) => setCollegeSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                    <div className="max-h-36 overflow-y-auto space-y-1.5">
                      {filteredColleges.map(c => (
                        <div
                          key={c.collegeId}
                          onClick={() => {
                            playClickSound();
                            setSelectedCollegeId(c.collegeId);
                            setEnteredCollegeId(c.collegeId); // Pre-fill for convenience
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            selectedCollegeId === c.collegeId
                              ? 'bg-orange-500/20 border-orange-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div>
                            <p className="font-bold">{c.collegeName}</p>
                            <p className="text-[10px] text-slate-400">{c.location}</p>
                          </div>
                          <span className="font-mono font-extrabold text-[11px] bg-slate-900 px-2 py-0.5 rounded text-orange-400">
                            {c.collegeId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* College ID Verification Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Enter College ID to Verify</span>
                    <span className="text-[10px] text-orange-400 font-mono font-bold">Matches {selectedCollegeObj.collegeId}</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${selectedCollegeObj.collegeId}`}
                    value={enteredCollegeId}
                    onChange={(e) => setEnteredCollegeId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>College information is locked after registration for canteen security.</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    className="w-1/3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Create My Account</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CELEBRATION */}
            {signupStep === 3 && (
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">Account Created! 🎉</h3>
                  <p className="text-xs text-slate-400">Welcome to CanteenX, <strong>{createdStudentName}</strong>!</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Generated Student ID:</span>
                    <span className="font-mono font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/30">
                      {createdStudentId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">College:</span>
                    <span className="text-slate-200 font-bold">{selectedCollegeObj.collegeName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Welcome Bonus:</span>
                    <span className="text-emerald-400 font-mono font-bold">+₹200 Campus Wallet</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playClickSound();
                    // login is already set in signup callback
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Exploring Menu</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
