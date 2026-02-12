import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { query as dbQuery } from '../config/database';
import { logAudit as auditLog } from '../services/audit.service';
import { getAuditLogs as fetchAuditLogs } from '../services/audit.service';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        // Get total users
        const [{ total_users }] = await dbQuery<any[]>(
            "SELECT COUNT(*) as total_users FROM USERS WHERE role = 'MEMBER'"
        );

        // Get total books
        const [totalBooksResult] = await dbQuery<any[]>('SELECT COUNT(*) as count FROM BOOKS');

        // Get total users
        const [totalUsersResult] = await dbQuery<any[]>('SELECT COUNT(*) as count FROM USERS');
        const [activeUsersResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM USERS WHERE status = ?',
            ['ACTIVE']
        );

        // Get pending requests
        const [pendingRequestsResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM REQUESTS WHERE status = ?',
            ['PENDING']
        );

        // Get issued and overdue books
        const [issuedBooksResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM ISSUED_BOOKS WHERE status IN (?, ?)',
            ['ISSUED', 'OVERDUE']
        );
        const [overdueBooksResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM ISSUED_BOOKS WHERE status = ?',
            ['OVERDUE']
        );

        // Get today's revenue
        const [todayRevenueResult] = await dbQuery<any[]>(
            `SELECT COALESCE(SUM(amount), 0) as revenue 
             FROM PAYMENTS 
             WHERE status = ? AND DATE(transaction_date) = CURDATE()`,
            ['COMPLETED']
        );

        // Get outstanding penalties
        const [penaltiesResult] = await dbQuery<any[]>(
            `SELECT COALESCE(SUM(penalty_amount), 0) as penalties 
             FROM ISSUED_BOOKS 
             WHERE penalty_amount > 0 AND status != ?`,
            ['RETURNED']
        );

        // Get batch distribution
        const [morningBatchResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM USERS WHERE batch = ? AND status = ?',
            ['MORNING', 'ACTIVE']
        );
        const [eveningBatchResult] = await dbQuery<any[]>(
            'SELECT COUNT(*) as count FROM USERS WHERE batch = ? AND status = ?',
            ['EVENING', 'ACTIVE']
        );

        res.status(200).json({
            totalUsers: totalUsersResult.count,
            totalBooks: totalBooksResult.count,
            activeUsers: activeUsersResult.count,
            pendingRequests: pendingRequestsResult.count,
            issuedBooks: issuedBooksResult.count,
            overdueBooks: overdueBooksResult.count,
            todayRevenue: parseFloat(todayRevenueResult.revenue) || 0,
            outstandingPenalties: parseFloat(penaltiesResult.penalties) || 0,
            batchDistribution: {
                morning: morningBatchResult.count,
                evening: eveningBatchResult.count
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const users = await dbQuery<any[]>(
            `SELECT user_id, full_name, email, phone, role, batch, time_slot, status, created_at 
       FROM USERS 
       ORDER BY created_at DESC`
        );

        res.status(200).json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { user_id, status } = req.body;

        if (!user_id || !status) {
            res.status(400).json({ error: 'User ID and status are required' });
            return;
        }

        if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        await dbQuery(
            'UPDATE USERS SET status = ? WHERE user_id = ?',
            [status, user_id]
        );

        await auditLog({
            action: 'USER_STATUS_UPDATED',
            entityType: 'USER',
            entityId: user_id,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: { new_status: status }
        });

        res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { full_name, email, phone, password, role, batch } = req.body;

        if (!full_name || !email || !password || !role) {
            res.status(400).json({ error: 'Name, email, password, and role are required' });
            return;
        }

        // Check if email already exists
        const existingUsers = await dbQuery<any[]>(
            'SELECT * FROM USERS WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await dbQuery<any>(
            'INSERT INTO USERS (full_name, email, phone, password_hash, role, batch, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [full_name, email, phone || null, password_hash, role, batch || null, 'ACTIVE']
        );

        const userId = result.insertId;

        await auditLog({
            action: 'USER_CREATED_BY_ADMIN',
            entityType: 'USER',
            entityId: userId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: { email, role, batch }
        });

        res.status(201).json({
            message: 'User created successfully',
            userId
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const userId = parseInt(req.params.id);
        const { full_name, email, phone, role, batch, time_slot } = req.body;

        if (!full_name || !email || !role) {
            res.status(400).json({ error: 'Name, email, and role are required' });
            return;
        }

        await dbQuery(
            'UPDATE USERS SET full_name = ?, email = ?, phone = ?, role = ?, batch = ?, time_slot = ? WHERE user_id = ?',
            [full_name, email, phone || null, role, batch || null, time_slot || null, userId]
        );

        await auditLog({
            action: 'USER_UPDATED_BY_ADMIN',
            entityType: 'USER',
            entityId: userId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: { full_name, email, role, batch, time_slot }
        });

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const userId = parseInt(req.params.id);
        const { password } = req.body;

        if (!password) {
            res.status(400).json({ error: 'New password is required' });
            return;
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        await dbQuery(
            'UPDATE USERS SET password_hash = ? WHERE user_id = ?',
            [password_hash, userId]
        );

        await auditLog({
            action: 'USER_PASSWORD_RESET_BY_ADMIN',
            entityType: 'USER',
            entityId: userId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(200).json({ message: 'User password reset successfully' });
    } catch (error) {
        console.error('Reset user password error:', error);
        res.status(500).json({ error: 'Failed to reset user password' });
    }
};

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await dbQuery<any[]>('SELECT setting_key, setting_value FROM SYSTEM_SETTINGS');
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.setting_key] = curr.setting_value;
            return acc;
        }, {});
        res.status(200).json({ settings: settingsMap });
    } catch (error) {
        console.error('Get system settings error:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { settings } = req.body; // Expecting { key: value, ... }

        if (!settings || typeof settings !== 'object') {
            res.status(400).json({ error: 'Invalid settings format' });
            return;
        }

        for (const [key, value] of Object.entries(settings)) {
            await dbQuery(
                'INSERT INTO SYSTEM_SETTINGS (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP',
                [key, value, value]
            );
        }

        await auditLog({
            action: 'SYSTEM_SETTINGS_UPDATED',
            entityType: 'SYSTEM',
            entityId: 0,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: settings
        });

        res.status(200).json({ message: 'System settings updated successfully' });
    } catch (error) {
        console.error('Update system settings error:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

export const getAllIssuedBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const issuedBooks = await dbQuery<any[]>(
            `SELECT ib.*, u.full_name, u.email, b.title, b.author 
       FROM ISSUED_BOOKS ib 
       JOIN USERS u ON ib.user_id = u.user_id 
       JOIN BOOKS b ON ib.book_id = b.book_id 
       WHERE ib.status IN ('ISSUED', 'OVERDUE')
       ORDER BY ib.due_date ASC`
        );

        res.status(200).json({ issuedBooks });
    } catch (error) {
        console.error('Get issued books error:', error);
        res.status(500).json({ error: 'Failed to fetch issued books' });
    }
};

export const getAuditLogsAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { limit = '10', offset = '0' } = req.query;
        const limitInt = parseInt(limit as string) || 10;
        const offsetInt = parseInt(offset as string) || 0;

        const logs = await dbQuery<any[]>(
            `SELECT al.*, u.full_name as user_name 
             FROM AUDIT_LOGS al 
             LEFT JOIN USERS u ON al.performed_by = u.user_id 
             ORDER BY al.created_at DESC 
             LIMIT ${limitInt} OFFSET ${offsetInt}`
        );

        res.status(200).json({ logs });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs', details: (error as Error).message });
    }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        let sql = `SELECT r.*, COALESCE(u.full_name, 'Public Applicant') as full_name, COALESCE(u.email, 'Contact in description') as email 
               FROM REQUESTS r 
               LEFT JOIN USERS u ON r.user_id = u.user_id
               ORDER BY r.created_at DESC`;
        const requests = await dbQuery<any[]>(sql);

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

export const approveRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const requestId = parseInt(req.params.id);

        // Fetch request details to check for side effects
        const requests = await dbQuery<any[]>(
            'SELECT * FROM REQUESTS WHERE request_id = ?',
            [requestId]
        );

        if (requests.length === 0) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }

        const request = requests[0];

        // Handle side effects for BATCH_CHANGE
        if (request.type === 'BATCH_CHANGE' && request.details) {
            const details = typeof request.details === 'string'
                ? JSON.parse(request.details)
                : request.details;

            if (details.new_batch || details.new_time_slot) {
                await dbQuery(
                    'UPDATE USERS SET batch = ?, time_slot = ? WHERE user_id = ?',
                    [
                        details.new_batch || null,
                        details.new_time_slot || null,
                        request.user_id
                    ]
                );

                await auditLog({
                    action: 'USER_BATCH_UPDATED_VIA_REQUEST',
                    entityType: 'USER',
                    entityId: request.user_id,
                    performedBy: req.user.userId,
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent'),
                    details: { ...details, request_id: requestId }
                });
            }
        }

        await dbQuery(
            'UPDATE REQUESTS SET status = ?, admin_id = ? WHERE request_id = ?',
            ['APPROVED', req.user.userId, requestId]
        );

        await auditLog({
            action: 'REQUEST_APPROVED',
            entityType: 'REQUEST',
            entityId: requestId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(200).json({ message: 'Request approved successfully and changes applied' });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ error: 'Failed to approve request' });
    }
};

export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const requestId = parseInt(req.params.id);
        const { reason } = req.body;

        await dbQuery(
            'UPDATE REQUESTS SET status = ?, admin_response = ?, admin_id = ? WHERE request_id = ?',
            ['REJECTED', reason || null, req.user.userId, requestId]
        );

        await auditLog({
            action: 'REQUEST_REJECTED',
            entityType: 'REQUEST',
            entityId: requestId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: { reason }
        });

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
};
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const payments = await dbQuery<any[]>(
            `SELECT p.*, u.full_name, u.email 
             FROM PAYMENTS p 
             JOIN USERS u ON p.user_id = u.user_id 
             ORDER BY p.transaction_date DESC`
        );

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};

export const getPaymentReceipt = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { id } = req.params;

        const payments = await dbQuery<any[]>(
            `SELECT p.*, u.full_name, u.email, u.phone, 
                    admin.full_name as admin_name
             FROM PAYMENTS p 
             JOIN USERS u ON p.user_id = u.user_id 
             LEFT JOIN USERS admin ON p.admin_processed_by = admin.user_id
             WHERE p.payment_id = ?`,
            [id]
        );

        if (payments.length === 0) {
            res.status(404).json({ error: 'Payment record not found' });
            return;
        }

        res.status(200).json({ receipt: payments[0] });
    } catch (error) {
        console.error('Get payment receipt error:', error);
        res.status(500).json({ error: 'Failed to fetch receipt data' });
    }
};
