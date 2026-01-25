import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/Colors';

const ProfileScreen = () => {
    const { user } = useAuth();

    const profileFields = [
        { label: 'Name', value: user?.name || 'N/A' },
        { label: 'Email', value: user?.email || 'N/A' },
        { label: 'Phone', value: user?.phone || 'N/A' },
        { label: 'GST Number', value: user?.gst_number || 'N/A' },
        { label: 'PAN Number', value: user?.pan_number || 'N/A' },
        { label: 'Account Number', value: user?.account_number || 'N/A' },
        { label: 'IFSC Code', value: user?.ifsc_code || 'N/A' },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
                </View>
                <Text style={styles.profileName}>{user?.name || 'Partner'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
            </View>

            {/* Profile Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Information</Text>
                {profileFields.map((field, index) => (
                    <View key={index} style={styles.infoField}>
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                        <Text style={styles.fieldValue}>{field.value}</Text>
                    </View>
                ))}
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    profileHeader: {
        backgroundColor: Colors.white,
        padding: 20,
        alignItems: 'center',
        elevation: 1,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    section: {
        backgroundColor: Colors.white,
        margin: 10,
        padding: 15,
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 15,
    },
    infoField: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    fieldLabel: {
        fontSize: 12,
        color: Colors.textTertiary,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 14,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    editButton: {
        backgroundColor: Colors.primary,
        margin: 10,
        marginTop: 20,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileScreen;
