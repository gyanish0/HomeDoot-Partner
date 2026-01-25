import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { mockUserData } from '../data/mockData';
import { getValue } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

const bankValidationSchema = Yup.object().shape({
    accountHolderName: Yup.string().required('Account holder name is required'),
    accountNumber: Yup.string().required('Account number is required'),
    ifscCode: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').required('IFSC code is required'),
    bankName: Yup.string().required('Bank name is required'),
    branchName: Yup.string().required('Branch name is required'),
});

const BankDetailsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [cancelledCheque, setCancelledCheque] = useState(null);
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            branchName: '',
        },
        validationSchema: bankValidationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const vendorId = await getValue('vendor_id');
                if (!vendorId) {
                    Alert.alert('Error', 'Vendor ID not found. Please register again.');
                    setLoading(false);
                    return;
                }

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Use mock response and login
                await login(mockUserData);
                setLoading(false);

                Alert.alert('Success', 'Registration completed successfully!');
            } catch (error) {
                setLoading(false);
                Alert.alert('Error', error.message || 'Failed to save bank details');
            }
        },
    });

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

    const handleSkip = async () => {
        Alert.alert(
            'Skip Bank Details',
            'You can add bank details later from your profile. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: async () => {
                        const vendorId = await getValue('vendor_id');
                        await login({ id: vendorId });
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                        });
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Bank Details</Text>
                <Text style={styles.subtitle}>Add your bank account for payments</Text>

                {/* Account Holder Name */}
                <View style={styles.inputContainer}>
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
                </View>

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
                    <Text style={styles.label}>Cancelled Cheque (Optional)</Text>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={pickChequeImage}
                    >
                        <Text style={styles.uploadButtonText}>
                            {cancelledCheque ? '✓ Image Selected' : 'Upload Cheque Image'}
                        </Text>
                    </TouchableOpacity>
                    {cancelledCheque && (
                        <Text style={styles.fileName}>{cancelledCheque.name}</Text>
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
                        <Text style={styles.submitButtonText}>COMPLETE REGISTRATION</Text>
                    )}
                </TouchableOpacity>

                {/* Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                >
                    <Text style={styles.skipButtonText}>Skip for now</Text>
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
        marginBottom: 30,
        textAlign: 'center',
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
        alignItems: 'center',
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
