import { Router } from 'express';
import taskRoutes from './taskRoutes';
import columnRoutes from './columnRoutes';

const router = Router();

router.use('/tasks', taskRoutes);
router.use('/columns', columnRoutes);

export default router; 