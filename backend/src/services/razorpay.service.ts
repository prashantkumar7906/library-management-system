import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export const createOrder = async (amount: number, receipt: string) => {
    try {
        const options = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay create order error:', error);
        throw error;
    }
};

export const verifyPayment = (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string
): boolean => {
    try {
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const generatedSignature = crypto
            .createHmac('sha256', secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        return generatedSignature === razorpay_signature;
    } catch (error) {
        console.error('Razorpay verify payment error:', error);
        return false;
    }
};

export const getPaymentDetails = async (paymentId: string) => {
    try {
        const payment = await razorpay.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Razorpay get payment error:', error);
        throw error;
    }
};

export default razorpay;
