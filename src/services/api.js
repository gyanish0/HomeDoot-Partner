/**
 * API Service Configuration
 * Base API client setup similar to Android's RetrofitClient
 */

const BASE_URL = 'https://www.homedoot.com/';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} - API response
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const defaultOptions = {
        headers,
        ...options,
    };

    try {
        const response = await fetch(url, defaultOptions);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON Response:', text.substring(0, 200));
            throw new Error('Server returned non-JSON response. Please check your API endpoint.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        if (error.message.includes('JSON Parse error') || error.message.includes('JSON')) {
            throw new Error('Failed to parse server response. Server may be down or endpoint is incorrect.');
        }
        throw error;
    }
};

/**
 * GET request
 */
export const get = (endpoint, options = {}) => {
    return apiRequest(endpoint, {
        method: 'GET',
        ...options,
    });
};

/**
 * POST request
 */
export const post = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    });
};

/**
 * POST request with URL parameters (like Android's @Query)
 */
export const postWithQuery = (endpoint, params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return apiRequest(url, {
        method: 'POST',
        ...options,
    });
};

/**
 * Multipart/form-data POST request
 */
export const postMultipart = (endpoint, formData, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions = {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header for FormData, browser will set it automatically with boundary
        ...options,
    };

    return fetch(url, defaultOptions)
        .then(response => response.json())
        .catch(error => {
            console.error('API Error:', error);
            throw error;
        });
};

export default {
    get,
    post,
    postWithQuery,
    postMultipart,
    BASE_URL,
};
