/**
 * Razorpay Configuration
 * 
 * Update these values with your actual Razorpay credentials
 * Test Key: For development and testing
 * Live Key: For production
 */

const RAZORPAY_CONFIG = {
    // Use test key for development
    key: __DEV__ ? 'rzp_live_RnATDVxI8IDLjP' : 'rzp_live_RnATDVxI8IDLjP',

    // Company details
    company: {
        name: 'HomeDoot',
        logo: 'https://www.homedoot.com/logo.png', // Update with your actual logo URL
        description: 'Wallet Recharge',
    },

    // Payment options
    currency: 'INR',
    theme: {
        color: '#6C5CE7',
    },
};

export default RAZORPAY_CONFIG;
