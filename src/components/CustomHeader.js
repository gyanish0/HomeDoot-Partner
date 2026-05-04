import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomHeader = () => {
    const navigation = useNavigation();
    const { user } = useSelector((state) => state.auth);
    const walletBalance = user?.wallet || 0;
    const notificationCount = 1; // You can make this dynamic from Redux state

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.container}>
                {/* Menu Icon */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.menuButton}
                >
                    <Icon name="menu" size={28} color="#000" />
                </TouchableOpacity>

                {/* Right Section - Wallet and Notifications */}
                <View style={styles.rightSection}>
                    {/* Wallet Balance */}
                    <TouchableOpacity
                        style={styles.walletContainer}
                        onPress={() => navigation.navigate('Wallet')}
                    >
                        <Text style={styles.walletAmount}>{walletBalance}</Text>
                        <Icon name="wallet" size={20} color="#B91C4F" style={styles.walletIcon} />
                    </TouchableOpacity>

                    {/* Notification Icon */}
                    {/* <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <Icon name="bell-outline" size={28} color="#000" />
                        {notificationCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{notificationCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity> */}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingBottom: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuButton: {
        padding: 5,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    walletContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    walletAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginRight: 5,
    },
    walletIcon: {
        marginLeft: 2,
    },
    notificationButton: {
        padding: 5,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#8B5CF6',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default CustomHeader;
