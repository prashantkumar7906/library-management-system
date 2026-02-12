import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Filter } from 'lucide-react';
import api from '../../services/api.service';
import { format } from 'date-fns';

interface AuditLog {
    log_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    performed_by: number;
    user_name: string;
    created_at: string;
    details: any;
}

const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('ALL');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/admin/audit-logs');
            setLogs(response.data.logs);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (action.includes('CREATE') || action.includes('ISSUED')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (action.includes('DELETE') || action.includes('REJECTED')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        if (action.includes('UPDATE') || action.includes('MODIFIED')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    };

    const filteredLogs = selectedAction === 'ALL'
        ? logs
        : logs.filter(log => log.action.includes(selectedAction));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        System activity monitoring and tracking
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} />
                    <select
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="input-field"
                    >
                        <option value="ALL">All Actions</option>
                        <option value="LOGIN">Login Events</option>
                        <option value="CREATE">Create Events</option>
                        <option value="UPDATE">Update Events</option>
                        <option value="DELETE">Delete Events</option>
                        <option value="PAYMENT">Payment Events</option>
                    </select>
                </div>
            </div>

            <div className="glass-card">
                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <motion.div
                            key={log.log_id}
                            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Activity className="text-primary-500 mt-1" size={20} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {log.entity_type} #{log.entity_id}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Performed by: <span className="font-medium">{log.user_name || `User #${log.performed_by}`}</span>
                                </p>
                                {log.details && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {JSON.stringify(log.details)}
                                    </p>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                {log.created_at ? format(new Date(log.created_at), 'MMM dd, HH:mm') : 'Recently'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
