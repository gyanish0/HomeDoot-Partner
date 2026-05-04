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
    Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getProfileImageUrl } from '../utils/imageUtils';
import {
    fetchVendorProfile,
    fetchCitiesByState,
    fetchSubcategoriesByCategory,
    selectVendor,
    selectStates,
    selectCities,
    selectCategories,
    selectSubCategories,
    selectFetchedSubCategories,
    selectVendorLoading,
} from '../store/slices/vendorSlice';
import { updateVendorProfile } from '../services/vendorService';
import { formatDisplayDate } from '../utils/dateUtils';

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

const EditProfileScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const vendor = useSelector(selectVendor);
    const authUser = useSelector((state) => state.auth.user);
    const states = useSelector(selectStates);
    const cities = useSelector(selectCities);
    const categories = useSelector(selectCategories);
    const subCategories = useSelector(selectSubCategories);
    const fetchedSubCategories = useSelector(selectFetchedSubCategories);
    const vendorLoading = useSelector(selectVendorLoading);
    const [loading, setLoading] = useState(false);
    const [subCategoryLoading, setSubCategoryLoading] = useState(false);
    const [cityLoading, setCityLoading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [activePicker, setActivePicker] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateText, setStartDateText] = useState('');
    const [endDateText, setEndDateText] = useState('');
    const [dateError, setDateError] = useState('');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false);
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const isNewVendorFlow = !!route?.params?.isNewVendor;
    const routeVendor = route?.params?.vendor;
    const formatDate = (date) => (date ? date.toISOString().split('T')[0] : '');

    useEffect(() => {
        dispatch(fetchVendorProfile());
    }, [dispatch]);

    useEffect(() => {
        if (vendor) {
            if (vendor.non_availability_from) {
                const parsed = new Date(vendor.non_availability_from);
                setStartDate(parsed);
                setStartDateText(formatDisplayDate(parsed));
            }

            if (vendor.non_availability_to) {
                const parsed = new Date(vendor.non_availability_to);
                setEndDate(parsed);
                setEndDateText(formatDisplayDate(parsed));
            }

            // Fetch cities if state is already selected
            const stateId = vendor.state_id || vendor.state;
            if (stateId) {
                dispatch(fetchCitiesByState(stateId));
            }

            // Fetch subcategories if category is already selected
            const categoryId = vendor.category_id || vendor.category;
            if (categoryId) {
                dispatch(fetchSubcategoriesByCategory(categoryId));
            }

            // Set selected subcategories from vendor data
            // Handle both string format "150,151,152" and array format
            const subCategoryData = vendor.sub_category_id || vendor.sub_category;
            if (subCategoryData) {
                let parsedSubCategories = [];
                if (typeof subCategoryData === 'string') {
                    // Split string and convert to numbers
                    parsedSubCategories = subCategoryData.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                } else if (Array.isArray(subCategoryData)) {
                    parsedSubCategories = subCategoryData;
                } else {
                    parsedSubCategories = [subCategoryData];
                }
                setSelectedSubCategories(parsedSubCategories);
            }
        }
    }, [vendor, dispatch]);

    const formik = useFormik({
        initialValues: {
            employeeId: vendor?.emp_id || '',
            fullName: vendor?.name || '',
            email: vendor?.email || '',
            mobile: vendor?.mobile || '',
            address: vendor?.address || '',
            state: vendor?.state_id || vendor?.state || '',
            city: vendor?.city_id || vendor?.city || '',
            pincode: vendor?.pincode || '',
            category: vendor?.category_id || vendor?.category || '',
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
                    sub_category: selectedSubCategories,
                    date_range: dateRangeStr,
                    non_availability_from: startDateStr,
                    non_availability_to: endDateStr,
                };

                if (profileImage) {
                    profileData.profile_photo = profileImage;
                }
                console.log(profileData, 'profileData')
                const response = await updateVendorProfile(profileData);

                if (response.success) {
                    formik.resetForm();
                    setProfileImage(null);
                    setStartDate(null);
                    setEndDate(null);
                    setStartDateText('');
                    setEndDateText('');
                    setDateError('');
                    setSelectedSubCategories([]);
                    setActivePicker(null);

                    Alert.alert('Success', 'Profile updated successfully!');

                    let latestVendor = vendor || routeVendor || authUser;

                    try {
                        const profilePayload = await dispatch(fetchVendorProfile()).unwrap();
                        latestVendor = profilePayload?.vendor || latestVendor;
                    } catch (profileError) {
                        console.warn('Failed to refresh profile after update:', profileError);
                    }

                    if (isNewVendorFlow) {
                        navigation.replace('BusinessDetails', {
                            isNewVendor: true,
                            vendor: latestVendor,
                            hideBackButton: route?.params?.hideBackButton,
                        });
                    } else {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main', params: { screen: 'Home' } }],
                        });
                    }
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
            setStartDateText(formatDisplayDate(jsDate));
            if (endDate && jsDate > endDate) {
                setDateError('Start date cannot be after end date');
            } else {
                setDateError('');
            }
        } else if (activePicker === 'end') {
            setEndDate(jsDate);
            setEndDateText(formatDisplayDate(jsDate));
            if (startDate && startDate > jsDate) {
                setDateError('End date cannot be before start date');
            } else {
                setDateError('');
            }
        }
        setActivePicker(null);
    };

    const handleStateChange = async (stateId) => {
        formik.setFieldValue('state', stateId);
        formik.setFieldValue('city', ''); // Reset city when state changes
        setShowStateDropdown(false);
        if (stateId) {
            setCityLoading(true);
            try {
                await dispatch(fetchCitiesByState(stateId));
            } finally {
                setCityLoading(false);
            }
        }
    };

    const handleCityChange = (cityId) => {
        formik.setFieldValue('city', cityId);
        setShowCityDropdown(false);
    };

    const handleCategoryChange = async (categoryId) => {
        formik.setFieldValue('category', categoryId);
        setSelectedSubCategories([]); // Reset subcategory when category changes
        setShowCategoryDropdown(false);
        if (categoryId) {
            setSubCategoryLoading(true);
            try {
                await dispatch(fetchSubcategoriesByCategory(categoryId));
            } finally {
                setSubCategoryLoading(false);
            }
        }
    };

    const toggleSubCategorySelection = (subCategoryId) => {
        const isSelected = selectedSubCategories.includes(subCategoryId);
        if (isSelected) {
            setSelectedSubCategories(selectedSubCategories.filter(id => id !== subCategoryId));
        } else {
            setSelectedSubCategories([...selectedSubCategories, subCategoryId]);
        }
    };

    const getSelectedCategoryName = () => {
        const selected = categories.find(cat => cat.id === formik.values.category);
        return selected ? selected.category_name : 'Select Category';
    };

    const getSelectedSubCategoriesText = () => {
        if (subCategoryLoading || vendorLoading) return 'Loading...';
        if (selectedSubCategories.length === 0) return 'Select Sub Categories';
        return `${selectedSubCategories.length} sub-category(s) selected`;
    };

    const getSelectedStateName = () => {
        const selected = states.find(state => state.id === formik.values.state);
        return selected ? selected.state_name : '-- Select State --';
    };

    const getSelectedCityName = () => {
        if (cityLoading || vendorLoading) return 'Loading...';
        const selected = cities.find(city => city.id === formik.values.city);
        return selected ? selected.city_name : '-- Select City --';
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: 30 + insets.bottom }}
                showsVerticalScrollIndicator={false}
            >
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
                                {startDateText || 'DD MMM YYYY'}
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
                                {endDateText || 'DD MMM YYYY'}
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
                    </View>
                )}

                {/* Profile Picture */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Profile Picture</Text>
                    <View style={styles.profilePictureContainer}>
                        <TouchableOpacity style={styles.fileButton} onPress={pickProfileImage}>
                            <Text style={styles.fileButtonText}>Choose File</Text>
                            <Text style={styles.fileButtonSubText}>
                                {profileImage ? profileImage.name : 'No file chosen'}
                            </Text>
                        </TouchableOpacity>
                        {(profileImage || vendor?.profile_photo_path || vendor?.profile_photo_url) && (
                            <Image
                                source={{
                                    uri: profileImage?.uri || getProfileImageUrl(vendor),
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
                            style={[styles.input, styles.disabledInput]}
                            placeholder="Mobile Number"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={formik.values.mobile}
                            onChangeText={formik.handleChange('mobile')}
                            onBlur={formik.handleBlur('mobile')}
                            editable={false}
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
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowStateDropdown(true)}
                        >
                            <Text style={styles.dropdownText}>
                                {getSelectedStateName()}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        {formik.touched.state && formik.errors.state && (
                            <Text style={styles.errorText}>{formik.errors.state}</Text>
                        )}
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>
                            City <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.dropdown, (!formik.values.state || cityLoading) && styles.dropdownDisabled]}
                            onPress={() => formik.values.state && !cityLoading && setShowCityDropdown(true)}
                            disabled={!formik.values.state || cityLoading}
                        >
                            <Text style={[styles.dropdownText, (!formik.values.state || cityLoading) && styles.dropdownTextDisabled]}>
                                {getSelectedCityName()}
                            </Text>
                            {cityLoading ? (
                                <ActivityIndicator size="small" color="#9C27B0" />
                            ) : (
                                <Icon name="chevron-down" size={20} color="#666" />
                            )}
                        </TouchableOpacity>
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
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowCategoryDropdown(true)}
                        >
                            <Text style={styles.dropdownText}>
                                {getSelectedCategoryName()}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        {formik.touched.category && formik.errors.category && (
                            <Text style={styles.errorText}>{formik.errors.category}</Text>
                        )}
                    </View>
                </View>

                {/* Sub Category */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Sub Category</Text>

                    {/* Selected Sub Categories Chips */}
                    {selectedSubCategories.length > 0 && (
                        <View style={styles.chipsContainer}>
                            {selectedSubCategories.map((subCatId) => {
                                const subCat = fetchedSubCategories.find(sc => sc.id === subCatId);
                                return subCat ? (
                                    <View key={subCatId} style={styles.selectedChip}>
                                        <Text style={styles.selectedChipText}>
                                            {subCat.sub_category_name}
                                        </Text>
                                        <TouchableOpacity onPress={() => toggleSubCategorySelection(subCatId)}>
                                            <Icon name="close" size={14} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : null;
                            })}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.dropdown, (!formik.values.category || subCategoryLoading) && styles.dropdownDisabled]}
                        onPress={() => formik.values.category && !subCategoryLoading && setShowSubCategoryDropdown(true)}
                        disabled={!formik.values.category || subCategoryLoading}
                    >
                        <Text style={[styles.dropdownText, (!formik.values.category || subCategoryLoading) && styles.dropdownTextDisabled]}>
                            {getSelectedSubCategoriesText()}
                        </Text>
                        {subCategoryLoading ? (
                            <ActivityIndicator size="small" color="#9C27B0" />
                        ) : (
                            <Icon name="chevron-down" size={20} color="#666" />
                        )}
                    </TouchableOpacity>
                    {!formik.values.category && (
                        <Text style={styles.helperText}>Please select a category first</Text>
                    )}
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

            </ScrollView>

            {/* Category Dropdown Modal */}
            <Modal
                visible={showCategoryDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCategoryDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCategoryDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownHeaderText}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.dropdownList}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.dropdownItem,
                                        formik.values.category === category.id && styles.dropdownItemSelected
                                    ]}
                                    onPress={() => handleCategoryChange(category.id)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        formik.values.category === category.id && styles.dropdownItemTextSelected
                                    ]}>
                                        {category.category_name}
                                    </Text>
                                    {formik.values.category === category.id && (
                                        <Icon name="check" size={20} color="#9C27B0" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* State Dropdown Modal */}
            <Modal
                visible={showStateDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStateDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowStateDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownHeaderText}>Select State</Text>
                            <TouchableOpacity onPress={() => setShowStateDropdown(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.dropdownList}>
                            {states.map((state) => (
                                <TouchableOpacity
                                    key={state.id}
                                    style={[
                                        styles.dropdownItem,
                                        formik.values.state === state.id && styles.dropdownItemSelected
                                    ]}
                                    onPress={() => handleStateChange(state.id)}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        formik.values.state === state.id && styles.dropdownItemTextSelected
                                    ]}>
                                        {state.state_name}
                                    </Text>
                                    {formik.values.state === state.id && (
                                        <Icon name="check" size={20} color="#9C27B0" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* City Dropdown Modal */}
            <Modal
                visible={showCityDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCityDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCityDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownHeaderText}>Select City</Text>
                            <TouchableOpacity onPress={() => setShowCityDropdown(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.dropdownList}>
                            {cityLoading || vendorLoading ? (
                                <View style={styles.emptyDropdown}>
                                    <ActivityIndicator size="large" color="#9C27B0" />
                                    <Text style={styles.emptyDropdownText}>Loading cities...</Text>
                                </View>
                            ) : cities.length === 0 ? (
                                <View style={styles.emptyDropdown}>
                                    <Text style={styles.emptyDropdownText}>No cities available</Text>
                                </View>
                            ) : (
                                cities.map((city) => (
                                    <TouchableOpacity
                                        key={city.id}
                                        style={[
                                            styles.dropdownItem,
                                            formik.values.city === city.id && styles.dropdownItemSelected
                                        ]}
                                        onPress={() => handleCityChange(city.id)}
                                    >
                                        <Text style={[
                                            styles.dropdownItemText,
                                            formik.values.city === city.id && styles.dropdownItemTextSelected
                                        ]}>
                                            {city.city_name}
                                        </Text>
                                        {formik.values.city === city.id && (
                                            <Icon name="check" size={20} color="#9C27B0" />
                                        )}
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
            {/* Sub Category Dropdown Modal */}
            <Modal
                visible={showSubCategoryDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSubCategoryDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSubCategoryDropdown(false)}
                >
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownHeaderText}>Select Sub Categories</Text>
                            <TouchableOpacity onPress={() => setShowSubCategoryDropdown(false)}>
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.dropdownList}>
                            {subCategoryLoading || vendorLoading ? (
                                <View style={styles.emptyDropdown}>
                                    <ActivityIndicator size="large" color="#9C27B0" />
                                    <Text style={styles.emptyDropdownText}>Loading sub-categories...</Text>
                                </View>
                            ) : fetchedSubCategories.length === 0 ? (
                                <View style={styles.emptyDropdown}>
                                    <Text style={styles.emptyDropdownText}>No sub-categories available</Text>
                                </View>
                            ) : (
                                fetchedSubCategories.map((subCategory) => {
                                    const isSelected = selectedSubCategories.includes(subCategory.id);
                                    return (
                                        <TouchableOpacity
                                            key={subCategory.id}
                                            style={[
                                                styles.dropdownItem,
                                                isSelected && styles.dropdownItemSelected
                                            ]}
                                            onPress={() => toggleSubCategorySelection(subCategory.id)}
                                        >
                                            <View style={styles.dropdownItemContent}>
                                                <View style={[
                                                    styles.checkbox,
                                                    isSelected && styles.checkboxSelected
                                                ]}>
                                                    {isSelected && (
                                                        <Icon name="check" size={16} color="#fff" />
                                                    )}
                                                </View>
                                                <Text style={[
                                                    styles.dropdownItemText,
                                                    isSelected && styles.dropdownItemTextSelected
                                                ]}>
                                                    {subCategory.sub_category_name}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                        <View style={styles.dropdownFooter}>
                            <TouchableOpacity
                                style={styles.dropdownDoneButton}
                                onPress={() => setShowSubCategoryDropdown(false)}
                            >
                                <Text style={styles.dropdownDoneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
    },
    helperText: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
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
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    dropdownDisabled: {
        backgroundColor: '#F0F0F0',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownTextDisabled: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    dropdownHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    dropdownList: {
        maxHeight: 400,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemSelected: {
        backgroundColor: '#F3E5F5',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#9C27B0',
        fontWeight: '600',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#9C27B0',
        borderColor: '#9C27B0',
    },
    dropdownFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    dropdownDoneButton: {
        backgroundColor: '#9C27B0',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    dropdownDoneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyDropdown: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyDropdownText: {
        fontSize: 14,
        color: '#999',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#9C27B0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedChipText: {
        color: '#fff',
        fontSize: 12,
        marginRight: 6,
    },
});

export default EditProfileScreen;
