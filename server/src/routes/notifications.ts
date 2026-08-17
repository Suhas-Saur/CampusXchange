import { Router } from 'express';
import { getNotifications, markRead, deleteNotification } from '../controllers/notifications';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markRead);
router.delete('/:id', protect, deleteNotification);

export default router;
