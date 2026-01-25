import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import WalletScreen from '../screens/WalletScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
            }}>
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Jobs"
                component={JobsScreen}
                options={{
                    tabBarLabel: 'Jobs',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="briefcase" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Wallet"
                component={WalletScreen}
                options={{
                    tabBarLabel: 'Wallet',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="wallet" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
