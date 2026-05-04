import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import Colors from '../constants/Colors';

const TermsConditionsScreen = ({ navigation }) => {
    useEffect(() => {
        const openTermsConditions = async () => {
            const url = 'https://www.homedoot.com/term-conditions';
            try {
                await Linking.openURL(url);
            } catch (error) {
                console.error('Error opening terms and conditions:', error);
            }
            navigation.goBack();
        };

        openTermsConditions();
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

export default TermsConditionsScreen;
