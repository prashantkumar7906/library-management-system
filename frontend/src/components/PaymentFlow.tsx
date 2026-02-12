import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.service';
import { pageVariants, stepperVariants, svgDrawVariants } from '../animations/variants';

const PaymentFlow: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [paymentType, setPaymentType] = useState<'SUBSCRIPTION' | 'PENALTY'>('SUBSCRIPTION');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'RAZORPAY'>('CASH');
    const [amount, setAmount] = useState(500);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCashPayment = async () => {
        setLoading(true);
        setError('');
        try {
            // For cash payment, user submits request and admin approves
            await api.post('/requests', {
                type: paymentType === 'SUBSCRIPTION' ? 'SUBSCRIPTION_EXTENSION' : 'PENALTY_WAIVER',
                subject: `${paymentType} Payment Request - Cash`,
                description: `Requesting ${paymentType.toLowerCase()} payment approval for ₹${amount}. Will pay in cash to admin.`
            });
            setStep(3);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to submit payment request');
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        setError('');

        // Check if Razorpay SDK is loaded
        // @ts-ignore
        if (typeof window.Razorpay === 'undefined') {
            setError('Razorpay SDK not loaded. Please refresh the page or use cash payment.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/payments/create-order', {
                amount,
                type: paymentType,
            });

            const { orderId, razorpayKeyId } = response.data;

            // Initialize Razorpay
            const options = {
                key: razorpayKeyId,
                amount: amount * 100,
                currency: 'INR',
                name: 'Library Management',
                description: `${paymentType} Payment`,
                order_id: orderId,
                handler: async (response: any) => {
                    try {
                        await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        setStep(3);
                    } catch (error) {
                        setError('Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            // @ts-ignore
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.message || 'Payment failed';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
        if (paymentMethod === 'CASH') {
            handleCashPayment();
        } else {
            handleRazorpayPayment();
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-light-bg dark:bg-dark-bg"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Header */}
            <div className="bg-white dark:bg-dark-card shadow-sm border-b border-light-border dark:border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft />
                        </button>
                        <h1 className="text-2xl font-bold">Payment</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <motion.div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${step >= s
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                                variants={stepperVariants}
                                animate={step >= s ? 'active' : 'inactive'}
                            >
                                {step > s ? <Check size={20} /> : s}
                            </motion.div>
                            {s < 3 && (
                                <div
                                    className={`w-24 h-1 ${step > s ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Step Content */}
                <div className="glass-card">
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">Select Payment Type</h2>
                            <div className="space-y-4">
                                <motion.button
                                    onClick={() => {
                                        setPaymentType('SUBSCRIPTION');
                                        setAmount(500);
                                    }}
                                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${paymentType === 'SUBSCRIPTION'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <h3 className="font-semibold mb-2">Subscription</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        3 months library access - ₹500
                                    </p>
                                </motion.button>
                                <motion.button
                                    onClick={() => {
                                        setPaymentType('PENALTY');
                                        setAmount(0);
                                    }}
                                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${paymentType === 'PENALTY'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <h3 className="font-semibold mb-2">Penalty Payment</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Pay overdue book penalties
                                    </p>
                                    {paymentType === 'PENALTY' && (
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            placeholder="Enter amount"
                                            className="input-field mt-4"
                                            min="0"
                                        />
                                    )}
                                </motion.button>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={paymentType === 'PENALTY' && amount === 0}
                                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold mb-6">Payment Method</h2>

                            {/* Payment Summary */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
                                <div className="flex justify-between mb-2">
                                    <span>Type:</span>
                                    <span className="font-semibold">{paymentType}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold">
                                    <span>Total:</span>
                                    <span>₹{amount}</span>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="space-y-4 mb-6">
                                <motion.button
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`w-full p-6 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${paymentMethod === 'CASH'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Banknote className="text-primary-500" size={32} />
                                    <div>
                                        <h3 className="font-semibold mb-1">Cash Payment</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Pay in cash to library admin
                                        </p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    onClick={() => setPaymentMethod('RAZORPAY')}
                                    className={`w-full p-6 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${paymentMethod === 'RAZORPAY'
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <CreditCard className="text-primary-500" size={32} />
                                    <div>
                                        <h3 className="font-semibold mb-1">Online Payment</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Pay via Razorpay (Card/UPI/Netbanking)
                                        </p>
                                    </div>
                                </motion.button>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : paymentMethod === 'CASH' ? 'Submit Request' : 'Pay Now'}
                            </button>
                            <button onClick={() => setStep(1)} className="btn-secondary w-full mt-4">
                                Back
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center">
                            <motion.svg
                                className="w-24 h-24 mx-auto mb-6 text-green-500"
                                viewBox="0 0 50 50"
                            >
                                <motion.circle
                                    cx="25"
                                    cy="25"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    variants={svgDrawVariants}
                                    initial="hidden"
                                    animate="visible"
                                />
                                <motion.path
                                    d="M15 25 L22 32 L35 18"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    variants={svgDrawVariants}
                                    initial="hidden"
                                    animate="visible"
                                />
                            </motion.svg>
                            <h2 className="text-2xl font-bold mb-2">
                                {paymentMethod === 'CASH' ? 'Request Submitted!' : 'Payment Successful!'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {paymentMethod === 'CASH'
                                    ? 'Your payment request has been submitted. Please pay cash to the admin.'
                                    : 'Your payment has been processed successfully.'}
                            </p>
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentFlow;
