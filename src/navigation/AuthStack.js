import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BusinessDetailsScreen from '../screens/BusinessDetailsScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
            <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
