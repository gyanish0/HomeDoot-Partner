import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';

const MoneyScreen = () => {
    const [earnedThisMonth, setEarnedThisMonth] = useState(61398);
    const [pendingDeductions, setPendingDeductions] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(5); // Default to Jan (index 5)

    // Monthly earnings data for chart
    const monthsData = [
        { label: 'Aug', value: 45000 },
        { label: 'Sept', value: 38000 },
        { label: 'Oct', value: 52000 },
        { label: 'Nov', value: 49000 },
        { label: 'Dec', value: 56000 },
        { label: 'Jan', value: 61398 }
    ];

    const chartData = {
        labels: monthsData.map(m => m.label),
        datasets: [{
            data: monthsData.map(m => m.value)
        }]
    };

    // Bank transfers data
    const [bankTransfers, setBankTransfers] = useState([
        {
            id: 1,
            amount: 1961.28,
            dateRange: '21 - 22 Jan',
            status: 'Upcoming'
        },
        {
            id: 2,
            amount: 0,
            dateRange: '19 - 20 Jan',
            status: 'Success'
        }
    ]);

    useEffect(() => {
        loadMoneyData();
    }, []);

    const loadMoneyData = () => {
        // Load money data from API
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMoneyData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >

                {/* Earnings Card with Chart */}
                <View style={styles.earningsCard}>
                    <TouchableOpacity style={styles.earningsHeader}>
                        <View>
                            <Text style={styles.earningsAmount}>₹{earnedThisMonth.toLocaleString('en-IN')}</Text>
                            <Text style={styles.earningsLabel}>Earned this month</Text>
                        </View>
                        <Icon name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    {/* Custom Bar Chart */}
                    <View style={styles.chartContainer}>
                        <View style={styles.barsContainer}>
                            {monthsData.map((month, index) => {
                                const maxValue = Math.max(...monthsData.map(m => m.value));
                                const barHeight = (month.value / maxValue) * 120;
                                const isSelected = selectedMonth === index;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.barWrapper}
                                        onPress={() => {
                                            setSelectedMonth(index);
                                            setEarnedThisMonth(month.value);
                                        }}
                                    >
                                        <View style={styles.barColumn}>
                                            <View
                                                style={[
                                                    styles.bar,
                                                    {
                                                        height: barHeight,
                                                        backgroundColor: isSelected ? '#2E7D32' : '#A5D6A7'
                                                    }
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.monthLabel, isSelected && styles.monthLabelSelected]}>
                                            {month.label}
                                        </Text>
                                        {isSelected && <View style={styles.selectedIndicator} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                {/* Bank Transfers Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Bank transfers</Text>
                        <Icon name="chevron-right" size={24} color="#000" />
                    </TouchableOpacity>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.transfersScroll}
                        contentContainerStyle={styles.transfersContent}
                    >
                        {bankTransfers.map((transfer) => (
                            <View key={transfer.id} style={styles.transferCard}>
                                <Text style={styles.transferAmount}>
                                    ₹{transfer.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Text>
                                <Text style={styles.transferDate}>{transfer.dateRange}</Text>
                                <Text style={[
                                    styles.transferStatus,
                                    transfer.status === 'Success' ? styles.statusSuccess : styles.statusUpcoming
                                ]}>
                                    {transfer.status}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Pending Deductions */}
                <TouchableOpacity style={styles.deductionsCard}>
                    <View style={styles.deductionsLeft}>
                        <Icon name="information-outline" size={24} color="#666" />
                        <View style={styles.deductionsText}>
                            <Text style={styles.deductionsLabel}>PENDING DEDUCTIONS</Text>
                            <Text style={styles.deductionsAmount}>₹{pendingDeductions}</Text>
                        </View>
                    </View>
                    <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        marginTop: 20,
        marginBottom: 24,
    },
    earningsCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        marginTop: 16,
    },
    earningsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    earningsAmount: {
        fontSize: 32,
        fontWeight: '700',
        color: '#2E7D32',
        marginBottom: 4,
    },
    earningsLabel: {
        fontSize: 14,
        color: '#666',
    },
    chartContainer: {
        marginTop: 12,
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
    },
    barColumn: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
    },
    bar: {
        width: 28,
        borderRadius: 4,
        minHeight: 20,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    transfersScroll: {
        marginHorizontal: -16,
    },
    transfersContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    transferCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: 200,
        marginRight: 12,
    },
    transferAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    transferDate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    transferStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusUpcoming: {
        color: '#FF9800',
    },
    statusSuccess: {
        color: '#4CAF50',
    },
    deductionsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    deductionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deductionsText: {
        justifyContent: 'center',
    },
    deductionsLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    deductionsAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    helpButton: {
        position: 'absolute',
        bottom: 80,
        right: 16,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    helpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    monthLabel: {
        fontSize: 13,
        color: '#666',
        marginTop: 8,
    },
    monthLabelSelected: {
        color: '#2E7D32',
        fontWeight: '600',
    },
    selectedIndicator: {
        height: 3,
        width: 35,
        backgroundColor: '#2E7D32',
        borderRadius: 2,
        marginTop: 4,
    },
});

export default MoneyScreen;
