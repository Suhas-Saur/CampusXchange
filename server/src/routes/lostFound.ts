import { Router } from 'express';
import {
  getLostItems,
  getLostItemById,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundItem,
  deleteFoundItem
} from '../controllers/lostFound';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Lost routes
router.get('/lost', protect, getLostItems);
router.get('/lost/:id', protect, getLostItemById);
router.post('/lost', protect, upload.array('images', 5), createLostItem);
router.put('/lost/:id', protect, upload.array('images', 5), updateLostItem);
router.delete('/lost/:id', protect, deleteLostItem);

// Found routes
router.get('/found', protect, getFoundItems);
router.get('/found/:id', protect, getFoundItemById);
router.post('/found', protect, upload.array('images', 5), createFoundItem);
router.put('/found/:id', protect, upload.array('images', 5), updateFoundItem);
router.delete('/found/:id', protect, deleteFoundItem);

export default router;
