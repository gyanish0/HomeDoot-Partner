import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getVendorBankDetails, updateVendorBankDetails } from '../services/vendorService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const bankValidationSchema = Yup.object().shape({
    // accountHolderName: Yup.string().required('Account holder name is required'),
    accountNumber: Yup.string().required('Account number is required'),
    ifscCode: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').required('IFSC code is required'),
    bankName: Yup.string().required('Bank name is required'),
    branchName: Yup.string().required('Branch name is required'),
});

const BankDetailsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [cancelledCheque, setCancelledCheque] = useState(null);
    const [existingBankDetails, setExistingBankDetails] = useState(null);

    const formik = useFormik({
        initialValues: {
            // accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: '',
        },
        validationSchema: bankValidationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Validate that cheque file is uploaded
                if (!cancelledCheque) {
                    Alert.alert('Required', 'Please upload a cancelled cheque image');
                    setLoading(false);
                    return;
                }

                const bankData = {
                    // accountHolderName: values.accountHolderName,
                    accountNumber: values.accountNumber,
                    ifscCode: values.ifscCode.toUpperCase(),
                    bankName: values.bankName,
                    branchName: values.branchName,
                    cancelledCheque: cancelledCheque,
                };

                const response = await updateVendorBankDetails(bankData);

                if (response.success) {
                    Alert.alert('Success', response.message || 'Bank details updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', response.message || 'Failed to update bank details');
                }
            } catch (error) {
                console.error('Bank details update error:', error);
                Alert.alert('Error', error.message || 'Failed to update bank details');
            } finally {
                setLoading(false);
            }
        },
    });

    // Fetch existing bank details
    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                setFetchingData(true);
                const response = await getVendorBankDetails();

                console.log('Bank details response:', response);

                if (response.success && response.data) {
                    const bankData = response.data.bank;

                    // Check if bank data exists (not null)
                    if (bankData) {
                        setExistingBankDetails(bankData);

                        // Populate form with existing data
                        formik.setValues({
                            // accountHolderName: bankData.account_holder_name || '',
                            accountNumber: bankData.account_number || '',
                            ifscCode: bankData.ifsc_code || '',
                            bankName: bankData.bank_name || '',
                            branchName: bankData.branch_name || '',
                        });
                    } else {
                        console.log('No existing bank details found - showing empty form');
                    }
                }
            } catch (error) {
                console.error('Error fetching bank details:', error);
                // Don't show error for first time users who don't have bank details yet
            } finally {
                setFetchingData(false);
            }
        };

        fetchBankDetails();
    }, []);

    const pickChequeImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1200,
            maxHeight: 1200,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                return;
            }
            if (response.error) {
                Alert.alert('Error', 'Failed to pick image');
                return;
            }

            if (response.assets && response.assets[0]) {
                const file = {
                    uri: response.assets[0].uri,
                    type: response.assets[0].type,
                    name: response.assets[0].fileName || 'cheque.jpg',
                };
                setCancelledCheque(file);
            }
        });
    };

    const handleSkip = () => {
        navigation.goBack();
    };

    // Show loading state while fetching data
    if (fetchingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#B91C4F" />
                <Text style={styles.loadingText}>Loading bank details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Bank Details</Text>
                <Text style={styles.subtitle}>
                    {existingBankDetails ? 'Update your bank account details' : 'Add your bank account for payments'}
                </Text>

                {/* Show existing bank status */}
                {existingBankDetails && (
                    <View style={styles.infoBox}>
                        <Icon name="information" size={20} color="#B91C4F" />
                        <Text style={styles.infoText}>
                            Bank account already added. You can update the details below.
                        </Text>
                    </View>
                )}

                {/* Account Holder Name */}
                {/* <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Holder Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter account holder name"
                        value={formik.values.accountHolderName}
                        onChangeText={formik.handleChange('accountHolderName')}
                        onBlur={formik.handleBlur('accountHolderName')}
                    />
                    {formik.touched.accountHolderName && formik.errors.accountHolderName && (
                        <Text style={styles.errorText}>{formik.errors.accountHolderName}</Text>
                    )}
                </View> */}

                {/* Account Number */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter account number"
                        keyboardType="number-pad"
                        value={formik.values.accountNumber}
                        onChangeText={formik.handleChange('accountNumber')}
                        onBlur={formik.handleBlur('accountNumber')}
                    />
                    {formik.touched.accountNumber && formik.errors.accountNumber && (
                        <Text style={styles.errorText}>{formik.errors.accountNumber}</Text>
                    )}
                </View>

                {/* IFSC Code */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>IFSC Code *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter IFSC code"
                        autoCapitalize="characters"
                        maxLength={11}
                        value={formik.values.ifscCode}
                        onChangeText={formik.handleChange('ifscCode')}
                        onBlur={formik.handleBlur('ifscCode')}
                    />
                    {formik.touched.ifscCode && formik.errors.ifscCode && (
                        <Text style={styles.errorText}>{formik.errors.ifscCode}</Text>
                    )}
                </View>

                {/* Bank Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Bank Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter bank name"
                        value={formik.values.bankName}
                        onChangeText={formik.handleChange('bankName')}
                        onBlur={formik.handleBlur('bankName')}
                    />
                    {formik.touched.bankName && formik.errors.bankName && (
                        <Text style={styles.errorText}>{formik.errors.bankName}</Text>
                    )}
                </View>

                {/* Branch Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Branch Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter branch name"
                        value={formik.values.branchName}
                        onChangeText={formik.handleChange('branchName')}
                        onBlur={formik.handleBlur('branchName')}
                    />
                    {formik.touched.branchName && formik.errors.branchName && (
                        <Text style={styles.errorText}>{formik.errors.branchName}</Text>
                    )}
                </View>

                {/* Cancelled Cheque Upload */}
                <View style={styles.documentContainer}>
                    <Text style={styles.label}>Cancelled Cheque *</Text>
                    <TouchableOpacity
                        style={[styles.uploadButton, !cancelledCheque && styles.uploadButtonError]}
                        onPress={pickChequeImage}
                    >
                        <Text style={styles.uploadButtonText}>
                            {cancelledCheque ? '✓ Image Selected' : 'Upload Cheque Image'}
                        </Text>
                    </TouchableOpacity>
                    {cancelledCheque && (
                        <Text style={styles.fileName}>{cancelledCheque.name}</Text>
                    )}
                    {!cancelledCheque && (
                        <Text style={styles.errorText}>Cheque image is required</Text>
                    )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={formik.handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {existingBankDetails ? 'UPDATE BANK DETAILS' : 'SAVE BANK DETAILS'}
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Cancel/Back Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>
                        {existingBankDetails ? 'Cancel' : 'Skip for now'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#B91C4F',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#B91C4F',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 5,
    },
    documentContainer: {
        marginBottom: 20,
        marginTop: 10,
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: '#B91C4F',
        borderRadius: 12,
        paddingVertical: 12,
        alignIteError: {
            borderColor: '#ff4444',
        },
        uploadButtonms: 'center',
        backgroundColor: '#fff',
    },
    uploadButtonText: {
        color: '#B91C4F',
        fontSize: 14,
        fontWeight: '600',
    },
    fileName: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    submitButton: {
        backgroundColor: '#B91C4F',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: '#B91C4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    skipButton: {
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    skipButtonText: {
        color: '#666',
        fontSize: 14,
    },
});

export default BankDetailsScreen;
