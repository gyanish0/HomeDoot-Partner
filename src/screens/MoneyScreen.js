import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Modal, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';
import axiosInstance from '../services/axiosInstance';

const MoneySkeleton = () => {
    const fadeAnim = React.useRef(new Animated.Value(0.5)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, [fadeAnim]);

    const dummyHeights = [40, 70, 50, 90, 60, 100, 30, 80, 50, 70, 40, 90];

    return (
        <View style={styles.container}>
            <View style={styles.scrollView}>
                <Animated.View style={[styles.earningsCard, { opacity: fadeAnim }]}>
                    <View style={styles.earningsHeader}>
                        <View>
                            <View style={styles.skeletonAmount} />
                            <View style={styles.skeletonLabel} />
                        </View>
                        <View style={styles.skeletonButton} />
                    </View>

                    <View style={styles.chartContainer}>
                        <View style={[styles.barsScrollContent, { overflow: 'hidden' }]}>
                            {dummyHeights.map((h, i) => (
                                <View key={i} style={styles.barWrapper}>
                                    <View style={styles.barColumn}>
                                        <View style={[styles.bar, { backgroundColor: '#C8E6C9', height: h }]} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </View>
        </View>
    );
};

const MoneyScreen = () => {
    const currentYear = new Date().getFullYear();
    const [earnedThisMonth, setEarnedThisMonth] = useState(61398);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(0); // Default to first month
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [isYearModalVisible, setYearModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

    // Monthly earnings data for chart
    const [monthsData, setMonthsData] = useState([]);

    useEffect(() => {
        setIsLoading(true);
        loadMoneyData();
    }, [selectedYear]);

    const loadMoneyData = async () => {
        try {
            const response = await axiosInstance.get(`/monthly-earnings?year=${selectedYear}`);

            if (response.status && response.data) {
                const mappedData = response.data.map(item => ({
                    label: item.month,
                    value: item.earning
                }));

                setMonthsData(mappedData);

                if (mappedData.length > 0) {
                    const currentMonthIndex = new Date().getMonth();
                    const finalIndex = currentMonthIndex < mappedData.length ? currentMonthIndex : mappedData.length - 1;
                    setSelectedMonth(finalIndex);
                    setEarnedThisMonth(mappedData[finalIndex].value);
                }
            }
        } catch (error) {
            console.error('Error fetching monthly earnings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMoneyData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    if (isLoading) {
        return <MoneySkeleton />;
    }

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
                    <View style={styles.earningsHeader}>
                        <View>
                            <Text style={styles.earningsAmount}>₹{earnedThisMonth.toLocaleString('en-IN')}</Text>
                            <Text style={styles.earningsLabel}>Earned this month</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.yearSelector}
                            onPress={() => setYearModalVisible(true)}
                        >
                            <Text style={styles.yearText}>{selectedYear}</Text>
                            <Icon name="chevron-down" size={20} color="#2E7D32" />
                        </TouchableOpacity>
                    </View>

                    {/* Custom Bar Chart */}
                    <View style={styles.chartContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.barsScrollContent}
                        >
                            {monthsData.map((month, index) => {
                                const maxValue = Math.max(...monthsData.map(m => m.value));
                                const barHeight = maxValue === 0 ? 0 : (month.value / maxValue) * 120;
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
                        </ScrollView>
                    </View>
                </View>

                {/* Bank Transfers Section */}
                {/* <View style={styles.section}>
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
                </View> */}

                {/* Pending Deductions */}
                {/* <TouchableOpacity style={styles.deductionsCard}>
                    <View style={styles.deductionsLeft}>
                        <Icon name="information-outline" size={24} color="#666" />
                        <View style={styles.deductionsText}>
                            <Text style={styles.deductionsLabel}>PENDING DEDUCTIONS</Text>
                            <Text style={styles.deductionsAmount}>₹{pendingDeductions}</Text>
                        </View>
                    </View>
                    <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity> */}

            </ScrollView>

            {/* Year Selection Modal */}
            <Modal
                visible={isYearModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setYearModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setYearModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Year</Text>
                            <TouchableOpacity onPress={() => setYearModalVisible(false)}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {availableYears.map(year => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearOption,
                                    selectedYear === year && styles.yearOptionSelected
                                ]}
                                onPress={() => {
                                    setSelectedYear(year);
                                    setYearModalVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.yearOptionText,
                                    selectedYear === year && styles.yearOptionTextSelected
                                ]}>{year}</Text>
                                {selectedYear === year && (
                                    <Icon name="check-circle" size={20} color="#2E7D32" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    skeletonAmount: {
        width: 120,
        height: 36,
        backgroundColor: '#C8E6C9',
        borderRadius: 8,
        marginBottom: 8,
    },
    skeletonLabel: {
        width: 100,
        height: 16,
        backgroundColor: '#C8E6C9',
        borderRadius: 4,
    },
    skeletonButton: {
        width: 80,
        height: 32,
        backgroundColor: '#C8E6C9',
        borderRadius: 20,
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
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C8E6C9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    yearText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2E7D32',
    },
    chartContainer: {
        marginTop: 12,
        marginHorizontal: -16,
    },
    barsScrollContent: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150,
        paddingHorizontal: 16,
        gap: 8,
    },
    barWrapper: {
        alignItems: 'center',
        width: 53,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    yearOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    yearOptionSelected: {
        backgroundColor: '#f8fdf8',
    },
    yearOptionText: {
        fontSize: 16,
        color: '#333',
    },
    yearOptionTextSelected: {
        color: '#2E7D32',
        fontWeight: '700',
    },
});

export default MoneyScreen;
