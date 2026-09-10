import { prisma } from '../config/database.js';
import { ApiError } from '../utils/apiResponse.js';

export interface GetMenuFilter {
  collegeId: string;
  category?: string;
  available?: boolean;
  search?: string;
}

export interface CreateFoodItemDto {
  name: string;
  description?: string;
  category: string;
  price: number;
  stock?: number;
  availableQuantity?: number;
  initialStock?: number;
  preparationTime?: number;
  dietaryType?: string;
  popularity?: number;
  rating?: number;
  image?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isChefSpecial?: boolean;
  calories?: number;
  tags?: string[];
}

export interface FoodItemResponse {
  id: string;
  collegeId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  availableQuantity: number;
  initialStock: number;
  preparationTime: number;
  dietaryType: string;
  popularity: number;
  rating: number;
  image: string;
  imageUrl: string;
  isAvailable: boolean;
  available: boolean;
  isChefSpecial: boolean;
  calories?: number | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory Fallback Seed Data (used when PostgreSQL daemon is not running locally)
const FALLBACK_SEED_ITEMS: any[] = [
  // BCE001 Items
  {
    id: 'food-1',
    collegeId: 'BCE001',
    name: 'Crispy Masala Dosa',
    description: 'Golden crispy crepe stuffed with spiced potato masala, served with 2 chutneys and hot sambar.',
    category: 'Breakfast',
    price: 40,
    availableQuantity: 18,
    initialStock: 30,
    preparationTime: 7,
    dietaryType: 'veg',
    popularity: 98,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: true,
    calories: 320,
    tags: ['south-indian', 'bestseller', 'crispy'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-2',
    collegeId: 'BCE001',
    name: 'Steamed Idli Vada Combo',
    description: '2 soft steamed rice cakes + 1 crunchy medu vada with hot aromatic sambar and coconut chutney.',
    category: 'Breakfast',
    price: 35,
    availableQuantity: 24,
    initialStock: 40,
    preparationTime: 3,
    dietaryType: 'veg',
    popularity: 92,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 260,
    tags: ['south-indian', 'quick-bite', 'breakfast'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-3',
    collegeId: 'BCE001',
    name: 'Spicy Potato Samosa (2 pcs)',
    description: 'Flaky pastry stuffed with spiced potato and green peas, served with mint & tamarind dips.',
    category: 'Snacks',
    price: 20,
    availableQuantity: 12,
    initialStock: 35,
    preparationTime: 2,
    dietaryType: 'veg',
    popularity: 95,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 280,
    tags: ['snack', 'fast', 'budget-pick'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-4',
    collegeId: 'BCE001',
    name: 'Vegetable Hakka Noodles',
    description: 'Wok-tossed noodles with crunchy bell peppers, cabbage, carrots, and spicy soy-chili sauce.',
    category: 'Meals',
    price: 60,
    availableQuantity: 8,
    initialStock: 20,
    preparationTime: 9,
    dietaryType: 'veg',
    popularity: 88,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 410,
    tags: ['chinese', 'filling', 'meal'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-6',
    collegeId: 'BCE001',
    name: 'Fresh Lemon Juice',
    description: 'Chilled tangy refreshing lemonade with mint leaves and black salt.',
    category: 'Beverages',
    price: 15,
    availableQuantity: 30,
    initialStock: 50,
    preparationTime: 2,
    dietaryType: 'vegan',
    popularity: 85,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 80,
    tags: ['drink', 'cooling', 'cheap'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-7',
    collegeId: 'BCE001',
    name: 'Special Masala Tea (Chai)',
    description: 'Freshly brewed aromatic tea infused with crushed cardamom, ginger, and cinnamon.',
    category: 'Beverages',
    price: 10,
    availableQuantity: 45,
    initialStock: 60,
    preparationTime: 2,
    dietaryType: 'veg',
    popularity: 99,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 90,
    tags: ['drink', 'hot', 'quick-sip'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ABC001 Items
  {
    id: 'food-abc-1',
    collegeId: 'ABC001',
    name: 'Paneer Butter Masala Rice Bowl',
    description: 'Creamy rich cottage cheese gravy served over aromatic jeera rice bowl.',
    category: 'Meals',
    price: 60,
    availableQuantity: 15,
    initialStock: 25,
    preparationTime: 7,
    dietaryType: 'veg',
    popularity: 95,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: true,
    calories: 450,
    tags: ['north-indian', 'filling', 'paneer'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'food-abc-2',
    collegeId: 'ABC001',
    name: 'Aloo Paratha with Curd & Pickle',
    description: '2 whole wheat flatbreads stuffed with spiced potatoes, served with chilled curd.',
    category: 'Breakfast',
    price: 45,
    availableQuantity: 20,
    initialStock: 30,
    preparationTime: 6,
    dietaryType: 'veg',
    popularity: 91,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    isChefSpecial: false,
    calories: 380,
    tags: ['breakfast', 'punjabi', 'comfort'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let fallbackMemoryItems: any[] = [...FALLBACK_SEED_ITEMS];

/**
 * Maps Prisma FoodItem entity to standardized Frontend/API Response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatFoodItem(item: any): FoodItemResponse {
  const img = item.image || item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  const stock = typeof item.availableQuantity === 'number' ? item.availableQuantity : item.stock || 0;
  const isAvailable = Boolean(item.isAvailable) && stock > 0;

  return {
    id: item.id,
    collegeId: item.collegeId,
    name: item.name,
    description: item.description || '',
    category: item.category,
    price: Number(item.price),
    stock,
    availableQuantity: stock,
    initialStock: item.initialStock || stock,
    preparationTime: Number(item.preparationTime) || 5,
    dietaryType: item.dietaryType || 'veg',
    popularity: item.popularity || 50,
    rating: item.rating || 4.5,
    image: img,
    imageUrl: img,
    isAvailable,
    available: isAvailable,
    isChefSpecial: Boolean(item.isChefSpecial),
    calories: item.calories || null,
    tags: Array.isArray(item.tags) ? item.tags : [],
    createdAt: item.createdAt || new Date(),
    updatedAt: item.updatedAt || new Date(),
  };
}

export class MenuService {
  /**
   * Get menu scoped strictly to a college with optional category, availability, and search filters
   */
  async getMenu(filter: GetMenuFilter): Promise<FoodItemResponse[]> {
    if (!filter.collegeId) {
      throw new ApiError(400, 'College ID is required to fetch menu.');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        collegeId: filter.collegeId,
      };

      if (filter.category && filter.category !== 'all' && filter.category !== 'ready_fast') {
        whereClause.category = filter.category;
      }

      if (filter.available !== undefined) {
        whereClause.isAvailable = filter.available;
        if (filter.available) {
          whereClause.availableQuantity = { gt: 0 };
        }
      }

      if (filter.search && filter.search.trim()) {
        const q = filter.search.trim();
        whereClause.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ];
      }

      const items = await prisma.foodItem.findMany({
        where: whereClause,
        orderBy: [{ popularity: 'desc' }, { name: 'asc' }],
      });

      return items.map(formatFoodItem);
    } catch {
      // Fallback to in-memory store
      let filtered = fallbackMemoryItems.filter(i => i.collegeId === filter.collegeId);

      if (filter.category && filter.category !== 'all' && filter.category !== 'ready_fast') {
        filtered = filtered.filter(i => i.category === filter.category);
      }

      if (filter.available !== undefined) {
        filtered = filtered.filter(i => (filter.available ? i.isAvailable && i.availableQuantity > 0 : !i.isAvailable || i.availableQuantity <= 0));
      }

      if (filter.search && filter.search.trim()) {
        const q = filter.search.trim().toLowerCase();
        filtered = filtered.filter(i =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
        );
      }

      return filtered.sort((a, b) => (b.popularity || 50) - (a.popularity || 50)).map(formatFoodItem);
    }
  }

  /**
   * Get single food item by ID and optionally verify college ownership
   */
  async getFoodItemById(id: string, collegeId?: string): Promise<FoodItemResponse> {
    try {
      const item = await prisma.foodItem.findUnique({
        where: { id },
      });

      if (!item) {
        throw new ApiError(404, 'Food item not found.');
      }

      if (collegeId && item.collegeId !== collegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to view this food item.');
      }

      return formatFoodItem(item);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      const found = fallbackMemoryItems.find(i => i.id === id);
      if (!found) {
        throw new ApiError(404, 'Food item not found.');
      }
      if (collegeId && found.collegeId !== collegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to view this food item.');
      }
      return formatFoodItem(found);
    }
  }

  /**
   * Create a new food item (Kitchen staff & Super Admin only)
   * Automatically scopes to the authenticated user's collegeId
   */
  async createFoodItem(userCollegeId: string, dto: CreateFoodItemDto): Promise<FoodItemResponse> {
    if (!userCollegeId) {
      throw new ApiError(400, 'User must be associated with a valid college.');
    }

    const name = dto.name?.trim();
    if (!name || name.length < 2) {
      throw new ApiError(400, 'Food name is required (minimum 2 characters).');
    }

    if (!dto.category || !dto.category.trim()) {
      throw new ApiError(400, 'Food category is required.');
    }

    if (typeof dto.price !== 'number' || dto.price < 0 || isNaN(dto.price)) {
      throw new ApiError(400, 'Price must be a valid non-negative number.');
    }

    const rawStock = dto.stock !== undefined ? dto.stock : dto.availableQuantity !== undefined ? dto.availableQuantity : 20;
    const stock = Math.max(0, Math.floor(Number(rawStock) || 0));

    const rawPrep = dto.preparationTime !== undefined ? dto.preparationTime : 5;
    const preparationTime = Math.max(1, Math.floor(Number(rawPrep) || 5));

    const isAvailable = dto.isAvailable !== undefined ? Boolean(dto.isAvailable) && stock > 0 : stock > 0;
    const image = dto.image || dto.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

    try {
      const newItem = await prisma.foodItem.create({
        data: {
          collegeId: userCollegeId,
          name,
          description: dto.description?.trim() || '',
          category: dto.category.trim(),
          price: Number(dto.price),
          availableQuantity: stock,
          initialStock: dto.initialStock !== undefined ? dto.initialStock : stock,
          preparationTime,
          dietaryType: dto.dietaryType || 'veg',
          popularity: dto.popularity !== undefined ? dto.popularity : 75,
          rating: dto.rating !== undefined ? dto.rating : 4.5,
          image,
          isAvailable,
          isChefSpecial: Boolean(dto.isChefSpecial),
          calories: dto.calories || null,
          tags: Array.isArray(dto.tags) ? dto.tags : [],
        },
      });

      return formatFoodItem(newItem);
    } catch {
      const newMemoryItem = {
        id: `food-${Date.now()}`,
        collegeId: userCollegeId,
        name,
        description: dto.description?.trim() || '',
        category: dto.category.trim(),
        price: Number(dto.price),
        availableQuantity: stock,
        initialStock: dto.initialStock !== undefined ? dto.initialStock : stock,
        preparationTime,
        dietaryType: dto.dietaryType || 'veg',
        popularity: dto.popularity !== undefined ? dto.popularity : 75,
        rating: dto.rating !== undefined ? dto.rating : 4.5,
        image,
        isAvailable,
        isChefSpecial: Boolean(dto.isChefSpecial),
        calories: dto.calories || null,
        tags: Array.isArray(dto.tags) ? dto.tags : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      fallbackMemoryItems.unshift(newMemoryItem);
      return formatFoodItem(newMemoryItem);
    }
  }

  /**
   * Update food item details
   * Enforces strict server-side college isolation
   */
  async updateFoodItem(
    id: string,
    userCollegeId: string,
    isSuperAdmin: boolean,
    dto: Partial<CreateFoodItemDto>
  ): Promise<FoodItemResponse> {
    // Validation
    const dataToUpdate: any = {};

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name.length < 2) {
        throw new ApiError(400, 'Food name must be at least 2 characters.');
      }
      dataToUpdate.name = name;
    }

    if (dto.description !== undefined) {
      dataToUpdate.description = dto.description.trim();
    }

    if (dto.category !== undefined) {
      if (!dto.category.trim()) {
        throw new ApiError(400, 'Category cannot be empty.');
      }
      dataToUpdate.category = dto.category.trim();
    }

    if (dto.price !== undefined) {
      if (typeof dto.price !== 'number' || dto.price < 0 || isNaN(dto.price)) {
        throw new ApiError(400, 'Price must be a valid non-negative number.');
      }
      dataToUpdate.price = Number(dto.price);
    }

    if (dto.stock !== undefined || dto.availableQuantity !== undefined) {
      const rawStock = dto.stock !== undefined ? dto.stock : dto.availableQuantity;
      if (typeof rawStock !== 'number' || rawStock < 0 || isNaN(rawStock)) {
        throw new ApiError(400, 'Stock must be a non-negative integer.');
      }
      const stock = Math.floor(rawStock);
      dataToUpdate.availableQuantity = stock;
      if (stock === 0) {
        dataToUpdate.isAvailable = false;
      }
    }

    if (dto.preparationTime !== undefined) {
      if (typeof dto.preparationTime !== 'number' || dto.preparationTime < 0 || isNaN(dto.preparationTime)) {
        throw new ApiError(400, 'Preparation time must be a non-negative integer.');
      }
      dataToUpdate.preparationTime = Math.floor(dto.preparationTime);
    }

    if (dto.dietaryType !== undefined) {
      dataToUpdate.dietaryType = dto.dietaryType;
    }

    if (dto.image !== undefined || dto.imageUrl !== undefined) {
      dataToUpdate.image = dto.image || dto.imageUrl;
    }

    if (dto.isChefSpecial !== undefined) {
      dataToUpdate.isChefSpecial = Boolean(dto.isChefSpecial);
    }

    if (dto.calories !== undefined) {
      dataToUpdate.calories = dto.calories;
    }

    if (dto.tags !== undefined && Array.isArray(dto.tags)) {
      dataToUpdate.tags = dto.tags;
    }

    try {
      const existing = await prisma.foodItem.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new ApiError(404, 'Food item not found.');
      }

      // Critical College Isolation Check
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to modify food items from another college.');
      }

      if (dto.isAvailable !== undefined) {
        const currentStock = dataToUpdate.availableQuantity !== undefined ? dataToUpdate.availableQuantity : existing.availableQuantity;
        dataToUpdate.isAvailable = Boolean(dto.isAvailable) && currentStock > 0;
      }

      const updated = await prisma.foodItem.update({
        where: { id },
        data: dataToUpdate,
      });

      return formatFoodItem(updated);
    } catch (err) {
      if (err instanceof ApiError) throw err;

      const idx = fallbackMemoryItems.findIndex(i => i.id === id);
      if (idx === -1) {
        throw new ApiError(404, 'Food item not found.');
      }

      const existing = fallbackMemoryItems[idx];
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to modify food items from another college.');
      }

      if (dto.isAvailable !== undefined) {
        const currentStock = dataToUpdate.availableQuantity !== undefined ? dataToUpdate.availableQuantity : existing.availableQuantity;
        dataToUpdate.isAvailable = Boolean(dto.isAvailable) && currentStock > 0;
      }

      const updated = { ...existing, ...dataToUpdate, updatedAt: new Date() };
      fallbackMemoryItems[idx] = updated;
      return formatFoodItem(updated);
    }
  }

  /**
   * Update stock portion count (PATCH /api/menu/:id/stock)
   * Automatically toggles availability off when stock reaches 0
   */
  async updateStock(
    id: string,
    userCollegeId: string,
    isSuperAdmin: boolean,
    stock: number
  ): Promise<FoodItemResponse> {
    if (typeof stock !== 'number' || stock < 0 || isNaN(stock)) {
      throw new ApiError(400, 'Stock must be a non-negative integer.');
    }

    const newStock = Math.floor(stock);

    try {
      const existing = await prisma.foodItem.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new ApiError(404, 'Food item not found.');
      }

      // Critical College Isolation Check
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to update stock for another college.');
      }

      const newAvailable = newStock === 0 ? false : existing.isAvailable;

      const updated = await prisma.foodItem.update({
        where: { id },
        data: {
          availableQuantity: newStock,
          isAvailable: newAvailable,
        },
      });

      return formatFoodItem(updated);
    } catch (err) {
      if (err instanceof ApiError) throw err;

      const idx = fallbackMemoryItems.findIndex(i => i.id === id);
      if (idx === -1) {
        throw new ApiError(404, 'Food item not found.');
      }

      const existing = fallbackMemoryItems[idx];
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to update stock for another college.');
      }

      const newAvailable = newStock === 0 ? false : existing.isAvailable;
      const updated = {
        ...existing,
        availableQuantity: newStock,
        isAvailable: newAvailable,
        updatedAt: new Date(),
      };
      fallbackMemoryItems[idx] = updated;
      return formatFoodItem(updated);
    }
  }

  /**
   * Toggle or set availability (PATCH /api/menu/:id/availability)
   */
  async updateAvailability(
    id: string,
    userCollegeId: string,
    isSuperAdmin: boolean,
    isAvailable: boolean
  ): Promise<FoodItemResponse> {
    try {
      const existing = await prisma.foodItem.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new ApiError(404, 'Food item not found.');
      }

      // Critical College Isolation Check
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to update availability for another college.');
      }

      // If making available, ensure stock is at least 10 if currently 0
      let stock = existing.availableQuantity;
      if (isAvailable && stock <= 0) {
        stock = 10;
      } else if (!isAvailable) {
        stock = 0;
      }

      const updated = await prisma.foodItem.update({
        where: { id },
        data: {
          isAvailable: isAvailable,
          availableQuantity: stock,
        },
      });

      return formatFoodItem(updated);
    } catch (err) {
      if (err instanceof ApiError) throw err;

      const idx = fallbackMemoryItems.findIndex(i => i.id === id);
      if (idx === -1) {
        throw new ApiError(404, 'Food item not found.');
      }

      const existing = fallbackMemoryItems[idx];
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to update availability for another college.');
      }

      let stock = existing.availableQuantity;
      if (isAvailable && stock <= 0) {
        stock = 10;
      } else if (!isAvailable) {
        stock = 0;
      }

      const updated = {
        ...existing,
        isAvailable,
        availableQuantity: stock,
        updatedAt: new Date(),
      };
      fallbackMemoryItems[idx] = updated;
      return formatFoodItem(updated);
    }
  }

  /**
   * Delete food item safely
   * Checks for historical order item references to preserve order history integrity
   */
  async deleteFoodItem(id: string, userCollegeId: string, isSuperAdmin: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const existing = await prisma.foodItem.findUnique({
        where: { id },
        include: {
          orderItems: { select: { id: true }, take: 1 },
        },
      });

      if (!existing) {
        throw new ApiError(404, 'Food item not found.');
      }

      // Critical College Isolation Check
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to delete food items from another college.');
      }

      // If item is referenced in orders, soft-retire it
      if (existing.orderItems.length > 0) {
        await prisma.foodItem.update({
          where: { id },
          data: {
            isAvailable: false,
            availableQuantity: 0,
          },
        });
        return {
          success: true,
          message: 'Food item retired and marked out of stock (preserved for past order history).',
        };
      }

      await prisma.foodItem.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Food item removed successfully.',
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;

      const idx = fallbackMemoryItems.findIndex(i => i.id === id);
      if (idx === -1) {
        throw new ApiError(404, 'Food item not found.');
      }

      const existing = fallbackMemoryItems[idx];
      if (!isSuperAdmin && existing.collegeId !== userCollegeId) {
        throw new ApiError(403, 'Forbidden: You do not have permission to delete food items from another college.');
      }

      fallbackMemoryItems.splice(idx, 1);
      return {
        success: true,
        message: 'Food item removed successfully.',
      };
    }
  }
}

export const menuService = new MenuService();

