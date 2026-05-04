import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import Colors from '../constants/Colors';
import { formatDisplayDate } from '../utils/dateUtils';
import {
    getVendorWalletCreditTransactions,
    getVendorWalletDebitTransactions,
} from '../services/vendorService';

const WalletTransactionScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [transactionType, setTransactionType] = useState('all'); // 'all', 'credit', 'debit'

    useEffect(() => {
        loadTransactions();
    }, [transactionType]);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const perPage = 20;
            let creditTransactions = [];
            let debitTransactions = [];

            if (transactionType === 'all' || transactionType === 'credit') {
                const creditResponse = await getVendorWalletCreditTransactions(currentPage, perPage);
                if (creditResponse?.success && creditResponse?.data) {
                    creditTransactions = creditResponse.data.map(item => ({
                        ...item,
                        id: item.id,
                        amount: parseFloat(item.amount),
                        type: 'credit',
                        orderNo: item.order_no || item.order_number || `HD${String(item.id).padStart(5, '0')}`,
                        createdAt: item.created_at || item.date,
                    }));
                }
            }

            if (transactionType === 'all' || transactionType === 'debit') {
                const debitResponse = await getVendorWalletDebitTransactions(currentPage, perPage);
                if (debitResponse?.success && debitResponse?.data) {
                    debitTransactions = debitResponse.data.map(item => ({
                        ...item,
                        id: item.id,
                        amount: -Math.abs(parseFloat(item.amount)),
                        type: 'debit',
                        orderNo: item.order_no || item.order_number || `HD${String(item.id).padStart(5, '0')}`,
                        createdAt: item.created_at || item.date,
                    }));
                }
            }

            const allTransactions = [...creditTransactions, ...debitTransactions]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setTransactions(allTransactions);

            if (allTransactions.length === 0) {
                // Fallback to mock data
                loadMockTransactions();
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            Alert.alert('Error', 'Failed to load transactions. Using local data.');
            loadMockTransactions();
        } finally {
            setLoading(false);
        }
    };

    const loadMockTransactions = () => {
        setTransactions([
            {
                id: 1,
                amount: 24.95,
                type: 'credit',
                orderNo: 'HD00511',
                createdAt: '2026-01-20 11:20:01',
            },
            {
                id: 2,
                amount: -799.75,
                type: 'debit',
                orderNo: 'HD00512',
                createdAt: '2026-01-17 19:55:57',
            },
            {
                id: 3,
                amount: -24.95,
                type: 'debit',
                orderNo: 'HD00511',
                createdAt: '2026-01-16 22:55:57',
            },
            {
                id: 4,
                amount: -799.75,
                type: 'debit',
                orderNo: 'HD00510',
                createdAt: '2026-01-16 05:47:24',
            },
            {
                id: 5,
                amount: -799.75,
                type: 'debit',
                orderNo: 'HD00506',
                createdAt: '2026-01-15 15:44:58',
            },
            {
                id: 6,
                amount: -799.75,
                type: 'debit',
                orderNo: 'HD00507',
                createdAt: '2026-01-15 15:44:53',
            },
            {
                id: 7,
                amount: -999.75,
                type: 'debit',
                orderNo: 'HD00508',
                createdAt: '2026-01-15 15:44:48',
            },
        ]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadTransactions().finally(() => setRefreshing(false));
    };

    const handleAddMoney = () => {
        navigation.navigate('AddMoney');
    };

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colIndex]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
            <Text style={[styles.tableHeaderText, styles.colOrderNo]}>Order No</Text>
            <Text style={[styles.tableHeaderText, styles.colCreatedAt]}>Created At</Text>
        </View>
    );

    const renderTransaction = ({ item, index }) => (
        <View style={styles.tableRow}>
            <Text style={[styles.tableRowText, styles.colIndex]}>{index + 1}</Text>
            <Text style={[
                styles.tableRowText,
                styles.colAmount,
                item.type === 'credit' ? styles.creditAmount : styles.debitAmount
            ]}>
                {item.type === 'credit' ? '+' : ''}{item.amount}
            </Text>
            <TouchableOpacity style={styles.colOrderNo}>
                <Text style={styles.orderLink}>{item.orderNo}</Text>
            </TouchableOpacity>
            <Text style={[styles.tableRowText, styles.colCreatedAt]}>{formatDisplayDate(item.createdAt)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Add Money Button */}
            <TouchableOpacity style={styles.addMoneyButton} onPress={handleAddMoney}>
                <Text style={styles.addMoneyButtonText}>+ Add Amount to Wallet</Text>
            </TouchableOpacity>

            {/* Wallet Transactions Section */}
            <View style={styles.transactionsSection}>
                <Text style={styles.sectionTitle}>Wallet Transactions</Text>

                <View style={styles.tableContainer}>
                    {renderTableHeader()}
                    <FlatList
                        data={transactions}
                        renderItem={renderTransaction}
                        keyExtractor={(item) => item.id.toString()}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                        }
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    addMoneyButton: {
        backgroundColor: '#9B59B6',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    addMoneyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    transactionsSection: {
        flex: 1,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 16,
    },
    tableContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2C2C2C',
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    tableHeaderText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#E8E8E8',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#D0D0D0',
    },
    tableRowText: {
        fontSize: 13,
        color: '#5A5A5A',
    },
    colIndex: {
        width: '10%',
    },
    colAmount: {
        width: '20%',
    },
    colOrderNo: {
        width: '30%',
    },
    colCreatedAt: {
        width: '40%',
    },
    creditAmount: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    debitAmount: {
        color: '#F44336',
        fontWeight: '600',
    },
    orderLink: {
        color: '#2196F3',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
});

export default WalletTransactionScreen;
