import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import MoneyScreen from '../screens/MoneyScreen';
import CustomHeader from '../components/CustomHeader';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                header: () => <CustomHeader />,
            }}>
            <Tab.Screen
                name="Home"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Ongoing"
                component={JobsScreen}
                options={{
                    tabBarLabel: 'Ongoing',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="progress-clock" size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Money"
                component={MoneyScreen}
                options={{
                    tabBarLabel: 'Earnings',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="wallet" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
