import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Linking,
    Alert,
    RefreshControl,
    ActivityIndicator,
    Modal,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';
import {
    getVendorPendingOrders,
    getVendorAssignedOrders,
    getVendorCompletedOrders,
    getVendorCancelledOrders,
    acceptVendorOrder,
    sendJobStartOTP,
    resendJobStartOTP,
    verifyJobStartOTP,
} from '../services/vendorService';

const JobsScreen = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);

    // Load jobs from API
    useEffect(() => {
        loadJobs();
    }, [activeTab]);

    const loadJobs = async () => {
        setLoading(true);
        try {
            let response;
            const perPage = 20;


            switch (activeTab.toLowerCase()) {
                case 'pending':
                    response = await getVendorPendingOrders(currentPage, perPage);
                    break;
                case 'upcoming':
                    response = await getVendorAssignedOrders(currentPage, perPage);
                    break;
                case 'completed':
                    response = await getVendorCompletedOrders(currentPage, perPage);
                    break;
                case 'cancelled':
                    response = await getVendorCancelledOrders(currentPage, perPage);
                    break;
                default:
                    response = await getVendorPendingOrders(currentPage, perPage);
            }
            if (response?.status && response?.data) {
                console.log(response.data, 'jobjobjobjobjob======111')
                const transformedJobs = response.data.data.map(order => {
                    // Format time from service_time (24-hour format)
                    const serviceHour = parseInt(order.service_time);
                    const timeString = serviceHour ?
                        `${serviceHour > 12 ? serviceHour - 12 : serviceHour === 12 ? 12 : serviceHour}:00 ${serviceHour >= 12 ? 'PM' : 'AM'}` :
                        'Time not set';

                    // Get customer name - handle both nested and flattened structures
                    let customerName, phone, location, houseNo, locality;

                    if (activeTab.toLowerCase() === 'pending') {
                        // Pending orders have nested structure
                        customerName = order.final_address?.first_name || order.customers?.name || 'Customer';
                        phone = order.final_address?.phone || order.customers?.mobile || '';
                        location = order.final_address?.address1 || order.address || 'Location not provided';
                        houseNo = order.other_address?.other_house_no || '';
                        locality = order.final_address?.locality || order.other_address?.other_locality || '';
                    } else {
                        // Assigned/Completed/Cancelled orders have flattened structure
                        customerName = order.other_first_name || order.user_name || 'Customer';
                        phone = order.other_mobile_no || order.user_mobile || '';
                        location = order.other_address1 || order.address || 'Location not provided';
                        houseNo = order.other_house_no || '';
                        locality = order.other_locality || '';
                    }

                    // Get service name from items
                    const serviceName = order.items?.[0]?.products?.service_name || 'Service';

                    // Format order status
                    const orderStatus = order.order_status || order.order_current_status;

                    return {
                        id: order.id,
                        orderNo: order.order_no,
                        time: timeString,
                        customerName: customerName,
                        location: location,
                        status: getStatusText(orderStatus),
                        statusColor: getStatusColor(orderStatus),
                        date: order.service_date || order.created_at?.split('T')[0] || 'Today',
                        type: orderStatus,
                        phone: phone,
                        service: serviceName,
                        amount: order.grand_total || order.sub_total || 0,
                        isRepeat: false,
                        houseNo: houseNo,
                        locality: locality,
                        pincode: order.pincode || order.other_postcode,
                        paymentMethod: order.payment_method,
                        paymentStatus: order.payment_status,
                    };
                });

                setJobs(transformedJobs);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            Alert.alert('Error', 'Failed to load jobs.');
            // Fallback to mock data
        } finally {
            setLoading(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadJobs();
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'assigned': return 'Assigned';
            case 'in_progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled':
            case 'canceled': return 'Cancelled';
            default: return status || 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return '#FFA500';
            case 'assigned': return '#2196F3';
            case 'in_progress': return '#2196F3';
            case 'completed': return '#4CAF50';
            case 'cancelled':
            case 'canceled': return '#F44336';
            default: return '#666';
        }
    };

    const tabs = ['Upcoming', 'Pending', 'Completed', 'Cancelled'];

    const groupJobsByDate = (jobs) => {
        const grouped = {};
        jobs.forEach(job => {
            const date = job.date || 'Today';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(job);
        });
        return grouped;
    };

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleNavigation = (location) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        Linking.openURL(url);
    };

    const handleAcceptOrder = async (job) => {
        Alert.alert(
            'Accept Order',
            `Do you want to accept this order #${job.orderNo}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Accept',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            const response = await acceptVendorOrder(job.orderNo);
                            if (response) {
                                Alert.alert('Success', response?.message || 'Order accepted successfully');
                                loadJobs(); // Refresh the list
                            } else {
                                Alert.alert('Error', response?.message || 'Failed to accept order');
                            }
                        } catch (error) {
                            console.error('Error accepting order:', error);
                            Alert.alert('Error', 'Failed to accept order. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReschedule = (job) => {
        Alert.alert(
            'Reschedule Order',
            `Do you want to reschedule order #${job.orderNo}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Reschedule',
                    onPress: () => {
                        // TODO: Implement reschedule API call or navigate to reschedule screen
                        Alert.alert('Info', 'Reschedule functionality will be implemented');
                    }
                }
            ]
        );
    };

    const handleSendSMS = async (job) => {
        try {
            setOtpLoading(true);
            const response = await sendJobStartOTP(job.orderNo);
            if (response?.success) {
                setSelectedJob(job);
                setOtpModalVisible(true);
                // Alert.alert('Success', response?.message || 'OTP sent to customer');
            } else {
                Alert.alert('Error', response?.message || 'Failed to send OTPaaaa');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            Alert.alert('Error', 'Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert('Error', 'Please enter a valid OTP');
            return;
        }

        try {
            setOtpLoading(true);
            const response = await verifyJobStartOTP(selectedJob.orderNo, otp);
            console.log(response, 'jobjobresponse======11111')
            if (response?.status) {
                Alert.alert('Success', response?.message || 'Job started successfully');
                setOtpModalVisible(false);
                setOtp('');
                setSelectedJob(null);
                loadJobs(); // Refresh the list
            } else {
                Alert.alert('Error', response?.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            Alert.alert('Error', error?.message || 'Failed to verify OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setOtpLoading(true);
            const response = await resendJobStartOTP(selectedJob.orderNo);
            if (response?.success) {
                Alert.alert('Success', response?.message || 'OTP resent successfully');
            } else {
                Alert.alert('Error', response?.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const groupedJobs = groupJobsByDate(jobs);

    const renderJobCard = (job) => (
        <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
                <View style={styles.jobTimeSection}>
                    <Text style={styles.jobTime}>{job.time}</Text>
                    {job.orderNo && (
                        <Text style={styles.orderNoText}>Order #{job.orderNo}</Text>
                    )}
                    {job.isRepeat && (
                        <View style={styles.repeatBadge}>
                            <Text style={styles.repeatText}>REPEAT</Text>
                        </View>
                    )}
                    {job.service && (
                        <Text style={styles.serviceText}>{job.service}</Text>
                    )}
                </View>
                <View style={styles.jobActions}>
                    {job.phone && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleCall(job.phone)}
                        >
                            <Icon name="phone-outline" size={24} color="#666" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleNavigation(job.location)}
                    >
                        <Icon name="navigation-variant-outline" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.customerName}>{job.customerName}</Text>
            <Text style={styles.locationText} numberOfLines={2}>{job.location}</Text>
            {(job.houseNo || job.locality) && (
                <Text style={styles.addressDetails}>
                    {job.houseNo ? `${job.houseNo}, ` : ''}{job.locality || ''}
                </Text>
            )}
            <View style={styles.jobFooter}>
                <Text style={[styles.jobStatus, { color: job.statusColor }]}>
                    {job.status}
                </Text>
                {job.amount && (
                    <Text style={styles.amount}>₹{job.amount}</Text>
                )}
            </View>
            {job.paymentMethod && (
                <Text style={styles.paymentInfo}>
                    {job.paymentMethod === 'pay_after_cash_service' ? 'Cash on Service' : 'Online Payment'} • {job.paymentStatus}
                </Text>
            )}

            {/* Action button for Pending orders */}
            {activeTab === 'Pending' && (
                <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOrder(job)}
                >
                    <Text style={styles.acceptButtonText}>Accept This Order</Text>
                </TouchableOpacity>
            )}

            {/* Action buttons for Upcoming orders */}
            {activeTab === 'Upcoming' && (
                <View style={styles.upcomingButtonsContainer}>
                    <TouchableOpacity
                        style={styles.rescheduleButton}
                        onPress={() => handleReschedule(job)}
                    >
                        <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.smsButton}
                        onPress={() => handleSendSMS(job)}
                        disabled={otpLoading}
                    >
                        {otpLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.smsButtonText}>Send SMS To Job Start</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabScrollContent}
                >
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText
                            ]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Job List */}
            <ScrollView
                style={styles.jobList}
                contentContainerStyle={styles.jobListContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                    />
                }
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Loading jobs...</Text>
                    </View>
                ) : Object.keys(groupedJobs).length > 0 ? (
                    Object.keys(groupedJobs).map(date => (
                        <View key={date} style={styles.dateSection}>
                            <Text style={styles.dateTitle}>{date}</Text>
                            {groupedJobs[date].map(job => renderJobCard(job))}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Icon name="briefcase-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyStateText}>No {activeTab.toLowerCase()} jobs</Text>
                    </View>
                )}
            </ScrollView>

            {/* OTP Verification Modal */}
            <Modal
                visible={otpModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setOtpModalVisible(false);
                    setOtp('');
                    setSelectedJob(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.otpModalContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setOtpModalVisible(false);
                                setOtp('');
                                setSelectedJob(null);
                            }}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.otpModalTitle}>Verify OTP</Text>

                        <TextInput
                            style={styles.otpInput}
                            placeholder="Enter OTP"
                            placeholderTextColor="#999"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />

                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={handleVerifyOTP}
                            disabled={otpLoading}
                        >
                            {otpLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.verifyButtonText}>Verify</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resendButton}
                            onPress={handleResendOTP}
                            disabled={otpLoading}
                        >
                            {otpLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.resendButtonText}>Resend OTP</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuButton: {
        padding: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        gap: 8,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    walletIcon: {
        marginLeft: 4,
    },
    notificationButton: {
        padding: 4,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#6C5CE7',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    notificationBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    tabContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    tabScrollContent: {
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 3,
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
    jobList: {
        flex: 1,
    },
    jobListContent: {
        padding: 16,
    },
    dateSection: {
        marginBottom: 24,
    },
    dateTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    jobTimeSection: {
        flex: 1,
    },
    jobTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    repeatBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    repeatText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4CAF50',
    },
    locationText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    addressDetails: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
    },
    orderNoText: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    paymentInfo: {
        fontSize: 11,
        color: '#888',
        marginTop: 6,
        textTransform: 'capitalize',
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    jobStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    amount: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    serviceText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 4,
    },
    jobActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 4,
    },
    customerName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    jobStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    amount: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
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
    acceptButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    upcomingButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
    },
    rescheduleButton: {
        flex: 1,
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rescheduleButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    smsButton: {
        flex: 1,
        backgroundColor: '#1DBFAF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    smsButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    otpModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        padding: 4,
        zIndex: 1,
    },
    otpModalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    otpInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 18,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: 8,
    },
    verifyButton: {
        backgroundColor: '#1DBFAF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendButton: {
        backgroundColor: '#F5A623',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    resendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default JobsScreen;
