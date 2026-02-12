import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Users, Mail, Phone, BookOpen, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api.service';
import { pageVariants, staggerContainer } from '../animations/variants';

const MembershipRequest: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        batch: 'MORNING',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/requests/membership', {
                full_name: formData.full_name,
                email: formData.email,
                phone: formData.phone,
                batch: formData.batch,
                description: `New Membership Registration Request. Batch: ${formData.batch}. Reason: ${formData.reason}`,
                subject: 'New Membership Application'
            });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card max-w-md w-full p-12 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="text-green-500" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Request Submitted!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Your membership application has been sent to our administrators.
                        We will review your request and contact you at <strong>{formData.email}</strong> soon.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary w-full py-4 rounded-xl font-bold"
                    >
                        Return to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen relative flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900 overflow-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Left Side - Info */}
            <div className="lg:w-1/2 p-8 lg:p-20 flex flex-col justify-center bg-primary-500 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -rotate-45" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blur-[100px] rotate-45" />

                <motion.button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/80 hover:text-white mb-12 w-fit transition-colors group"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </motion.button>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
                        Start Your <br />
                        Reading <br />
                        Legacy.
                    </h1>
                    <p className="text-xl text-white/80 max-w-md leading-relaxed mb-12">
                        Complete the form to request your membership. Our team reviews
                        each application within 24 hours to ensure the best community experience.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Full Access</h3>
                                <p className="text-sm text-white/60">Unlock thousands of titles instantly</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold">Community</h3>
                                <p className="text-sm text-white/60">Join local and global reading clubs</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-20 flex items-center justify-center">
                <motion.div
                    className="glass-card max-w-lg w-full p-10 shadow-2xl"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-3xl font-bold mb-8">Membership Application</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-800"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold mb-2 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        className="input-field pl-12 w-full"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold mb-2 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        className="input-field pl-12 w-full"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="input-field pl-12 w-full"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Preferred Batch</label>
                                    <select
                                        className="input-field w-full"
                                        value={formData.batch}
                                        onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                    >
                                        <option value="MORNING">Morning (8 AM - 12 PM)</option>
                                        <option value="EVENING">Evening (4 PM - 8 PM)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold mb-2 block">Why do you want to join? (Optional)</label>
                                <textarea
                                    className="input-field w-full min-h-[100px] py-4"
                                    placeholder="Tell us a bit about your reading interests..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className="btn-primary w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Submit Application</span>
                                    <Send size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default MembershipRequest;
