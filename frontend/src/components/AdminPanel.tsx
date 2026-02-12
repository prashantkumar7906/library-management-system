import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, BookOpen, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.service';
import { DashboardStats } from '../types';
import { pageVariants, staggerContainer, cardHoverVariants } from '../animations/variants';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
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
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft />
                        </button>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Total Users</h3>
                                <Users className="text-primary-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
                        </motion.div>

                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Total Books</h3>
                                <BookOpen className="text-primary-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats?.totalBooks || 0}</div>
                        </motion.div>

                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Issued Books</h3>
                                <BookOpen className="text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats?.issuedBooks || 0}</div>
                        </motion.div>

                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Active Subscriptions</h3>
                                <Users className="text-green-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats?.activeUsers || 0}</div>
                        </motion.div>

                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Total Revenue</h3>
                                <DollarSign className="text-green-500" />
                            </div>
                            <div className="text-3xl font-bold">₹{stats?.todayRevenue || 0}</div>
                        </motion.div>

                        <motion.div className="glass-card" variants={cardHoverVariants} whileHover="hover">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Pending Requests</h3>
                                <Users className="text-yellow-500" />
                            </div>
                            <div className="text-3xl font-bold">{stats?.pendingRequests || 0}</div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default AdminPanel;
