import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const businessValidationSchema = Yup.object().shape({
    businessName: Yup.string().required('Business name is required'),
    contactPerson: Yup.string().required('Contact person is required'),
    mobile: Yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits').required('Mobile is required'),
    businessAddress: Yup.string().required('Business address is required'),
    panDetails: Yup.string().required('PAN details are required'),
    aadharNumber: Yup.string().matches(/^[0-9]{12}$/, 'Aadhar must be 12 digits').required('Aadhar number is required'),
});

const BusinessDetailsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState({
        gstFile: null,
        panFile: null,
        udyogFile: null,
        addressProof: null,
        aadharProof: null,
    });

    const formik = useFormik({
        initialValues: {
            businessName: '',
            contactPerson: '',
            mobile: '',
            businessAddress: '',
            gstDetails: '',
            panDetails: '',
            aadharNumber: '',
        },
        validationSchema: businessValidationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                setLoading(false);
                Alert.alert('Success', 'Business details updated successfully!');
            } catch (error) {
                setLoading(false);
                Alert.alert('Error', error.message || 'Failed to update business details');
            }
        },
    });

    const pickDocument = (documentType) => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
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
                    name: response.assets[0].fileName || 'document.jpg',
                };
                setDocuments(prev => ({ ...prev, [documentType]: file }));
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Business Name - Full Width */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Business Name <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter business name"
                        value={formik.values.businessName}
                        onChangeText={formik.handleChange('businessName')}
                        onBlur={formik.handleBlur('businessName')}
                    />
                    {formik.touched.businessName && formik.errors.businessName && (
                        <Text style={styles.errorText}>{formik.errors.businessName}</Text>
                    )}
                </View>

                {/* Contact Person and Mobile - Side by Side */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Contact Person <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter contact person"
                            value={formik.values.contactPerson}
                            onChangeText={formik.handleChange('contactPerson')}
                            onBlur={formik.handleBlur('contactPerson')}
                        />
                        {formik.touched.contactPerson && formik.errors.contactPerson && (
                            <Text style={styles.errorText}>{formik.errors.contactPerson}</Text>
                        )}
                    </View>

                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Mobile <Text style={styles.required}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile"
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
                </View>

                {/* Registered Business Address - Full Width */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Registered Business Address <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Enter complete business address"
                        multiline
                        numberOfLines={3}
                        value={formik.values.businessAddress}
                        onChangeText={formik.handleChange('businessAddress')}
                        onBlur={formik.handleBlur('businessAddress')}
                    />
                    {formik.touched.businessAddress && formik.errors.businessAddress && (
                        <Text style={styles.errorText}>{formik.errors.businessAddress}</Text>
                    )}
                </View>

                {/* GST Details */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>GST Details</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter GST number"
                        autoCapitalize="characters"
                        value={formik.values.gstDetails}
                        onChangeText={formik.handleChange('gstDetails')}
                    />
                </View>

                {/* GST File */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>GST File</Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => pickDocument('gstFile')}
                    >
                        <Text style={styles.fileButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    {documents.gstFile && (
                        <Text style={styles.fileName} numberOfLines={1}>Selected</Text>
                    )}
                </View>

                {/* PAN Details */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>PAN Details <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter PAN number"
                        autoCapitalize="characters"
                        maxLength={10}
                        value={formik.values.panDetails}
                        onChangeText={formik.handleChange('panDetails')}
                        onBlur={formik.handleBlur('panDetails')}
                    />
                    {formik.touched.panDetails && formik.errors.panDetails && (
                        <Text style={styles.errorText}>{formik.errors.panDetails}</Text>
                    )}
                </View>

                {/* PAN File */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>PAN File <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => pickDocument('panFile')}
                    >
                        <Text style={styles.fileButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    {documents.panFile && (
                        <Text style={styles.fileName} numberOfLines={1}>Selected</Text>
                    )}
                </View>

                {/* UDYOG File */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>UDYOG File</Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => pickDocument('udyogFile')}
                    >
                        <Text style={styles.fileButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    {documents.udyogFile && (
                        <Text style={styles.fileName} numberOfLines={1}>Selected</Text>
                    )}
                </View>

                {/* Address Proof */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Address Proof</Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => pickDocument('addressProof')}
                    >
                        <Text style={styles.fileButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    {documents.addressProof && (
                        <Text style={styles.fileName} numberOfLines={1}>Selected</Text>
                    )}
                </View>

                {/* Aadhar Number */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Aadhar Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="12-digit Aadhar"
                        keyboardType="number-pad"
                        maxLength={12}
                        value={formik.values.aadharNumber}
                        onChangeText={formik.handleChange('aadharNumber')}
                        onBlur={formik.handleBlur('aadharNumber')}
                    />
                    {formik.touched.aadharNumber && formik.errors.aadharNumber && (
                        <Text style={styles.errorText}>{formik.errors.aadharNumber}</Text>
                    )}
                </View>

                {/* Aadhar Proof */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Aadhar Proof</Text>
                    <TouchableOpacity
                        style={styles.fileButton}
                        onPress={() => pickDocument('aadharProof')}
                    >
                        <Text style={styles.fileButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    {documents.aadharProof && (
                        <Text style={styles.fileName} numberOfLines={1}>Selected</Text>
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
                        <>
                            <Text style={styles.submitButtonText}>Update Business Details</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    inputContainer: {
        marginBottom: 16,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    halfInput: {
        width: '48%',
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '400',
    },
    required: {
        color: '#FF0000',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        fontSize: 14,
        color: '#333',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    fileButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    fileButtonText: {
        fontSize: 14,
        color: '#666',
    },
    fileName: {
        fontSize: 11,
        color: '#4CAF50',
        marginTop: 4,
    },
    errorText: {
        color: '#FF0000',
        fontSize: 11,
        marginTop: 4,
    },
    submitButton: {
        backgroundColor: '#9C27B0',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#BDBDBD',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BusinessDetailsScreen;
