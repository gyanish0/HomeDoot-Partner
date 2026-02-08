import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    fetchVendorProfile,
    selectVendor,
    selectStates,
    selectCities,
    selectCategories,
    selectSubCategories,
} from '../store/slices/vendorSlice';
import { updateVendorProfile } from '../services/vendorService';

const profileValidationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    mobile: Yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits').required('Mobile is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().matches(/^[0-9]{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
    category: Yup.string().required('Category is required'),
});

const EditProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const vendor = useSelector(selectVendor);
    const states = useSelector(selectStates);
    const cities = useSelector(selectCities);
    const categories = useSelector(selectCategories);
    const subCategories = useSelector(selectSubCategories);

    const [loading, setLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [activePicker, setActivePicker] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateText, setStartDateText] = useState('');
    const [endDateText, setEndDateText] = useState('');
    const [dateError, setDateError] = useState('');

    const formatDate = (date) => (date ? date.toISOString().split('T')[0] : '');

    useEffect(() => {
        dispatch(fetchVendorProfile());
    }, [dispatch]);

    useEffect(() => {
        if (vendor) {
            if (vendor.non_availability_from) {
                const parsed = new Date(vendor.non_availability_from);
                setStartDate(parsed);
                setStartDateText(formatDate(parsed));
            }

            if (vendor.non_availability_to) {
                const parsed = new Date(vendor.non_availability_to);
                setEndDate(parsed);
                setEndDateText(formatDate(parsed));
            }
        }
    }, [vendor]);

    const formik = useFormik({
        initialValues: {
            employeeId: vendor?.emp_id || '',
            fullName: vendor?.name || '',
            email: vendor?.email || '',
            mobile: vendor?.mobile || '',
            address: vendor?.address || '',
            state: vendor?.state_id || '',
            city: vendor?.city_id || '',
            pincode: vendor?.pincode || '',
            category: vendor?.category_id || '',
            subCategory: [],
        },
        validationSchema: profileValidationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                if (startDate && endDate && startDate > endDate) {
                    setDateError('Start date cannot be after end date');
                    setLoading(false);
                    return;
                }

                setDateError('');

                // Use provided dates or current date as fallback
                const startDateStr = formatDate(startDate) || formatDate(new Date());
                const endDateStr = formatDate(endDate) || formatDate(new Date());
                const dateRangeStr = `${startDateStr} to ${endDateStr}`;

                const profileData = {
                    emp_id: values.employeeId,
                    name: values.fullName,
                    email: values.email,
                    mobile: values.mobile,
                    address: values.address,
                    state: values.state,
                    city: values.city,
                    pincode: values.pincode,
                    category: values.category,
                    sub_category: values.subCategory ? [values.subCategory] : [],
                    date_range: dateRangeStr,
                    non_availability_from: startDateStr,
                    non_availability_to: endDateStr,
                };

                if (profileImage) {
                    profileData.profile_photo = profileImage;
                }

                const response = await updateVendorProfile(profileData);

                if (response.success) {
                    Alert.alert('Success', 'Profile updated successfully!');
                    dispatch(fetchVendorProfile());
                    navigation.goBack();
                } else {
                    Alert.alert('Error', response.message || 'Failed to update profile');
                }
            } catch (error) {
                console.error('Profile update error:', error);
                Alert.alert('Error', error.message || 'Failed to update profile');
            } finally {
                setLoading(false);
            }
        },
    });

    const pickProfileImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
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
                    name: response.assets[0].fileName || 'profile.jpg',
                };
                setProfileImage(file);
            }
        });
    };

    const handleDateSelect = (date) => {
        const jsDate = date instanceof Date ? date : new Date(date);
        const formatted = formatDate(jsDate);

        if (activePicker === 'start') {
            setStartDate(jsDate);
            setStartDateText(formatted);
            if (endDate && jsDate > endDate) {
                setDateError('Start date cannot be after end date');
            } else {
                setDateError('');
            }
        } else if (activePicker === 'end') {
            setEndDate(jsDate);
            setEndDateText(formatted);
            if (startDate && startDate > jsDate) {
                setDateError('End date cannot be before start date');
            } else {
                setDateError('');
            }
        }
        setActivePicker(null);
    };

    return (
        <View style={styles.container}>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Employee ID */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Employee ID</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={formik.values.employeeId}
                        editable={false}
                    />
                </View>

                {/* Full Name */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Full Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter full name"
                        value={formik.values.fullName}
                        onChangeText={formik.handleChange('fullName')}
                        onBlur={formik.handleBlur('fullName')}
                    />
                    {formik.touched.fullName && formik.errors.fullName && (
                        <Text style={styles.errorText}>{formik.errors.fullName}</Text>
                    )}
                </View>

                {/* Date Range for leave mark */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setActivePicker('start')}
                        >
                            <Icon name="calendar" size={18} color="#666" />
                            <Text style={styles.dateText}>
                                {startDateText || 'YYYY-MM-DD'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setActivePicker('end')}
                        >
                            <Icon name="calendar" size={18} color="#666" />
                            <Text style={styles.dateText}>
                                {endDateText || 'YYYY-MM-DD'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

                {activePicker && (
                    <View style={styles.calendarContainer}>
                        <CalendarPicker
                            minDate={activePicker === 'end' && startDate ? startDate : undefined}
                            selectedStartDate={startDate}
                            onDateChange={handleDateSelect}
                            todayBackgroundColor="#E0E0E0"
                            selectedDayColor="#9C27B0"
                            selectedDayTextColor="#FFFFFF"
                        />
                        <TouchableOpacity
                            onPress={() => setActivePicker(null)}
                            style={styles.closeCalendarButton}
                        >
                            <Text style={styles.closeCalendarText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Profile Picture */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Profile Picture</Text>
                    <View style={styles.profilePictureContainer}>
                        <TouchableOpacity style={styles.fileButton} onPress={pickProfileImage}>
                            <Text style={styles.fileButtonText}>Choose File</Text>
                            <Text style={styles.fileButtonSubText}>No file chosen</Text>
                        </TouchableOpacity>
                        {(profileImage || vendor?.profile_image) && (
                            <Image
                                source={{
                                    uri: profileImage?.uri || vendor?.profile_image,
                                }}
                                style={styles.profilePreview}
                            />
                        )}
                    </View>
                </View>

                {/* Email and Mobile in Row */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Email Address"
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

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            Mobile <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mobile Number"
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

                {/* Address */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Address <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Full Address"
                        value={formik.values.address}
                        onChangeText={formik.handleChange('address')}
                        onBlur={formik.handleBlur('address')}
                    />
                    {formik.touched.address && formik.errors.address && (
                        <Text style={styles.errorText}>{formik.errors.address}</Text>
                    )}
                </View>

                {/* State and City in Row */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            State <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formik.values.state}
                                onValueChange={(value) => formik.setFieldValue('state', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="-- Select State --" value="" />
                                {states.map((state) => (
                                    <Picker.Item
                                        key={state.id}
                                        label={state.state_name}
                                        value={state.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {formik.touched.state && formik.errors.state && (
                            <Text style={styles.errorText}>{formik.errors.state}</Text>
                        )}
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            City <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formik.values.city}
                                onValueChange={(value) => formik.setFieldValue('city', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="-- Select City --" value="" />
                                {cities.map((city) => (
                                    <Picker.Item
                                        key={city.id}
                                        label={city.city_name}
                                        value={city.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {formik.touched.city && formik.errors.city && (
                            <Text style={styles.errorText}>{formik.errors.city}</Text>
                        )}
                    </View>
                </View>

                {/* Pincode and Category in Row */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            Pincode <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="6 Digit Pincode"
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

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            Category <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formik.values.category}
                                onValueChange={(value) => formik.setFieldValue('category', value)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((category) => (
                                    <Picker.Item
                                        key={category.id}
                                        label={category.category_name}
                                        value={category.id}
                                    />
                                ))}
                            </Picker>
                        </View>
                        {formik.touched.category && formik.errors.category && (
                            <Text style={styles.errorText}>{formik.errors.category}</Text>
                        )}
                    </View>
                </View>

                {/* Sub Category */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Sub Category</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Sub Category"
                        value={formik.values.subCategory}
                        onChangeText={formik.handleChange('subCategory')}
                    />
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                    onPress={formik.handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Icon name="content-save" size={20} color="#fff" />
                            <Text style={styles.updateButtonText}>Update Profile Details</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#9C27B0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 16,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
    },
    required: {
        color: '#FF0000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
        fontSize: 14,
        backgroundColor: '#fff',
        color: '#333',
    },
    disabledInput: {
        backgroundColor: '#F0F0F0',
        color: '#666',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    profilePictureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    fileButton: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    fileButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    fileButtonSubText: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    profilePreview: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#333',
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
    },
    updateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9C27B0',
        paddingVertical: 14,
        borderRadius: 4,
        marginTop: 16,
        gap: 8,
    },
    updateButtonDisabled: {
        backgroundColor: '#CCC',
    },
    updateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    closeCalendarButton: {
        marginTop: 12,
        alignSelf: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    closeCalendarText: {
        color: '#9C27B0',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default EditProfileScreen;
