import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Check, Key, ShieldBan } from 'lucide-react';
import api from '../../services/api.service';
import { staggerContainer, cardHoverVariants } from '../../animations/variants';

interface User {
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    batch: string | null;
    time_slot: string | null;
    status: string;
    created_at: string;
}

interface UserManagementProps {
    searchQuery?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ searchQuery }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resettingUser, setResettingUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'MEMBER',
        batch: 'MORNING',
        time_slot: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (editingUser) {
            setFormData({
                full_name: editingUser.full_name,
                email: editingUser.email,
                phone: editingUser.phone || '',
                password: '', // Don't populate password
                role: editingUser.role,
                batch: editingUser.batch || 'MORNING',
                time_slot: editingUser.time_slot || ''
            });
        }
    }, [editingUser]);

    useEffect(() => {
        filterUsers();
    }, [users, selectedStatus, selectedBatch, searchQuery]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.user_id}`, formData);
            } else {
                await api.post('/admin/users', formData);
            }

            setShowAddModal(false);
            setEditingUser(null);
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'MEMBER',
                batch: 'MORNING',
                time_slot: ''
            });
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUser) return;
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/admin/users/${resettingUser.user_id}/reset-password`, { password: newPassword });
            setResettingUser(null);
            setNewPassword('');
            alert('Password reset successfully');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setSubmitting(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        if (selectedStatus !== 'ALL') {
            filtered = filtered.filter(u => u.status === selectedStatus);
        }

        if (selectedBatch !== 'ALL') {
            filtered = filtered.filter(u => u.batch === selectedBatch);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                u.full_name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.phone.includes(query)
            );
        }

        setFilteredUsers(filtered);
    };

    const handleStatusChange = async (userId: number, newStatus: string) => {
        try {
            await api.post('/admin/users/status', { user_id: userId, status: newStatus });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'INACTIVE': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
            case 'SUSPENDED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage library members and administrators
                    </p>
                </div>
                <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    Add User
                </motion.button>
            </div>

            {/* Filters */}
            <div className="glass-card">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="input-field"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Batch</label>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="input-field"
                        >
                            <option value="ALL">All Batches</option>
                            <option value="MORNING">Morning</option>
                            <option value="EVENING">Evening</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-end">
                        <div className="text-sm text-gray-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Batch
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <motion.tr
                                    key={user.user_id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-sm text-gray-500">{user.role}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium">{user.batch || 'N/A'}</div>
                                        {user.time_slot && <div className="text-xs text-gray-500">{user.time_slot}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Edit User"
                                            >
                                                <Edit2 size={16} />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => setResettingUser(user)}
                                                className="p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Reset Password"
                                            >
                                                <Key size={16} />
                                            </motion.button>
                                            {user.status === 'SUSPENDED' ? (
                                                <motion.button
                                                    onClick={() => handleStatusChange(user.user_id, 'ACTIVE')}
                                                    className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Unblock User"
                                                >
                                                    <Check size={16} />
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    onClick={() => handleStatusChange(user.user_id, 'SUSPENDED')}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    title="Block User"
                                                >
                                                    <ShieldBan size={16} />
                                                </motion.button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Password Reset Modal */}
            {resettingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="glass-card max-w-md w-full p-8 shadow-2xl"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Reset Password</h2>
                            <button
                                onClick={() => {
                                    setResettingUser(null);
                                    setNewPassword('');
                                    setError('');
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 mb-6">
                            Resetting password for <span className="font-bold text-gray-900 dark:text-gray-100">{resettingUser.full_name}</span>
                        </p>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-semibold mb-2 block">New Password</label>
                                <input
                                    required
                                    type="password"
                                    className="input-field w-full"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Key size={18} />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
            {/* Add/Edit User Modal */}
            {(showAddModal || editingUser) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="glass-card max-w-lg w-full p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingUser(null);
                                    setError('');
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field w-full"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        className="input-field w-full"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Phone</label>
                                        <input
                                            type="tel"
                                            className="input-field w-full"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Batch</label>
                                        <select
                                            className="input-field w-full"
                                            value={formData.batch}
                                            onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                        >
                                            <option value="MORNING">Morning</option>
                                            <option value="EVENING">Evening</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Time Slot</label>
                                        <input
                                            type="text"
                                            className="input-field w-full"
                                            value={formData.time_slot}
                                            onChange={e => setFormData({ ...formData, time_slot: e.target.value })}
                                            placeholder="e.g. 9-11 AM"
                                        />
                                    </div>
                                </div>

                                {!editingUser && (
                                    <div>
                                        <label className="text-sm font-semibold mb-2 block">Initial Password</label>
                                        <input
                                            required
                                            type="password"
                                            className="input-field w-full"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Role</label>
                                    <select
                                        className="input-field w-full"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="MEMBER">Member</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
