import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

interface TopBarProps {
    onSearch?: (query: string) => void;
}

const AdminTopBar: React.FC<TopBarProps> = ({ onSearch }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(0);

    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await api.get('/admin/stats');
                setPendingRequests(response.data.pendingRequests || 0);
            } catch (error) {
                console.error('Failed to fetch notification count:', error);
            }
        };

        fetchNotificationCount();
        const interval = setInterval(fetchNotificationCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="h-16 bg-white dark:bg-dark-card border-b border-light-border dark:border-dark-border px-6 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search users, books, payments..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl border-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <motion.button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>

                {/* Notifications */}
                <motion.button
                    onClick={() => navigate('/admin/requests')}
                    className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bell size={20} />
                    {pendingRequests > 0 && (
                        <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {pendingRequests}
                        </span>
                    )}
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <motion.button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="text-sm font-medium">{user?.full_name}</div>
                            <div className="text-xs text-gray-500">Administrator</div>
                        </div>
                    </motion.button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <motion.div
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                            >
                                <User size={16} />
                                <span>User Dashboard</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTopBar;
