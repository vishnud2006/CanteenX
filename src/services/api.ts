import { User, FoodCategory, FoodItem } from '../types';

const TOKEN_STORAGE_KEY = 'canteenx_jwt_token';
const API_BASE = '/api';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string | null;
  studentId: string | null;
  staffId: string | null;
  role: 'STUDENT' | 'KITCHEN_STAFF' | 'SUPER_ADMIN';
  collegeId: string | null;
  collegeName?: string;
  profileImage: string | null;
  dietaryPreference: string | null;
  typicalBudget: number | null;
  walletBalance: number;
  favoriteCategories: string[];
  createdAt: string;
}

export interface AuthSuccessData {
  user: BackendUser;
  token: string;
}

/**
 * Token management
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // fallback
  }
}

export function removeAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // fallback
  }
}

/**
 * Helper to map backend user format to frontend User type
 */
export function mapBackendUserToFrontend(backendUser: BackendUser): User {
  const roleMap: Record<string, User['role']> = {
    STUDENT: 'student',
    KITCHEN_STAFF: 'kitchen_staff',
    SUPER_ADMIN: 'admin',
  };

  const dietaryMap: Record<string, User['dietaryPreference']> = {
    veg: 'veg',
    'non-veg': 'non-veg',
    vegan: 'vegan',
    all: 'all',
  };

  return {
    id: backendUser.studentId || backendUser.staffId || backendUser.id,
    name: backendUser.fullName,
    email: backendUser.email,
    role: roleMap[backendUser.role] || 'student',
    collegeId: backendUser.collegeId || 'BCE001',
    collegeName: backendUser.collegeName || (backendUser.collegeId === 'ABC001' ? 'ABC Engineering College' : backendUser.collegeId === 'XYZ001' ? 'XYZ Institute of Technology' : 'Brindavan College of Engineering'),
    phoneNumber: backendUser.mobileNumber || undefined,
    dietaryPreference: (dietaryMap[backendUser.dietaryPreference || 'veg'] || 'veg') as User['dietaryPreference'],
    budget: backendUser.typicalBudget || 60,
    walletBalance: typeof backendUser.walletBalance === 'number' ? backendUser.walletBalance : 200,
    favoriteCategories: (backendUser.favoriteCategories as FoodCategory[]) || ['Breakfast', 'Snacks'],
    createdAt: backendUser.createdAt || new Date().toISOString(),
  };
}

/**
 * Core API request wrapper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Invalid response from server',
    }));

    if (!response.ok && data.success === undefined) {
      data.success = false;
    }

    return data;
  } catch (error) {
    console.warn(`[CanteenX API] Error calling ${endpoint}:`, error);
    return {
      success: false,
      message: 'Unable to connect to CanteenX backend server. Please ensure the backend is running.',
    };
  }
}

/**
 * 1. Register a new student
 */
export async function apiRegisterStudent(payload: {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword?: string;
  collegeId: string;
}): Promise<ApiResponse<AuthSuccessData>> {
  const result = await apiRequest<AuthSuccessData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (result.success && result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

/**
 * 2. Log in user (student or staff)
 */
export async function apiLogin(
  identifier: string,
  password?: string
): Promise<ApiResponse<AuthSuccessData>> {
  const result = await apiRequest<AuthSuccessData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

  if (result.success && result.data?.token) {
    setAuthToken(result.data.token);
  }

  return result;
}

/**
 * 3. Fetch current user
 */
export async function apiGetCurrentUser(): Promise<ApiResponse<BackendUser>> {
  return apiRequest<BackendUser>('/auth/me');
}

/**
 * 4. Fetch student profile
 */
export async function apiGetStudentProfile(): Promise<ApiResponse<BackendUser>> {
  return apiRequest<BackendUser>('/students/me');
}

/**
 * 5. Update student profile
 */
export async function apiUpdateStudentProfile(
  updates: Partial<BackendUser>
): Promise<ApiResponse<BackendUser>> {
  return apiRequest<BackendUser>('/students/me', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * 6. Logout user
 */
export async function apiLogout(): Promise<ApiResponse> {
  const result = await apiRequest('/auth/logout', {
    method: 'POST',
  });
  removeAuthToken();
  return result;
}

/**
 * 7. Fetch active colleges
 */
export async function apiGetColleges(): Promise<ApiResponse<Array<{ collegeId: string; collegeName: string; location?: string; logo?: string }>>> {
  return apiRequest('/colleges');
}

/**
 * 8. Fetch menu scoped by college with optional filters
 */
export async function apiGetMenu(params?: {
  collegeId?: string;
  category?: string;
  available?: boolean;
  search?: string;
}): Promise<ApiResponse<FoodItem[]>> {
  const searchParams = new URLSearchParams();
  if (params?.collegeId) searchParams.append('collegeId', params.collegeId);
  if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
  if (params?.available !== undefined) searchParams.append('available', String(params.available));
  if (params?.search) searchParams.append('search', params.search);

  const queryStr = searchParams.toString();
  const endpoint = `/menu${queryStr ? `?${queryStr}` : ''}`;
  return apiRequest<FoodItem[]>(endpoint);
}

/**
 * 9. Fetch single food item details
 */
export async function apiGetFoodItem(id: string): Promise<ApiResponse<FoodItem>> {
  return apiRequest<FoodItem>(`/menu/${id}`);
}

/**
 * 10. Create new food item (Kitchen staff / Super admin)
 */
export async function apiCreateFoodItem(data: Partial<FoodItem> & { name: string; category: string; price: number }): Promise<ApiResponse<FoodItem>> {
  return apiRequest<FoodItem>('/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 11. Update food item details
 */
export async function apiUpdateFoodItem(id: string, data: Partial<FoodItem>): Promise<ApiResponse<FoodItem>> {
  return apiRequest<FoodItem>(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 12. Update food item stock (portions count)
 */
export async function apiUpdateFoodStock(id: string, stock: number): Promise<ApiResponse<FoodItem>> {
  return apiRequest<FoodItem>(`/menu/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  });
}

/**
 * 13. Update food item availability (In stock / Sold out)
 */
export async function apiUpdateFoodAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<FoodItem>> {
  return apiRequest<FoodItem>(`/menu/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ isAvailable }),
  });
}

/**
 * 14. Delete food item (or soft-retire if referenced by order history)
 */
export async function apiDeleteFoodItem(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/menu/${id}`, {
    method: 'DELETE',
  });
}

