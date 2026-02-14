import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { fetchVendorProfile, selectVendor, selectVendorLoading } from '../store/slices/vendorSlice';
import Colors from '../constants/Colors';
import { getProfileImageUrl } from '../utils/imageUtils';

const ProfileScreen = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const vendor = useSelector(selectVendor);
    const loading = useSelector(selectVendorLoading);
    const error = useSelector((state) => state.vendor.error);
    const navigation = useNavigation();

    // Fetch vendor profile on mount
    useEffect(() => {
        dispatch(fetchVendorProfile())
            .unwrap()
            .then((data) => {
            })
            .catch((err) => {
                Alert.alert('Error', `Failed to load profile: ${err}`);
            });
    }, [dispatch]);

    // Use vendor data if available, fallback to user data
    const profileData = vendor || user;

    const menuItems = [
        { label: 'Calendar', icon: 'calendar', screen: 'Calendar' },
        { label: 'Job history', icon: 'briefcase-outline', screen: 'JobHistory' },
        { label: 'My Hub', icon: 'map-marker-radius', screen: 'MyHub' },
        { label: 'Credits', icon: 'wallet', screen: 'Wallet', badge: vendor?.wallet ? `₹${vendor.wallet.toFixed(2)}` : null, badgeColor: Colors.primary },
        { label: 'Commission', icon: 'cash', screen: 'Commission' },
        { label: 'Rating & Reviews', icon: 'star-outline', screen: 'RatingReview' },
        { label: 'Business Details', icon: 'office-building', screen: 'BusinessDetails' },
        { label: 'Bank Details', icon: 'bank', screen: 'BankDetails' },
        { label: 'Add Money', icon: 'plus-circle-outline', screen: 'AddMoney' },
        { label: 'Privacy Policy', icon: 'shield-account', screen: 'PrivacyPolicy' },
        { label: 'Terms & Conditions', icon: 'file-document-outline', screen: 'TermsConditions' },
        { label: 'Refund Policy', icon: 'cash-refund', screen: 'RefundPolicy' },
        { label: 'Logout', icon: 'logout', screen: 'logout', color: '#FF3B30' },
    ];

    const handleMenuPress = (item) => {
        if (item.screen === 'logout') {
            Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await dispatch(logoutUser()).unwrap();
                                Alert.alert('Success', 'You have been logged out successfully.');
                            } catch (error) {
                                console.error('Logout error:', error);
                            }
                        },
                    },
                ]
            );
        } else if (item.screen) {
            navigation.navigate(item.screen);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Loading indicator */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            )}

            {/* Error display */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={24} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(fetchVendorProfile())}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>{profileData?.name || 'Not Available'}</Text>
                    <Text style={styles.empId}>{vendor?.emp_id || 'Employee ID'}</Text>
                    <View style={styles.ratingContainer}>
                        <Icon name="star" size={16} color="#FFB800" />
                        <Text style={styles.ratingText}>4.81</Text>
                    </View>
                </View>
                <Image
                    source={{ uri: getProfileImageUrl(profileData) }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
            </View>

            {/* Profile Actions */}
            <View style={styles.profileActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ProfileDetails')}>
                    <Text style={styles.actionButtonText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Change photo</Text>
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => handleMenuPress(item)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.menuLeft}>
                            <Icon name={item.icon} size={24} color={item.color || "#000"} />
                            <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
                                {item.label}
                            </Text>
                        </View>
                        <View style={styles.menuRight}>
                            {item.badge && (
                                <Text style={[styles.badge, { color: item.badgeColor }]}>
                                    {item.badge}
                                </Text>
                            )}
                            <Icon name="chevron-right" size={24} color="#666" />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Spacing at bottom */}
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        margin: 20,
        padding: 16,
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFC0C0',
    },
    errorText: {
        marginTop: 8,
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 6,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingTop: 10,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    empId: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    profileDetails: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    profileActions: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 20,
    },
    actionButton: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 4,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    menuContainer: {
        backgroundColor: '#fff',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
    },
    menuRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    badge: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ProfileScreen;
