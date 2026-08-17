import { Router } from 'express';
import { createReport } from '../controllers/reports';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, createReport);

export default router;
