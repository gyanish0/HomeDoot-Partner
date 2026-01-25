/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserData, saveUserData, clearStorage, isLoggedIn as checkLoginStatus } from '../utils/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load user data on app start
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const loginStatus = await checkLoginStatus();
            setIsLoggedIn(loginStatus);

            if (loginStatus) {
                const userData = await getUserData();
                setUser(userData);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        try {
            await saveUserData(userData);
            setUser(userData);
            setIsLoggedIn(true);
            return true;
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await clearStorage();
            setUser(null);
            setIsLoggedIn(false);
            return true;
        } catch (error) {
            console.error('Error during logout:', error);
            return false;
        }
    };

    const updateUser = async (userData) => {
        try {
            const updatedUser = { ...user, ...userData };
            await saveUserData(updatedUser);
            setUser(updatedUser);
            return true;
        } catch (error) {
            console.error('Error updating user:', error);
            return false;
        }
    };

    const value = {
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
