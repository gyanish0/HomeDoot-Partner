import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../constants/Colors';
import { getVendorRatings } from '../services/vendorService';
import { formatDisplayDate } from '../utils/dateUtils';

const RatingReviewScreen = () => {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [ratingSummary, setRatingSummary] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const perPage = 20;
            const response = await getVendorRatings(currentPage, perPage);
            console.log(response, '-------1111')
            if (response?.status && response?.data) {
                const apiData = response.data;
                const apiReviews = Array.isArray(apiData.reviews) ? apiData.reviews : [];

                const transformedReviews = apiReviews.map(item => ({
                    id: item.id,
                    customer_name: item.customers?.name || item.customer_name || item.user_name || 'Customer',
                    service: item.service || item.service_name || item.order_no || 'Service',
                    rating: Number(item.rating) || 0,
                    comment: item.review || item.comment || item.feedback || '',
                    date: item.created_at || item.date,
                    avatar_url: item.customers?.profile_photo_url || null,
                }));

                setRatingSummary({
                    averageRating: Number(apiData.average_rating) || 0,
                    totalReviews: Number(apiData.total_reviews) || transformedReviews.length,
                    ratingBreakup: Array.isArray(apiData.rating_breakup) ? apiData.rating_breakup : [],
                });

                setReviews(transformedReviews);
            } else {
                setRatingSummary(null);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            Alert.alert('Error', 'Failed to load reviews.');
            setReviews([]);
            setRatingSummary(null);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setCurrentPage(1);
        loadReviews().finally(() => setRefreshing(false));
    };

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Text key={star} style={styles.star}>
                        {star <= rating ? '⭐' : '☆'}
                    </Text>
                ))}
            </View>
        );
    };

    const renderReview = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                        {item.avatar_url ? (
                            <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{item.customer_name?.charAt(0) || 'C'}</Text>
                        )}
                    </View>
                    <View>
                        <Text style={styles.customerName}>{item.customer_name}</Text>
                        <Text style={styles.serviceName}>{item.service}</Text>
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.starIcon}>⭐</Text>
                </View>
            </View>

            {renderStars(item.rating)}

            <Text style={styles.comment}>{item.comment}</Text>

            <Text style={styles.date}>{formatDisplayDate(item.date)}</Text>
        </View>
    );

    const renderSummary = () => {
        const computedTotal = reviews.length;
        const computedAverage = computedTotal > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / computedTotal
            : 0;

        const totalReviews = ratingSummary?.totalReviews ?? computedTotal;
        const averageRatingValue = ratingSummary?.averageRating ?? computedAverage;
        const averageRating = averageRatingValue.toFixed(1);

        const getBreakupCount = (star) => {
            if (Array.isArray(ratingSummary?.ratingBreakup) && ratingSummary.ratingBreakup.length > 0) {
                const entry = ratingSummary.ratingBreakup.find(item => Number(item.rating) === star);
                return Number(entry?.total) || 0;
            }
            return reviews.filter(r => Math.round(r.rating) === star).length;
        };

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.overallRating}>
                    <Text style={styles.ratingNumber}>{averageRating}</Text>
                    <View style={styles.starsContainerLarge}>
                        {renderStars(Math.round(averageRatingValue))}
                    </View>
                    <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
                </View>

                <View style={styles.ratingBreakdown}>
                    {[
                        { stars: 5, count: getBreakupCount(5) },
                        { stars: 4, count: getBreakupCount(4) },
                        { stars: 3, count: getBreakupCount(3) },
                        { stars: 2, count: getBreakupCount(2) },
                        { stars: 1, count: getBreakupCount(1) },
                    ].map(({ stars, count }) => (
                        <View key={stars} style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>{stars} ⭐</Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.breakdownCount}>{count}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            {['all', '5', '4', '3', '2', '1'].map((filter) => (
                <TouchableOpacity
                    key={filter}
                    style={[
                        styles.filterButton,
                        selectedFilter === filter && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                >
                    <Text style={[
                        styles.filterText,
                        selectedFilter === filter && styles.filterTextActive
                    ]}>
                        {filter === 'all' ? 'All' : `${filter} ⭐`}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const filteredReviews = selectedFilter === 'all'
        ? reviews
        : reviews.filter(r => r.rating === Number(selectedFilter));

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredReviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <>
                        {renderSummary()}
                        {renderFilters()}
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {loading ? 'Loading reviews...' : 'No reviews found'}
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
                }
                contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom }]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 15,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    overallRating: {
        alignItems: 'center',
        marginBottom: 20,
    },
    ratingNumber: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#B91C4F',
        marginBottom: 5,
    },
    starsContainerLarge: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    totalReviews: {
        fontSize: 14,
        color: '#666',
    },
    ratingBreakdown: {
        marginTop: 10,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    breakdownLabel: {
        width: 50,
        fontSize: 13,
        color: '#333',
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFC107',
        borderRadius: 4,
    },
    breakdownCount: {
        width: 30,
        textAlign: 'right',
        fontSize: 13,
        color: '#666',
    },
    filtersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 15,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterButtonActive: {
        backgroundColor: '#B91C4F',
        borderColor: '#B91C4F',
    },
    filterText: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#B91C4F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    customerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    serviceName: {
        fontSize: 12,
        color: '#666',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F57C00',
        marginRight: 2,
    },
    starIcon: {
        fontSize: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    star: {
        fontSize: 16,
        marginRight: 2,
    },
    comment: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 10,
    },
    date: {
        fontSize: 12,
        color: '#999',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 15,
        color: '#999',
    },
});

export default RatingReviewScreen;
