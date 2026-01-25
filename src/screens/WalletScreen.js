import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';

const WalletScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');
    const [balance, setBalance] = useState(250);
    const [transactions, setTransactions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        // Mock transaction data - replace with actual API call
        const mockTransactions = [
            {
                id: 1,
                date: '22 Jan 2026, 05:49 PM',
                type: 'Added from payout',
                customer: '',
                amount: 131,
                isCredit: true,
                category: 'recharge'
            },
            {
                id: 2,
                date: '22 Jan 2026, 04:16 PM',
                type: 'Lead bought',
                customer: 'pravin bhosale',
                amount: 43,
                isCredit: false,
                category: 'expense'
            },
            {
                id: 3,
                date: '22 Jan 2026, 04:08 PM',
                type: 'Lead Refund',
                customer: 'Sumedha Sudhir',
                amount: 41,
                isCredit: true,
                category: 'recharge'
            },
            {
                id: 4,
                date: '22 Jan 2026, 04:07 PM',
                type: 'Lead bought',
                customer: 'Sumedha Sudhir',
                amount: 41,
                isCredit: false,
                category: 'expense'
            },
            {
                id: 5,
                date: '22 Jan 2026, 11:23 AM',
                type: 'Lead bought',
                customer: '',
                amount: 88,
                isCredit: false,
                category: 'expense'
            }
        ];
        setTransactions(mockTransactions);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTransactions();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const tabs = ['All', 'Recharges', 'Expenses', 'Penalties'];

    const filterTransactions = () => {
        if (activeTab === 'All') return transactions;
        if (activeTab === 'Recharges') return transactions.filter(t => t.category === 'recharge');
        if (activeTab === 'Expenses') return transactions.filter(t => t.category === 'expense');
        if (activeTab === 'Penalties') return transactions.filter(t => t.category === 'penalty');
        return transactions;
    };

    const filteredTransactions = filterTransactions();

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
                {transaction.isCredit ? '+ ' : '- '}{transaction.amount} cr.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
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
                        <Text style={styles.balanceAmount}>{balance}</Text>
                        <Text style={styles.balanceLabel}>Credit balance</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddMoney')}
                    >
                        <Text style={styles.addButtonText}>Add +</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, activeTab === tab && styles.activeTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Transactions List */}
                <View style={styles.transactionsContainer}>
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(transaction => renderTransaction(transaction))
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
    headerSection: {
        backgroundColor: 'linear-gradient(180deg, #B2EBF2 0%, #E0F7FA 100%)',
        paddingTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 48,
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
    tabsContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 16,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#000',
    },
    tabText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#000',
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
        color: '#666',
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
});

export default WalletScreen;
