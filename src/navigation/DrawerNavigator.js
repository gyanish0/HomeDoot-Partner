import React from 'react';
import {
    createDrawerNavigator,
    DrawerContentScrollView,
    DrawerItemList,
    DrawerItem,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';

import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import CommissionScreen from '../screens/CommissionScreen';
import RatingReviewScreen from '../screens/RatingReviewScreen';
import CalendarScreen from '../screens/CalendarScreen';
import JobHistoryScreen from '../screens/JobHistoryScreen';
import BusinessDetailsScreen from '../screens/BusinessDetailsScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import AddMoneyScreen from '../screens/AddMoneyScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';
import RefundPolicyScreen from '../screens/RefundPolicyScreen';
import MyHubScreen from '../screens/MyHubScreen';

import { useAuth } from '../context/AuthContext';
import MoneyScreen from '../screens/MoneyScreen';

const Drawer = createDrawerNavigator();

/* ---------------- Custom Drawer ---------------- */

function CustomDrawerContent(props) {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                },
            },
        ]);
    };

    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'Partner'}</Text>
                <Text style={styles.userEmail}>
                    {user?.email || user?.mobile || ''}
                </Text>
            </View>

            <DrawerItemList {...props} />

            <DrawerItem
                label="Logout"
                onPress={handleLogout}
                icon={({ size, color }) => (
                    <Text style={{ fontSize: size, color }}>🚪</Text>
                )}
                labelStyle={{ color: '#F44336' }}
            />
        </DrawerContentScrollView>
    );
}

/* ---------------- Drawer Navigator ---------------- */

const DrawerNavigator = () => {
    const screenWidth = Dimensions.get('window').width;

    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
                drawerActiveTintColor: '#B91C4F',
                drawerInactiveTintColor: '#8E8E93',
                drawerType: 'front',
                swipeEnabled: true,
                drawerStyle: {
                    width: Math.min(screenWidth * 0.8, 280),
                },
                headerStyle: {
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTitleStyle: {
                    maxWidth: screenWidth - 100,
                },
                headerShadowVisible: false,
            }}
        >
            <Drawer.Screen
                name="Home"
                component={BottomTabNavigator}
                options={{
                    drawerLabel: 'Dashboard',
                    title: '',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏠</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    drawerLabel: 'Calendar',
                    title: 'Calendar',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📅</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="JobHistory"
                component={JobHistoryScreen}
                options={{
                    drawerLabel: 'Job History',
                    title: '',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📋</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    drawerLabel: 'My Profile',
                    title: 'My Profile',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>👤</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="BusinessDetails"
                component={BusinessDetailsScreen}
                options={{
                    drawerLabel: 'Update Business Detail',
                    title: 'Update Business Detail',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏢</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="BankDetails"
                component={BankDetailsScreen}
                options={{
                    drawerLabel: 'Update Bank Detail',
                    title: 'Update Bank Detail',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🏦</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="RatingReview"
                component={RatingReviewScreen}
                options={{
                    drawerLabel: 'Rating',
                    title: 'Rating',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>⭐</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="MyHub"
                component={MyHubScreen}
                options={{
                    drawerLabel: 'My Hub',
                    title: 'My Hub',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📍</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="Commission"
                component={CommissionScreen}
                options={{
                    drawerLabel: 'Commission',
                    title: 'Commission',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>💰</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="Money"
                component={MoneyScreen}
                options={{
                    drawerLabel: 'Money',
                    title: 'Money',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>💰</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="PrivacyPolicy"
                component={PrivacyPolicyScreen}
                options={{
                    drawerLabel: 'Privacy Policy',
                    title: 'Privacy Policy',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>🔒</Text>
                    ),
                }}
            />

            <Drawer.Screen
                name="TermsConditions"
                component={TermsConditionsScreen}
                options={{
                    drawerLabel: 'Terms and Conditions',
                    title: 'Terms and Conditions',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>📄</Text>
                    ),
                }}
            />

            {/* Hidden screen */}
            <Drawer.Screen
                name="AddMoney"
                component={AddMoneyScreen}
                options={{
                    drawerItemStyle: { display: 'none' },
                    title: '',
                }}
            />

            <Drawer.Screen
                name="RefundPolicy"
                component={RefundPolicyScreen}
                options={{
                    drawerLabel: 'Refund Policy',
                    title: 'Refund Policy',
                    drawerIcon: ({ color, size }) => (
                        <Text style={{ fontSize: size, color }}>💵</Text>
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
    userInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
});

export default DrawerNavigator;
