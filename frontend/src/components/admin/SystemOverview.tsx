import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    DollarSign,
    AlertCircle,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import api from '../../services/api.service';
import { staggerContainer, cardHoverVariants } from '../../animations/variants';

interface DashboardStats {
    totalUsers: number;
    totalBooks: number;
    activeUsers: number;
    pendingRequests: number;
    issuedBooks: number;
    overdueBooks: number;
    todayRevenue: number;
    outstandingPenalties: number;
    batchDistribution: {
        morning: number;
        evening: number;
    };
}

interface Activity {
    id: number;
    action: string;
    user: string;
    timestamp: string;
    type: 'success' | 'warning' | 'error' | 'info';
}

interface SystemOverviewProps {
    searchQuery?: string;
}

const SystemOverview: React.FC<SystemOverviewProps> = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalBooks: 0,
        activeUsers: 0,
        pendingRequests: 0,
        issuedBooks: 0,
        overdueBooks: 0,
        todayRevenue: 0,
        outstandingPenalties: 0,
        batchDistribution: { morning: 0, evening: 0 }
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/audit-logs?limit=5')
            ]);

            setStats(statsRes.data);

            // Format audit logs for activity feed
            const formattedLogs: Activity[] = logsRes.data.logs.map((log: any) => ({
                id: log.log_id,
                action: log.action.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
                user: log.user_name || 'System',
                timestamp: formatDate(log.created_at),
                type: getLogType(log.action)
            }));

            setActivities(formattedLogs);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Recently';
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} min ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        return date.toLocaleDateString();
    };

    const getLogType = (action: string) => {
        if (action.includes('REGISTER') || action.includes('APPROVED') || action.includes('ADDED')) return 'success';
        if (action.includes('REJECTED') || action.includes('EXPIRED') || action.includes('DELETED')) return 'error';
        if (action.includes('LATE') || action.includes('OVERDUE')) return 'warning';
        return 'info';
    };

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            subtitle: `${stats.activeUsers} active`,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            title: 'Pending Requests',
            value: stats.pendingRequests,
            subtitle: 'Awaiting approval',
            icon: Clock,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            title: 'Books Issued',
            value: stats.issuedBooks,
            subtitle: `${stats.overdueBooks} overdue`,
            icon: BookOpen,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            title: "Today's Revenue",
            value: `₹${stats.todayRevenue}`,
            subtitle: 'Total collected',
            icon: DollarSign,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            title: 'Overdue Books',
            value: stats.overdueBooks,
            subtitle: 'Requires action',
            icon: AlertCircle,
            color: 'from-red-500 to-rose-500',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            title: 'Outstanding Penalties',
            value: `₹${stats.outstandingPenalties}`,
            subtitle: 'To be collected',
            icon: TrendingUp,
            color: 'from-orange-500 to-amber-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20'
        },
    ];

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertCircle size={16} className="text-yellow-500" />;
            case 'error': return <XCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-blue-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Mission Control</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Real-time system overview and activity monitoring
                </p>
            </div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={index}
                            className="glass-card"
                            variants={cardHoverVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                        {stat.title}
                                    </p>
                                    <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                    <p className="text-xs text-gray-400">{stat.subtitle}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={24} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Batch Distribution & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Batch Distribution */}
                <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-4">Batch Distribution</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm">Morning Batch</span>
                                <span className="text-sm font-semibold">{stats.batchDistribution.morning} users</span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(stats.batchDistribution.morning / (stats.batchDistribution.morning + stats.batchDistribution.evening)) * 100}%`
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm">Evening Batch</span>
                                <span className="text-sm font-semibold">{stats.batchDistribution.evening} users</span>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{
                                        width: `${(stats.batchDistribution.evening / (stats.batchDistribution.morning + stats.batchDistribution.evening)) * 100}%`
                                    }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Activity Feed */}
                <div className="glass-card overflow-hidden">
                    <h3 className="text-lg font-semibold mb-6 px-2">Recent Activity</h3>
                    <div className="space-y-1">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className={`p-2 rounded-xl bg-opacity-10 ${activity.type === 'success' ? 'bg-green-500 text-green-500' :
                                        activity.type === 'warning' ? 'bg-yellow-500 text-yellow-500' :
                                            activity.type === 'error' ? 'bg-red-500 text-red-500' :
                                                'bg-blue-500 text-blue-500'
                                        }`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">
                                            {activity.action}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 font-medium">{activity.user}</span>
                                            <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="text-gray-300" size={24} />
                                </div>
                                <p className="text-gray-500 font-medium">No recent activity found</p>
                                <p className="text-xs text-gray-400 mt-1">New actions will appear here in real-time</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemOverview;
