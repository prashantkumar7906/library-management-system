
export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const requests = await query<any[]>(
            `SELECT r.*, u.full_name, u.email 
             FROM REQUESTS r 
             JOIN USERS u ON r.user_id = u.user_id
             ORDER BY r.created_at DESC`
        );

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

        await query(
            'UPDATE REQUESTS SET status = ?, admin_id = ? WHERE request_id = ?',
            ['APPROVED', req.user.userId, requestId]
        );

        await logAudit({
            action: 'REQUEST_APPROVED',
            entityType: 'REQUEST',
            entityId: requestId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json({ message: 'Request approved successfully' });
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

        await query(
            'UPDATE REQUESTS SET status = ?, admin_response = ?, admin_id = ? WHERE request_id = ?',
            ['REJECTED', reason || null, req.user.userId, requestId]
        );

        await logAudit({
            action: 'REQUEST_REJECTED',
            entityType: 'REQUEST',
            entityId: requestId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { reason }
        });

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ error: 'Failed to reject request' });
    }
};
