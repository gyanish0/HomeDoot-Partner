import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SplashScreen = ({ navigation }) => {
    const { isLoggedIn, loading } = useAuth();

    useEffect(() => {
        // Wait for auth state to load
        if (!loading) {
            // Add a small delay for better UX
            const timer = setTimeout(() => {
                if (isLoggedIn) {
                    navigation.navigate('Main');
                } else {
                    navigation.navigate('Login');
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [loading, isLoggedIn, navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../assets/hdloginlogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.appName}>HOMEDOOT</Text>
                    <Text style={styles.tagline}>HOME SERVICES</Text>
                    <Text style={styles.partnerText}>Partner App</Text>
                </View>
            </View>

            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#B91C4F" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>

            <Text style={styles.version}>Version 1.0.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    textContainer: {
        alignItems: 'center',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#B91C4F',
        letterSpacing: 2,
        marginBottom: 5,
    },
    tagline: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 1,
        marginBottom: 10,
    },
    partnerText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14,
    },
    version: {
        position: 'absolute',
        bottom: 30,
        color: '#999',
        fontSize: 12,
    },
});

export default SplashScreen;
