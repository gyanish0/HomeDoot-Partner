/**
 * Vendor/Partner API Service
 * Handles all vendor-related API calls
 */

import axiosInstance from './axiosInstance';

/**
 * Get states list
 * @returns {Promise} - API response with states
 */
export const getStates = async () => {
    try {
        const response = await axiosInstance.get('state');
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
        const response = await axiosInstance.get(`city?state_id=${stateId}`);
        return response;
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
        const response = await axiosInstance.get('category');
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

        const response = await axiosInstance.post('vendor-business-details', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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

        const response = await axiosInstance.post('vendor-bank-details', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
        const response = await axiosInstance.get(`vendor-dashboard?vendor_id=${vendorId}`);
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
        const response = await axiosInstance.post(url);
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
        const response = await axiosInstance.post(`vendor-wallet?vendor_id=${vendorId}`);
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
        const response = await axiosInstance.post(`vendor-review?vendor_id=${vendorId}`);
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

        const response = await axiosInstance.post('update_profile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor pending orders with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with pending orders
 */
export const getVendorPendingOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/pending?page=${page}&per_page=${perPage}`);
        console.log(response, '12345678');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor assigned orders with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with assigned orders
 */
export const getVendorAssignedOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/assigned?page=${page}&per_page=${perPage}`);
        console.log(response, '12345678');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor completed orders with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with completed orders
 */
export const getVendorCompletedOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/completed`);
        console.log(response, '12345678');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor cancelled orders with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with cancelled orders
 */
export const getVendorCancelledOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/cancelled?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor ratings with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)`
 * @returns {Promise} - API response with ratings
 */
export const getVendorRatings = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`ratings?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor wallet credit transactions
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with credit transactions
 */
export const getVendorWalletCreditTransactions = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`vendor-wallet-transaction/credit?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor wallet debit transactions
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise} - API response with debit transactions
 */
export const getVendorWalletDebitTransactions = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`vendor-wallet-transaction/debit?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor commission invoice for current month
 * @returns {Promise} - API response with commission data
 */
export const getVendorCommissionCurrentMonth = async () => {
    try {
        const response = await axiosInstance.get('invoice/commission');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get vendor commission invoice for custom date range
 * @param {string} fromDate - Start date (YYYY-MM-DD format)
 * @param {string} toDate - End date (YYYY-MM-DD format)
 * @returns {Promise} - API response with commission data
 */
export const getVendorCommissionCustomRange = async (fromDate, toDate) => {
    try {
        const response = await axiosInstance.get(`invoice/commission?from_date=${fromDate}&to_date=${toDate}`);
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
    getVendorPendingOrders,
    getVendorAssignedOrders,
    getVendorCompletedOrders,
    getVendorCancelledOrders,
    getVendorRatings,
    getVendorWalletCreditTransactions,
    getVendorWalletDebitTransactions,
    getVendorCommissionCurrentMonth,
    getVendorCommissionCustomRange,
};
