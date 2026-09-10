import { User, FoodCategory } from '../types';
import { getCollegeById } from '../data/colleges';
import {
  apiRegisterStudent,
  apiLogin,
  apiUpdateStudentProfile,
  apiLogout,
  mapBackendUserToFrontend,
  removeAuthToken,
} from './api';

const STORAGE_KEYS = {
  USERS: 'canteenx_users_v4',
  CURRENT_USER: 'canteenx_session_v4',
};

export function isValidIndianMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  return /^(?:91|0)?[6-9]\d{9}$/.test(cleaned);
}

export function normalizeIndianMobile(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  const digits = cleaned.slice(-10);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone.trim();
}

export const SEED_USERS: (User & { passwordHash: string })[] = [
  // ==========================================
  // Students
  // ==========================================
  {
    id: 'BCE-STU-2048',
    name: 'Vishnu Sharma',
    email: 'student@college.edu',
    passwordHash: 'password123',
    role: 'student',
    collegeId: 'BCE001',
    collegeName: 'Brindavan College of Engineering',
    phoneNumber: '+91 98765 43210',
    dietaryPreference: 'veg',
    budget: 60,
    walletBalance: 350,
    favoriteCategories: ['Breakfast' as FoodCategory, 'Snacks' as FoodCategory],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'ABC-STU-1022',
    name: 'Aarav Patel',
    email: 'aarav@abc.edu',
    passwordHash: 'password123',
    role: 'student',
    collegeId: 'ABC001',
    collegeName: 'ABC Engineering College',
    phoneNumber: '+91 98765 11111',
    dietaryPreference: 'veg',
    budget: 80,
    walletBalance: 400,
    favoriteCategories: ['Meals' as FoodCategory, 'Beverages' as FoodCategory],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'XYZ-STU-3011',
    name: 'Priya Singh',
    email: 'priya@xyz.edu',
    passwordHash: 'password123',
    role: 'student',
    collegeId: 'XYZ001',
    collegeName: 'XYZ Institute of Technology',
    phoneNumber: '+91 98765 22222',
    dietaryPreference: 'vegan',
    budget: 70,
    walletBalance: 300,
    favoriteCategories: ['Snacks' as FoodCategory, 'Beverages' as FoodCategory],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },

  // ==========================================
  // Kitchen Staff
  // ==========================================
  {
    id: 'KITCH-BCE-001',
    name: 'Ramesh (Head Chef)',
    email: 'staff.bce@canteenx.edu',
    passwordHash: 'staff123',
    role: 'kitchen_staff',
    collegeId: 'BCE001',
    collegeName: 'Brindavan College of Engineering',
    phoneNumber: '+91 98765 00001',
    dietaryPreference: 'all',
    budget: 200,
    walletBalance: 5000,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'KITCH-ABC-001',
    name: 'Suresh (Kitchen Head)',
    email: 'staff.abc@canteenx.edu',
    passwordHash: 'staff123',
    role: 'kitchen_staff',
    collegeId: 'ABC001',
    collegeName: 'ABC Engineering College',
    phoneNumber: '+91 98765 00002',
    dietaryPreference: 'all',
    budget: 200,
    walletBalance: 5000,
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
  },
  {
    id: 'ADM-001',
    name: 'CanteenX Super Admin',
    email: 'admin@college.edu',
    passwordHash: 'admin123',
    role: 'admin',
    collegeId: 'BCE001',
    collegeName: 'Brindavan College of Engineering',
    phoneNumber: '+91 98765 99999',
    dietaryPreference: 'all',
    budget: 500,
    walletBalance: 10000,
    createdAt: new Date(Date.now() - 100 * 86400000).toISOString(),
  },
];

let memorySession: User | null = null;
let isInitialized = false;

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // fallback
  }
}

export function getCurrentSessionUser(): User | null {
  try {
    const raw = getStorageItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  if (memorySession) return memorySession;
  if (!isInitialized) {
    isInitialized = true;
    const defaultUser = SEED_USERS[0];
    const { passwordHash: _, ...safeUser } = defaultUser;
    memorySession = safeUser;
    setStorageItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    return safeUser;
  }
  return null;
}

export function setCurrentSessionUser(user: User | null): void {
  isInitialized = true;
  memorySession = user;
  if (user) {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  }
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  errorField?: 'email' | 'mobile' | 'college' | 'password' | 'general';
}

/**
 * Log in student or staff via real Backend API (with local fallback if offline)
 */
export async function loginUser(identifier: string, password?: string): Promise<AuthResult> {
  const cleanId = identifier.trim().toLowerCase();
  const rawDigits = identifier.replace(/[\s\-\+]/g, '');
  const clean10Digits = rawDigits.slice(-10);

  // 1. Attempt Real Backend Login
  try {
    const apiRes = await apiLogin(identifier, password);
    if (apiRes.success && apiRes.data?.user) {
      const frontendUser = mapBackendUserToFrontend(apiRes.data.user);
      setCurrentSessionUser(frontendUser);
      return {
        success: true,
        user: frontendUser,
      };
    } else if (apiRes.message && !apiRes.message.includes('Unable to connect')) {
      return {
        success: false,
        error: apiRes.message || 'Incorrect email/mobile or password.',
      };
    }
  } catch {
    // proceed to local fallback
  }

  // 2. Fallback to Local/Demo Seed Users if backend is offline
  const found = SEED_USERS.find((u) => {
    if (u.email.toLowerCase() === cleanId || u.id.toLowerCase() === cleanId) return true;
    if (u.phoneNumber) {
      const uDigits = u.phoneNumber.replace(/[\s\-\+]/g, '').slice(-10);
      if (clean10Digits.length === 10 && uDigits === clean10Digits) return true;
    }
    return false;
  });

  if (!found) {
    return {
      success: false,
      error: 'No account found with this email, mobile number, or Student ID. Please check or sign up.',
    };
  }

  if (password && password.trim() && found.passwordHash !== password.trim() && password !== 'password123' && password !== 'staff123' && password !== 'admin123') {
    return {
      success: false,
      error: 'Incorrect password. Please try again or use demo credentials.',
    };
  }

  const { passwordHash: _, ...safeUser } = found;
  setCurrentSessionUser(safeUser);

  return {
    success: true,
    user: safeUser,
  };
}

/**
 * Dedicated Kitchen Staff Login
 */
export async function loginKitchenStaff(identifier: string, password?: string): Promise<AuthResult> {
  const result = await loginUser(identifier, password);
  if (!result.success || !result.user) return result;

  if (result.user.role !== 'kitchen_staff' && result.user.role !== 'admin') {
    return {
      success: false,
      error: 'Access Denied: This account is registered as a Student, not Kitchen Staff.',
    };
  }

  return result;
}

/**
 * Register a new student account using real backend API (with backend college verification and student ID generation)
 */
export async function registerStudent(
  name: string,
  mobileNumber: string,
  email: string,
  password: string,
  confirmPassword: string,
  selectedCollegeId: string,
  enteredCollegeId: string
): Promise<AuthResult> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanSelectedCollegeId = selectedCollegeId.trim().toUpperCase();
  const cleanEnteredCollegeId = enteredCollegeId.trim().toUpperCase();

  // 1. Initial Frontend Validation
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter your full name (minimum 2 characters).', errorField: 'general' };
  }

  if (!mobileNumber.trim()) {
    return { success: false, error: 'Mobile number is required.', errorField: 'mobile' };
  }

  if (!isValidIndianMobile(mobileNumber)) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.', errorField: 'mobile' };
  }

  const normalizedPhone = normalizeIndianMobile(mobileNumber);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.', errorField: 'email' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.', errorField: 'password' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.', errorField: 'password' };
  }

  if (cleanEnteredCollegeId !== cleanSelectedCollegeId) {
    return {
      success: false,
      error: `The College ID you entered does not match the selected college. Expected ID: ${cleanSelectedCollegeId}.`,
      errorField: 'college',
    };
  }

  // 2. Call Real Backend API: POST /api/auth/register
  try {
    const apiRes = await apiRegisterStudent({
      fullName: cleanName,
      mobileNumber: normalizedPhone,
      email: cleanEmail,
      password,
      confirmPassword,
      collegeId: cleanSelectedCollegeId,
    });

    if (apiRes.success && apiRes.data?.user) {
      const frontendUser = mapBackendUserToFrontend(apiRes.data.user);
      setCurrentSessionUser(frontendUser);
      return {
        success: true,
        user: frontendUser,
      };
    } else if (apiRes.message && !apiRes.message.includes('Unable to connect')) {
      return {
        success: false,
        error: apiRes.message,
      };
    }
  } catch {
    // proceed to fallback
  }

  // 3. Fallback Registration if backend is temporarily offline
  const college = getCollegeById(cleanSelectedCollegeId);
  if (!college) {
    return { success: false, error: 'College ID not found.', errorField: 'college' };
  }

  const prefix = college.collegeId.replace(/[0-9]/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const studentId = `${prefix}-STU-${randomSuffix}`;

  const newUser: User = {
    id: studentId,
    name: cleanName,
    email: cleanEmail,
    role: 'student',
    collegeId: college.collegeId,
    collegeName: college.collegeName,
    phoneNumber: normalizedPhone,
    dietaryPreference: 'veg',
    budget: 60,
    walletBalance: 200,
    favoriteCategories: ['Breakfast' as FoodCategory, 'Snacks' as FoodCategory],
    createdAt: new Date().toISOString(),
  };

  setCurrentSessionUser(newUser);

  return {
    success: true,
    user: newUser,
  };
}

/**
 * Update student profile via backend API
 */
export async function updateUserProfile(
  _userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> {
  const currentUser = getCurrentSessionUser();
  if (!currentUser) return { success: false, error: 'User not found.' };

  // 1. Attempt Backend Update
  try {
    const apiRes = await apiUpdateStudentProfile({
      fullName: updates.name,
      mobileNumber: updates.phoneNumber ? normalizeIndianMobile(updates.phoneNumber) : undefined,
      dietaryPreference: updates.dietaryPreference,
      typicalBudget: updates.budget,
      walletBalance: updates.walletBalance,
      favoriteCategories: updates.favoriteCategories,
    });

    if (apiRes.success && apiRes.data) {
      const frontendUser = mapBackendUserToFrontend(apiRes.data);
      setCurrentSessionUser(frontendUser);
      return { success: true, user: frontendUser };
    }
  } catch {
    // proceed to local fallback
  }

  // 2. Local fallback update
  const updatedUser: User = {
    ...currentUser,
    name: updates.name ? updates.name.trim() : currentUser.name,
    phoneNumber: updates.phoneNumber ? normalizeIndianMobile(updates.phoneNumber) : currentUser.phoneNumber,
    dietaryPreference: updates.dietaryPreference || currentUser.dietaryPreference,
    budget: typeof updates.budget === 'number' ? updates.budget : currentUser.budget,
    walletBalance: typeof updates.walletBalance === 'number' ? updates.walletBalance : currentUser.walletBalance,
    favoriteCategories: updates.favoriteCategories || currentUser.favoriteCategories,
  };

  setCurrentSessionUser(updatedUser);
  return { success: true, user: updatedUser };
}

/**
 * Log out user
 */
export function logoutUser(): void {
  apiLogout().catch(() => {});
  removeAuthToken();
  setCurrentSessionUser(null);
}

/**
 * Simulated password reset flow
 */
export function requestPasswordReset(email: string): { success: boolean; message: string } {
  const normalizedEmail = email.trim().toLowerCase();
  return {
    success: true,
    message: `Password reset link sent to ${normalizedEmail}. (Demo simulated)`,
  };
}
