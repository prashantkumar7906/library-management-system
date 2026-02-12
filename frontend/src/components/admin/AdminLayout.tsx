import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import SystemOverview from './SystemOverview';
import UserManagement from './UserManagement';
import RequestManagement from './RequestManagement';
import PaymentLedger from './PaymentLedger';
import BookControl from './BookControl';
import AuditLog from './AuditLog';
import BrandingSettings from './BrandingSettings';

const AdminLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
            {/* Sidebar */}
            <AdminSidebar
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <motion.div
                className="min-h-screen"
                animate={{ marginLeft: sidebarCollapsed ? 80 : 256 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {/* Top Bar */}
                <AdminTopBar onSearch={setSearchQuery} />

                {/* Content Area */}
                <div className="p-6">
                    <Routes>
                        <Route path="/" element={<SystemOverview searchQuery={searchQuery} />} />
                        <Route path="users" element={<UserManagement searchQuery={searchQuery} />} />
                        <Route path="requests" element={<RequestManagement />} />
                        <Route path="payments" element={<PaymentLedger />} />
                        <Route path="books" element={<BookControl />} />
                        <Route path="audit" element={<AuditLog />} />
                        <Route path="branding" element={<BrandingSettings />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLayout;
