import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Calendar, DollarSign, LogOut, Moon, Sun, BookOpen, User, RotateCcw, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.service';
import { IssuedBook, Subscription } from '../types';
import { pageVariants, staggerContainer, cardHoverVariants } from '../animations/variants';
import LogoutPortal from './LogoutPortal';
import BatchChangeModal from './BatchChangeModal';

const Dashboard: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [showLogoutPortal, setShowLogoutPortal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [booksRes, subRes] = await Promise.all([
                api.get('/issues/my-books'),
                api.get('/subscriptions/current').catch(() => ({ data: { subscription: null } })),
            ]);
            setIssuedBooks(booksRes.data.issuedBooks || []);
            setSubscription(subRes.data.subscription);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysRemaining = () => {
        if (!subscription) return 0;
        const endDate = new Date(subscription.end_date);
        const today = new Date();
        const diff = endDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const handleReturnBook = async (issueId: number) => {
        if (!window.confirm('Are you sure you want to return this book?')) return;
        try {
            const response = await api.post('/issues/return', { issue_id: issueId });
            if (response.data.penaltyAmount > 0) {
                alert(`Book returned. A penalty of ₹${response.data.penaltyAmount} has been applied for late return.`);
            } else {
                alert('Book returned successfully!');
            }
            fetchDashboardData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to return book');
        }
    };

    if (showLogoutPortal) {
        return <LogoutPortal />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-purple-500 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Dashboard</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Welcome back, {user?.full_name}!
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <motion.button
                                onClick={toggleTheme}
                                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </motion.button>
                            <motion.button
                                onClick={() => setShowLogoutPortal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {/* Subscription Card */}
                    <motion.div
                        className="glass-card"
                        variants={cardHoverVariants}
                        whileHover="hover"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Subscription</h3>
                            <Calendar className="text-primary-500" />
                        </div>
                        {subscription ? (
                            <>
                                <div className="text-3xl font-bold mb-2">{getDaysRemaining()} days</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Valid until {new Date(subscription.end_date).toLocaleDateString()}
                                </p>

                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-light-border dark:border-dark-border mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Batch</span>
                                        <button
                                            onClick={() => setShowBatchModal(true)}
                                            className="text-primary-500 text-xs font-bold hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                    <p className="font-bold flex items-center gap-2">
                                        <Users size={16} className="text-primary-500" />
                                        {user?.batch || 'Not Assigned'}
                                    </p>
                                    {user?.time_slot && (
                                        <p className="text-xs text-gray-500 mt-1 ml-6">{user.time_slot}</p>
                                    )}
                                </div>

                                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(getDaysRemaining() / 90) * 100}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">No active subscription</p>
                                <button
                                    onClick={() => navigate('/payment')}
                                    className="btn-primary w-full"
                                >
                                    Subscribe Now
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Issued Books Card */}
                    <motion.div
                        className="glass-card"
                        variants={cardHoverVariants}
                        whileHover="hover"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Issued Books</h3>
                            <Book className="text-primary-500" />
                        </div>
                        <div className="text-3xl font-bold mb-2">{issuedBooks.length}</div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Currently borrowed</p>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="glass-card"
                        variants={cardHoverVariants}
                        whileHover="hover"
                    >
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => navigate('/books')}
                                className="w-full btn-primary"
                            >
                                Browse Books
                            </button>
                            <button
                                onClick={() => navigate('/payment')}
                                className="w-full btn-secondary"
                            >
                                Make Payment
                            </button>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200"
                                >
                                    Admin Panel
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Issued Books List */}
                {issuedBooks.length > 0 && (
                    <div className="glass-card">
                        <h3 className="text-xl font-semibold mb-4">Your Borrowed Books</h3>
                        <div className="space-y-4">
                            {issuedBooks.map((book) => (
                                <motion.div
                                    key={book.issue_id}
                                    className="flex items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-xl"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {book.cover_image_url ? (
                                                <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Book size={24} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold line-clamp-1">{book.title}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{book.author}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Due: {new Date(book.due_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 ml-4">
                                        <div className="text-right">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${book.status === 'OVERDUE'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    }`}
                                            >
                                                {book.status}
                                            </span>
                                            {book.penalty_amount > 0 && (
                                                <p className="text-sm text-red-500 mt-1">
                                                    Penalty: ₹{book.penalty_amount}
                                                </p>
                                            )}
                                        </div>
                                        <motion.button
                                            onClick={() => handleReturnBook(book.issue_id)}
                                            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            title="Return Book"
                                        >
                                            <RotateCcw size={18} />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <BatchChangeModal
                isOpen={showBatchModal}
                onClose={() => setShowBatchModal(false)}
                currentBatch={user?.batch || null}
                currentTimeSlot={user?.time_slot || null}
                onSuccess={() => alert('Change request submitted successfully!')}
            />
        </motion.div>
    );
};

export default Dashboard;
