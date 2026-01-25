import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import SplashScreen from '../screens/SplashScreen';
import BottomTabNavigator from './BottomTabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import JobHistoryScreen from '../screens/JobHistoryScreen';
import MyHubScreen from '../screens/MyHubScreen';
import CommissionScreen from '../screens/CommissionScreen';
import RatingReviewScreen from '../screens/RatingReviewScreen';
import BusinessDetailsScreen from '../screens/BusinessDetailsScreen';
import BankDetailsScreen from '../screens/BankDetailsScreen';
import AddMoneyScreen from '../screens/AddMoneyScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';
import RefundPolicyScreen from '../screens/RefundPolicyScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
    const { isLoggedIn, loading } = useAuth();

    // Show splash screen while loading
    if (loading) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
            </Stack.Navigator>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : (
                <>
                    <Stack.Screen name="Main" component={BottomTabNavigator} />
                    <Stack.Screen
                        name="Profile"
                        component={ProfileScreen}
                        options={{
                            headerShown: true,
                            headerTitle: '',
                            headerBackTitleVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Calendar"
                        component={CalendarScreen}
                        options={{ headerShown: true, title: 'Calendar' }}
                    />
                    <Stack.Screen
                        name="JobHistory"
                        component={JobHistoryScreen}
                        options={{ headerShown: true, title: 'Job History' }}
                    />
                    <Stack.Screen
                        name="MyHub"
                        component={MyHubScreen}
                        options={{ headerShown: true, title: 'My Hub' }}
                    />
                    <Stack.Screen
                        name="Commission"
                        component={CommissionScreen}
                        options={{ headerShown: true, title: 'Commission' }}
                    />
                    <Stack.Screen
                        name="RatingReview"
                        component={RatingReviewScreen}
                        options={{ headerShown: true, title: 'Ratings & Reviews' }}
                    />
                    <Stack.Screen
                        name="BusinessDetails"
                        component={BusinessDetailsScreen}
                        options={{ headerShown: true, title: 'Business Details' }}
                    />
                    <Stack.Screen
                        name="BankDetails"
                        component={BankDetailsScreen}
                        options={{ headerShown: true, title: 'Bank Details' }}
                    />
                    <Stack.Screen
                        name="AddMoney"
                        component={AddMoneyScreen}
                        options={{ headerShown: true, title: 'Add Money' }}
                    />
                    <Stack.Screen
                        name="PrivacyPolicy"
                        component={PrivacyPolicyScreen}
                        options={{ headerShown: true, title: 'Privacy Policy' }}
                    />
                    <Stack.Screen
                        name="TermsConditions"
                        component={TermsConditionsScreen}
                        options={{ headerShown: true, title: 'Terms & Conditions' }}
                    />
                    <Stack.Screen
                        name="RefundPolicy"
                        component={RefundPolicyScreen}
                        options={{ headerShown: true, title: 'Refund Policy' }}
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default RootNavigator;
