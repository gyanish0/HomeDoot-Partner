/**
 * Authentication Slice
 * Manages authentication state with Redux Toolkit
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserData, saveUserData, clearStorage, getToken, saveToken } from '../../utils/storage';
import * as authAPI from '../../services/authService';

// Async thunks
export const loadUserData = createAsyncThunk(
    'auth/loadUserData',
    async (_, { rejectWithValue }) => {
        try {
            const token = await getToken();
            if (token) {
                const userData = await getUserData();
                return { user: userData, token };
            }
            return { user: null, token: null };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const sendOTP = createAsyncThunk(
    'auth/sendOTP',
    async (mobile, { rejectWithValue }) => {
        try {
            const response = await authAPI.sendOTP(mobile);
            console.log(response, 'response')
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const verifyOTP = createAsyncThunk(
    'auth/verifyOTP',
    async ({ mobile, otp }, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyOTP(mobile, otp);
            console.log(response, 'verifyOTP response');
            if (response.status && response.token) {
                await saveToken(response.token);
                await saveUserData(response.vendor);
                return { token: response.token, user: response.vendor };
            }
            return rejectWithValue(response.message || 'Verification failed');
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchDashboard = createAsyncThunk(
    'auth/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getDashboard();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout();
            await clearStorage();
            return null;
        } catch (error) {
            // Even if API fails, clear local storage
            await clearStorage();
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Initial state
const initialState = {
    user: null,
    token: null,
    isLoggedIn: false,
    initializing: true, // App startup loading
    loading: false,      // API operation loading
    error: null,
    otpSent: false,
    dashboardData: null,
};

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            saveUserData(state.user);
        },
        setToken: (state, action) => {
            state.token = action.payload;
            state.isLoggedIn = !!action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Load user data
            .addCase(loadUserData.pending, (state) => {
                state.initializing = true;
            })
            .addCase(loadUserData.fulfilled, (state, action) => {
                state.initializing = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = !!action.payload.token;
            })
            .addCase(loadUserData.rejected, (state, action) => {
                state.initializing = false;
                state.error = action.payload;
            })

            // Send OTP
            .addCase(sendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.otpSent = false;
            })
            .addCase(sendOTP.fulfilled, (state) => {
                state.loading = false;
                state.otpSent = true;
            })
            .addCase(sendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.otpSent = false;
            })

            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isLoggedIn = true;
                state.otpSent = false;
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Dashboard
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.dashboardData = action.payload;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isLoggedIn = false;
                state.dashboardData = null;
                state.otpSent = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                // Clear state even on error
                state.loading = false;
                state.user = null;
                state.token = null;
                state.isLoggedIn = false;
                state.dashboardData = null;
                state.otpSent = false;
            });
    },
});

export const { clearError, updateUser, setToken } = authSlice.actions;
export default authSlice.reducer;
