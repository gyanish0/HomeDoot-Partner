/**
 * Vendor/Partner API Service
 * Handles all vendor-related API calls
 */

import { get, post, postMultipart } from './api';

/**
 * Get states list
 * @returns {Promise} - API response with states
 */
export const getStates = async () => {
    try {
        const response = await get('state');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get cities by state ID
 * @param {number} stateId - State ID
 * @returns {Promise} - API response with cities
 */
export const getCities = async (stateId) => {
    try {
        const response = await post('city', null, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const url = `city?state_id=${stateId}`;
        const citiesResponse = await post(url);
        return citiesResponse;
    } catch (error) {
        throw error;
    }
};

/**
 * Get categories list
 * @returns {Promise} - API response with categories
 */
export const getCategories = async () => {
    try {
        const response = await get('category');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Upload vendor business details
 * @param {object} businessData - Business details form data
 * @returns {Promise} - API response
 */
export const uploadBusinessDetails = async (businessData) => {
    try {
        const formData = new FormData();
        formData.append('business_name', businessData.businessName);
        formData.append('contact_person', businessData.contactPerson);
        formData.append('contact_mobile', businessData.contactMobile);
        formData.append('business_address', businessData.businessAddress);
        formData.append('pan_details', businessData.panDetails);
        formData.append('aadhar_details', businessData.aadharDetails);
        formData.append('vendor_id', businessData.vendorId);

        // Add optional files if present
        if (businessData.addressProof) {
            formData.append('hid_address_proof', businessData.addressProof);
        }
        if (businessData.tanFile) {
            formData.append('hid_tan_file', businessData.tanFile);
        }
        if (businessData.panFile) {
            formData.append('hid_pan_file', businessData.panFile);
        }
        if (businessData.aadharProof) {
            formData.append('hid_aadhar_proof', businessData.aadharProof);
        }

        const response = await postMultipart('vendor-business-details', formData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Upload vendor bank details
 * @param {object} bankData - Bank details form data
 * @returns {Promise} - API response
 */
export const uploadBankDetails = async (bankData) => {
    try {
        const formData = new FormData();
        formData.append('vendor_id', bankData.vendorId);
        formData.append('account_holder_name', bankData.accountHolderName);
        formData.append('account_number', bankData.accountNumber);
        formData.append('ifsc_code', bankData.ifscCode);
        formData.append('bank_name', bankData.bankName);
        formData.append('branch_name', bankData.branchName);

        if (bankData.cancelledCheque) {
            formData.append('cancelled_cheque', bankData.cancelledCheque);
        }

        const response = await postMultipart('vendor-bank-details', formData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor dashboard data
 * @param {string} vendorId - Vendor ID
 * @returns {Promise} - API response with dashboard data
 */
export const getVendorDashboard = async (vendorId) => {
    try {
        const response = await get(`vendor-dashboard?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor orders
 * @param {string} vendorId - Vendor ID
 * @param {string} status - Order status (pending, completed, etc.)
 * @returns {Promise} - API response with orders
 */
export const getVendorOrders = async (vendorId, status = '') => {
    try {
        const url = status
            ? `vendor-order?vendor_id=${vendorId}&status=${status}`
            : `vendor-order?vendor_id=${vendorId}`;
        const response = await post(url);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor wallet details
 * @param {string} vendorId - Vendor ID
 * @returns {Promise} - API response with wallet data
 */
export const getVendorWallet = async (vendorId) => {
    try {
        const response = await post(`vendor-wallet?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor reviews/ratings
 * @param {string} vendorId - Vendor ID
 * @returns {Promise} - API response with reviews
 */
export const getVendorReviews = async (vendorId) => {
    try {
        const response = await post(`vendor-review?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Update vendor profile
 * @param {object} profileData - Profile data
 * @returns {Promise} - API response
 */
export const updateVendorProfile = async (profileData) => {
    try {
        const formData = new FormData();
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== null && profileData[key] !== undefined) {
                formData.append(key, profileData[key]);
            }
        });

        const response = await postMultipart('update_profile', formData);
        return response;
    } catch (error) {
        throw error;
    }
};

export default {
    getStates,
    getCities,
    getCategories,
    uploadBusinessDetails,
    uploadBankDetails,
    getVendorDashboard,
    getVendorOrders,
    getVendorWallet,
    getVendorReviews,
    updateVendorProfile,
};
