import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Search, Download, Printer, X, CreditCard, User, Calendar, Tag, FileText } from 'lucide-react';
import api from '../../services/api.service';
import { format } from 'date-fns';

interface Payment {
    payment_id: number;
    user_id: number;
    full_name: string;
    email: string;
    amount: number;
    type: string;
    method: string;
    status: string;
    transaction_date: string;
    notes: string;
}

const PaymentLedger: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState<'SUBSCRIPTION' | 'PENALTY'>('SUBSCRIPTION');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
    const [settings, setSettings] = useState({
        library_name: 'Library Management System',
        library_logo: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/admin/settings');
            if (response.data.settings) {
                setSettings({
                    library_name: response.data.settings.library_name || 'Library Management System',
                    library_logo: response.data.settings.library_logo || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await api.get('/admin/payments');
            setPayments(response.data.payments);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setFetching(false);
        }
    };

    const handleCashPayment = async () => {
        if (!selectedUser || !amount) {
            alert('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/payments/cash', {
                user_id: parseInt(selectedUser),
                amount: parseFloat(amount),
                type: paymentType,
                notes
            });
            alert('Payment recorded successfully!');
            // Reset form
            setSelectedUser('');
            setAmount('');
            setNotes('');
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(p =>
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.payment_id.toString().includes(searchQuery)
    );

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Payment & Ledger</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage payments and monitor system revenue
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Payment Section */}
                <div className="lg:col-span-1">
                    <div className="glass-card h-full">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <DollarSign className="text-green-500" />
                            Accept Cash Payment
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">User ID</label>
                                <input
                                    type="number"
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Enter user ID"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="input-field w-full"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Payment Type</label>
                                <select
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value as 'SUBSCRIPTION' | 'PENALTY')}
                                    className="input-field w-full"
                                >
                                    <option value="SUBSCRIPTION">Subscription</option>
                                    <option value="PENALTY">Penalty</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="input-field w-full h-24 resize-none"
                                    placeholder="Add transaction notes..."
                                />
                            </div>
                            <button
                                onClick={handleCashPayment}
                                disabled={loading}
                                className="btn-primary w-full disabled:opacity-50 mt-4 h-12 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <DollarSign size={18} />
                                        Record Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="lg:col-span-2">
                    <div className="glass-card h-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-xl font-semibold">Payment History</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by user or ID..."
                                    className="input-field pl-10 w-full md:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100 dark:border-gray-800">
                                        <th className="pb-4 font-semibold text-sm text-gray-500">Transaction</th>
                                        <th className="pb-4 font-semibold text-sm text-gray-500">User</th>
                                        <th className="pb-4 font-semibold text-sm text-gray-500">Amount</th>
                                        <th className="pb-4 font-semibold text-sm text-gray-500">Status</th>
                                        <th className="pb-4 font-semibold text-sm text-gray-500">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {fetching ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="py-4 h-12 bg-gray-100/50 dark:bg-gray-800/20 rounded-lg"></td>
                                            </tr>
                                        ))
                                    ) : filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-500">
                                                No payments found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <tr key={payment.payment_id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">#{payment.payment_id}</span>
                                                        <span className="text-xs text-gray-400">
                                                            {payment.transaction_date ? format(new Date(payment.transaction_date), 'MMM dd, yyyy') : 'Recently'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{payment.full_name}</span>
                                                        <span className="text-xs text-gray-400">{payment.type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <span className="font-bold text-sm text-primary-500">
                                                        ₹{payment.amount}
                                                    </span>
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${payment.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedReceipt(payment)}
                                                        className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 rounded-lg transition-colors"
                                                        title="View Receipt"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Modal */}
            <AnimatePresence>
                {selectedReceipt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReceipt(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 print:shadow-none print:w-full print:max-w-none"
                        >
                            {/* Receipt Content */}
                            <div className="p-8 print:p-0">
                                <div className="flex justify-between items-start mb-8 print:hidden">
                                    <div className="flex-shrink-0">
                                        {settings.library_logo ? (
                                            <img src={settings.library_logo} alt="Logo" className="h-12 w-auto object-contain" />
                                        ) : (
                                            <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl text-primary-500">
                                                <FileText size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedReceipt(null)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold mb-1">{settings.library_name}</h2>
                                    <p className="text-primary-500 dark:text-primary-400 font-bold mb-4">Payment Receipt</p>
                                    <p className="text-gray-500 text-xs">Transaction ID: #{selectedReceipt.payment_id}</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <User size={18} />
                                            <span className="text-sm">Paid By</span>
                                        </div>
                                        <span className="font-semibold">{selectedReceipt.full_name}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Calendar size={18} />
                                            <span className="text-sm">Date</span>
                                        </div>
                                        <span className="font-semibold">
                                            {selectedReceipt.transaction_date ? format(new Date(selectedReceipt.transaction_date), 'MMM dd, yyyy HH:mm') : 'Recently'}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Tag size={18} />
                                            <span className="text-sm">Description</span>
                                        </div>
                                        <span className="font-semibold capitalize">{selectedReceipt.type}</span>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <CreditCard size={18} />
                                            <span className="text-sm">Method</span>
                                        </div>
                                        <span className="font-semibold capitalize">{selectedReceipt.method}</span>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mt-8">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500 font-medium">Total Amount</span>
                                            <span className="text-3xl font-black text-primary-500">₹{selectedReceipt.amount}</span>
                                        </div>
                                    </div>

                                    {selectedReceipt.notes && (
                                        <div className="pt-4">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Notes</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{selectedReceipt.notes}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 flex gap-3 print:hidden">
                                    <button
                                        onClick={handlePrint}
                                        className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <Printer size={18} />
                                        Print
                                    </button>
                                    <button
                                        className="flex-1 h-12 rounded-xl bg-primary-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 shadow-lg shadow-primary-500/25 transition-all"
                                    >
                                        <Download size={18} />
                                        Download PDF
                                    </button>
                                </div>

                                <p className="text-center text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-widest">
                                    This is a computer generated receipt
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentLedger;
