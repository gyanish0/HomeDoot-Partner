import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';

const AddMoneyScreen = ({ navigation }) => {
    const [credits, setCredits] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('online');

    const quickSelectAmounts = [
        { value: 20, label: '20' },
        { value: 50, label: '50' },
        { value: 100, label: '100', popular: true },
        { value: 250, label: '250' }
    ];

    const handleQuickSelect = (value) => {
        setCredits(value.toString());
    };

    const calculateAmount = () => {
        const creditValue = parseFloat(credits) || 0;
        return creditValue;
    };

    const handleAddCredits = () => {
        if (!credits || parseFloat(credits) <= 0) {
            Alert.alert('Error', 'Please enter a valid number of credits');
            return;
        }

        // Handle payment logic here
        Alert.alert('Success', `${credits} credits will be added to your wallet`, [
            {
                text: 'OK',
                onPress: () => navigation.goBack(),
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.title}>Add credits</Text>

                {/* Credits Input */}
                <View style={styles.inputContainer}>
                    <Icon name="target" size={24} color="#999" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter number of credits"
                        placeholderTextColor="#999"
                        value={credits}
                        onChangeText={setCredits}
                        keyboardType="numeric"
                    />
                </View>

                {/* Quick Select */}
                <Text style={styles.sectionLabel}>Quick select:</Text>
                <View style={styles.quickSelectContainer}>
                    {quickSelectAmounts.map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            style={[
                                styles.quickSelectButton,
                                credits === item.value.toString() && styles.quickSelectButtonActive
                            ]}
                            onPress={() => handleQuickSelect(item.value)}
                        >
                            <Text style={[
                                styles.quickSelectText,
                                credits === item.value.toString() && styles.quickSelectTextActive
                            ]}>
                                {item.label}
                            </Text>
                            {item.popular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>POPULAR</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Amount to Pay */}
                <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Amount to pay</Text>
                    <Text style={styles.amountValue}>₹{calculateAmount()}</Text>
                </View>

                {/* Select Payment Method */}
                <View style={styles.paymentSection}>
                    <Text style={styles.paymentTitle}>Select payment method</Text>

                    <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setSelectedPayment('online')}
                    >
                        <View style={styles.radioButton}>
                            {selectedPayment === 'online' && (
                                <View style={styles.radioButtonSelected} />
                            )}
                        </View>
                        <Text style={styles.paymentOptionText}>Pay online</Text>
                    </TouchableOpacity>
                </View>

                {/* Spacer for bottom bar */}
                {credits && parseFloat(credits) > 0 && (
                    <View style={styles.bottomSpacer} />
                )}
            </ScrollView>

            {/* Bottom Fixed Bar */}
            {credits && parseFloat(credits) > 0 && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomBarLeft}>
                        <Text style={styles.bottomBarAmount}>₹{calculateAmount()}</Text>
                        <Text style={styles.bottomBarPayment}>Pay online</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.agreeButton}
                        onPress={handleAddCredits}
                    >
                        <Text style={styles.agreeButtonText}>Agree & pay</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    backButton: {
        padding: 16,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginHorizontal: 16,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#000',
    },
    sectionLabel: {
        fontSize: 16,
        color: '#000',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    quickSelectContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 32,
        gap: 12,
    },
    quickSelectButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        paddingVertical: 16,
        alignItems: 'center',
        position: 'relative',
    },
    quickSelectButtonActive: {
        borderColor: '#6C5CE7',
        backgroundColor: '#F5F3FF',
    },
    quickSelectText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
    },
    quickSelectTextActive: {
        color: '#6C5CE7',
    },
    popularBadge: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    popularText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#4CAF50',
    },
    amountSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#f9f9f9',
        marginBottom: 24,
    },
    amountLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    amountValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#999',
    },
    paymentSection: {
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    paymentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#999',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioButtonSelected: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6C5CE7',
    },
    paymentOptionText: {
        fontSize: 16,
        color: '#000',
    },
    scrollContent: {
        paddingBottom: 16,
    },
    bottomSpacer: {
        height: 100,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
    },
    bottomBarLeft: {
        flex: 1,
    },
    bottomBarAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 2,
    },
    bottomBarPayment: {
        fontSize: 14,
        color: '#666',
    },
    agreeButton: {
        backgroundColor: '#6C5CE7',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginLeft: 16,
    },
    agreeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddMoneyScreen;
