import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { mockDashboardData, mockOrdersData } from '../data/mockData';
import Colors from '../constants/Colors';

const DashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [todayJobs, setTodayJobs] = useState([]);
    const [availabilityDates, setAvailabilityDates] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = () => {
        // Mock today's jobs - replace with API call
        const mockTodayJobs = [
            {
                id: 1,
                time: 'Today 12:30 PM',
                customerName: 'Priyanka naik',
                status: 'CANCELLED',
                statusColor: '#F44336'
            },
            {
                id: 2,
                time: 'Today 02:00 PM',
                customerName: 'Leenali',
                status: 'CANCELLED',
                statusColor: '#F44336'
            }
        ];
        setTodayJobs(mockTodayJobs);

        // Mock availability dates - replace with API call
        const mockAvailability = [
            { id: 1, date: 'Fri, Jan 23', available: true },
            { id: 2, date: 'Sat, Jan 24', available: true },
            { id: 3, date: 'Sun, Jan 25', available: false },
            { id: 4, date: 'Mon, Jan 26', available: true },
            { id: 5, date: 'Tue, Jan 27', available: true },
            { id: 6, date: 'Wed, Jan 28', available: false },
            { id: 7, date: 'Thu, Jan 29', available: true },
            { id: 8, date: 'Fri, Jan 30', available: true },
            { id: 9, date: 'Sat, Jan 31', available: true },
            { id: 10, date: 'Sun, Feb 1', available: false }
        ];
        setAvailabilityDates(mockAvailability);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {/* Greeting Banner */}
                <View style={styles.greetingBanner}>
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.greetingTitle}>{getGreeting()}, partner!</Text>
                        <Text style={styles.greetingSubtitle}>Let's help you finish your workday</Text>
                    </View>
                    <Icon name="weather-sunset" size={60} color="#FFA726" />
                </View>

                {/* Availability Section */}
                <View style={styles.availabilityContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.availabilityScroll}
                        contentContainerStyle={styles.availabilityScrollContent}
                    >
                        {availabilityDates.map((item, index) => (
                            <View key={index} style={styles.dateCard}>
                                <Text style={styles.dateText}>{item.date}</Text>
                                <View style={styles.availableBadge}>
                                    <Text style={[styles.availableText, { color: item.available ? '#4CAF50' : '#F44336' }]}>
                                        • {item.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* No New Jobs */}
                <TouchableOpacity style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>No new jobs</Text>
                    <Icon name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                {/* Today's Jobs Section */}
                <View style={styles.jobsSection}>
                    <TouchableOpacity style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{todayJobs.length} more jobs today</Text>
                        <Icon name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>

                    {todayJobs.map((job) => (
                        <View key={job.id} style={styles.jobCard}>
                            <View style={styles.jobCardLeft}>
                                <Text style={styles.jobTime}>{job.time}</Text>
                                <Text style={styles.jobCustomer}>{job.customerName}</Text>
                            </View>
                            <Text style={[styles.jobStatus, { color: job.statusColor }]}>
                                {job.status}
                            </Text>
                        </View>
                    ))}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    greetingBanner: {
        backgroundColor: '#FFF3E0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    greetingTextContainer: {
        flex: 1,
    },
    greetingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    availabilityContainer: {
        flexDirection: 'row',
        paddingLeft: 16,
        marginTop: 16,
        gap: 12,
    },
    availabilityScroll: {
        flex: 1,
    },
    availabilityScrollContent: {
        paddingRight: 16,
        gap: 12,
    },
    dateCard: {
        width: 150,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginRight: 12,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    availableBadge: {
        alignSelf: 'flex-start',
    },
    availableText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4CAF50',
    },
    calendarButton: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sectionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    jobsSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    jobCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    jobCardLeft: {
        flex: 1,
    },
    jobTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    jobCustomer: {
        fontSize: 14,
        color: '#666',
    },
    jobStatus: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 16,
    },
    cultSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 24,
        marginBottom: 80,
    },
    cultTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    helpButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
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
    }
});

export default DashboardScreen;
