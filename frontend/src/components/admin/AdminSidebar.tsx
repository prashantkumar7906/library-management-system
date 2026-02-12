import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    DollarSign,
    BookOpen,
    Activity,
    ChevronLeft,
    ChevronRight,
    Settings
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const AdminSidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
        { icon: Users, label: 'Users', path: '/admin/users' },
        { icon: FileText, label: 'Requests', path: '/admin/requests' },
        { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
        { icon: BookOpen, label: 'Books', path: '/admin/books' },
        { icon: Activity, label: 'Audit Logs', path: '/admin/audit' },
        { icon: Settings, label: 'Branding', path: '/admin/branding' },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <motion.div
            className={`fixed left-0 top-0 h-screen bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border z-30 flex flex-col`}
            initial={false}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-light-border dark:border-dark-border">
                <motion.div
                    className="flex items-center gap-3"
                    animate={{ opacity: isCollapsed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {!isCollapsed && (
                        <>
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg" />
                            <span className="font-bold text-lg">Admin</span>
                        </>
                    )}
                </motion.div>
                {isCollapsed && (
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg" />
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <motion.button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={20} />
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.span
                                        className="font-medium"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </nav>

            {/* Toggle Button */}
            <div className="p-3 border-t border-light-border dark:border-dark-border">
                <motion.button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default AdminSidebar;
