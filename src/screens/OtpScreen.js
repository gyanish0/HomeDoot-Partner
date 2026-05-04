import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator, Alert } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, sendOTP, updateFcmToken } from '../store/slices/authSlice';

const otpValidationSchema = Yup.object().shape({
    otp: Yup.string()
        .matches(/^[0-9]{4}$/, 'OTP must be exactly 4 digits')
        .required('OTP is required'),
});

const OtpScreen = ({ navigation, route }) => {
    const { mobileNumber, otpMessage } = route.params || {};
    const from = route?.params?.from;
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const [otpValues, setOtpValues] = useState(['', '', '', '']);
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const formik = useFormik({
        initialValues: {
            otp: '',
        },
        validationSchema: otpValidationSchema,
        onSubmit: async (values) => {
            try {
                const result = await dispatch(verifyOTP({ mobile: mobileNumber, otp: values.otp })).unwrap();
                console.log(result, 'result', route.params)

                // Check if this is a new vendor
                if (result?.is_new_vendor) {
                    // Redirect to Edit Profile screen for new vendor to complete registration
                    navigation.replace('EditProfile', {
                        vendor: result?.vendor,
                        isNewVendor: true,
                        hideBackButton: from === 'login',
                    });
                } else {
                    // After successful OTP verification, update FCM token and proceed to main app
                    dispatch(updateFcmToken());
                    navigation.replace('Dashboard');
                }
            } catch (error) {
                const errorMessage = typeof error === 'string' ? error : error?.message || 'Verification failed. Please try again.';
                Alert.alert('Error', errorMessage);
            }
        },
    });

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.charAt(value.length - 1);
        }

        const newOtpValues = [...otpValues];
        newOtpValues[index] = value;
        setOtpValues(newOtpValues);

        const otpString = newOtpValues.join('');
        formik.setFieldValue('otp', otpString);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index, key) => {
        if (key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (canResend) {
            setTimer(30);
            setCanResend(false);
            setOtpValues(['', '', '', '']);
            formik.resetForm();
            inputRefs.current[0]?.focus();

            try {
                const result = await dispatch(sendOTP(mobileNumber)).unwrap();
                if (result.status) {
                    Alert.alert('Success', 'OTP has been resent to your mobile number.');
                } else {
                    Alert.alert('Error', 'Failed to resend OTP. Please try again.');
                }
            } catch (error) {
                const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to resend OTP. Please try again.';
                Alert.alert('Error', errorMessage);
            }
        }
    };

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

                        {/* OTP Info */}
                        <View style={styles.infoContainer}>
                            <Text style={styles.infoTitle}>Enter OTP</Text>
                            <Text style={styles.infoSubtitle}>
                                We've sent a 4-digit code to
                            </Text>
                            <Text style={styles.mobileNumber}>+91 {mobileNumber}</Text>
                            {/* <Text style={styles.mobileNumber}>{otpMessage}</Text> */}
                        </View>

                        {/* OTP Input Boxes */}
                        <View style={styles.otpContainer}>
                            {[0, 1, 2, 3].map((index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={[
                                        styles.otpInput,
                                        formik.touched.otp && formik.errors.otp && styles.otpInputError
                                    ]}
                                    value={otpValues[index]}
                                    onChangeText={(value) => handleOtpChange(index, value)}
                                    onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    returnKeyType={index === 3 ? 'done' : 'next'}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {formik.touched.otp && formik.errors.otp && (
                            <Text style={styles.errorText}>{formik.errors.otp}</Text>
                        )}

                        {/* Resend OTP */}
                        <View style={styles.resendContainer}>
                            {!canResend ? (
                                <Text style={styles.timerText}>
                                    Resend OTP in {timer}s
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendOtp}>
                                    <Text style={styles.resendText}>Resend OTP</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                (!formik.isValid || loading) && styles.verifyButtonDisabled
                            ]}
                            onPress={formik.handleSubmit}
                            activeOpacity={0.8}
                            disabled={!formik.isValid || formik.isSubmitting || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>VERIFY & CONTINUE</Text>
                            )}
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.backButtonText}>← Back to Login</Text>
                        </TouchableOpacity>
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
        marginBottom: 60,
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
    infoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    infoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    mobileNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#B91C4F',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    otpInput: {
        width: 50,
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                paddingVertical: 15,
            },
            android: {
                paddingVertical: 12,
            },
        }),
    },
    otpInputError: {
        borderColor: '#ff4444',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10,
    },
    timerText: {
        fontSize: 14,
        color: '#666',
    },
    resendText: {
        fontSize: 14,
        color: '#B91C4F',
        fontWeight: '600',
    },
    verifyButton: {
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
    verifyButtonDisabled: {
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
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    backButton: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    backButtonText: {
        color: '#666',
        fontSize: 14,
    },
});

export default OtpScreen;
