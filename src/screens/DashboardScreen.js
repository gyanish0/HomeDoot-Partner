import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView, Animated, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { fetchDashboard } from '../store/slices/authSlice';
import { getVendorOrderTodayDate, acceptVendorOrder, getOrderFullDetails } from '../services/vendorService';
import Colors from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const DashboardScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [todayJobs, setTodayJobs] = useState([]);
    const [availabilityDates, setAvailabilityDates] = useState([]);
    const [todayOrders, setTodayOrders] = useState(null);
    const [pendingJobs, setPendingJobs] = useState([]);
    const [bookingPopup, setBookingPopup] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchToken = async () => {
            const token = await AsyncStorage.getItem('@homedoot_auth_token');
            console.log(token, 'tokentokentokentoken');
        };
        fetchToken();
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('FCM Foreground Message:', remoteMessage);

            const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification';
            const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
            const isBooking = remoteMessage?.data?.type === 'new_order';

            await notifee.displayNotification({
                title,
                body,
                data: remoteMessage.data || {},
                android: {
                    channelId: isBooking ? 'booking' : 'default',
                    importance: AndroidImportance.HIGH,
                    sound: 'ring',
                    vibrationPattern: [300, 500],
                    pressAction: { id: 'default' },
                    smallIcon: 'ic_launcher',
                    largeIcon: 'ic_launcher',
                },
                ios: {
                    sound: 'ring.wav',
                },
            });

            if (remoteMessage?.data?.type === 'new_order') {
                showBookingPopup(remoteMessage.data);
            }
        });

        return unsubscribe;
    }, []);

    const showBookingPopup = async (data) => {
        // Show popup immediately with loading state
        setBookingPopup(data);
        setBookingLoading(true);

        try {
            const orderId = data?.order_id;
            if (orderId) {
                const response = await getOrderFullDetails(orderId);
                console.log('Order full details:', response);
                if (response?.data) {
                    const { order, carts, vendors } = response.data;
                    // Build service name from carts
                    const serviceNames = carts?.map(cart => {
                        const productName = cart.products?.service_name || '';
                        const itemName = cart.items?.item_name || '';
                        return itemName ? `${productName} (${itemName})` : productName;
                    }).filter(Boolean).join(', ');

                    setBookingPopup({
                        ...data,
                        order_no: order?.order_no,
                        service_date: order?.service_date,
                        service_time: order?.service_time,
                        grand_total: order?.grand_total,
                        sub_total: order?.sub_total,
                        discount_total: order?.discount_total,
                        address: order?.address,
                        payment_method: order?.payment_method,
                        order_status: order?.order_status,
                        service_name: serviceNames || data?.service_name,
                        carts: carts || [],
                        vendors: vendors || [],
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching order full details:', error);
            // Keep showing popup with FCM data if API fails
        } finally {
            setBookingLoading(false);
        }
    };

    const handleAcceptBooking = async () => {
        try {
            setLoading(true);
            const response = await acceptVendorOrder(bookingPopup?.order_no);
            if (response) {
                Alert.alert('Success', response?.message || 'Order accepted successfully');
                setBookingPopup(null);
                // Refresh dashboard to show new booking
                loadDashboardData();
            } else {
                Alert.alert('Error', response?.message || 'Failed to accept order');
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            Alert.alert('Error', 'Failed to accept order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectBooking = () => {
        setBookingPopup(null);
    };

    // Animation for skeleton
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadDashboardData();
    }, []);

    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnimation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnimation, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [loading]);

    const loadDashboardData = async (isRefreshing = false) => {
        if (!isRefreshing) {
            setLoading(true);
        }
        try {
            const result = await dispatch(fetchDashboard()).unwrap();

            // Fetch today's orders
            let todayOrdersResponse = null;
            try {
                todayOrdersResponse = await getVendorOrderTodayDate();
                console.log('Today orders response:', todayOrdersResponse);
                if (todayOrdersResponse?.status && todayOrdersResponse?.data) {
                    setTodayOrders(todayOrdersResponse.data);
                }
            } catch (todayOrdersError) {
                console.error('Error loading today orders:', todayOrdersError);
            }

            // Generate availability dates based on vendor details
            if (result?.VendorDetails) {
                const vendorDetails = result.VendorDetails;
                const nonAvailableFrom = vendorDetails.non_availability_from ? new Date(vendorDetails.non_availability_from) : null;
                const nonAvailableTo = vendorDetails.non_availability_to ? new Date(vendorDetails.non_availability_to) : null;

                // Generate next 14 days
                const dates = [];
                const today = new Date();

                for (let i = 0; i < 14; i++) {
                    const currentDate = new Date(today);
                    currentDate.setDate(today.getDate() + i);

                    // Check if this date falls in non-availability range
                    let isAvailable = true;
                    if (nonAvailableFrom && nonAvailableTo) {
                        isAvailable = !(currentDate >= nonAvailableFrom && currentDate <= nonAvailableTo);
                    }

                    // Format date as "Day, Mon DD"
                    const formattedDate = currentDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    });

                    dates.push({
                        id: i + 1,
                        date: formattedDate,
                        available: isAvailable
                    });
                }

                setAvailabilityDates(dates);
            }

            // Process today's jobs from today orders API
            if (todayOrdersResponse?.status && todayOrdersResponse?.data) {
                const data = todayOrdersResponse.data;
                const statusColors = {
                    'completed': '#4CAF50',
                    'assigned': '#FF9800',
                    'cancelled': '#F44336',
                    'pending': '#2196F3'
                };

                // Process assigned orders (for "more jobs today" section)
                if (data.assignedOrders && Array.isArray(data.assignedOrders)) {
                    const assignedJobs = data.assignedOrders.map((order) => {
                        // Format service time
                        let timeDisplay = 'Today';
                        if (order.service_time) {
                            const hour = parseInt(order.service_time);
                            if (hour >= 0 && hour < 24) {
                                timeDisplay = `${hour}:00`;
                            }
                        }

                        return {
                            id: order.id,
                            time: timeDisplay,
                            customerName: `Order #${order.order_no}`,
                            status: order.order_status?.toUpperCase() || 'ASSIGNED',
                            statusColor: statusColors[order.order_status?.toLowerCase()] || '#FF9800'
                        };
                    });
                    setTodayJobs(assignedJobs);
                }

                // Process pending orders (for "no new jobs" section)
                if (data.pendingOrders && Array.isArray(data.pendingOrders)) {
                    const pending = data.pendingOrders.map((order) => {
                        // Format service time
                        let timeDisplay = 'Today';
                        if (order.service_time) {
                            const hour = parseInt(order.service_time);
                            if (hour >= 0 && hour < 24) {
                                timeDisplay = `${hour}:00`;
                            }
                        }

                        // Get customer name from the customers object if available
                        const customerName = order.customers?.name || `Order #${order.order_no}`;

                        return {
                            id: order.id,
                            time: timeDisplay,
                            customerName: customerName,
                            status: order.order_status?.toUpperCase() || 'PENDING',
                            statusColor: statusColors[order.order_status?.toLowerCase()] || '#2196F3'
                        };
                    });
                    setPendingJobs(pending);
                }
            } else if (result?.Dashboard) {
                // Fallback to dashboard data if today orders API doesn't return data
                const jobs = result.Dashboard.map((item, index) => {
                    const statusColors = {
                        'completed': '#4CAF50',
                        'assigned': '#FF9800',
                        'cancelled': '#F44336',
                        'pending': '#2196F3'
                    };

                    return {
                        id: index + 1,
                        time: 'Today',
                        customerName: `${item.status_count} order(s)`,
                        status: item.order_status.toUpperCase(),
                        statusColor: statusColors[item.order_status.toLowerCase()] || '#666'
                    };
                });
                setTodayJobs(jobs);
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            if (!isRefreshing) {
                setLoading(false);
            }
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData(true);
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Skeleton loader component
    const SkeletonLoader = () => {
        const opacity = shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
        });

        return (
            <View style={styles.skeletonContainer}>
                {/* Skeleton Greeting Banner */}
                <Animated.View style={[styles.skeletonBanner, { opacity }]}>
                    <View style={styles.skeletonBannerText}>
                        <Animated.View style={[styles.skeletonBox, { width: '60%', height: 20, marginBottom: 8, opacity }]} />
                        <Animated.View style={[styles.skeletonBox, { width: '80%', height: 16, opacity }]} />
                    </View>
                    <Animated.View style={[styles.skeletonBox, { width: 60, height: 60, borderRadius: 30, opacity }]} />
                </Animated.View>

                {/* Skeleton Availability Dates */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.availabilityContainer}
                >
                    {[1, 2, 3, 4].map((item) => (
                        <Animated.View key={item} style={[styles.skeletonDateCard, { opacity }]}>
                            <Animated.View style={[styles.skeletonBox, { width: '70%', height: 14, marginBottom: 8, opacity }]} />
                            <Animated.View style={[styles.skeletonBox, { width: '90%', height: 12, opacity }]} />
                        </Animated.View>
                    ))}
                </ScrollView>

                {/* Skeleton Section Card */}
                <Animated.View style={[styles.skeletonSectionCard, { opacity }]}>
                    <Animated.View style={[styles.skeletonBox, { width: '40%', height: 18, opacity }]} />
                    <Animated.View style={[styles.skeletonBox, { width: 24, height: 24, borderRadius: 12, opacity }]} />
                </Animated.View>

                {/* Skeleton Jobs Section */}
                <Animated.View style={[styles.skeletonJobsSection, { opacity }]}>
                    <View style={styles.skeletonJobHeader}>
                        <Animated.View style={[styles.skeletonBox, { width: '50%', height: 18, opacity }]} />
                        <Animated.View style={[styles.skeletonBox, { width: 24, height: 24, borderRadius: 12, opacity }]} />
                    </View>
                    {[1, 2].map((item) => (
                        <View key={item} style={styles.skeletonJobCard}>
                            <View style={{ flex: 1 }}>
                                <Animated.View style={[styles.skeletonBox, { width: '50%', height: 16, marginBottom: 6, opacity }]} />
                                <Animated.View style={[styles.skeletonBox, { width: '70%', height: 14, opacity }]} />
                            </View>
                            <Animated.View style={[styles.skeletonBox, { width: 80, height: 16, opacity }]} />
                        </View>
                    ))}
                </Animated.View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <ScrollView style={styles.scrollView}>
                    <SkeletonLoader />
                </ScrollView>
            ) : (
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

                    {/* Pending Jobs Section */}
                    {pendingJobs.length > 0 ? (
                        <View style={styles.jobsSection}>
                            <TouchableOpacity
                                style={styles.sectionHeader}
                                onPress={() => navigation.navigate('Ongoing')}
                            >
                                <Text style={styles.sectionTitle}>{pendingJobs.length} pending job{pendingJobs.length !== 1 ? 's' : ''}</Text>
                                <Icon name="chevron-right" size={24} color="#666" />
                            </TouchableOpacity>

                            {pendingJobs.map((job) => (
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
                    ) : (
                        <TouchableOpacity style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>No new jobs</Text>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    )}

                    {/* Today's Assigned Jobs Section */}
                    {todayJobs.length > 0 && (
                        <View style={styles.jobsSection}>
                            <TouchableOpacity
                                style={styles.sectionHeader}
                                onPress={() => navigation.navigate('Ongoing')}
                            >
                                <Text style={styles.sectionTitle}>{todayJobs.length} job{todayJobs.length !== 1 ? 's' : ''} assigned today</Text>
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
                    )}
                </ScrollView>
            )}

            {/* New Booking Popup Modal */}
            <Modal
                visible={!!bookingPopup}
                transparent
                animationType="slide"
                onRequestClose={() => setBookingPopup(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Icon name="bell-ring" size={28} color={Colors.primary} />
                            <Text style={styles.modalTitle}>New Booking!</Text>
                        </View>

                        {bookingPopup && (
                            <View style={styles.modalBody}>
                                {bookingLoading ? (
                                    <View style={styles.modalLoadingContainer}>
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                        <Text style={styles.modalLoadingText}>Fetching order details...</Text>
                                    </View>
                                ) : (
                                    <>
                                        {bookingPopup.order_no && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Order No:</Text>
                                                <Text style={styles.modalValue}>#{bookingPopup.order_no}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.service_name && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Service:</Text>
                                                <Text style={[styles.modalValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>{bookingPopup.service_name}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.carts?.length > 0 && bookingPopup.carts.map((cart, index) => (
                                            <View key={index} style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Item {bookingPopup.carts.length > 1 ? index + 1 : ''}:</Text>
                                                <Text style={styles.modalValue}>
                                                    {cart.items?.item_name || cart.products?.service_name} × {cart.quantity} — ₹{cart.price}
                                                </Text>
                                            </View>
                                        ))}
                                        {bookingPopup.service_date && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Date:</Text>
                                                <Text style={styles.modalValue}>{bookingPopup.service_date}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.service_time && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Time:</Text>
                                                <Text style={styles.modalValue}>{bookingPopup.service_time}:00</Text>
                                            </View>
                                        )}
                                        {bookingPopup.grand_total && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Total Amount:</Text>
                                                <Text style={[styles.modalValue, { color: '#4CAF50', fontSize: 16 }]}>₹{bookingPopup.grand_total}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.discount_total > 0 && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Discount:</Text>
                                                <Text style={[styles.modalValue, { color: '#F44336' }]}>-₹{bookingPopup.discount_total}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.payment_method && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Payment:</Text>
                                                <Text style={styles.modalValue}>{bookingPopup.payment_method.replace(/_/g, ' ').toUpperCase()}</Text>
                                            </View>
                                        )}
                                        {bookingPopup.address && (
                                            <View style={styles.modalRow}>
                                                <Text style={styles.modalLabel}>Address:</Text>
                                                <Text style={[styles.modalValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>{bookingPopup.address}</Text>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        {!bookingLoading && (
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    onPress={handleRejectBooking}
                                >
                                    <Text style={styles.rejectButtonText}>REJECT</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    onPress={handleAcceptBooking}
                                >
                                    <Text style={styles.acceptButtonText}>ACCEPT</Text>
                                </TouchableOpacity>
                            </View>
                        )}
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
    },
    // Skeleton styles
    skeletonContainer: {
        flex: 1,
    },
    skeletonBanner: {
        backgroundColor: '#f0f0f0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        marginHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    skeletonBannerText: {
        flex: 1,
    },
    skeletonBox: {
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
    },
    skeletonDateCard: {
        width: 150,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        marginRight: 12,
        marginLeft: 4,
    },
    skeletonSectionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    skeletonJobsSection: {
        backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    skeletonJobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    skeletonJobCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    // Booking Popup Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
    },
    modalBody: {
        marginBottom: 24,
    },
    modalLoadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    modalLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    modalValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    rejectButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#F44336',
        alignItems: 'center',
    },
    rejectButtonText: {
        color: '#F44336',
        fontSize: 15,
        fontWeight: '700',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 30,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default DashboardScreen;
