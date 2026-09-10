import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  FoodItem,
  Order,
  OrderItem,
  OrderStatus,
  User,
  AppRole,
  AppView,
  College,
  AIMessage,
  Announcement,
  QRVerificationResult,
  CanteenQueueMetrics
} from '../types';
import { DEMO_COLLEGES, getCollegeById } from '../data/colleges';
import { INITIAL_MENU } from '../data/initialMenu';
import {
  getCurrentSessionUser,
  loginUser,
  loginKitchenStaff,
  registerStudent,
  updateUserProfile,
  logoutUser,
  AuthResult,
  SEED_USERS
} from '../services/authService';
import { generateAIRecommendations, CANTEEN_ANNOUNCEMENTS } from '../services/aiRecommender';
import { calculateCanteenQueueMetrics } from '../services/queueIntelligence';
import { playClickSound, playOrderPlacedSound, playOrderReadyAlert, playSuccessChime } from '../utils/sound';
import {
  apiGetMenu,
  apiCreateFoodItem,
  apiUpdateFoodItem,
  apiUpdateFoodStock,
  apiUpdateFoodAvailability,
  apiDeleteFoodItem,
} from '../services/api';

interface AppContextType {
  // Authentication & Session
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password?: string) => Promise<AuthResult>;
  loginStaff: (identifier: string, password?: string) => Promise<AuthResult>;
  signup: (
    name: string,
    mobileNumber: string,
    email: string,
    password: string,
    confirmPassword: string,
    selectedCollegeId: string,
    enteredCollegeId: string
  ) => Promise<AuthResult>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  logout: () => void;

  // College Multi-Tenant Entity
  colleges: College[];
  currentCollege: College;
  switchCollege: (collegeId: string) => void;

  // Navigation & Role
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentRole: AppRole;
  setCurrentRole: (role: AppRole) => void;

  // Student & Break
  breakMinutesLeft: number;
  breakTotalMinutes: number;
  breakName: string;
  setBreakMinutesLeft: (mins: number) => void;
  announcements: Announcement[];

  // Live Queue Intelligence
  queueMetrics: CanteenQueueMetrics;

  // College-Isolated Menu & Inventory
  menu: FoodItem[];
  collegeMenu: FoodItem[];
  getItemById: (id: string) => FoodItem | undefined;
  updateItemStock: (foodId: string, delta: number) => void;
  toggleItemAvailability: (foodId: string) => void;
  updateFoodItem: (foodId: string, updates: Partial<FoodItem>) => void;
  addNewFoodItem: (item: Omit<FoodItem, 'id' | 'collegeId'>) => void;
  deleteFoodItem: (foodId: string) => Promise<boolean>;

  // Cart & Ordering
  cart: OrderItem[];
  cartTotalAmount: number;
  cartTotalCount: number;
  cartMaxPrepTime: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: FoodItem, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  addComboToCart: (items: FoodItem[]) => void;

  // Orders & Tracking
  orders: Order[];
  studentOrders: Order[];
  staffOrders: Order[];
  activeOrder: Order | null;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  confirmedOrderModal: Order | null;
  setConfirmedOrderModal: (order: Order | null) => void;
  activeQRModalOrder: Order | null;
  setActiveQRModalOrder: (order: Order | null) => void;
  isAdminScannerOpen: boolean;
  setIsAdminScannerOpen: (open: boolean) => void;

  placeReservation: (paymentMethod: 'Campus Wallet' | 'UPI / GPay' | 'Counter Cash', specialNote?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  simulateOrderProgress: (orderId: string) => void;
  reorderPastOrder: (order: Order) => void;

  // Multi-College QR Pickup Verification
  verifyQRPickup: (rawPayload: string) => QRVerificationResult;
  confirmQRPickup: (orderId: string) => boolean;

  // AI Assistant
  aiMessages: AIMessage[];
  isAITyping: boolean;
  sendAIMessage: (query: string) => void;
  clearAIChat: () => void;

  // Presentation & Demo
  resetDemoData: () => void;
  runHackathonDemoScenario: () => void;
  setSimulatedRushMode: (rush: 'low' | 'moderate' | 'high') => void;

  // Global Notification
  notification: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;
  dismissNotification: () => void;
}

const STORAGE_KEYS = {
  MENU: 'canteenx_menu_v5',
  ORDERS: 'canteenx_orders_v5',
  COLLEGE: 'canteenx_college_v5',
  CART: 'canteenx_cart_v5'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Orders for realistic demo
const SEED_ORDERS: Order[] = [
  {
    orderId: 'CX-1047',
    collegeId: 'BCE001',
    studentName: 'Vishnu Sharma',
    studentId: 'BCE-STU-2048',
    studentEmail: 'student@college.edu',
    items: [
      { foodId: 'food-1', foodName: 'Crispy Masala Dosa', quantity: 1, price: 40, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', prepTime: 7 },
      { foodId: 'food-6', foodName: 'Fresh Lemon Juice', quantity: 1, price: 15, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', prepTime: 2 }
    ],
    totalAmount: 55,
    orderTime: new Date(Date.now() - 6 * 60000).toISOString(),
    estimatedPickupTime: 8,
    status: 'ready',
    paymentMethod: 'Campus Wallet',
    pickupToken: 'tok_cx1047_bce_verified_94a7',
    pickupCode: '8472',
    pickupVerified: false,
    specialNote: 'Extra coconut chutney please'
  },
  {
    orderId: 'CX-1048',
    collegeId: 'BCE001',
    studentName: 'Rohan Mehta',
    studentId: 'BCE-STU-3104',
    items: [
      { foodId: 'food-3', foodName: 'Spicy Potato Samosa (2 pcs)', quantity: 2, price: 20, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', prepTime: 2 },
      { foodId: 'food-7', foodName: 'Special Masala Tea (Chai)', quantity: 2, price: 10, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', prepTime: 2 }
    ],
    totalAmount: 60,
    orderTime: new Date(Date.now() - 4 * 60000).toISOString(),
    estimatedPickupTime: 5,
    status: 'preparing',
    paymentMethod: 'UPI / GPay',
    pickupToken: 'tok_cx1048_bce_verified_31b8',
    pickupCode: '4912',
    pickupVerified: false
  },
  {
    orderId: 'CX-1049',
    collegeId: 'BCE001',
    studentName: 'Ananya Roy',
    studentId: 'BCE-STU-1892',
    items: [
      { foodId: 'food-4', foodName: 'Vegetable Hakka Noodles', quantity: 1, price: 60, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80', prepTime: 9 }
    ],
    totalAmount: 60,
    orderTime: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedPickupTime: 9,
    status: 'confirmed',
    paymentMethod: 'Campus Wallet',
    pickupToken: 'tok_cx1049_bce_verified_72c1',
    pickupCode: '1638',
    pickupVerified: false
  },
  // ABC College Orders
  {
    orderId: 'CX-5021',
    collegeId: 'ABC001',
    studentName: 'Aarav Patel',
    studentId: 'ABC-STU-1022',
    items: [
      { foodId: 'food-abc-1', foodName: 'Paneer Butter Masala Rice Bowl', quantity: 1, price: 60, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', prepTime: 7 }
    ],
    totalAmount: 60,
    orderTime: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedPickupTime: 7,
    status: 'preparing',
    paymentMethod: 'Campus Wallet',
    pickupToken: 'tok_cx5021_abc_verified_55a2',
    pickupCode: '3194',
    pickupVerified: false
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth & Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentSessionUser());
  const isAuthenticated = currentUser !== null;

  // Selected College
  const [selectedDemoCollegeId, setSelectedDemoCollegeId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLLEGE);
      if (saved) return saved;
    } catch {}
    return currentUser?.collegeId || 'BCE001';
  });

  const currentCollege = useMemo(() => {
    const cid = currentUser?.collegeId || selectedDemoCollegeId;
    return getCollegeById(cid) || DEMO_COLLEGES[0];
  }, [currentUser, selectedDemoCollegeId]);

  const switchCollege = useCallback((collegeId: string) => {
    const found = getCollegeById(collegeId);
    if (found) {
      setSelectedDemoCollegeId(found.collegeId);
      try {
        localStorage.setItem(STORAGE_KEYS.COLLEGE, found.collegeId);
      } catch {}
      // If student is logged in, sync their view
      if (currentUser && currentUser.collegeId !== found.collegeId) {
        // demo switch
      }
    }
  }, [currentUser]);

  // Views & Role
  const [activeView, setActiveView] = useState<AppView>('home');
  const [currentRole, setCurrentRole] = useState<AppRole>(() => {
    if (currentUser?.role === 'kitchen_staff') return 'staff';
    return 'student';
  });

  // Break Timer
  const [breakMinutesLeft, setBreakMinutesLeft] = useState<number>(12);
  const breakTotalMinutes = 20;
  const breakName = 'Afternoon Recess';

  // Announcements
  const [announcements] = useState<Announcement[]>(CANTEEN_ANNOUNCEMENTS);

  // Menu State
  const [menu, setMenu] = useState<FoodItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MENU;
  });

  // Fetch authoritative menu from PostgreSQL backend for currentCollege
  useEffect(() => {
    let isMounted = true;
    const fetchBackendMenu = async () => {
      try {
        const res = await apiGetMenu({ collegeId: currentCollege.collegeId });
        if (isMounted && res.success && res.data && res.data.length > 0) {
          const backendItems = res.data;
          setMenu(prev => {
            const otherCollegeItems = prev.filter(item => item.collegeId !== currentCollege.collegeId);
            return [...backendItems, ...otherCollegeItems];
          });
        }
      } catch (err) {
        console.warn('[CanteenX] Could not reach backend menu, keeping local data:', err);
      }
    };
    fetchBackendMenu();
    return () => {
      isMounted = false;
    };
  }, [currentCollege.collegeId]);

  // Menu filtered by active college
  const collegeMenu = useMemo(() => {
    return menu.filter(item => item.collegeId === currentCollege.collegeId);
  }, [menu, currentCollege]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED_ORDERS;
  });

  // Live Queue Metrics for Current College
  const queueMetrics = useMemo(() => {
    return calculateCanteenQueueMetrics(orders, currentCollege.collegeId, collegeMenu);
  }, [orders, currentCollege, collegeMenu]);

  // Scoped orders
  const studentOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.studentId === currentUser.id && o.collegeId === currentCollege.collegeId);
  }, [orders, currentUser, currentCollege]);

  const staffOrders = useMemo(() => {
    return orders.filter(o => o.collegeId === currentCollege.collegeId);
  }, [orders, currentCollege]);

  // Active student order
  const activeOrder = useMemo(() => {
    if (studentOrders.length === 0) return null;
    const active = studentOrders.find(o => o.status !== 'completed' && o.status !== 'cancelled');
    return active || null;
  }, [studentOrders]);

  // Cart State
  const [cart, setCart] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals & UI States
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmedOrderModal, setConfirmedOrderModal] = useState<Order | null>(null);
  const [activeQRModalOrder, setActiveQRModalOrder] = useState<Order | null>(null);
  const [isAdminScannerOpen, setIsAdminScannerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // AI Chat State
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: `👋 Hey ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! I'm your CanteenX Live Queue Assistant.\n\nTell me your budget & break time (e.g. "I have ₹60 and 10 mins") and I'll find food that fits your break and skips the canteen rush!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAITyping, setIsAITyping] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [menu, orders, cart]);

  // Cross-tab broadcast channel
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('canteenx_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'ORDER_STATUS_CHANGED') {
          const { orderId, status, pickupVerified, pickupTime } = event.data;
          setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status, pickupVerified: pickupVerified ?? o.pickupVerified, pickupTime: pickupTime ?? o.pickupTime } : o));

          if (status === 'ready') {
            playOrderReadyAlert();
            setNotification({
              title: `🎉 Order #${orderId} Ready!`,
              message: 'Your meal is packed at Counter #2! Please show your Pickup QR pass.',
              type: 'success'
            });
          } else if (status === 'completed') {
            playSuccessChime();
            setNotification({
              title: `✓ Order #${orderId} Handover Verified!`,
              message: 'Enjoy your meal! 🍽️ Pickup confirmed at canteen counter.',
              type: 'success'
            });
          }
        } else if (event.data?.type === 'INVENTORY_CHANGED') {
          setMenu(event.data.menu);
        } else if (event.data?.type === 'NEW_ORDER_PLACED') {
          setOrders(prev => [event.data.order, ...prev.filter(o => o.orderId !== event.data.order.orderId)]);
        }
      };
      return () => {
        channel.close();
      };
    } catch {}
  }, []);

  const broadcastEvent = (data: unknown) => {
    try {
      const channel = new BroadcastChannel('canteenx_sync');
      channel.postMessage(data);
      channel.close();
    } catch {}
  };

  const dismissNotification = () => setNotification(null);

  // Authentication Operations
  const login = useCallback(async (identifier: string, password?: string) => {
    const res = await loginUser(identifier, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSelectedDemoCollegeId(res.user.collegeId);
      setCurrentRole(res.user.role === 'kitchen_staff' || res.user.role === 'admin' ? 'staff' : 'student');
      setActiveView('home');
      setNotification({
        title: `Welcome back, ${res.user.name.split(' ')[0]}! 👋`,
        message: `Logged into ${res.user.collegeName || res.user.collegeId} (${res.user.id})`,
        type: 'success'
      });
    }
    return res;
  }, []);

  const loginStaff = useCallback(async (identifier: string, password?: string) => {
    const res = await loginKitchenStaff(identifier, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSelectedDemoCollegeId(res.user.collegeId);
      setCurrentRole('staff');
      setActiveView('home');
      setNotification({
        title: `Kitchen Staff Access Granted 👨‍🍳`,
        message: `Logged in as ${res.user.name} • ${res.user.collegeName || res.user.collegeId}`,
        type: 'success'
      });
    }
    return res;
  }, []);

  const signup = useCallback(async (
    name: string,
    mobileNumber: string,
    email: string,
    password: string,
    confirmPassword: string,
    selectedCollegeId: string,
    enteredCollegeId: string
  ) => {
    const res = await registerStudent(name, mobileNumber, email, password, confirmPassword, selectedCollegeId, enteredCollegeId);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSelectedDemoCollegeId(res.user.collegeId);
      setCurrentRole('student');
      setActiveView('home');
      setNotification({
        title: 'Welcome to CanteenX! 🎉',
        message: `Account created for ${res.user.name} (${res.user.id}) at ${res.user.collegeName}.`,
        type: 'success'
      });
    }
    return res;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!currentUser) return false;
    const res = await updateUserProfile(currentUser.id, updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setNotification({
        title: 'Profile Updated',
        message: 'Your personal information and preferences have been updated.',
        type: 'success'
      });
      playSuccessChime();
      return true;
    }
    return false;
  }, [currentUser]);

  const logout = useCallback(() => {
    logoutUser();
    setCurrentUser(null);
    clearCart();
    setConfirmedOrderModal(null);
    setActiveQRModalOrder(null);
    setNotification({
      title: 'Logged Out',
      message: 'You have been safely signed out.',
      type: 'info'
    });
  }, []);

  // Menu Helpers
  const getItemById = useCallback((id: string) => {
    return menu.find(item => item.id === id);
  }, [menu]);

  const updateItemStock = useCallback(async (foodId: string, delta: number) => {
    const currentItem = menu.find(item => item.id === foodId);
    const newQty = currentItem ? Math.max(0, currentItem.availableQuantity + delta) : 0;

    setMenu(prev => {
      const updated = prev.map(item => {
        if (item.id === foodId) {
          return {
            ...item,
            availableQuantity: newQty,
            isAvailable: newQty > 0
          };
        }
        return item;
      });
      broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
      return updated;
    });

    try {
      const res = await apiUpdateFoodStock(foodId, newQty);
      if (res.success && res.data) {
        setMenu(prev => prev.map(item => item.id === foodId ? { ...item, ...res.data! } : item));
      }
    } catch (err) {
      console.warn('[CanteenX] Stock API sync error:', err);
    }
  }, [menu]);

  const toggleItemAvailability = useCallback(async (foodId: string) => {
    const currentItem = menu.find(item => item.id === foodId);
    const newAvailable = currentItem ? !currentItem.isAvailable : false;

    setMenu(prev => {
      const updated = prev.map(item => {
        if (item.id === foodId) {
          return {
            ...item,
            isAvailable: newAvailable,
            availableQuantity: newAvailable ? (item.availableQuantity === 0 ? 10 : item.availableQuantity) : 0
          };
        }
        return item;
      });
      broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
      return updated;
    });

    try {
      const res = await apiUpdateFoodAvailability(foodId, newAvailable);
      if (res.success && res.data) {
        setMenu(prev => prev.map(item => item.id === foodId ? { ...item, ...res.data! } : item));
      }
    } catch (err) {
      console.warn('[CanteenX] Availability API sync error:', err);
    }
  }, [menu]);

  const updateFoodItem = useCallback(async (foodId: string, updates: Partial<FoodItem>) => {
    setMenu(prev => {
      const updated = prev.map(item => item.id === foodId ? { ...item, ...updates } : item);
      broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
      return updated;
    });

    try {
      const res = await apiUpdateFoodItem(foodId, updates);
      if (res.success && res.data) {
        setMenu(prev => prev.map(item => item.id === foodId ? { ...item, ...res.data! } : item));
      }
    } catch (err) {
      console.warn('[CanteenX] Update food API error:', err);
    }
  }, []);

  const addNewFoodItem = useCallback(async (itemData: Omit<FoodItem, 'id' | 'collegeId'>) => {
    try {
      const res = await apiCreateFoodItem({
        ...itemData,
        collegeId: currentCollege.collegeId,
      });
      if (res.success && res.data) {
        setMenu(prev => {
          const updated = [res.data!, ...prev.filter(i => i.id !== res.data!.id)];
          broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
          return updated;
        });
        return;
      }
    } catch (err) {
      console.warn('[CanteenX] Create food API error, fallback to local:', err);
    }

    const newItem: FoodItem = {
      ...itemData,
      id: `food-${Date.now()}`,
      collegeId: currentCollege.collegeId
    };
    setMenu(prev => {
      const updated = [newItem, ...prev];
      broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
      return updated;
    });
  }, [currentCollege]);

  const deleteFoodItem = useCallback(async (foodId: string): Promise<boolean> => {
    setMenu(prev => {
      const updated = prev.filter(item => item.id !== foodId);
      broadcastEvent({ type: 'INVENTORY_CHANGED', menu: updated });
      return updated;
    });

    try {
      const res = await apiDeleteFoodItem(foodId);
      return res.success;
    } catch (err) {
      console.warn('[CanteenX] Delete food API error:', err);
      return false;
    }
  }, []);

  // Cart Operations
  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const cartTotalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartMaxPrepTime = useMemo(() => {
    if (cart.length === 0) return 0;
    return Math.max(...cart.map(i => i.prepTime || 5));
  }, [cart]);

  const addToCart = useCallback((item: FoodItem, quantity: number = 1) => {
    if (!item.isAvailable || item.availableQuantity <= 0) {
      setNotification({
        title: 'Item Sold Out',
        message: `${item.name} is currently out of stock.`,
        type: 'warning'
      });
      return { success: false, message: 'Item is sold out' };
    }

    playClickSound();

    setCart(prev => {
      const existing = prev.find(i => i.foodId === item.id);
      if (existing) {
        return prev.map(i => i.foodId === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        foodId: item.id,
        foodName: item.name,
        quantity,
        price: item.price,
        image: item.image,
        prepTime: item.preparationTime
      }];
    });

    setNotification({
      title: `Added to Cart (+${quantity})`,
      message: `${item.name} (Prep ~${item.preparationTime}m)`,
      type: 'success'
    });

    return { success: true };
  }, []);

  const updateCartQuantity = useCallback((foodId: string, quantity: number) => {
    playClickSound();
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.foodId !== foodId));
    } else {
      setCart(prev => prev.map(i => i.foodId === foodId ? { ...i, quantity } : i));
    }
  }, []);

  const removeFromCart = useCallback((foodId: string) => {
    playClickSound();
    setCart(prev => prev.filter(i => i.foodId !== foodId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addComboToCart = useCallback((items: FoodItem[]) => {
    playSuccessChime();
    items.forEach(item => {
      addToCart(item, 1);
    });
    setIsCartOpen(true);
  }, [addToCart]);

  // Order Placement
  const placeReservation = useCallback((paymentMethod: 'Campus Wallet' | 'UPI / GPay' | 'Counter Cash', specialNote?: string) => {
    if (cart.length === 0) return null;

    const currentStudent = currentUser || SEED_USERS[0];
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `CX-${orderNum}`;
    const token = `tok_${currentCollege.collegeId.toLowerCase()}_${orderNum}_${Math.random().toString(36).substring(2, 8)}`;
    const passCode = String(Math.floor(1000 + Math.random() * 9000));

    // Deduct stock
    cart.forEach(item => {
      updateItemStock(item.foodId, -item.quantity);
    });

    // Deduct wallet if used
    if (paymentMethod === 'Campus Wallet' && currentUser) {
      updateProfile({ walletBalance: Math.max(0, currentUser.walletBalance - cartTotalAmount) });
    }

    const estimatedTotalWait = cartMaxPrepTime + queueMetrics.queueDelayMinutes;

    const newOrder: Order = {
      orderId: newOrderId,
      collegeId: currentCollege.collegeId,
      studentName: currentStudent.name,
      studentId: currentStudent.id,
      studentEmail: currentStudent.email,
      items: [...cart],
      totalAmount: cartTotalAmount,
      orderTime: new Date().toISOString(),
      estimatedPickupTime: estimatedTotalWait,
      status: 'received',
      paymentMethod,
      pickupToken: token,
      pickupCode: passCode,
      pickupVerified: false,
      specialNote
    };

    setOrders(prev => [newOrder, ...prev]);
    broadcastEvent({ type: 'NEW_ORDER_PLACED', order: newOrder });

    clearCart();
    setIsCartOpen(false);
    setConfirmedOrderModal(newOrder);
    playOrderPlacedSound();

    setNotification({
      title: `Order #${newOrderId} Confirmed! 🎉`,
      message: `Estimated ready in ~${estimatedTotalWait} min at Counter #2.`,
      type: 'success'
    });

    return newOrder;
  }, [cart, currentUser, currentCollege, cartTotalAmount, cartMaxPrepTime, queueMetrics, updateItemStock, updateProfile, clearCart]);

  // Order Status Updates
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    playClickSound();

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.orderId === orderId) {
        return {
          ...o,
          status,
          pickupVerified: status === 'completed' ? true : o.pickupVerified,
          pickupTime: status === 'completed' ? formattedTime : o.pickupTime,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));

    broadcastEvent({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status,
      pickupVerified: status === 'completed',
      pickupTime: status === 'completed' ? formattedTime : undefined
    });

    if (status === 'ready') {
      playOrderReadyAlert();
      setNotification({
        title: `🔔 Order #${orderId} Ready!`,
        message: 'Your meal is hot & packed at the counter. Show your QR pass to collect!',
        type: 'success'
      });
    } else if (status === 'completed') {
      playSuccessChime();
    }
  }, []);

  // Step-through order state simulator for presentation
  const simulateOrderProgress = useCallback((orderId: string) => {
    const target = orders.find(o => o.orderId === orderId);
    if (!target) return;

    if (target.status === 'received') {
      updateOrderStatus(orderId, 'confirmed');
    } else if (target.status === 'confirmed') {
      updateOrderStatus(orderId, 'preparing');
    } else if (target.status === 'preparing') {
      updateOrderStatus(orderId, 'ready');
    } else if (target.status === 'ready') {
      updateOrderStatus(orderId, 'completed');
    }
  }, [orders, updateOrderStatus]);

  // Reorder past order
  const reorderPastOrder = useCallback((pastOrder: Order) => {
    playClickSound();
    clearCart();
    pastOrder.items.forEach(item => {
      const found = getItemById(item.foodId);
      if (found) {
        addToCart(found, item.quantity);
      }
    });
    setIsCartOpen(true);
  }, [clearCart, getItemById, addToCart]);

  // Multi-College Secure QR Verification Engine
  const verifyQRPickup = useCallback((rawPayload: string): QRVerificationResult => {
    let orderId = rawPayload.trim();
    let code = '';
    let token = '';
    let payloadCollegeId = '';

    try {
      const parsed = JSON.parse(rawPayload);
      if (parsed.orderId) orderId = parsed.orderId;
      if (parsed.code) code = parsed.code;
      if (parsed.token) token = parsed.token;
      if (parsed.collegeId) payloadCollegeId = parsed.collegeId;
    } catch {}

    const matchedOrder = orders.find(o =>
      o.orderId.toLowerCase() === orderId.toLowerCase() ||
      (token && o.pickupToken === token) ||
      (code && o.pickupCode === code) ||
      o.pickupCode === rawPayload.trim()
    );

    if (!matchedOrder) {
      return {
        valid: false,
        errorType: 'INVALID_QR',
        message: '🔒 Invalid Pass: This QR code is not recognized in the campus database.'
      };
    }

    // Security Check: Cross-College Access Enforcement
    const orderCollegeId = matchedOrder.collegeId || payloadCollegeId;
    if (orderCollegeId !== currentCollege.collegeId) {
      const orderCollege = getCollegeById(orderCollegeId);
      const orderCollegeName = orderCollege ? orderCollege.collegeName : orderCollegeId;
      return {
        valid: false,
        errorType: 'WRONG_COLLEGE',
        message: `🔒 CROSS-COLLEGE VIOLATION: This order belongs to "${orderCollegeName}" (${orderCollegeId}), but you are logged in as staff for "${currentCollege.collegeName}" (${currentCollege.collegeId}). Handover rejected.`,
        order: matchedOrder
      };
    }

    if (matchedOrder.status === 'completed' || matchedOrder.pickupVerified) {
      return {
        valid: false,
        errorType: 'ALREADY_COLLECTED',
        message: `⚠️ Already Collected: Order #${matchedOrder.orderId} was collected at ${matchedOrder.pickupTime || 'earlier today'}.`,
        order: matchedOrder
      };
    }

    if (matchedOrder.status !== 'ready') {
      return {
        valid: false,
        errorType: 'NOT_READY',
        message: `⏳ Order Not Ready: Status is currently "${matchedOrder.status.toUpperCase()}". The kitchen has not marked it ready.`,
        order: matchedOrder
      };
    }

    return {
      valid: true,
      message: `✓ Valid Pickup Pass! Order #${matchedOrder.orderId} belongs to ${matchedOrder.studentName}.`,
      order: matchedOrder
    };
  }, [orders, currentCollege]);

  // Confirm Pickup Handover
  const confirmQRPickup = useCallback((orderId: string) => {
    const target = orders.find(o => o.orderId === orderId);
    if (!target) return false;

    if (target.collegeId !== currentCollege.collegeId) {
      return false;
    }

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders(prev => prev.map(o => o.orderId === orderId ? {
      ...o,
      status: 'completed',
      pickupVerified: true,
      pickupTime: formattedTime,
      updatedAt: new Date().toISOString()
    } : o));

    playSuccessChime();
    setNotification({
      title: `✓ Pickup Confirmed #${orderId}`,
      message: `Handed over to ${target.studentName} at ${formattedTime}.`,
      type: 'success'
    });

    broadcastEvent({
      type: 'ORDER_STATUS_CHANGED',
      orderId,
      status: 'completed',
      pickupVerified: true,
      pickupTime: formattedTime
    });

    return true;
  }, [orders, currentCollege]);

  // AI Chat interaction (strictly queue-aware and college-isolated)
  const sendAIMessage = useCallback((query: string) => {
    if (!query.trim()) return;

    playClickSound();

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, userMsg]);
    setIsAITyping(true);

    setTimeout(() => {
      const studentPref = currentUser?.dietaryPreference || 'veg';
      const studentBudget = currentUser?.budget || 60;

      const result = generateAIRecommendations(
        query,
        collegeMenu,
        studentPref,
        breakMinutesLeft,
        queueMetrics,
        studentBudget
      );

      const aiMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `[${currentCollege.shortName} Canteen Assistant]\n\n${result.responseText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendations: result.recommendations,
        closestOptions: result.closestOptions,
        isImpossibleMatch: result.isImpossibleMatch,
        rushWarning: result.rushWarning,
        fastAlternatives: result.fastAlternatives
      };

      setAiMessages(prev => [...prev, aiMsg]);
      setIsAITyping(false);
      playSuccessChime();
    }, 400);
  }, [currentUser, collegeMenu, breakMinutesLeft, queueMetrics, currentCollege]);

  const clearAIChat = useCallback(() => {
    setAiMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `👋 Hey ${currentUser ? currentUser.name.split(' ')[0] : 'there'}! I'm your CanteenX Live Queue Assistant.\n\nTell me what you're craving or your budget & break time (e.g. "I have ₹60 and 10 mins")!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [currentUser]);

  // Simulation controls for Hackathon Demo
  const setSimulatedRushMode = useCallback((rush: 'low' | 'moderate' | 'high') => {
    if (rush === 'high') {
      // Inject simulated active orders for current college to create High Rush (23+ orders)
      const fakeOrders: Order[] = Array.from({ length: 24 }).map((_, i) => ({
        orderId: `CX-9${100 + i}`,
        collegeId: currentCollege.collegeId,
        studentName: `Student ${i + 1}`,
        studentId: `${currentCollege.collegeId}-STU-${2000 + i}`,
        items: [{ foodId: 'food-3', foodName: 'Spicy Potato Samosa', quantity: 1, price: 20, image: '', prepTime: 2 }],
        totalAmount: 20,
        orderTime: new Date(Date.now() - (i + 1) * 60000).toISOString(),
        estimatedPickupTime: 12,
        status: i < 8 ? 'preparing' : 'received',
        paymentMethod: 'Campus Wallet',
        pickupToken: `tok_sim_${i}`,
        pickupCode: String(1000 + i),
        pickupVerified: false
      }));

      setOrders(prev => [...fakeOrders, ...prev.filter(o => !o.orderId.startsWith('CX-9'))]);
      setBreakMinutesLeft(10);
      setNotification({
        title: '🔴 Simulated High Rush Activated',
        message: `${currentCollege.shortName} queue set to High Rush (28 active orders, +8m queue delay).`,
        type: 'warning'
      });
    } else if (rush === 'low') {
      setOrders(prev => prev.filter(o => !o.orderId.startsWith('CX-9')));
      setBreakMinutesLeft(20);
      setNotification({
        title: '🟢 Simulated Low Crowd Activated',
        message: `${currentCollege.shortName} queue set to Low Crowd (<5m wait).`,
        type: 'success'
      });
    } else {
      setOrders(SEED_ORDERS);
      setBreakMinutesLeft(15);
      setNotification({
        title: '🟡 Simulated Moderate Crowd',
        message: `${currentCollege.shortName} queue set to Moderate Rush (~8m wait).`,
        type: 'info'
      });
    }
  }, [currentCollege]);

  // 1-Click Complete Hackathon Demo Scenario
  const runHackathonDemoScenario = useCallback(async () => {
    // 1. Switch to BCE001 student Vishnu
    await login('student@college.edu', 'password123');
    // 2. Set simulated High Rush
    setSimulatedRushMode('high');
    // 3. Set break to 10 min
    setBreakMinutesLeft(10);
    // 4. Trigger AI prompt: "I have ₹60 and 10 minutes"
    setActiveView('ai');
    sendAIMessage('I have ₹60 and only 10 minutes');
  }, [login, setSimulatedRushMode, sendAIMessage]);

  // Reset demo
  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.MENU);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    setMenu(INITIAL_MENU);
    setOrders(SEED_ORDERS);
    setCart([]);
    setBreakMinutesLeft(12);
    setNotification({
      title: 'Demo Data Reset',
      message: 'Initial menus, active orders, and queue data restored.',
      type: 'info'
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        loginStaff,
        signup,
        updateProfile,
        logout,
        colleges: DEMO_COLLEGES,
        currentCollege,
        switchCollege,
        activeView,
        setActiveView,
        currentRole,
        setCurrentRole,
        breakMinutesLeft,
        breakTotalMinutes,
        breakName,
        setBreakMinutesLeft,
        announcements,
        queueMetrics,
        menu,
        collegeMenu,
        getItemById,
        updateItemStock,
        toggleItemAvailability,
        updateFoodItem,
        addNewFoodItem,
        deleteFoodItem,
        cart,
        cartTotalAmount,
        cartTotalCount,
        cartMaxPrepTime,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addComboToCart,
        orders,
        studentOrders,
        staffOrders,
        activeOrder,
        selectedOrderId,
        setSelectedOrderId,
        confirmedOrderModal,
        setConfirmedOrderModal,
        activeQRModalOrder,
        setActiveQRModalOrder,
        isAdminScannerOpen,
        setIsAdminScannerOpen,
        placeReservation,
        updateOrderStatus,
        simulateOrderProgress,
        reorderPastOrder,
        verifyQRPickup,
        confirmQRPickup,
        aiMessages,
        isAITyping,
        sendAIMessage,
        clearAIChat,
        resetDemoData,
        runHackathonDemoScenario,
        setSimulatedRushMode,
        notification,
        dismissNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
