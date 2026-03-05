import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
    Linking,
    RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../constants/Colors';
import { getOrderFullDetails } from '../services/vendorService';

const JobDetailScreen = ({ route, navigation }) => {
    const { jobId } = route.params;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [carts, setCarts] = useState([]);
    const [vendors, setVendors] = useState([]);

    useEffect(() => {
        fetchDetails();
    }, []);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await getOrderFullDetails(jobId);
            if (response?.data) {
                const { order, carts: cartItems, vendors: vendorList } = response.data;
                setOrderDetails(order);
                setCarts(cartItems || []);
                setVendors(vendorList || []);
            } else {
                Alert.alert('Error', 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            Alert.alert('Error', 'Failed to load order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDetails();
        setRefreshing(false);
    };

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const handleNavigation = (address) => {
        if (address) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            Linking.openURL(url);
        }
    };

    const formatTime = (serviceTime) => {
        const hour = parseInt(serviceTime);
        if (isNaN(hour)) return serviceTime || 'N/A';
        return `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
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

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'pay_after_cash_service': return 'Cash on Service';
            case 'online': return 'Online Payment';
            default: return method || 'N/A';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading order details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!orderDetails) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Icon name="alert-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.loadingText}>No order details found</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const order = orderDetails;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
            >
                {/* Order Header */}
                <View style={styles.section}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderNo}>Order #{order.order_no}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) + '20' }]}>
                            <Text style={[styles.statusText, { color: getStatusColor(order.order_status) }]}>
                                {order.order_status?.replace('_', ' ')?.toUpperCase() || 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Service Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <View style={styles.detailRow}>
                        <Icon name="calendar" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>{order.service_date || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="clock-outline" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>{formatTime(order.service_time)}</Text>
                    </View>
                </View>

                {/* Customer Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <View style={styles.detailRow}>
                        <Icon name="account" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Name:</Text>
                        <Text style={styles.detailValue}>
                            {order.name || order.other_first_name || order.user_name || order.final_address?.first_name || 'N/A'}
                        </Text>
                    </View>
                    {(order.other_mobile_no || order.user_mobile || order.final_address?.phone) ? (
                        <TouchableOpacity
                            style={styles.detailRow}
                            onPress={() => handleCall(order.other_mobile_no || order.user_mobile || order.final_address?.phone)}
                        >
                            <Icon name="phone" size={18} color={Colors.primary} />
                            <Text style={styles.detailLabel}>Phone:</Text>
                            <Text style={[styles.detailValue, styles.linkText]}>
                                {order.other_mobile_no || order.user_mobile || order.final_address?.phone}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address</Text>
                    <TouchableOpacity
                        style={styles.addressContainer}
                        onPress={() => handleNavigation(order.address || order.other_address1 || order.final_address?.address1)}
                    >
                        <Icon name="map-marker" size={20} color={Colors.primary} />
                        <View style={styles.addressTextContainer}>
                            <Text style={styles.addressText}>
                                {order.address || order.other_address1 || order.final_address?.address1 || 'N/A'}
                            </Text>
                            {(order.other_house_no || order.other_locality) ? (
                                <Text style={styles.addressSubText}>
                                    {order.other_house_no ? `${order.other_house_no}, ` : ''}
                                    {order.other_locality || ''}
                                </Text>
                            ) : null}
                            {(order.pincode || order.other_postcode) ? (
                                <Text style={styles.addressSubText}>
                                    Pincode: {order.pincode || order.other_postcode}
                                </Text>
                            ) : null}
                        </View>
                        <Icon name="navigation-variant-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Items / Services */}
                {carts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Services</Text>
                        {carts.map((cart, index) => {
                            const productName = cart.products?.service_name || '';
                            const itemName = cart.items?.item_name || '';
                            const qty = cart.quantity || 1;
                            const price = cart.price || cart.total || 0;

                            return (
                                <View key={index} style={styles.serviceItem}>
                                    <View style={styles.serviceInfo}>
                                        <Text style={styles.serviceName}>
                                            {productName}{itemName ? ` - ${itemName}` : ''}
                                        </Text>
                                        <Text style={styles.serviceQty}>Qty: {qty}</Text>
                                    </View>
                                    <Text style={styles.servicePrice}>₹{price}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Payment Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Details</Text>
                    <View style={styles.detailRow}>
                        <Icon name="cash" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Method:</Text>
                        <Text style={styles.detailValue}>{getPaymentMethodLabel(order.payment_method)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="check-circle-outline" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
                            {order.payment_status || 'N/A'}
                        </Text>
                    </View>
                    {order.sub_total ? (
                        <View style={styles.detailRow}>
                            <Icon name="receipt" size={18} color="#666" />
                            <Text style={styles.detailLabel}>Subtotal:</Text>
                            <Text style={styles.detailValue}>₹{order.sub_total}</Text>
                        </View>
                    ) : null}
                    {order.discount_total ? (
                        <View style={styles.detailRow}>
                            <Icon name="tag-outline" size={18} color="#666" />
                            <Text style={styles.detailLabel}>Discount:</Text>
                            <Text style={[styles.detailValue, { color: '#4CAF50' }]}>-₹{order.discount_total}</Text>
                        </View>
                    ) : null}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Grand Total</Text>
                        <Text style={styles.totalValue}>₹{order.grand_total || order.sub_total || '0'}</Text>
                    </View>
                </View>
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
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderNo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#888',
        width: 70,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    linkText: {
        color: Colors.primary,
        textDecorationLine: 'underline',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    addressTextContainer: {
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    addressSubText: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    serviceInfo: {
        flex: 1,
    },
    serviceName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    serviceQty: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
});

export default JobDetailScreen;
