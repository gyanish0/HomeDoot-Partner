/**
 * Image Utility Functions
 * Handles image URL transformations and formatting
 */

import { BASE_URL } from '../config/api';

const STORAGE_PATH = '/storage/app/public/images/profile/';

export const getProfileImageUrl = (vendor) => {
    if (!vendor) {
        return 'https://via.placeholder.com/100';
    }

    // If profile_photo_path exists, construct proper storage URL
    if (vendor.profile_photo_path) {
        return `${BASE_URL}${STORAGE_PATH}${vendor.profile_photo_path}`;
    }

    // Fallback to profile_photo_url if available
    if (vendor.profile_photo_url) {
        return vendor.profile_photo_url;
    }

    // Default placeholder
    return 'https://via.placeholder.com/100';
};

/**
 * Get business document URL
 * @param {string} filename - Document filename
 * @param {string} type - Document type (gst, pan, aadhar, etc.)
 * @returns {string} - Complete document URL
 */
export const getDocumentUrl = (filename, type = 'documents') => {
    if (!filename) return null;
    return `${BASE_URL}/storage/app/public/${type}/${filename}`;
};

/**
 * Format image object for upload
 * @param {Object} imageData - Image picker response data
 * @returns {Object} - Formatted object for FormData
 */
export const formatImageForUpload = (imageData) => {
    if (!imageData) return null;

    return {
        uri: imageData.uri,
        type: imageData.type || 'image/jpeg',
        name: imageData.fileName || imageData.name || `image_${Date.now()}.jpg`,
    };
};
