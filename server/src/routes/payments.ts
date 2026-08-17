import { Router } from 'express';
import { createRazorpayOrder, verifyPayment, razorpayWebhook } from '../controllers/payments';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', razorpayWebhook);

export default router;
