import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import Colors from '../constants/Colors';

const PrivacyPolicyScreen = ({ navigation }) => {
    useEffect(() => {
        const openPrivacyPolicy = async () => {
            const url = 'https://www.homedoot.com/privacy-policy';
            try {
                await Linking.openURL(url);
            } catch (error) {
                console.error('Error opening privacy policy:', error);
            }
            navigation.goBack();
        };

        openPrivacyPolicy();
    }, [navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PrivacyPolicyScreen;
