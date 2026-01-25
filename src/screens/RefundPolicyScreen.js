import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import Colors from '../constants/Colors';

const RefundPolicyScreen = ({ navigation }) => {
    useEffect(() => {
        const openRefundPolicy = async () => {
            const url = 'https://www.homedoot.com/refund-policy';
            try {
                await Linking.openURL(url);
            } catch (error) {
                console.error('Error opening refund policy:', error);
            }
            navigation.goBack();
        };

        openRefundPolicy();
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

export default RefundPolicyScreen;
