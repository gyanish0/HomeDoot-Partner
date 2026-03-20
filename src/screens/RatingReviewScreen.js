import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockReviewsData } from '../data/mockData';
import Colors from '../constants/Colors';
import { getVendorRatings } from '../services/vendorService';
import { formatDisplayDate } from '../utils/dateUtils';

const RatingReviewScreen = () => {
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [reviews, setReviews] = useState(mockReviewsData.data);
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

            if (response?.success && response?.data) {
                const transformedReviews = response.data.map(item => ({
                    id: item.id,
                    customer_name: item.customer_name || item.user_name,
                    service: item.service || item.service_name,
                    rating: parseFloat(item.rating),
                    comment: item.comment || item.review || item.feedback,
                    date: item.date || item.created_at,
                }));
                setReviews(transformedReviews);
            } else {
                // Fallback to mock data
                setReviews(mockReviewsData.data);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
            Alert.alert('Error', 'Failed to load reviews. Using local data.');
            setReviews(mockReviewsData.data);
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
                        <Text style={styles.avatarText}>{item.customer_name.charAt(0)}</Text>
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
        const totalReviews = reviews.length;
        const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1);
        const fiveStarCount = reviews.filter(r => r.rating === 5).length;
        const fourStarCount = reviews.filter(r => r.rating === 4).length;
        const threeStarCount = reviews.filter(r => r.rating === 3).length;
        const twoStarCount = reviews.filter(r => r.rating === 2).length;
        const oneStarCount = reviews.filter(r => r.rating === 1).length;

        return (
            <View style={styles.summaryContainer}>
                <View style={styles.overallRating}>
                    <Text style={styles.ratingNumber}>{averageRating}</Text>
                    <View style={styles.starsContainerLarge}>
                        {renderStars(Math.round(parseFloat(averageRating)))}
                    </View>
                    <Text style={styles.totalReviews}>{totalReviews} reviews</Text>
                </View>

                <View style={styles.ratingBreakdown}>
                    {[
                        { stars: 5, count: fiveStarCount },
                        { stars: 4, count: fourStarCount },
                        { stars: 3, count: threeStarCount },
                        { stars: 2, count: twoStarCount },
                        { stars: 1, count: oneStarCount },
                    ].map(({ stars, count }) => (
                        <View key={stars} style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>{stars} ⭐</Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(count / totalReviews) * 100}%` }
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

    return (
        <View style={styles.container}>
            <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={
                    <>
                        {renderSummary()}
                        {renderFilters()}
                    </>
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
});

export default RatingReviewScreen;
