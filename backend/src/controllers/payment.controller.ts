import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { Payment } from '../types';
import { logAudit } from '../services/audit.service';
import { createOrder, verifyPayment } from '../services/razorpay.service';

export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const { amount, type } = req.body;
        const user_id = req.user.userId;

        if (!amount || !type) {
            res.status(400).json({ error: 'Amount and type are required' });
            return;
        }

        if (!['SUBSCRIPTION', 'PENALTY'].includes(type)) {
            res.status(400).json({ error: 'Invalid payment type' });
            return;
        }

        // Create Razorpay order
        const receipt = `${type}_${user_id}_${Date.now()}`;
        const order = await createOrder(amount, receipt);

        // Save payment record
        const result = await query<any>(
            `INSERT INTO PAYMENTS (user_id, amount, type, method, razorpay_order_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [user_id, amount, type, 'RAZORPAY', order.id, 'PENDING']
        );

        const paymentId = result.insertId;

        res.status(201).json({
            paymentId,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create payment order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

export const verifyPaymentWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ error: 'Missing payment verification data' });
            return;
        }

        // Verify signature
        const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            res.status(400).json({ error: 'Invalid payment signature' });
            return;
        }

        await transaction(async (conn) => {
            // Update payment record
            await conn.query(
                `UPDATE PAYMENTS 
                 SET razorpay_payment_id = ?, razorpay_signature = ?, status = ? 
                 WHERE razorpay_order_id = ?`,
                [razorpay_payment_id, razorpay_signature, 'COMPLETED', razorpay_order_id]
            );

            // Get payment details
            const [payments] = await conn.execute<any[]>(
                'SELECT * FROM PAYMENTS WHERE razorpay_order_id = ?',
                [razorpay_order_id]
            );

            if (payments.length > 0) {
                const payment = payments[0];

                await logAudit({
                    action: 'PAYMENT_COMPLETED',
                    entityType: 'PAYMENT',
                    entityId: payment.payment_id,
                    performedBy: payment.user_id,
                    ipAddress: req.ip,
                    userAgent: req.headers['user-agent'],
                    details: { amount: payment.amount, type: payment.type }
                });

                // If subscription payment, create/stack subscription
                if (payment.type === 'SUBSCRIPTION') {
                    // Check for existing active subscription to stack
                    const [existingSubs] = await conn.execute<any[]>(
                        `SELECT * FROM SUBSCRIPTIONS 
                         WHERE user_id = ? AND status = 'ACTIVE' 
                         ORDER BY end_date DESC LIMIT 1`,
                        [payment.user_id]
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
                    endDate.setMonth(endDate.getMonth() + 3); // 3-month subscription

                    await conn.query(
                        `INSERT INTO SUBSCRIPTIONS (user_id, start_date, end_date, stacked_from, amount, status) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [payment.user_id, startDate, endDate, stackedFrom, payment.amount, 'ACTIVE']
                    );
                }
            }
        });

        res.status(200).json({ message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

export const acceptCashPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }

        const { user_id, amount, type, notes } = req.body;
        const admin_id = req.user.userId;

        if (!user_id || !amount || !type) {
            res.status(400).json({ error: 'User ID, amount, and type are required' });
            return;
        }

        const result = await transaction(async (conn) => {
            // Insert payment record
            const [paymentResult] = await conn.execute<any>(
                `INSERT INTO PAYMENTS (user_id, amount, type, method, admin_processed_by, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user_id, amount, type, 'CASH', admin_id, 'COMPLETED', notes || null]
            );

            const paymentId = paymentResult.insertId;

            // If subscription payment, create subscription
            if (type === 'SUBSCRIPTION') {
                // Check for existing active subscription to stack
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

                await conn.query(
                    `INSERT INTO SUBSCRIPTIONS (user_id, start_date, end_date, stacked_from, amount, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [user_id, startDate, endDate, stackedFrom, amount, 'ACTIVE']
                );
            }

            return paymentId;
        });

        await logAudit({
            action: 'CASH_PAYMENT_ACCEPTED',
            entityType: 'PAYMENT',
            entityId: result,
            performedBy: admin_id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            details: { user_id, amount, type }
        });

        res.status(201).json({
            message: 'Cash payment accepted successfully',
            paymentId: result
        });
    } catch (error: any) {
        console.error('Accept cash payment error:', error);
        res.status(500).json({ error: error.message || 'Failed to accept cash payment' });
    }
};

export const getMyPayments = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const payments = await query<Payment[]>(
            `SELECT * FROM PAYMENTS 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC`,
            [req.user.userId]
        );

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
};
