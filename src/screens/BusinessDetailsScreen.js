import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVendorBusinessDetails, updateVendorBusinessDetails } from '../services/vendorService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const businessValidationSchema = Yup.object().shape({
    businessName: Yup.string().required('Business name is required'),
    contactPerson: Yup.string().required('Contact person is required'),
    mobile: Yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits').required('Mobile is required'),
    businessAddress: Yup.string().required('Business address is required'),
    panDetails: Yup.string().required('PAN details are required'),
    aadharNumber: Yup.string().matches(/^[0-9]{12}$/, 'Aadhar must be 12 digits').required('Aadhar number is required'),
});

const BusinessDetailsScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [existingBusinessDetails, setExistingBusinessDetails] = useState(null);
    const [filePaths, setFilePaths] = useState(null);
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
                const businessData = {
                    businessName: values.businessName,
                    contactPerson: values.contactPerson,
                    mobile: values.mobile,
                    businessAddress: values.businessAddress,
                    gstDetails: values.gstDetails,
                    panDetails: values.panDetails,
                    aadharNumber: values.aadharNumber,
                    gstFile: documents.gstFile,
                    panFile: documents.panFile,
                    udyogFile: documents.udyogFile,
                    addressProof: documents.addressProof,
                    aadharProof: documents.aadharProof,
                    // Send existing file names if no new file selected
                    existingPanFile: !documents.panFile ? existingBusinessDetails?.pan_file : null,
                    existingGstFile: !documents.gstFile ? existingBusinessDetails?.gst_file : null,
                    existingTanFile: !documents.udyogFile ? existingBusinessDetails?.tan_file : null,
                    existingAddressProof: !documents.addressProof ? existingBusinessDetails?.address_proof : null,
                    existingAadharProof: !documents.aadharProof ? existingBusinessDetails?.aadhar_proof : null,
                };

                const response = await updateVendorBusinessDetails(businessData);

                if (response.success) {
                    Alert.alert('Success', response.message || 'Business details updated successfully!');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', response.message || 'Failed to update business details');
                }
            } catch (error) {
                console.error('Business details update error:', error);

                // Show validation errors if present
                if (error.response?.data?.errors) {
                    const errorMessages = Object.entries(error.response.data.errors)
                        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                        .join('\n');
                    Alert.alert('Validation Error', errorMessages);
                } else {
                    Alert.alert('Error', error.message || 'Failed to update business details');
                }
            } finally {
                setLoading(false);
            }
        },
    });

    // Fetch existing business details
    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                setFetchingData(true);
                const response = await getVendorBusinessDetails();

                if (response.success && response.data?.business) {
                    const businessData = response.data.business;
                    setExistingBusinessDetails(businessData);
                    setFilePaths(response.data.file_paths);

                    // Populate form with existing data
                    formik.setValues({
                        businessName: businessData.business_name || '',
                        contactPerson: businessData.contact_person || '',
                        mobile: businessData.contact_mobile || '',
                        businessAddress: businessData.business_address || '',
                        gstDetails: businessData.gst_details || '',
                        panDetails: businessData.pan_details || '',
                        aadharNumber: businessData.aadhar_details || '',
                    });
                } else {
                    console.log('No existing business details found - showing empty form');
                }
            } catch (error) {
                console.error('Error fetching business details:', error);
            } finally {
                setFetchingData(false);
            }
        };

        fetchBusinessDetails();
    }, []);

    // Helper function to get document URL
    const getDocumentUrl = (filename, pathKey) => {
        if (!filename || !filePaths || !filePaths[pathKey]) return null;
        return `${filePaths[pathKey]}/${filename}`;
    };

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

    // Show loading state while fetching data
    if (fetchingData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9C27B0" />
                <Text style={styles.loadingText}>Loading business details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Show existing details status */}
                {existingBusinessDetails && (
                    <View style={styles.infoBox}>
                        <Icon name="information" size={20} color="#9C27B0" />
                        <Text style={styles.infoText}>
                            Business details already added. You can update them below.
                        </Text>
                    </View>
                )}

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
                    {documents.gstFile ? (
                        <Text style={styles.fileName}>New file selected</Text>
                    ) : existingBusinessDetails?.gst_file ? (
                        <TouchableOpacity onPress={() => {
                            const url = getDocumentUrl(existingBusinessDetails.gst_file, 'gst_files');
                            if (url) Linking.openURL(url);
                        }}>
                            <Text style={styles.existingFileNameLink}>View: {existingBusinessDetails.gst_file}</Text>
                        </TouchableOpacity>
                    ) : null}
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
                    {documents.panFile ? (
                        <Text style={styles.fileName}>New file selected</Text>
                    ) : existingBusinessDetails?.pan_file ? (
                        <TouchableOpacity onPress={() => {
                            const url = getDocumentUrl(existingBusinessDetails.pan_file, 'pan_files');
                            if (url) Linking.openURL(url);
                        }}>
                            <Text style={styles.existingFileNameLink}>View: {existingBusinessDetails.pan_file}</Text>
                        </TouchableOpacity>
                    ) : null}
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
                    {documents.udyogFile ? (
                        <Text style={styles.fileName}>New file selected</Text>
                    ) : existingBusinessDetails?.tan_file ? (
                        <TouchableOpacity onPress={() => {
                            const url = getDocumentUrl(existingBusinessDetails.tan_file, 'tan_files');
                            if (url) Linking.openURL(url);
                        }}>
                            <Text style={styles.existingFileNameLink}>View: {existingBusinessDetails.tan_file}</Text>
                        </TouchableOpacity>
                    ) : null}
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
                    {documents.addressProof ? (
                        <Text style={styles.fileName}>New file selected</Text>
                    ) : existingBusinessDetails?.address_proof ? (
                        <TouchableOpacity onPress={() => {
                            const url = getDocumentUrl(existingBusinessDetails.address_proof, 'address_proofs');
                            if (url) Linking.openURL(url);
                        }}>
                            <Text style={styles.existingFileNameLink}>View: {existingBusinessDetails.address_proof}</Text>
                        </TouchableOpacity>
                    ) : null}
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
                    {documents.aadharProof ? (
                        <Text style={styles.fileName}>New file selected</Text>
                    ) : existingBusinessDetails?.aadhar_proof ? (
                        <TouchableOpacity onPress={() => {
                            const url = getDocumentUrl(existingBusinessDetails.aadhar_proof, 'aadhar_proofs');
                            if (url) Linking.openURL(url);
                        }}>
                            <Text style={styles.existingFileNameLink}>View: {existingBusinessDetails.aadhar_proof}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[styles.submitButton, { marginBottom: insets.bottom + 8 }, loading && styles.submitButtonDisabled]}
                    onPress={formik.handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>
                            {existingBusinessDetails ? 'Update Business Details' : 'Save Business Details'}
                        </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#9C27B0',
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
    existingFileName: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    existingFileNameLink: {
        fontSize: 11,
        color: '#9C27B0',
        marginTop: 4,
        textDecorationLine: 'underline',
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
