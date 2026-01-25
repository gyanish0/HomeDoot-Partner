import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardScreen from '../screens/DashboardScreen';
import JobsScreen from '../screens/JobsScreen';
import MoneyScreen from '../screens/MoneyScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ navigation }) => ({
                headerShown: true,
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Profile')}
                        style={{ marginLeft: 15 }}
                    >
                        <Icon name="menu" size={28} color="#000" />
                    </TouchableOpacity>
                ),
                headerTitle: '',
            })}>
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
                    tabBarLabel: 'Money',
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="wallet" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
