import { Router } from 'express';
import healthRoutes from './health.routes.js';
import collegeRoutes from './college.routes.js';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import menuRoutes from './menu.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/colleges', collegeRoutes);
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/menu', menuRoutes);

export default router;
