/**
 * Storage Utility
 * Handles AsyncStorage operations for persisting user data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    USER_DATA: '@homedoot_user_data',
    AUTH_TOKEN: '@homedoot_auth_token',
    IS_LOGGED_IN: '@homedoot_is_logged_in',
    VENDOR_ID: '@homedoot_vendor_id',
};

/**
 * Save user data to storage
 * @param {object} userData - User data object
 */
export const saveUserData = async (userData) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        if (userData.id) {
            await AsyncStorage.setItem(STORAGE_KEYS.VENDOR_ID, userData.id.toString());
        }
        await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
};

/**
 * Get user data from storage
 * @returns {object|null} - User data or null
 */
export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

/**
 * Save auth token
 * @param {string} token - Authentication token
 */
export const saveAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        return true;
    } catch (error) {
        console.error('Error saving auth token:', error);
        return false;
    }
};

// Alias for saveAuthToken
export const saveToken = saveAuthToken;

/**
 * Get auth token
 * @returns {string|null} - Auth token or null
 */
export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

// Alias for getAuthToken
export const getToken = getAuthToken;

/**
 * Check if user is logged in
 * @returns {boolean} - Login status
 */
export const isLoggedIn = async () => {
    try {
        const loginStatus = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
        return loginStatus === 'true';
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
};

/**
 * Get vendor ID
 * @returns {string|null} - Vendor ID or null
 */
export const getVendorId = async () => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.VENDOR_ID);
    } catch (error) {
        console.error('Error getting vendor ID:', error);
        return null;
    }
};

/**
 * Clear all storage data (logout)
 */
export const clearStorage = async () => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_DATA,
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.IS_LOGGED_IN,
            STORAGE_KEYS.VENDOR_ID,
        ]);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
};

/**
 * Save specific value
 * @param {string} key - Storage key
 * @param {any} value - Value to save
 */
export const saveValue = async (key, value) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        await AsyncStorage.setItem(`@homedoot_${key}`, stringValue);
        return true;
    } catch (error) {
        console.error(`Error saving ${key}:`, error);
        return false;
    }
};

/**
 * Get specific value
 * @param {string} key - Storage key
 * @returns {any} - Stored value
 */
export const getValue = async (key) => {
    try {
        const value = await AsyncStorage.getItem(`@homedoot_${key}`);
        if (!value) return null;

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    } catch (error) {
        console.error(`Error getting ${key}:`, error);
        return null;
    }
};

export default {
    saveUserData,
    getUserData,
    saveAuthToken,
    getAuthToken,
    isLoggedIn,
    getVendorId,
    clearStorage,
    saveValue,
    getValue,
};
