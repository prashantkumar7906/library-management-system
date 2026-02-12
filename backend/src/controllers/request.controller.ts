import { Request, Response } from 'express';
import { query } from '../config/database';
import { Request as RequestType } from '../types';
import { logAudit } from '../services/audit.service';

export const createRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { type, subject, description, details } = req.body;
        const user_id = req.user.userId;

        if (!type || !subject || !description) {
            res.status(400).json({ error: 'Type, subject, and description are required' });
            return;
        }

        const validTypes = ['BOOK_REQUEST', 'SUBSCRIPTION_EXTENSION', 'PENALTY_WAIVER', 'MEMBERSHIP_REGISTRATION', 'BATCH_CHANGE', 'OTHER'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ error: 'Invalid request type' });
            return;
        }

        const result = await query<any>(
            `INSERT INTO REQUESTS (user_id, type, subject, description, details, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, type, subject, description, details ? JSON.stringify(details) : null, 'PENDING']
        );

        const requestId = result.insertId;

        await logAudit({
            action: 'REQUEST_CREATED',
            entityType: 'REQUEST',
            entityId: requestId,
            performedBy: user_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { type, subject }
        });

        res.status(201).json({
            message: 'Request created successfully',
            requestId
        });
    } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
};

export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const requests = await query<RequestType[]>(
            `SELECT * FROM REQUESTS 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { status } = req.query;

        let sql = `SELECT r.*, u.full_name, u.email 
               FROM REQUESTS r 
               LEFT JOIN USERS u ON r.user_id = u.user_id`;
        const params: any[] = [];

        if (status) {
            sql += ' WHERE r.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY r.created_at DESC';

        const requests = await query<any[]>(sql, params);

        res.status(200).json({ requests });
    } catch (error) {
        console.error('Get all requests error:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};

export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { request_id, status, admin_response } = req.body;

        if (!request_id || !status) {
            res.status(400).json({ error: 'Request ID and status are required' });
            return;
        }

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
            return;
        }

        await query(
            `UPDATE REQUESTS 
       SET status = ?, admin_response = ?, admin_id = ? 
       WHERE request_id = ?`,
            [status, admin_response || null, req.user.userId, request_id]
        );

        await logAudit({
            action: 'REQUEST_UPDATED',
            entityType: 'REQUEST',
            entityId: request_id,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { status, admin_response }
        });

        res.status(200).json({ message: 'Request updated successfully' });
    } catch (error) {
        console.error('Update request error:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
};
export const createMembershipRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { full_name, email, phone, batch, subject, description } = req.body;

        if (!full_name || !email || !phone || !subject || !description) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const result = await query<any>(
            `INSERT INTO REQUESTS (type, subject, description, status) 
             VALUES (?, ?, ?, ?)`,
            ['MEMBERSHIP_REGISTRATION', subject, `${description} | Contact: ${full_name} (${email}, ${phone}) | Batch: ${batch}`, 'PENDING']
        );

        const requestId = result.insertId;

        res.status(201).json({
            message: 'Membership request submitted successfully',
            requestId
        });
    } catch (error) {
        console.error('Create membership request error:', error);
        res.status(500).json({ error: 'Failed to submit membership request' });
    }
};
