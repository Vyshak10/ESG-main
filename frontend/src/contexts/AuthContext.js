import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const response = await authAPI.getMe();
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true, user };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const signup = async (name, email, password, role) => {
        try {
            const response = await authAPI.signup({ name, email, password, role });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setToken(token);
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    const value = {
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAdmin
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
