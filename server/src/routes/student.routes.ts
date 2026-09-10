import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/student.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All student routes require authentication and STUDENT (or SUPER_ADMIN) role
router.get('/me', authenticateToken, requireRole(UserRole.STUDENT, UserRole.SUPER_ADMIN), getProfile);
router.put('/me', authenticateToken, requireRole(UserRole.STUDENT, UserRole.SUPER_ADMIN), updateProfile);

export default router;

