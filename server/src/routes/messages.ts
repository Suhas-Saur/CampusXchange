import { Router } from 'express';
import { getChatsList, getMessagesWithUser, sendMessage } from '../controllers/messages';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/chats', protect, getChatsList);
router.get('/:userId', protect, getMessagesWithUser);
router.post('/', protect, sendMessage);

export default router;
