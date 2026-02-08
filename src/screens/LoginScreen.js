import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { sendOTP, clearError } from '../store/slices/authSlice';

const loginValidationSchema = Yup.object().shape({
    mobileNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
        .required('Mobile number is required'),
});

const LoginScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading, error, otpSent } = useSelector((state) => state.auth);

    const formik = useFormik({
        initialValues: {
            mobileNumber: '',
        },
        validationSchema: loginValidationSchema,
        onSubmit: async (values) => {
            try {
                const result = await dispatch(sendOTP(values.mobileNumber)).unwrap();
                if (result.status) {
                    navigation.navigate('Otp', {
                        mobileNumber: values.mobileNumber,
                        otpMessage: result.message,
                        from: 'login'
                    });
                } else {
                    Alert.alert('Error', result.message || 'Failed to send OTP. Please try again.');
                }
            } catch (error) {
                Alert.alert('Error', error || 'Something went wrong. Please try again.');
            }
        },
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/hdloginlogo.png')}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Mobile Number Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    formik.touched.mobileNumber && formik.errors.mobileNumber && styles.inputError
                                ]}
                                placeholder="Enter Mobile Number"
                                placeholderTextColor="#999"
                                value={formik.values.mobileNumber}
                                onChangeText={(text) => {
                                    // Remove country code prefix if present
                                    let cleanNumber = text.replace(/^\+91/, '').replace(/^91/, '');
                                    // Keep only numbers
                                    cleanNumber = cleanNumber.replace(/[^0-9]/g, '');
                                    // Limit to 10 digits
                                    cleanNumber = cleanNumber.slice(0, 10);
                                    formik.setFieldValue('mobileNumber', cleanNumber);
                                }}
                                onBlur={formik.handleBlur('mobileNumber')}
                                keyboardType="phone-pad"
                                maxLength={13}
                                returnKeyType="done"
                                autoComplete="tel"
                            />
                            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                                <Text style={styles.errorText}>{formik.errors.mobileNumber}</Text>
                            )}
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                (!formik.isValid || loading) && styles.loginButtonDisabled
                            ]}
                            onPress={formik.handleSubmit}
                            activeOpacity={0.8}
                            disabled={!formik.isValid || formik.isSubmitting || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>SEND OTP</Text>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 30,
        paddingVertical: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 80,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoImage: {
        marginRight: 15,
    },
    logoTextContainer: {
        justifyContent: 'center',
    },
    logoHomedoot: {
        color: '#B91C4F',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    logoHomeServices: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: Platform.OS === 'ios' ? 18 : 16,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#ff4444',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    loginButton: {
        backgroundColor: '#B91C4F',
        borderRadius: 30,
        paddingVertical: Platform.OS === 'ios' ? 18 : 16,
        alignItems: 'center',
        marginBottom: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#B91C4F',
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    loginButtonDisabled: {
        backgroundColor: '#ccc',
        ...Platform.select({
            ios: {
                shadowOpacity: 0,
            },
            android: {
                elevation: 0,
            },
        }),
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#333',
        fontSize: 14,
    },
    registerLink: {
        color: '#333',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
