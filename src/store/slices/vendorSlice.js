/**
 * Vendor Profile Redux Slice
 * Manages vendor profile data, states, cities, categories, and sub-categories
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getVendorProfile, getCities, getSubcategories } from '../../services/vendorService';

// Initial state
const initialState = {
    vendor: null,
    states: [],
    cities: [],
    categories: [],
    subCategories: [],
    selectedSubCategories: [],
    fetchedSubCategories: [],
    loading: false,
    error: null,
};

export const fetchVendorProfile = createAsyncThunk(
    'vendor/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getVendorProfile();
            // Check if response has the expected structure
            if (response && response.success) {
                return response.data;
            } else {
                return rejectWithValue(response?.message || 'Failed to fetch vendor profile');
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'An error occurred while fetching vendor profile'
            );
        }
    }
);

export const fetchCitiesByState = createAsyncThunk(
    'vendor/fetchCitiesByState',
    async (stateId, { rejectWithValue }) => {
        try {
            const response = await getCities(stateId);

            if (response) {
                return response || [];
            } else {
                return rejectWithValue(response?.message || 'Failed to fetch cities');
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'An error occurred while fetching cities'
            );
        }
    }
);

export const fetchSubcategoriesByCategory = createAsyncThunk(
    'vendor/fetchSubcategoriesByCategory',
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await getSubcategories(categoryId);
            if (response) {
                return response || [];
            } else {
                return rejectWithValue(response?.message || 'Failed to fetch subcategories');
            }
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                error.message ||
                'An error occurred while fetching subcategories'
            );
        }
    }
);

const vendorSlice = createSlice({
    name: 'vendor',
    initialState,
    reducers: {
        // Clear vendor data
        clearVendorData: (state) => {
            state.vendor = null;
            state.states = [];
            state.cities = [];
            state.categories = [];
            state.subCategories = [];
            state.selectedSubCategories = [];
            state.fetchedSubCategories = [];
            state.error = null;
        },

        // Update vendor data locally
        updateVendorData: (state, action) => {
            state.vendor = {
                ...state.vendor,
                ...action.payload,
            };
        },

        // Update cities based on selected state
        updateCities: (state, action) => {
            state.cities = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch vendor profile
            .addCase(fetchVendorProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.vendor = action.payload.vendor;
                state.states = action.payload.states || [];
                state.cities = action.payload.cities || [];
                state.categories = action.payload.categories || [];
                state.subCategories = action.payload.sub_categories || [];
                state.selectedSubCategories = action.payload.selected_sub_categories || [];
                state.error = null;
            })
            .addCase(fetchVendorProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch cities by state
            .addCase(fetchCitiesByState.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCitiesByState.fulfilled, (state, action) => {
                state.loading = false;
                state.cities = action.payload;
            })
            .addCase(fetchCitiesByState.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.cities = [];
            })
            // Fetch subcategories by category
            .addCase(fetchSubcategoriesByCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSubcategoriesByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.fetchedSubCategories = action.payload;
            })
            .addCase(fetchSubcategoriesByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.fetchedSubCategories = [];
            });
    },
});

// Export actions
export const { clearVendorData, updateVendorData, updateCities } = vendorSlice.actions;

// Export selectors
export const selectVendor = (state) => state.vendor.vendor;
export const selectStates = (state) => state.vendor.states;
export const selectCities = (state) => state.vendor.cities;
export const selectCategories = (state) => state.vendor.categories;
export const selectSubCategories = (state) => state.vendor.subCategories;
export const selectSelectedSubCategories = (state) => state.vendor.selectedSubCategories;
export const selectFetchedSubCategories = (state) => state.vendor.fetchedSubCategories;
export const selectVendorLoading = (state) => state.vendor.loading;
export const selectVendorError = (state) => state.vendor.error;

// Export reducer
export default vendorSlice.reducer;
