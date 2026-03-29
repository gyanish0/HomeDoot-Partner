import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';
import { formatDisplayDate } from '../utils/dateUtils';
import { getVendorCompletedOrders } from '../services/vendorService';

const JobHistoryScreen = () => {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPage] = useState(1);
    const [perPage] = useState(20);
    const [jobHistory, setJobHistory] = useState([]);

    useEffect(() => {
        loadJobHistory();
    }, []);

    const loadJobHistory = async () => {
        setLoading(true);
        try {
            const response = await getVendorCompletedOrders(currentPage, perPage);
            if (response?.status && response?.data?.data) {
                const transformedHistory = response.data.data.map(order => {
                    const serviceHour = parseInt(order.service_time, 10);
                    const timeString = Number.isNaN(serviceHour)
                        ? 'Time not set'
                        : `${serviceHour > 12 ? serviceHour - 12 : serviceHour === 0 ? 12 : serviceHour}:00 ${serviceHour >= 12 ? 'PM' : 'AM'}`;

                    const amount = Number(order.grand_total || order.sub_total || 0);
                    const paymentMethod = (order.payment_method || '').toLowerCase();
                    const isOnlinePayment = !['cash', 'cod'].includes(paymentMethod);

                    return {
                        id: order.id,
                        customerName: order.other_first_name || order.user_name || 'Customer',
                        time: timeString,
                        date: formatDisplayDate(order.service_date || order.created_at?.split('T')[0]) || 'N/A',
                        jobValue: amount,
                        onlinePayment: isOnlinePayment ? amount : 0,
                    };
                });

                setJobHistory(transformedHistory);
            } else {
                setJobHistory([]);
            }
        } catch (error) {
            console.error('Error loading job history:', error);
            Alert.alert('Error', 'Failed to load job history.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadJobHistory();
        setRefreshing(false);
    };

    const renderJobHistoryCard = (job) => (
        <View key={job.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                <View style={styles.timeContainer}>
                    <Text style={styles.time}>{job.time}</Text>
                    <Text style={styles.date}>{job.date}</Text>
                </View>
            </View>

            <View style={styles.detailRow}>
                <Icon name="briefcase-outline" size={18} color="#666" />
                <Text style={styles.detailLabel}>Job Value: </Text>
                <Text style={styles.detailValue}>₹{job.jobValue.toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
                <Icon name="credit-card-outline" size={18} color="#666" />
                <Text style={styles.detailLabel}>Online Payment: </Text>
                <Text style={styles.detailValue}>₹{job.onlinePayment.toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : jobHistory.length > 0 ? (
                    <View style={styles.historyList}>
                        {jobHistory.map(job => renderJobHistoryCard(job))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="history" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No job history available</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000',
        marginBottom: 24,
        marginTop: 8,
    },
    historyList: {
        gap: 12,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    time: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    date: {
        fontSize: 13,
        color: '#666',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
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
    loaderContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default JobHistoryScreen;
