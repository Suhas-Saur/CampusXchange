import { Router } from 'express';
import { getStats, getUsers, updateUserStatus, getReports, updateReportStatus } from '../controllers/admin';
import { protect, admin } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/reports', getReports);
router.put('/reports/:id/status', updateReportStatus);

export default router;
