import { Router } from 'express';
import {
    createRequest,
    getMyRequests,
    getAllRequests,
    updateRequestStatus,
    createMembershipRequest
} from '../controllers/request.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/membership', createMembershipRequest); // Public endpoint
router.post('/', authenticateToken, createRequest);
router.get('/my-requests', authenticateToken, getMyRequests);
router.get('/all', authenticateToken, requireAdmin, getAllRequests);
router.post('/update-status', authenticateToken, requireAdmin, updateRequestStatus);

export default router;
