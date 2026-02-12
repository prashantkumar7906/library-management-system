import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import AnimatedLogin from './components/AnimatedLogin';
import Dashboard from './components/Dashboard';
import BookBrowser from './components/BookBrowser';
import PaymentFlow from './components/PaymentFlow';
import AdminLayout from './components/admin/AdminLayout';
import LandingPage from './components/LandingPage';
import MembershipRequest from './components/MembershipRequest';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
    children,
    adminOnly = false,
}) => {
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const App: React.FC = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <BrowserRouter>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
                            ) : (
                                <LandingPage />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ? (
                                <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
                            ) : (
                                <AnimatedLogin />
                            )
                        }
                    />
                    <Route path="/join" element={<MembershipRequest />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/books"
                        element={
                            <ProtectedRoute>
                                <BookBrowser />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment"
                        element={
                            <ProtectedRoute>
                                <PaymentFlow />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </BrowserRouter>
    );
};

export default App;
