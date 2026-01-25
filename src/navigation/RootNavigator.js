import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator';

const Stack = createStackNavigator();

const RootNavigator = () => {
    const { isLoggedIn } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
                <Stack.Screen name="Main" component={DrawerNavigator} />
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
