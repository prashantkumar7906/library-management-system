import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import api from '../../services/api.service';

interface Request {
    request_id: number;
    user_id: number | null;
    full_name: string;
    type: string;
    subject: string;
    description: string;
    details: any;
    status: string;
    created_at: string;
}

const RequestManagement: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/admin/requests');
            setRequests(response.data.requests);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            await api.post(`/admin/requests/${requestId}/approve`);
            fetchRequests();
            setSelectedRequest(null);
        } catch (error) {
            console.error('Failed to approve request:', error);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await api.post(`/admin/requests/${requestId}/reject`, { reason: rejectReason });
            fetchRequests();
            setSelectedRequest(null);
            setRejectReason('');
        } catch (error) {
            console.error('Failed to reject request:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        return type.replace(/_/g, ' ');
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
            <div>
                <h1 className="text-3xl font-bold mb-2">Request Management</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Review and process user requests
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requests.map((request) => (
                    <motion.div
                        key={request.request_id}
                        className="glass-card cursor-pointer"
                        onClick={() => setSelectedRequest(request)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold mb-1">{request.subject}</h3>
                                <p className="text-sm text-gray-500">{request.full_name}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {request.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                {getTypeLabel(request.type)}
                            </span>
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Request Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{selectedRequest.subject}</h2>
                                <p className="text-gray-500">{selectedRequest.full_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Type</label>
                                <p className="mt-1">{getTypeLabel(selectedRequest.type)}</p>
                            </div>

                            {selectedRequest.type === 'BATCH_CHANGE' && selectedRequest.details && (
                                <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-900/30">
                                    <h4 className="text-sm font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">Requested Changes</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">New Batch</label>
                                            <p className="font-semibold">{(() => {
                                                const d = typeof selectedRequest.details === 'string' ? JSON.parse(selectedRequest.details) : selectedRequest.details;
                                                return d.new_batch;
                                            })()}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">New Time Slot</label>
                                            <p className="font-semibold">{(() => {
                                                const d = typeof selectedRequest.details === 'string' ? JSON.parse(selectedRequest.details) : selectedRequest.details;
                                                return d.new_time_slot || 'Any';
                                            })()}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500">Description</label>
                                <p className="mt-1">{selectedRequest.description}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Status</label>
                                <p className="mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                                        {selectedRequest.status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {selectedRequest.status === 'PENDING' && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Rejection Reason (optional)</label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="input-field w-full"
                                        rows={3}
                                        placeholder="Enter reason for rejection..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprove(selectedRequest.request_id)}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest.request_id)}
                                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={20} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default RequestManagement;
