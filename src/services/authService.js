/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { post, postWithQuery } from './api';

/**
 * Send OTP to mobile number for login
 * @param {string} mobile - Mobile number
 * @returns {Promise} - API response with OTP sent status
 */
export const sendLoginOtp = async (mobile) => {
    console.log('Sending OTP to mobile:', mobile);
    try {
        const response = await post('send-user-otp', {
            mobile: mobile,
            guard: 'vendor'
        });
        console.log('Send OTP Response:', response);
        return response;
    } catch (error) {
        console.error('Send OTP Error:', error.message);
        // Provide helpful error message
        if (error.message.includes('non-JSON') || error.message.includes('parse')) {
            throw new Error('OTP login endpoint not configured on server. Contact backend team.');
        }
        throw error;
    }
};

/**
 * Verify OTP and login
 * @param {string} mobile - Mobile number
 * @param {string} otp - OTP code
 * @returns {Promise} - API response with user data and token
 */
export const verifyLoginOtp = async (mobile, otp) => {
    try {
        const response = await post('verify-user-otp', {
            mobile: mobile,
            otp: otp,
            guard: 'vendor'
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Traditional login with username and password (keeping for backward compatibility)
 * @param {string} username - Username/Email
 * @param {string} password - Password
 * @returns {Promise} - API response with user data
 */
export const loginWithPassword = async (username, password) => {
    try {
        const response = await postWithQuery('login', {
            username: username,
            guard: 'vendor',
            login_password: password
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Send OTP for registration
 * @param {object} registrationData - Registration form data
 * @returns {Promise} - API response with verification code
 */
export const sendRegistrationOtp = async (registrationData) => {
    try {
        const response = await post('user-register', {
            role_id: 3, // vendor role
            name: registrationData.name,
            email: registrationData.email,
            mobile: registrationData.mobile,
            address: registrationData.address,
            state_id: registrationData.stateId,
            city_id: registrationData.cityId,
            pincode: registrationData.pincode,
            password: registrationData.password,
            password_confirmation: registrationData.confirmPassword,
            category: registrationData.category
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Complete registration after OTP verification
 * @param {object} registrationData - Registration form data with OTP
 * @returns {Promise} - API response with user data
 */
export const completeRegistration = async (registrationData) => {
    try {
        const response = await post('user-register', {
            role_id: 3, // vendor role
            name: registrationData.name,
            email: registrationData.email,
            mobile: registrationData.mobile,
            address: registrationData.address,
            state_id: registrationData.stateId,
            city_id: registrationData.cityId,
            pincode: registrationData.pincode,
            password: registrationData.password,
            password_confirmation: registrationData.confirmPassword,
            register_otp: registrationData.otp,
            VerificationCode: registrationData.verificationCode,
            category: registrationData.category
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Forgot password
 * @param {string} username - Username/Email
 * @returns {Promise} - API response
 */
export const forgotPassword = async (username) => {
    try {
        const response = await postWithQuery('forgot_password', {
            username: username,
            guard: 'vendor'
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update password
 * @param {string} username - Username/Email
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm password
 * @returns {Promise} - API response
 */
export const updatePassword = async (username, password, confirmPassword) => {
    try {
        const response = await postWithQuery('update_password', {
            username: username,
            guard: 'vendor',
            password: password,
            password_confirmation: confirmPassword
        });
        return response;
    } catch (error) {
        throw error;
    }
};

export default {
    sendLoginOtp,
    verifyLoginOtp,
    loginWithPassword,
    sendRegistrationOtp,
    completeRegistration,
    forgotPassword,
    updatePassword,
};
