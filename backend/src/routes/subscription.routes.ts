import { Router } from 'express';
import {
    getMySubscription,
    getAllMySubscriptions,
    stackSubscription,
    changeBatch
} from '../controllers/subscription.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/current', authenticateToken, getMySubscription);
router.get('/all', authenticateToken, getAllMySubscriptions);
router.post('/stack', authenticateToken, stackSubscription);
router.post('/change-batch', authenticateToken, changeBatch);

export default router;
