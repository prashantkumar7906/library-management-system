import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { Subscription } from '../types';
import { logAudit } from '../services/audit.service';

export const getMySubscription = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const subscriptions = await query<Subscription[]>(
            `SELECT * FROM SUBSCRIPTIONS 
       WHERE user_id = ? AND status = 'ACTIVE' 
       ORDER BY end_date DESC LIMIT 1`,
            [req.user.userId]
        );

        if (subscriptions.length === 0) {
            res.status(404).json({ error: 'No active subscription found' });
            return;
        }

        res.status(200).json({ subscription: subscriptions[0] });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};

export const getAllMySubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const subscriptions = await query<Subscription[]>(
            `SELECT * FROM SUBSCRIPTIONS 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.status(200).json({ subscriptions });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};

export const stackSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { payment_id } = req.body;
        const user_id = req.user.userId;

        if (!payment_id) {
            res.status(400).json({ error: 'Payment ID is required' });
            return;
        }

        const result = await transaction(async (conn) => {
            // Verify payment is completed
            const [payments] = await conn.execute<any[]>(
                `SELECT * FROM PAYMENTS 
         WHERE payment_id = ? AND user_id = ? AND type = 'SUBSCRIPTION' AND status = 'COMPLETED'`,
                [payment_id, user_id]
            );

            if (payments.length === 0) {
                throw new Error('Valid payment not found');
            }

            const payment = payments[0];

            // Get current active subscription
            const [existingSubs] = await conn.execute<any[]>(
                `SELECT * FROM SUBSCRIPTIONS 
         WHERE user_id = ? AND status = 'ACTIVE' 
         ORDER BY end_date DESC LIMIT 1`,
                [user_id]
            );

            let startDate: Date;
            let stackedFrom = null;

            if (existingSubs.length > 0 && new Date(existingSubs[0].end_date) > new Date()) {
                // Stack from existing subscription
                startDate = new Date(existingSubs[0].end_date);
                startDate.setDate(startDate.getDate() + 1);
                stackedFrom = existingSubs[0].sub_id;
            } else {
                startDate = new Date();
            }

            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 3); // 3 months

            const [subResult] = await conn.execute<any>(
                `INSERT INTO SUBSCRIPTIONS (user_id, start_date, end_date, stacked_from, amount, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
                [user_id, startDate, endDate, stackedFrom, payment.amount, 'ACTIVE']
            );

            return { subId: subResult.insertId, startDate, endDate };
        });

        await logAudit({
            action: 'SUBSCRIPTION_STACKED',
            entityType: 'SUBSCRIPTION',
            entityId: result.subId,
            performedBy: user_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { payment_id }
        });

        res.status(201).json({
            message: 'Subscription stacked successfully',
            subscription: result
        });
    } catch (error: any) {
        console.error('Stack subscription error:', error);
        res.status(400).json({ error: error.message || 'Failed to stack subscription' });
    }
};

export const changeBatch = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { batch } = req.body;

        if (!batch || !['MORNING', 'EVENING'].includes(batch)) {
            res.status(400).json({ error: 'Valid batch (MORNING/EVENING) is required' });
            return;
        }

        await query(
            'UPDATE USERS SET batch = ? WHERE user_id = ?',
            [batch, req.user.userId]
        );

        await logAudit({
            action: 'BATCH_CHANGED',
            entityType: 'USER',
            entityId: req.user.userId,
            performedBy: req.user.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { new_batch: batch }
        });

        res.status(200).json({ message: 'Batch changed successfully' });
    } catch (error) {
        console.error('Change batch error:', error);
        res.status(500).json({ error: 'Failed to change batch' });
    }
};
