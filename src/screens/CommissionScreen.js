import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { mockCommissionData } from '../data/mockData';
import Colors from '../constants/Colors';
import { getVendorCommissionCurrentMonth } from '../services/vendorService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CommissionScreen = () => {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [commissionData, setCommissionData] = useState(mockCommissionData.data);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCommissionData();
    }, []);

    const loadCommissionData = async () => {
        setLoading(true);
        try {
            const response = await getVendorCommissionCurrentMonth();

            console.log(response, 'Commission API Response');

            if (response?.status && response?.data) {
                const invoiceItems = response.data.invoice_items || [];
                const discounts = response.data.discounts || [];

                // Calculate summary totals
                const totalCommission = invoiceItems.reduce((sum, item) => sum + (Number(item.commission) || 0), 0);
                const totalTaxOnCommission = invoiceItems.reduce((sum, item) => sum + (Number(item.tax_on_commission) || 0), 0);
                const totalAmount = invoiceItems.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
                const totalDiscount = discounts.reduce((sum, disc) => sum + (Number(disc.discount_total) || 0), 0);

                const formattedData = {
                    transactions: invoiceItems,
                    summary: {
                        total_commission_paid: totalCommission,
                        total_earnings: totalAmount,
                        pending_commission: totalCommission + totalTaxOnCommission,
                        total_discount: totalDiscount,
                    }
                };

                setCommissionData(formattedData);
            } else {
                // Fallback to mock data if API fails
                setCommissionData(mockCommissionData.data);
            }
        } catch (error) {
            console.error('Error loading commission data:', error);
            setCommissionData(mockCommissionData.data);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadCommissionData().finally(() => setRefreshing(false));
    };

    const renderCommissionItem = ({ item }) => {
        const itemTotal = Number(item.total_amount) || 0;
        const itemPrice = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const commissionAmount = Number(item.commission) || 0;
        const taxOnCommission = Number(item.tax_on_commission) || 0;
        const gstPercentage = Number(item.gst_percentage) || 0;
        const discount = Number(item.discount) || 0;

        return (
            <View style={styles.commissionCard}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderNumber}>Order ID: {item.order_no}</Text>
                        <Text style={styles.serviceName}>{item.service_name}</Text>
                        {item.status_from_vendor && (
                            <Text style={styles.statusText}>Status: {item.status_from_vendor}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Item Name:</Text>
                        <Text style={styles.detailValue}>{item.item_name || item.service_name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Qty:</Text>
                        <Text style={styles.detailValue}>{quantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Rate:</Text>
                        <Text style={styles.detailValue}>{itemPrice}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total:</Text>
                        <Text style={styles.detailValue}>{itemTotal}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Discount:</Text>
                        <Text style={styles.detailValue}>{discount}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Commission:</Text>
                        <Text style={styles.detailValue}>{commissionAmount.toFixed(2)}</Text>
                    </View>
                    {/* <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>GST on Commission (%):</Text>
                        <Text style={styles.detailValue}>{gstPercentage} ({gstPercentage}%)</Text>
                    </View> */}
                </View>
            </View>
        );
    };

    const renderSummary = () => {
        const totalCommission = Number(commissionData?.summary?.total_commission_paid || 0);
        const totalEarnings = Number(commissionData?.summary?.total_earnings || 0);
        const totalDiscount = Number(commissionData?.summary?.total_discount || 0);

        // Calculate Left Total (Total Earnings - Total Discount)
        const leftTotal = totalEarnings - totalDiscount;

        // Right Total is Admin Commission
        const rightTotal = totalCommission;

        // Partner Total (Left Total - Admin Commission)
        const partnerTotal = leftTotal - rightTotal;

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <View style={styles.leftColumn}>
                        <Text style={styles.summaryLabel}>Left Total:</Text>
                        <Text style={styles.summaryValue}>{leftTotal.toFixed(4)}</Text>
                    </View>
                    <View style={styles.rightColumn}>
                        <Text style={styles.summaryLabel}>Right Total (Admin Commission):</Text>
                        <Text style={styles.summaryValue}>{rightTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.partnerTotalRow}>
                    <Text style={styles.partnerTotalLabel}>Partner Total</Text>
                    <Text style={styles.partnerTotalAmount}>{partnerTotal.toFixed(4)}</Text>
                </View>

                <Text style={styles.reverseNote}>Reverse Mechanism charge not applicable.</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.top }]}>
            <FlatList
                data={commissionData?.transactions || []}
                renderItem={renderCommissionItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderSummary}
                ListEmptyComponent={() => (
                    loading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.emptySubText}>Loading commission data...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No commission data available</Text>
                            <Text style={styles.emptySubText}>Check back later for commission updates</Text>
                        </View>
                    )
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                contentContainerStyle={styles.listContainer}
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
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGray,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
    },
    summaryLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
    partnerTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
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
        marginTop: 4,
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
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textSecondary,
        marginTop: 4,
        textTransform: 'capitalize',
    },
    cardBody: {
        marginBottom: 0,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: Colors.textTertiary,
        textAlign: 'center',
    },
});

export default CommissionScreen;
