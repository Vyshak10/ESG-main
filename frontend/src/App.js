import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDetail from './pages/CompanyDetail';
import AdminUpload from './pages/AdminUpload';
import CompanyComparison from './pages/CompanyComparison';

function DashboardRouter() {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return user.role === 'admin'
        ? <Navigate to="/admin/dashboard" replace />
        : <Navigate to="/dashboard" replace />;
}

function AppContent() {
    const { theme } = useThemeMode();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/company/:id"
                            element={
                                <ProtectedRoute>
                                    <CompanyDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/compare"
                            element={
                                <ProtectedRoute>
                                    <CompanyComparison />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin Routes */}
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/upload/:companyId"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminUpload />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/admin/compare"
                            element={
                                <ProtectedRoute adminOnly>
                                    <CompanyComparison />
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Route */}
                        <Route path="/" element={<DashboardRouter />} />

                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

function App() {
    return (
        <ThemeModeProvider>
            <AppContent />
        </ThemeModeProvider>
    );
}

export default App;
