import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutPortal: React.FC = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);

        const timer = setTimeout(() => {
            logout();
            navigate('/');
        }, 1500);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timer);
        };
    }, [logout, navigate]);

    return (
        <div className="fixed inset-0 bg-black z-50 overflow-hidden">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500"
                initial={{ scale: 1, opacity: 1 }}
                animate={{
                    scale: 0,
                    x: mousePos.x - window.innerWidth / 2,
                    y: mousePos.y - window.innerHeight / 2,
                    opacity: 0,
                }}
                transition={{
                    duration: 1.2,
                    ease: [0.6, 0.01, 0.05, 0.95],
                }}
            />
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.8 }}
            >
                Goodbye!
            </motion.div>
        </div>
    );
};

export default LogoutPortal;
