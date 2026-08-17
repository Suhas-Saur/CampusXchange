import { Router } from 'express';
import { getOrders, getOrderById, updateOrderStatus } from '../controllers/orders';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, updateOrderStatus);

export default router;
