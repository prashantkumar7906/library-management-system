import { Router } from 'express';
import {
    createPaymentOrder,
    verifyPaymentWebhook,
    acceptCashPayment,
    getMyPayments
} from '../controllers/payment.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', verifyPaymentWebhook);
router.post('/cash', authenticateToken, requireAdmin, acceptCashPayment);
router.get('/my-payments', authenticateToken, getMyPayments);

export default router;
