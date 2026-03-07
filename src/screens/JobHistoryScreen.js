import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';

const JobHistoryScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [jobHistory, setJobHistory] = useState([]);

    useEffect(() => {
        loadJobHistory();
    }, []);

    const loadJobHistory = () => {
        // Mock job history data - replace with actual API call
        const mockHistory = [
            {
                id: 1,
                customerName: 'Priyanka naik',
                time: '02:00 PM',
                date: '22 Jan 2026',
                jobValue: 3630,
                onlinePayment: 3630
            },
            {
                id: 2,
                customerName: 'Sheetal Mankoo',
                time: '04:00 PM',
                date: '19 Jan 2026',
                jobValue: 2207,
                onlinePayment: 2207
            },
            {
                id: 3,
                customerName: 'Shubhangi',
                time: '04:30 PM',
                date: '18 Jan 2026',
                jobValue: 4155,
                onlinePayment: 4155
            },
            {
                id: 4,
                customerName: 'sneha raut',
                time: '03:00 PM',
                date: '18 Jan 2026',
                jobValue: 918,
                onlinePayment: 918
            },
            {
                id: 5,
                customerName: 'Abida Kazi',
                time: '04:30 PM',
                date: '17 Jan 2026',
                jobValue: 2546,
                onlinePayment: 2546
            },
            {
                id: 6,
                customerName: 'SHIVANGI RAI',
                time: '01:00 PM',
                date: '17 Jan 2026',
                jobValue: 1850,
                onlinePayment: 1850
            }
        ];
        setJobHistory(mockHistory);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobHistory();
        setTimeout(() => setRefreshing(false), 1000);
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
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >

                {jobHistory.length > 0 ? (
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
});

export default JobHistoryScreen;
