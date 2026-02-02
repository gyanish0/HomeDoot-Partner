import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { mockCommissionData } from '../data/mockData';
import Colors from '../constants/Colors';
import {
    getVendorCommissionCurrentMonth,
    getVendorCommissionCustomRange,
} from '../services/vendorService';

const CommissionScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [commissionData, setCommissionData] = useState(mockCommissionData.data);
    const [fromDate, setFromDate] = useState(new Date(2026, 4, 1)); // May 1, 2026
    const [toDate, setToDate] = useState(new Date(2026, 4, 31)); // May 31, 2026
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('from'); // 'from' or 'to'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCommissionData();
    }, []);

    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatDateForAPI = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadCommissionData = async (customRange = false) => {
        setLoading(true);
        try {
            let response;
            if (customRange) {
                const fromDateStr = formatDateForAPI(fromDate);
                const toDateStr = formatDateForAPI(toDate);
                response = await getVendorCommissionCustomRange(fromDateStr, toDateStr);
            } else {
                response = await getVendorCommissionCurrentMonth();
            }

            if (response?.success && response?.data) {
                setCommissionData(response.data);
            } else {
                // Fallback to mock data if API fails
                setCommissionData(mockCommissionData.data);
            }
        } catch (error) {
            console.error('Error loading commission data:', error);
            Alert.alert('Error', 'Failed to load commission data. Using local data.');
            setCommissionData(mockCommissionData.data);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadCommissionData().finally(() => setRefreshing(false));
    };

    const handleSearch = () => {
        if (fromDate > toDate) {
            Alert.alert('Invalid Date Range', 'From date cannot be after To date');
            return;
        }
        loadCommissionData(true);
    };

    const handleClear = () => {
        setFromDate(new Date());
        setToDate(new Date());
        loadCommissionData(false);
    };

    const openDatePicker = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const onDateChange = (selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            if (datePickerMode === 'from') {
                setFromDate(selectedDate);
            } else {
                setToDate(selectedDate);
            }
        }
    };

    const onDatePickerCancel = () => {
        setShowDatePicker(false);
    };



    const renderCommissionItem = ({ item }) => (
        <View style={styles.commissionCard}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.orderNumber}>Order ID: {item.order_number}</Text>
                    <Text style={styles.serviceName}>{item.service_name}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Item Name:</Text>
                    <Text style={styles.detailValue}>{item.service_name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Qty:</Text>
                    <Text style={styles.detailValue}>1</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rate:</Text>
                    <Text style={styles.detailValue}>₹{item.service_amount}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total:</Text>
                    <Text style={styles.detailValue}>₹{item.service_amount}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Discount:</Text>
                    <Text style={styles.detailValue}>₹0</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.amountRow}>
                    <Text style={styles.label}>Commission ({item.commission_percentage}%):</Text>
                    <Text style={[styles.value, styles.commissionAmount]}>₹{item.commission_amount}</Text>
                </View>
                <View style={styles.amountRow}>
                    <Text style={styles.label}>GST on Commission:</Text>
                    <Text style={styles.value}>₹0 (0%)</Text>
                </View>
            </View>
        </View>
    );

    const renderSummary = () => (
        <View style={styles.summaryContainer}>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Left Total (Admin Commissioned):</Text>
                <Text style={styles.totalAmount}>₹{commissionData?.summary?.total_commission_paid || 0}</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Right Total (Admin Commissioned):</Text>
                <Text style={styles.totalAmount}>₹{commissionData?.summary?.total_earnings || 0}</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.partnerTotalLabel}>Partner Total:</Text>
                <Text style={styles.partnerTotalAmount}>₹{commissionData?.summary?.pending_commission || 0}</Text>
            </View>
            <Text style={styles.reverseNote}>Reverse Mechanism charge not applicable.</Text>
        </View>
    );

    const renderDateFilters = () => (
        <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter by Date Range</Text>
            <View style={styles.dateInputRow}>
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>From Date</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => openDatePicker('from')}
                    >
                        <Text style={styles.dateInputText}>{formatDate(fromDate)}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>To Date</Text>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => openDatePicker('to')}
                    >
                        <Text style={styles.dateInputText}>{formatDate(toDate)}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={commissionData?.transactions || []}
                renderItem={renderCommissionItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={() => (
                    <>
                        {renderDateFilters()}
                        {renderSummary()}
                    </>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                contentContainerStyle={styles.listContainer}
            />
            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                date={datePickerMode === 'from' ? fromDate : toDate}
                onConfirm={onDateChange}
                onCancel={onDatePickerCancel}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    listContainer: {
        padding: 10,
    },
    filterContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 15,
        elevation: 2,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    dateInputRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    dateInputContainer: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        padding: 12,
        backgroundColor: '#FAFAFA',
    },
    dateInputText: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    searchButton: {
        flex: 1,
        backgroundColor: '#4DB8AC',
        borderRadius: 6,
        padding: 12,
        alignItems: 'center',
    },
    searchButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#BDBDBD',
        borderRadius: 6,
        padding: 12,
        alignItems: 'center',
    },
    clearButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    summaryContainer: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 15,
        elevation: 1,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    totalLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    totalAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    partnerTotalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    partnerTotalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.successGreen,
    },
    reverseNote: {
        fontSize: 12,
        color: Colors.textTertiary,
        fontStyle: 'italic',
        marginTop: 12,
    },
    commissionCard: {
        backgroundColor: Colors.white,
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 1,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    orderNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '500',
    },
    date: {
        fontSize: 11,
        color: Colors.textTertiary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 4,
    },
    statusText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '600',
    },
    cardBody: {
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textPrimary,
    },
    customerName: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    cardFooter: {
        paddingTop: 2,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    earningRow: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGray,
    },
    label: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    value: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    commissionAmount: {
        color: Colors.primary,
    },
    earningLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    earningAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.successGreen,
    },
});

export default CommissionScreen;
