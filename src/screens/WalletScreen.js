import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';
import { getVendorWalletCreditTransactions } from '../services/vendorService';
import { useSelector } from 'react-redux';

const WalletScreen = () => {
    const { user } = useSelector((state) => state.auth);
    const navigation = useNavigation();
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        try {
            const perPage = 50;
            const response = await getVendorWalletCreditTransactions(currentPage, perPage);
            console.log(response, 'creditResponse')

            if (response?.status && response?.data) {
                const transformedTransactions = response.data.map(item => {
                    const isCredit = item.payment_type === 'credit';
                    const date = new Date(item.created_at);
                    const formattedDate = date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    });

                    return {
                        id: item.id,
                        date: formattedDate,
                        type: item.remark || (isCredit ? 'Commission' : 'Service charge'),
                        customer: item.order_no,
                        amount: `₹${parseFloat(item.amount).toFixed(2)}`,
                        isCredit: isCredit,
                        category: isCredit ? 'recharge' : 'expense',
                    };
                });

                setTransactions(transformedTransactions);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            Alert.alert('Error', 'Failed to load transactions.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTransactions();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const renderTransaction = (transaction) => (
        <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                {transaction.customer ? (
                    <Text style={styles.transactionCustomer}>{transaction.customer}</Text>
                ) : null}
            </View>
            <Text style={[styles.transactionAmount, transaction.isCredit ? styles.creditAmount : styles.debitAmount]}>
                {transaction.isCredit ? '+ ' : '- '}{transaction.amount}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >

                {/* Balance Section */}
                <View style={styles.balanceSection}>
                    <View style={styles.balanceLeft}>
                        <Text style={styles.balanceAmount}>{user.wallet}</Text>
                        <Text style={styles.balanceLabel}>Credit balance</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddMoney')}
                    >
                        <Text style={styles.addButtonText}>Add +</Text>
                    </TouchableOpacity>
                </View>

                {/* Transactions List */}
                <View style={styles.transactionsContainer}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading transactions...</Text>
                        </View>
                    ) : transactions.length > 0 ? (
                        transactions.map(transaction => renderTransaction(transaction))
                    ) : (
                        <View style={styles.emptyState}>
                            <Icon name="wallet-outline" size={64} color="#ccc" />
                            <Text style={styles.emptyText}>No transactions found</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
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
    balanceSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    balanceLeft: {
        flex: 1,
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    balanceLabel: {
        fontSize: 16,
        color: '#666',
    },
    addButton: {
        backgroundColor: '#6C5CE7',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 6,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    transactionsContainer: {
        padding: 16,
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    transactionLeft: {
        flex: 1,
    },
    transactionDate: {
        fontSize: 12,
        color: '#999',
        marginBottom: 4,
    },
    transactionType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    transactionCustomer: {
        fontSize: 14,
        color: '#666',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
        marginLeft: 16,
    },
    creditAmount: {
        color: '#4CAF50',
    },
    debitAmount: {
        color: '#F44336',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 12,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
});

export default WalletScreen;
