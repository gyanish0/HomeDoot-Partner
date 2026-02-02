/**
 * Axios Instance Configuration
 * Configured with interceptors for authentication and error handling
 */

import axios from 'axios';
import { getToken } from '../utils/storage';

// Base API URL
const BASE_URL = 'https://doot.globleitsolutions.com/api/vendor';

// Create axios instance with React Native compatible configuration
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    // Use XMLHttpRequest adapter for React Native
    adapter: 'xhr',
});

// Request interceptor - Add auth token to all requests
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            // Get token from storage
            const token = await getToken();

            // Add token to headers if it exists
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // Log request in development
            if (__DEV__) {
                console.log('📤 API Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    baseURL: config.baseURL,
                    hasToken: !!token,
                });
            }

            return config;
        } catch (error) {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors
axiosInstance.interceptors.response.use(
    (response) => {
        // Log response in development
        if (__DEV__) {
            console.log('📥 API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        // Return the response data
        return response.data;
    },
    async (error) => {
        // Log error in development
        if (__DEV__) {
            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
        }

        // Handle specific error cases
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    // Unauthorized - Token expired or invalid
                    console.log('Unauthorized access - Token may be expired');
                    // You can dispatch a logout action here if needed
                    // store.dispatch(logoutUser());
                    break;

                case 403:
                    // Forbidden
                    console.log('Access forbidden');
                    break;

                case 404:
                    // Not found
                    console.log('Resource not found');
                    break;

                case 422:
                    // Validation error
                    console.log('Validation error:', data);
                    break;

                case 500:
                    // Server error
                    console.log('Server error');
                    break;

                default:
                    console.log('API error:', status);
            }

            // Return a structured error
            return Promise.reject({
                status,
                message: data?.message || error.message,
                errors: data?.errors || null,
                response: error.response,
            });
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
            return Promise.reject({
                message: 'Network error - No response from server',
                error,
            });
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject({
                message: error.message,
                error,
            });
        }
    }
);

export default axiosInstance;
