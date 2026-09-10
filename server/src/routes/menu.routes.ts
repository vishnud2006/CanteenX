import { Router } from 'express';
import {
  getMenu,
  getFoodItem,
  createFood,
  updateFood,
  updateStock,
  updateAvailability,
  deleteFood,
} from '../controllers/menu.controller.js';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
} from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// Student & Public Read Endpoints
router.get('/', optionalAuthenticateToken, getMenu);
router.get('/:id', optionalAuthenticateToken, getFoodItem);

// Kitchen Staff & Super Admin Mutation Endpoints
router.post(
  '/',
  authenticateToken,
  requireRole(UserRole.KITCHEN_STAFF, UserRole.SUPER_ADMIN),
  createFood
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(UserRole.KITCHEN_STAFF, UserRole.SUPER_ADMIN),
  updateFood
);

router.patch(
  '/:id/stock',
  authenticateToken,
  requireRole(UserRole.KITCHEN_STAFF, UserRole.SUPER_ADMIN),
  updateStock
);

router.patch(
  '/:id/availability',
  authenticateToken,
  requireRole(UserRole.KITCHEN_STAFF, UserRole.SUPER_ADMIN),
  updateAvailability
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(UserRole.KITCHEN_STAFF, UserRole.SUPER_ADMIN),
  deleteFood
);

export default router;

