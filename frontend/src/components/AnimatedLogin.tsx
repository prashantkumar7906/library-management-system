import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { pageVariants, shakeVariants, magneticFocusVariants, elasticVariants } from '../animations/variants';

const AnimatedLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            // Route based on role
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 dark:from-primary-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Animated background circles */}
            <motion.div
                className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
            <motion.div
                className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Login Card */}
            <motion.div
                className="glass-card w-full max-w-md mx-4 relative z-10"
                variants={shake ? shakeVariants : {}}
                animate={shake ? 'shake' : ''}
            >
                {/* Logo */}
                <motion.div
                    className="flex justify-center mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-glow">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                </motion.div>

                <motion.h1
                    className="text-3xl font-bold text-center mb-2 text-white"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Library Management
                </motion.h1>
                <motion.p
                    className="text-center text-white/70 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    Sign in to access your account
                </motion.p>

                {error && (
                    <motion.div
                        className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <motion.div
                        className="relative"
                        variants={magneticFocusVariants}
                        animate={email ? 'focused' : 'unfocused'}
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field bg-white/10 border-white/20 text-white placeholder-transparent peer"
                            placeholder="Email"
                            id="email"
                        />
                        <label
                            htmlFor="email"
                            className={`floating-label ${email ? 'floating-label-active' : ''} text-white/70`}
                        >
                            Email Address
                        </label>
                    </motion.div>

                    {/* Password Field */}
                    <motion.div
                        className="relative"
                        variants={magneticFocusVariants}
                        animate={password ? 'focused' : 'unfocused'}
                    >
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field bg-white/10 border-white/20 text-white placeholder-transparent peer pr-12"
                            placeholder="Password"
                            id="password"
                        />
                        <label
                            htmlFor="password"
                            className={`floating-label ${password ? 'floating-label-active' : ''} text-white/70`}
                        >
                            Password
                        </label>
                        <motion.button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            variants={elasticVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </motion.button>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-primary-600 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        variants={elasticVariants}
                        whileHover={!loading ? 'hover' : {}}
                        whileTap={!loading ? 'tap' : {}}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <motion.div
                                    className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full mr-2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                {/* Demo Credentials */}
                <motion.div
                    className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-xs text-white/60 mb-2">Demo Credentials:</p>
                    <p className="text-sm text-white/80">
                        <strong>Admin:</strong> libadmin@library.com / admin123
                    </p>
                    <p className="text-sm text-white/80">
                        <strong>Member:</strong> member@library.com / member123
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default AnimatedLogin;
