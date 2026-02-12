import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    getAllIssuedBooks,
    getAuditLogsAdmin,
    getAllRequests,
    approveRequest,
    rejectRequest,
    createUser,
    updateUser,
    getSystemSettings,
    updateSystemSettings,
    getAllPayments,
    getPaymentReceipt,
    resetUserPassword
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.post('/users', authenticateToken, requireAdmin, createUser);
router.put('/users/:id', authenticateToken, requireAdmin, updateUser);
router.post('/users/status', authenticateToken, requireAdmin, updateUserStatus);
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, resetUserPassword);
router.get('/settings', authenticateToken, getSystemSettings); // Public within auth
router.post('/settings', authenticateToken, requireAdmin, updateSystemSettings);
router.get('/issued-books', authenticateToken, requireAdmin, getAllIssuedBooks);
router.get('/audit-logs', authenticateToken, requireAdmin, getAuditLogsAdmin);
router.get('/requests', authenticateToken, requireAdmin, getAllRequests);
router.post('/requests/:id/approve', authenticateToken, requireAdmin, approveRequest);
router.post('/requests/:id/reject', authenticateToken, requireAdmin, rejectRequest);
router.get('/payments', authenticateToken, requireAdmin, getAllPayments);
router.get('/payments/:id/receipt', authenticateToken, requireAdmin, getPaymentReceipt);

export default router;
