export type FoodCategory = 'Breakfast' | 'Snacks' | 'Meals' | 'Beverages' | 'Desserts';

export type DietaryType = 'veg' | 'non-veg' | 'egg' | 'vegan';

export interface College {
  collegeId: string; // e.g. "BCE001", "ABC001", "XYZ001"
  collegeName: string; // e.g. "Brindavan College of Engineering"
  shortName: string; // e.g. "Brindavan"
  location: string; // e.g. "Bengaluru, Karnataka"
  logo: string;
  isActive: boolean;
}

export interface FoodItem {
  id: string;
  collegeId: string; // Belongs to specific college
  name: string;
  category: FoodCategory;
  price: number;
  availableQuantity: number;
  initialStock: number;
  preparationTime: number; // in minutes
  dietaryType: DietaryType;
  popularity: number; // 1-100
  rating: number; // 1.0 - 5.0
  image: string;
  isAvailable: boolean;
  description: string;
  isChefSpecial?: boolean;
  calories?: number;
  tags: string[];
}

export interface OrderItem {
  foodId: string;
  foodName: string;
  quantity: number;
  price: number;
  image: string;
  prepTime: number;
}

export type OrderStatus = 'received' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  orderId: string; // e.g. "CX-1047", "CX-2851"
  collegeId: string; // e.g. "BCE001"
  studentName: string;
  studentId: string; // e.g. "BCE-STU-2048"
  studentEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  orderTime: string; // ISO string
  estimatedPickupTime: number; // in minutes from order time
  status: OrderStatus;
  paymentMethod: 'Campus Wallet' | 'UPI / GPay' | 'Counter Cash';
  pickupToken: string; // Unique cryptographic verification token
  pickupCode: string; // 4-digit code e.g. "8472"
  pickupVerified: boolean;
  pickupTime?: string; // Formatted time e.g. "12:42 PM"
  specialNote?: string;
  updatedAt?: string;
}

export type UserRole = 'student' | 'kitchen_staff' | 'admin';

export interface User {
  id: string; // e.g. "BCE-STU-2048" or "KITCH-BCE-001"
  name: string; // e.g. "Vishnu Sharma"
  email: string; // e.g. "student@college.edu"
  role: UserRole;
  collegeId: string; // e.g. "BCE001"
  collegeName?: string;
  phoneNumber?: string;
  dietaryPreference: 'all' | 'veg' | 'non-veg' | 'vegan';
  budget: number;
  walletBalance: number;
  favoriteCategories?: FoodCategory[];
  createdAt: string;
}

export interface QRVerificationResult {
  valid: boolean;
  errorType?: 'INVALID_QR' | 'NOT_READY' | 'ALREADY_COLLECTED' | 'NOT_FOUND' | 'WRONG_COLLEGE';
  message: string;
  order?: Order;
}

export type QueueRushLevel = 'low' | 'moderate' | 'high';

export interface CounterLoad {
  category: FoodCategory;
  loadPercent: number;
  activeItems: number;
  rushLevel: QueueRushLevel;
}

export interface CanteenQueueMetrics {
  collegeId: string;
  rushLevel: QueueRushLevel;
  activeOrdersCount: number;
  preparingCount: number;
  waitingCount: number;
  kitchenLoadPercent: number;
  estimatedWaitMin: number;
  estimatedWaitMax: number;
  averagePrepTime: number;
  queueDelayMinutes: number;
  peakPeriod: string;
  isPeakPeriod: boolean;
  counterLoads: CounterLoad[];
  insightMessage: string;
}

export interface BreakTimingAdvice {
  status: 'good' | 'tight' | 'risky';
  label: string;
  explanation: string;
}

export interface RecommendationCombo {
  id: string;
  title: string;
  items: FoodItem[];
  totalPrice: number;
  maxPrepTime: number;
  queueDelay?: number;
  estimatedReadyTime?: number;
  reason: string;
  badge?: string;
  isAvailable: boolean;
  fitsBudget: boolean;
  fitsBreak: boolean;
  timingAdvice?: BreakTimingAdvice;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  recommendations?: RecommendationCombo[];
  closestOptions?: FoodItem[];
  isImpossibleMatch?: boolean;
  rushWarning?: string;
  fastAlternatives?: FoodItem[];
}

export interface Announcement {
  id: string;
  icon: string;
  text: string;
  tag: 'hot' | 'stock' | 'rush';
}

export type AppView = 'home' | 'menu' | 'ai' | 'orders' | 'profile';
export type AppRole = 'student' | 'staff' | 'split';
