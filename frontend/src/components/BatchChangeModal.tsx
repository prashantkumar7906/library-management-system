import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Send, AlertCircle } from 'lucide-react';
import api from '../services/api.service';

interface BatchChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBatch: string | null;
    currentTimeSlot: string | null;
    onSuccess: () => void;
}

const BatchChangeModal: React.FC<BatchChangeModalProps> = ({
    isOpen,
    onClose,
    currentBatch,
    currentTimeSlot,
    onSuccess
}) => {
    const [formData, setFormData] = useState({
        new_batch: currentBatch || 'MORNING',
        new_time_slot: currentTimeSlot || '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/requests', {
                type: 'BATCH_CHANGE',
                subject: 'Request to Change Batch/Time Slot',
                description: `Requested change from ${currentBatch || 'None'} (${currentTimeSlot || 'No slot'}) to ${formData.new_batch} (${formData.new_time_slot || 'No specific slot'}). Reason: ${formData.reason}`,
                details: {
                    new_batch: formData.new_batch,
                    new_time_slot: formData.new_time_slot
                }
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl p-8 shadow-2xl border border-light-border dark:border-dark-border"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-500 rounded-2xl">
                                <Clock size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Change Batch/Slot</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-3">
                                    <AlertCircle size={18} />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold mb-2">New Batch</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, new_batch: 'MORNING' })}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.new_batch === 'MORNING'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                                            : 'border-light-border dark:border-dark-border hover:border-primary-300'
                                            }`}
                                    >
                                        <Users size={20} />
                                        <span className="font-semibold text-sm">Morning</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, new_batch: 'EVENING' })}
                                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.new_batch === 'EVENING'
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                                            : 'border-light-border dark:border-dark-border hover:border-primary-300'
                                            }`}
                                    >
                                        <Users size={20} />
                                        <span className="font-semibold text-sm">Evening</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Requested Time Slot</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 9:00 AM - 11:00 AM"
                                    className="input-field w-full"
                                    value={formData.new_time_slot}
                                    onChange={e => setFormData({ ...formData, new_time_slot: e.target.value })}
                                />
                                <p className="text-xs text-gray-400 mt-2">Specify your preferred window within the batch.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">Reason for Change</label>
                                <textarea
                                    required
                                    className="input-field w-full min-h-[100px] py-3"
                                    placeholder="Tell the admin why you need this change..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Submit Request</span>
                                        <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BatchChangeModal;
