import axiosInstance from './axiosInstance';

export const sendOTP = async (mobile) => {
    try {
        const response = await axiosInstance.post('/send-otp', {
            mobile: mobile,
        });
        return response;
    } catch (error) {
        console.error('Send OTP Error:', error);
        throw error;
    }
};

export const verifyOTP = async (mobile, otp) => {
    try {
        const response = await axiosInstance.post('/verify-otp', {
            mobile: mobile,
            otp: otp,
        });
        return response;
    } catch (error) {
        console.error('Verify OTP Error:', error);
        throw error;
    }
};

export const getDashboard = async () => {
    try {
        const response = await axiosInstance.get('/dashboard');
        return response;
    } catch (error) {
        console.error('Get Dashboard Error:', error);
        throw error;
    }
};

/**
 * Logout vendor
 * @returns {Promise} - API response
 */
export const logout = async () => {
    try {
        const response = await axiosInstance.post('/logout');
        return response;
    } catch (error) {
        console.error('Logout Error:', error);
        throw error;
    }
};

export const sendLoginOtp = sendOTP;
export const verifyLoginOtp = verifyOTP;

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
