import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Shield, Sparkles, ArrowRight, Zap, Star, Globe } from 'lucide-react';
import { pageVariants, staggerContainer, cardHoverVariants } from '../animations/variants';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: BookOpen,
            title: 'Vast Collection',
            description: 'Access thousands of books ranging from classics to the latest bestsellers across all genres.',
            color: 'text-blue-500',
            borderColor: 'group-hover:border-blue-500/50'
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Join a community of avid readers, participate in book clubs, and share your reading journey.',
            color: 'text-purple-500',
            borderColor: 'group-hover:border-purple-500/50'
        },
        {
            icon: Shield,
            title: 'Secure Access',
            description: 'State-of-the-art security for your account and reading history. Your data is always protected.',
            color: 'text-pink-500',
            borderColor: 'group-hover:border-pink-500/50'
        }
    ];

    const stats = [
        { label: 'Total Books', value: '15,000+', icon: BookOpen },
        { label: 'Active Members', value: '2,500+', icon: Users },
        { label: 'Daily Visitors', value: '500+', icon: Globe },
        { label: 'Rating', value: '4.9/5', icon: Star }
    ];

    return (
        <motion.div
            className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {/* Navigation Bar */}
            <nav className="fixed top-0 w-full z-50 glass-header border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg shadow-primary-500/20">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                            Antigravity Library
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-primary-500 transition-colors font-medium px-4 py-2"
                        >
                            Sign In
                        </button>
                        <motion.button
                            onClick={() => navigate('/join')}
                            className="btn-primary flex items-center gap-2 group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Zap size={18} className="group-hover:animate-pulse" />
                            Join Now
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-8 border border-primary-100 dark:border-primary-800/50"
                    >
                        <Sparkles size={16} />
                        <span>Experience the Future of Libraries</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tight"
                    >
                        Where Stories <br />
                        <span className="text-secondary-500">Come Alive</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        Explore our vast collection of knowledge, connect with fellow readers,
                        and embark on a digital journey that transcends boundaries.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => navigate('/join')}
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl"
                        >
                            Become a Member <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-3"
                        >
                            Member Login
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-8 text-center group cursor-pointer"
                                whileHover={{ y: -10 }}
                            >
                                <stat.icon className="mx-auto mb-4 text-primary-500 group-hover:scale-110 transition-transform" size={32} />
                                <div className="text-3xl font-black mb-2 text-gray-900 dark:text-white">{stat.value}</div>
                                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Why Choose Us?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We combine the classic library experience with cutting-edge technology
                            to provide you with the best reading environment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className={`glass-card p-10 group cursor-pointer border-2 border-transparent transition-all duration-300 ${feature.borderColor}`}
                                whileHover={{ y: -10 }}
                            >
                                <div className={`p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 w-fit mb-8 group-hover:scale-110 transition-transform ${feature.color}`}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative p-12 md:p-20 rounded-[40px] bg-gradient-to-br from-primary-500 to-secondary-500 overflow-hidden text-center text-white"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[100px] -rotate-45" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-[100px] rotate-45" />

                        <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to Start Your Journey?</h2>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12">
                            Join thousands of readers today and get access to our entire collection.
                            Your next favorite book is just a click away.
                        </p>
                        <button
                            onClick={() => navigate('/join')}
                            className="px-12 py-6 bg-white text-primary-600 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl"
                        >
                            Become a Member Now
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-200 dark:border-gray-800 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8 text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <BookOpen size={20} />
                        <span className="font-bold">Antigravity Library</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium">
                        <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-primary-500 transition-colors">Contact Us</a>
                    </div>
                    <p className="text-sm">© 2024 Antigravity Library. All rights reserved.</p>
                </div>
            </footer>
        </motion.div>
    );
};

export default LandingPage;
