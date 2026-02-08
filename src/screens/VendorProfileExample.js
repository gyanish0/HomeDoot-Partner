/**
 * Vendor Profile Screen
 * Displays vendor profile information with edit capability
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    fetchVendorProfile,
    selectVendor,
    selectVendorLoading,
    selectVendorError,
} from '../store/slices/vendorSlice';

const VendorProfileExample = ({ navigation }) => {
    const dispatch = useDispatch();

    // Get data from Redux store
    const vendor = useSelector(selectVendor);
    const loading = useSelector(selectVendorLoading);
    const error = useSelector(selectVendorError);

    // Fetch vendor profile on component mount
    useEffect(() => {
        dispatch(fetchVendorProfile());
    }, [dispatch]);

    const handleEditProfile = () => {
        // Navigate to edit profile screen
        navigation.navigate('EditProfile');
    };

    // Loading state
    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading vendor profile...</Text>
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {vendor && (
                    <>
                        {/* Profile Header */}
                        <View style={styles.profileHeader}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: vendor.profile_photo_url || 'https://via.placeholder.com/100' }}
                                    style={styles.avatar}
                                />
                                <View style={styles.onlineIndicator} />
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.vendorName}>{vendor.name || 'Vendor Name'}</Text>
                                <View style={styles.ratingContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Icon
                                            key={star}
                                            name="star"
                                            size={20}
                                            color="#FF6B00"
                                        />
                                    ))}
                                    <Text style={styles.ratingText}>4.81</Text>
                                </View>
                                {/* <Text style={styles.businessName}>{vendor.business_name || 'Business Name'}</Text> */}
                            </View>
                        </View>

                        {/* Update Profile Button */}
                        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                            <Icon name="pencil" size={20} color="#fff" />
                            <Text style={styles.editButtonText}>Update Profile</Text>
                        </TouchableOpacity>

                        {/* Inventory Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Inventory</Text>
                            <View style={styles.sectionContent}>
                                <Text style={styles.label}>My Inventory Id</Text>
                                <Text style={styles.value}>{vendor.emp_id || 'UC0601819'}</Text>
                            </View>
                        </View>

                        {/* My Rating Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>My Rating</Text>
                            <View style={styles.sectionContent}>
                                <Text style={styles.label}>My Latest 100 Ratings</Text>
                                <Text style={styles.value}>4.81</Text>
                            </View>
                        </View>

                        {/* Award and Certificate Photos Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Award and certificate photos</Text>
                            <View style={styles.certificatesContainer}>
                                <Image
                                    source={{ uri: 'https://via.placeholder.com/300x200' }}
                                    style={styles.certificateImage}
                                />
                            </View>
                            <TouchableOpacity style={styles.viewMoreButton}>
                                <Text style={styles.viewMoreText}>View more</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Contact Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Contact Information</Text>
                            <View style={styles.sectionContent}>
                                <View style={styles.infoRow}>
                                    <Icon name="email" size={20} color="#666" />
                                    <Text style={styles.infoText}>{vendor.email}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Icon name="phone" size={20} color="#666" />
                                    <Text style={styles.infoText}>{vendor.mobile}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Icon name="map-marker" size={20} color="#666" />
                                    <Text style={styles.infoText}>{vendor.address}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Wallet Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Wallet Balance</Text>
                            <View style={styles.sectionContent}>
                                <Text style={styles.walletAmount}>₹{vendor.wallet || '0.00'}</Text>
                            </View>
                        </View>
                    </>
                )}

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
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginLeft: 16,
    },
    content: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
    },
    profileHeader: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E0E0',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    vendorName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginLeft: 8,
    },
    businessName: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 8,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    sectionContent: {
        paddingVertical: 8,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    certificatesContainer: {
        marginTop: 8,
    },
    certificateImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        backgroundColor: '#E0E0E0',
    },
    viewMoreButton: {
        marginTop: 12,
    },
    viewMoreText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    walletAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#4CAF50',
    },
});

export default VendorProfileExample;
