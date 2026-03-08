import axiosInstance from './axiosInstance';

export const getStates = async () => {
    try {
        const response = await axiosInstance.get('state');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getCities = async (stateId) => {
    try {
        const response = await axiosInstance.get(`https://doot.globleitsolutions.com/api/cities/${stateId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await axiosInstance.get('category');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getSubcategories = async (categoryId) => {
    try {
        const response = await axiosInstance.get(`https://doot.globleitsolutions.com/ajax-subcategory?cat_id=${categoryId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

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

export const getVendorDashboard = async (vendorId) => {
    try {
        const response = await axiosInstance.get(`vendor-dashboard?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

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

export const getVendorWallet = async (vendorId) => {
    try {
        const response = await axiosInstance.post(`vendor-wallet?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorReviews = async (vendorId) => {
    try {
        const response = await axiosInstance.post(`vendor-review?vendor_id=${vendorId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateVendorProfile = async (profileData) => {
    try {
        const formData = new FormData();

        // Add required fields
        formData.append('profile_guard', 'vendor');
        formData.append('role_id', '3');

        // Add profile fields
        if (profileData.emp_id) formData.append('emp_id', profileData.emp_id);
        if (profileData.name) formData.append('name', profileData.name);
        if (profileData.email) formData.append('email', profileData.email);
        if (profileData.mobile) formData.append('mobile', profileData.mobile);
        if (profileData.address) formData.append('address', profileData.address);
        if (profileData.state) formData.append('state', profileData.state);
        if (profileData.city) formData.append('city', profileData.city);
        if (profileData.pincode) formData.append('pincode', profileData.pincode);
        if (profileData.category) formData.append('category', profileData.category);

        // Add optional fields
        if (profileData.date_range) formData.append('date_range', profileData.date_range);
        if (profileData.non_availability_from) formData.append('non_availability_from', profileData.non_availability_from);
        if (profileData.non_availability_to) formData.append('non_availability_to', profileData.non_availability_to);

        // Add sub categories as array
        if (profileData.sub_category && Array.isArray(profileData.sub_category)) {
            profileData.sub_category.forEach(subCat => {
                formData.append('sub_category[]', subCat);
            });
        }

        // Add profile photo if provided
        if (profileData.profile_photo) {
            formData.append('profile_photo_path', {
                uri: profileData.profile_photo.uri,
                type: profileData.profile_photo.type || 'image/jpeg',
                name: profileData.profile_photo.name || 'profile.jpg',
            });
            formData.append('hid_profile_photo_path', profileData.profile_photo.name || 'profile.jpg');
        }

        // Add password fields if provided (for password change)
        if (profileData.password) {
            formData.append('password', profileData.password);
            formData.append('password_confirmation', profileData.password);
        }

        console.log('📤 Updating vendor profile');

        const response = await axiosInstance.post('profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

export const getVendorPendingOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/pending?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorAssignedOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/assigned?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorCompletedOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/completed`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorCancelledOrders = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`orders/cancelled?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorRatings = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`ratings?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorWalletCreditTransactions = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`https://doot.globleitsolutions.com/api/vendor-wallet-transaction/credit?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorWalletDebitTransactions = async (page = 1, perPage = 20) => {
    try {
        const response = await axiosInstance.get(`https://doot.globleitsolutions.com/api/vendor-wallet-transaction/debit?page=${page}&per_page=${perPage}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorOrderTodayDate = async () => {
    try {
        const response = await axiosInstance.get('https://doot.globleitsolutions.com/api/vendor-order-today-date/');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorTodayPendingOrders = async () => {
    try {
        const response = await axiosInstance.get('/today-pending-orders');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorCommissionCurrentMonth = async () => {
    try {
        const response = await axiosInstance.get('invoice/commission');
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorCommissionCustomRange = async (fromDate, toDate) => {
    try {
        const response = await axiosInstance.get(`invoice/commission?from_date=${fromDate}&to_date=${toDate}`);
        return response;
    } catch (error) {
        throw error;
    }
};

export const getVendorProfile = async () => {
    try {
        const response = await axiosInstance.get('profile');
        return response;
    } catch (error) {
        console.error('📡 Vendor profile API error:', error);
        throw error;
    }
};

export const getVendorBankDetails = async () => {
    try {
        const response = await axiosInstance.get('bank');
        return response;
    } catch (error) {
        console.error('Error fetching bank details:', error);
        throw error;
    }
};

export const updateVendorBankDetails = async (bankData) => {
    try {
        const formData = new FormData();

        // Add all required fields - ensure strings are properly formatted
        formData.append('account_number', String(bankData.accountNumber || ''));
        formData.append('bank_name', String(bankData.bankName || ''));
        formData.append('branch_name', String(bankData.branchName || ''));
        formData.append('ifsc_code', String(bankData.ifscCode || '').toUpperCase());

        // Add cheque file if provided
        if (bankData.cancelledCheque) {
            formData.append('cheque_file', {
                uri: bankData.cancelledCheque.uri,
                type: bankData.cancelledCheque.type || 'image/jpeg',
                name: bankData.cancelledCheque.name || 'cheque.jpg',
            });
            // Add hidden field with filename
            formData.append('hid_cheque_file', bankData.cancelledCheque.name || 'cheque.jpg');
        } else if (bankData.existingChequeFile) {
            // Send existing filename to indicate "keep existing file"
            formData.append('hid_cheque_file', bankData.existingChequeFile);
        }

        console.log('📤 Sending bank details update:', {
            accountNumber: bankData.accountNumber,
            bankName: bankData.bankName,
            branchName: bankData.branchName,
            ifscCode: bankData.ifscCode,
            hasChequeFile: !!bankData.cancelledCheque,
            approval: '0',
        });

        const response = await axiosInstance.post('bank/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Error updating bank details:', error);

        // Improve error message for server errors
        if (error.response?.status === 500) {
            throw new Error('Server error occurred. Please contact support or try again later.');
        }

        throw error;
    }
};

export const getVendorBusinessDetails = async () => {
    try {
        const response = await axiosInstance.get('business-details');
        return response;
    } catch (error) {
        console.error('Error fetching business details:', error);
        throw error;
    }
};

export const getOrderFullDetails = async (orderId) => {
    try {
        const response = await axiosInstance.get(`order/${orderId}/full-details`);
        return response;
    } catch (error) {
        console.error('Error fetching order full details:', error);
        throw error;
    }
};

export const acceptVendorOrder = async (orderNo) => {
    try {
        const response = await axiosInstance.post('orders/accept', {
            order_no: orderNo
        });
        return response;
    } catch (error) {
        console.error('Error accepting order:', error);
        throw error;
    }
};

export const sendJobStartOTP = async (orderNo) => {
    try {
        const response = await axiosInstance.post('order/job-start/send-otp', {
            order_no: orderNo
        });
        return response;
    } catch (error) {
        console.error('Error sending job start OTP:', error);
        throw error;
    }
};
export const sendJobStopOTP = async (orderNo) => {
    try {
        const response = await axiosInstance.post('order/job-stop/send-otp', {
            order_no: orderNo
        });
        return response;
    } catch (error) {
        console.error('Error sending job stop OTP:', error);
        throw error;
    }
};

export const resendJobStartOTP = async (orderNo) => {
    try {
        const response = await axiosInstance.post('order/job-start/resend-otp', {
            order_no: orderNo
        });
        return response;
    } catch (error) {
        console.error('Error resending job start OTP:', error);
        throw error;
    }
};

export const verifyJobStartOTP = async (orderNo, otp) => {
    try {
        const response = await axiosInstance.post('order/job-start/verify-otp', {
            order_no: orderNo,
            otp: otp
        });
        return response;
    } catch (error) {
        console.error('Error verifying job start OTP:', error);
        throw error;
    }
};
export const verifyJobStopOTP = async (orderNo, otp) => {
    try {
        const response = await axiosInstance.post('order/job-stop/verify-otp', {
            order_no: orderNo,
            otp: otp
        });
        return response;
    } catch (error) {
        console.error('Error verifying job stop OTP:', error);
        throw error;
    }
};

export const rescheduleVendorOrder = async (orderNo, serviceDate, serviceTime, vendorId) => {
    console.log('Rescheduling order:', { orderNo, serviceDate, serviceTime, vendorId });
    try {
        const response = await axiosInstance.post('order/reschedule', {
            order_no: orderNo,
            service_date: serviceDate,
            service_time: serviceTime,
            vid: vendorId
        });
        return response;
    } catch (error) {
        console.error('Error rescheduling order:', error);
        throw error;
    }
};

export const updateVendorBusinessDetails = async (businessData) => {
    try {
        const formData = new FormData();

        // Add text fields
        if (businessData.businessName) formData.append('business_name', businessData.businessName);
        if (businessData.contactPerson) formData.append('contact_person', businessData.contactPerson);
        if (businessData.mobile) formData.append('contact_mobile', businessData.mobile);
        if (businessData.businessAddress) formData.append('business_address', businessData.businessAddress);
        if (businessData.gstDetails) formData.append('gst_details', businessData.gstDetails);
        if (businessData.panDetails) formData.append('pan_details', businessData.panDetails);
        if (businessData.aadharNumber) formData.append('aadhar_details', businessData.aadharNumber);

        // Add GST file with _val field
        if (businessData.gstFile) {
            const gstFileData = {
                uri: businessData.gstFile.uri,
                type: businessData.gstFile.type || 'image/jpeg',
                name: businessData.gstFile.name || 'gst_file.jpg',
            };
            formData.append('gst_file', gstFileData);
            formData.append('gst_file_val', gstFileData.name);
        } else if (businessData.existingGstFile) {
            formData.append('gst_file_val', businessData.existingGstFile);
        }

        // Add PAN file with _val field
        if (businessData.panFile) {
            const panFileData = {
                uri: businessData.panFile.uri,
                type: businessData.panFile.type || 'image/jpeg',
                name: businessData.panFile.name || 'pan_file.jpg',
            };
            formData.append('pan_file', panFileData);
            formData.append('pan_file_val', panFileData.name);
        } else if (businessData.existingPanFile) {
            // Send existing filename to indicate "keep existing file"
            formData.append('pan_file_val', businessData.existingPanFile);
        }

        // Add TAN file with _val field (previously udyogFile)
        if (businessData.udyogFile) {
            const tanFileData = {
                uri: businessData.udyogFile.uri,
                type: businessData.udyogFile.type || 'image/jpeg',
                name: businessData.udyogFile.name || 'tan_file.jpg',
            };
            formData.append('tan_file', tanFileData);
            formData.append('tan_file_val', tanFileData.name);
        } else if (businessData.existingTanFile) {
            formData.append('tan_file_val', businessData.existingTanFile);
        }

        // Add Address Proof with _val field
        if (businessData.addressProof) {
            const addressProofData = {
                uri: businessData.addressProof.uri,
                type: businessData.addressProof.type || 'image/jpeg',
                name: businessData.addressProof.name || 'address_proof.jpg',
            };
            formData.append('address_proof', addressProofData);
            formData.append('address_proof_val', addressProofData.name);
        } else if (businessData.existingAddressProof) {
            formData.append('address_proof_val', businessData.existingAddressProof);
        }

        // Add Aadhar Proof (front) with _val field
        if (businessData.aadharProof) {
            const aadharProofData = {
                uri: businessData.aadharProof.uri,
                type: businessData.aadharProof.type || 'image/jpeg',
                name: businessData.aadharProof.name || 'aadhar_proof.jpg',
            };
            formData.append('aadhar_proof', aadharProofData);
            formData.append('aadhar_proof_val', aadharProofData.name);
        } else if (businessData.existingAadharProof) {
            formData.append('aadhar_proof_val', businessData.existingAadharProof);
        }

        // Add Aadhar Back with _val field
        if (businessData.aadharBack) {
            const aadharBackData = {
                uri: businessData.aadharBack.uri,
                type: businessData.aadharBack.type || 'image/jpeg',
                name: businessData.aadharBack.name || 'aadhar_back.jpg',
            };
            formData.append('aadhar_back', aadharBackData);
            formData.append('aadhar_back_val', aadharBackData.name);
        }

        console.log('📤 Sending business details update:', {
            businessName: businessData.businessName,
            contactPerson: businessData.contactPerson,
            contactMobile: businessData.mobile,
            hasGstFile: !!businessData.gstFile,
            hasPanFile: !!businessData.panFile,
            hasTanFile: !!businessData.udyogFile,
            hasAddressProof: !!businessData.addressProof,
            hasAadharProof: !!businessData.aadharProof,
            hasAadharBack: !!businessData.aadharBack,
        });

        const response = await axiosInstance.post('update-business', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    } catch (error) {
        console.error('Error updating business details:', error);

        if (error.response?.status === 500) {
            throw new Error('Server error occurred. Please contact support or try again later.');
        }

        throw error;
    }
};

export const updateVendorLeave = async (leaveData) => {
    try {
        const requestData = {
            non_availability_from: leaveData.non_availability_from,
            non_availability_to: leaveData.non_availability_to,
        };

        console.log('📤 Updating vendor leave period:', requestData);

        const response = await axiosInstance.post('profile/update-leave', requestData);
        return response;
    } catch (error) {
        console.error('Error updating leave period:', error);
        throw error;
    }
};

export const createWalletOrder = async (amount) => {
    try {
        const requestData = {
            amount: amount,
        };

        console.log('📤 Creating wallet order:', requestData);

        const response = await axiosInstance.post('wallet/add-amount', requestData);
        return response;
    } catch (error) {
        console.error('Error creating wallet order:', error);
        throw error;
    }
};

export const verifyWalletPayment = async (paymentData) => {
    try {
        const requestData = {
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
        };

        console.log('📤 Verifying wallet payment:', requestData);

        const response = await axiosInstance.post('wallet/verify-payment', requestData);
        return response;
    } catch (error) {
        console.error('Error verifying wallet payment:', error);
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
    getVendorProfile,
    getVendorBankDetails,
    updateVendorBankDetails,
    getVendorBusinessDetails,
    updateVendorBusinessDetails,
    getOrderFullDetails,
    acceptVendorOrder,
    sendJobStartOTP,
    resendJobStartOTP,
    verifyJobStartOTP,
    sendJobStopOTP,
    verifyJobStopOTP,
    rescheduleVendorOrder,
    updateVendorLeave,
    createWalletOrder,
    verifyWalletPayment,
};
