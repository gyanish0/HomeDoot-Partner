import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { mockStatesData, mockCitiesData, mockCategoriesData, mockRegistrationResponse } from '../data/mockData';
import { saveValue } from '../utils/storage';

const registrationValidationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile: Yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits').required('Mobile is required'),
    address: Yup.string().required('Address is required'),
    stateId: Yup.number().min(1, 'Select state').required('State is required'),
    cityId: Yup.number().min(1, 'Select city').required('City is required'),
    pincode: Yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password is required'),
    category: Yup.string().required('Category is required'),
});

const RegisterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otp, setOtp] = useState('');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        fetchStates();
        fetchCategories();
    }, []);

    const fetchStates = async () => {
        try {
            // Use mock data
            await new Promise(resolve => setTimeout(resolve, 300));
            setStates(mockStatesData.data);
        } catch (error) {
            console.error('Error fetching states:', error);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            // Use mock data
            await new Promise(resolve => setTimeout(resolve, 300));
            const citiesForState = mockCitiesData[stateId] || { data: [] };
            setCities(citiesForState.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            // Use mock data
            await new Promise(resolve => setTimeout(resolve, 300));
            setCategories(mockCategoriesData.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            mobile: '',
            address: '',
            stateId: 0,
            cityId: 0,
            pincode: '',
            password: '',
            confirmPassword: '',
            category: '',
        },
        validationSchema: registrationValidationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Use mock OTP
                setVerificationCode('123456');
                setShowOtpDialog(true);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                Alert.alert('Error', error.message || 'Registration failed');
            }
        },
    });

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            Alert.alert('Error', 'Please enter 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use mock response
            await saveValue('vendor_id', mockRegistrationResponse.data.id.toString());
            setLoading(false);

            Alert.alert('Success', 'Registration successful!', [
                { text: 'OK', onPress: () => navigation.navigate('BusinessDetails') }
            ]);
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message || 'Verification failed');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Partner Registration</Text>
                <Text style={styles.subtitle}>Join HomeDoot as a Service Partner</Text>

                {/* Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={formik.values.name}
                        onChangeText={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <Text style={styles.errorText}>{formik.errors.name}</Text>
                    )}
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formik.values.email}
                        onChangeText={formik.handleChange('email')}
                        onBlur={formik.handleBlur('email')}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <Text style={styles.errorText}>{formik.errors.email}</Text>
                    )}
                </View>

                {/* Mobile */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile Number *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="10-digit mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={formik.values.mobile}
                        onChangeText={formik.handleChange('mobile')}
                        onBlur={formik.handleBlur('mobile')}
                    />
                    {formik.touched.mobile && formik.errors.mobile && (
                        <Text style={styles.errorText}>{formik.errors.mobile}</Text>
                    )}
                </View>

                {/* Category */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Service Category *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formik.values.category}
                            onValueChange={(value) => formik.setFieldValue('category', value)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select Category" value="" />
                            {categories.map((cat) => (
                                <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                            ))}
                        </Picker>
                    </View>
                    {formik.touched.category && formik.errors.category && (
                        <Text style={styles.errorText}>{formik.errors.category}</Text>
                    )}
                </View>

                {/* Address */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Address *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter your complete address"
                        multiline
                        numberOfLines={3}
                        value={formik.values.address}
                        onChangeText={formik.handleChange('address')}
                        onBlur={formik.handleBlur('address')}
                    />
                    {formik.touched.address && formik.errors.address && (
                        <Text style={styles.errorText}>{formik.errors.address}</Text>
                    )}
                </View>

                {/* State */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>State *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formik.values.stateId}
                            onValueChange={(value) => {
                                formik.setFieldValue('stateId', value);
                                formik.setFieldValue('cityId', 0);
                                if (value > 0) {
                                    fetchCities(value);
                                }
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select State" value={0} />
                            {states.map((state) => (
                                <Picker.Item key={state.id} label={state.name} value={state.id} />
                            ))}
                        </Picker>
                    </View>
                    {formik.touched.stateId && formik.errors.stateId && (
                        <Text style={styles.errorText}>{formik.errors.stateId}</Text>
                    )}
                </View>

                {/* City */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>City *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={formik.values.cityId}
                            onValueChange={(value) => formik.setFieldValue('cityId', value)}
                            style={styles.picker}
                            enabled={cities.length > 0}
                        >
                            <Picker.Item label="Select City" value={0} />
                            {cities.map((city) => (
                                <Picker.Item key={city.id} label={city.name} value={city.id} />
                            ))}
                        </Picker>
                    </View>
                    {formik.touched.cityId && formik.errors.cityId && (
                        <Text style={styles.errorText}>{formik.errors.cityId}</Text>
                    )}
                </View>

                {/* Pincode */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Pincode *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="6-digit pincode"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={formik.values.pincode}
                        onChangeText={formik.handleChange('pincode')}
                        onBlur={formik.handleBlur('pincode')}
                    />
                    {formik.touched.pincode && formik.errors.pincode && (
                        <Text style={styles.errorText}>{formik.errors.pincode}</Text>
                    )}
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Minimum 6 characters"
                        secureTextEntry
                        value={formik.values.password}
                        onChangeText={formik.handleChange('password')}
                        onBlur={formik.handleBlur('password')}
                    />
                    {formik.touched.password && formik.errors.password && (
                        <Text style={styles.errorText}>{formik.errors.password}</Text>
                    )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirm Password *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Re-enter password"
                        secureTextEntry
                        value={formik.values.confirmPassword}
                        onChangeText={formik.handleChange('confirmPassword')}
                        onBlur={formik.handleBlur('confirmPassword')}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <Text style={styles.errorText}>{formik.errors.confirmPassword}</Text>
                    )}
                </View>

                {/* Register Button */}
                <TouchableOpacity
                    style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                    onPress={formik.handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.registerButtonText}>REGISTER</Text>
                    )}
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginLink}>Login</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* OTP Dialog */}
            {showOtpDialog && (
                <View style={styles.dialogOverlay}>
                    <View style={styles.dialogContainer}>
                        <Text style={styles.dialogTitle}>Enter OTP</Text>
                        <Text style={styles.dialogSubtitle}>
                            We've sent a 6-digit code to your mobile
                        </Text>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter 6-digit OTP"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />
                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>VERIFY</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowOtpDialog(false)}
                        >
                            <Text style={styles.cancelButtonText}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        overflow: 'hidden',
    },
    picker: {
        height: Platform.OS === 'ios' ? 150 : 50,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 5,
    },
    registerButton: {
        backgroundColor: '#B91C4F',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#B91C4F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    registerButtonDisabled: {
        backgroundColor: '#ccc',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    loginText: {
        color: '#333',
        fontSize: 14,
    },
    loginLink: {
        color: '#B91C4F',
        fontSize: 14,
        fontWeight: '600',
    },
    dialogOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialogContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        width: '85%',
        alignItems: 'center',
    },
    dialogTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    dialogSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    otpInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 18,
        width: '100%',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 5,
    },
    verifyButton: {
        backgroundColor: '#B91C4F',
        borderRadius: 30,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 14,
    },
});

export default RegisterScreen;
