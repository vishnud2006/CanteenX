import { Request, Response, NextFunction } from 'express';
import { menuService } from '../services/menu.service.js';
import { ApiError } from '../utils/apiResponse.js';
import { UserRole } from '@prisma/client';

export const getMenu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Determine collegeId strictly from authenticated user, or query if admin / fallback demo
    let collegeId = req.user?.collegeId;
    if (!collegeId && req.query.collegeId) {
      collegeId = String(req.query.collegeId);
    }
    if (!collegeId) {
      // Default to BCE001 if public unauthenticated exploration is enabled
      collegeId = 'BCE001';
    }

    const category = req.query.category ? String(req.query.category) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;
    const available = req.query.available !== undefined ? req.query.available === 'true' : undefined;

    const items = await menuService.getMenu({
      collegeId,
      category,
      available,
      search,
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const getFoodItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const item = await menuService.getFoodItemById(id);

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const createFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Role check: Only kitchen staff and super admin can create food items
    if (req.user.role !== UserRole.KITCHEN_STAFF && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Forbidden: Only Kitchen Staff and Admins can create food items.');
    }

    const collegeId = req.user.collegeId || (req.body.collegeId && req.user.role === UserRole.SUPER_ADMIN ? String(req.body.collegeId) : 'BCE001');

    const newItem = await menuService.createFoodItem(collegeId, req.body);

    res.status(201).json({
      success: true,
      data: newItem,
      message: 'Food item created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.role !== UserRole.KITCHEN_STAFF && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Forbidden: Only Kitchen Staff and Admins can edit food items.');
    }

    const id = String(req.params.id);
    const userCollegeId = req.user.collegeId || '';
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;

    const updated = await menuService.updateFoodItem(id, userCollegeId, isSuperAdmin, req.body);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Food item updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.role !== UserRole.KITCHEN_STAFF && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Forbidden: Only Kitchen Staff and Admins can update inventory stock.');
    }

    const id = String(req.params.id);
    const rawStock = req.body.stock !== undefined ? req.body.stock : req.body.availableQuantity;
    if (rawStock === undefined || typeof rawStock !== 'number') {
      throw new ApiError(400, 'Please provide a valid numeric stock value.');
    }

    const userCollegeId = req.user.collegeId || '';
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;

    const updated = await menuService.updateStock(id, userCollegeId, isSuperAdmin, rawStock);

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Inventory stock updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.role !== UserRole.KITCHEN_STAFF && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Forbidden: Only Kitchen Staff and Admins can toggle item availability.');
    }

    const id = String(req.params.id);
    const rawAvailable = req.body.available !== undefined ? req.body.available : req.body.isAvailable;
    if (rawAvailable === undefined || typeof rawAvailable !== 'boolean') {
      throw new ApiError(400, 'Please provide a valid boolean availability value.');
    }

    const userCollegeId = req.user.collegeId || '';
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;

    const updated = await menuService.updateAvailability(id, userCollegeId, isSuperAdmin, rawAvailable);

    res.status(200).json({
      success: true,
      data: updated,
      message: `Food item marked as ${rawAvailable ? 'available' : 'sold out'}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFood = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (req.user.role !== UserRole.KITCHEN_STAFF && req.user.role !== UserRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Forbidden: Only Kitchen Staff and Admins can delete food items.');
    }

    const id = String(req.params.id);
    const userCollegeId = req.user.collegeId || '';
    const isSuperAdmin = req.user.role === UserRole.SUPER_ADMIN;

    const result = await menuService.deleteFoodItem(id, userCollegeId, isSuperAdmin);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
