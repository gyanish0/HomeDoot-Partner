import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Skill session slot on 23 Jan, 10:00 am',
            timestamp: '4 DAYS AGO',
            isRead: false,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            expiresIn: 15 * 60 * 1000, // 15 minutes in milliseconds
        },
        {
            id: 2,
            title: 'Skill session confirmed for 23 Jan, 10:00 am',
            timestamp: '4 DAYS AGO',
            isRead: true,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            expiresIn: 0,
        },
    ]);

    const [timers, setTimers] = useState({});

    useEffect(() => {
        // Calculate remaining time for each notification
        const updateTimers = () => {
            const newTimers = {};
            notifications.forEach(notif => {
                if (notif.expiresIn > 0) {
                    const elapsed = Date.now() - notif.createdAt.getTime();
                    const remaining = Math.max(0, notif.expiresIn - elapsed);
                    newTimers[notif.id] = remaining;
                }
            });
            setTimers(newTimers);
        };

        updateTimers();
        const interval = setInterval(updateTimers, 1000);
        return () => clearInterval(interval);
    }, [notifications]);

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleNotificationPress = (notification) => {
        console.log('Notification pressed:', notification);
    };

    const unreadNotifications = notifications.filter(n => !n.isRead);
    const completedNotifications = notifications.filter(n => n.isRead);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notification Centre</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                    <View style={styles.section}>
                        {unreadNotifications.map(notification => (
                            <TouchableOpacity
                                key={notification.id}
                                style={styles.notificationCard}
                                onPress={() => handleNotificationPress(notification)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.notificationContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.notificationTitle}>
                                            {notification.title}
                                        </Text>
                                        <View style={styles.timestampContainer}>
                                            <Text style={styles.timestamp}>{notification.timestamp}</Text>
                                            {timers[notification.id] > 0 && (
                                                <View style={styles.timerContainer}>
                                                    <Icon name="clock-outline" size={14} color="#FF5722" />
                                                    <Text style={styles.timerText}>
                                                        {formatTime(timers[notification.id])} left
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View style={styles.iconContainer}>
                                        <Icon name="bell" size={32} color="#FFA726" />
                                        <View style={styles.notificationBadge}>
                                            <Icon name="exclamation" size={12} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Completed Notifications */}
                {completedNotifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Completed Notifications</Text>
                        {completedNotifications.map(notification => (
                            <TouchableOpacity
                                key={notification.id}
                                style={[styles.notificationCard, styles.completedCard]}
                                onPress={() => handleNotificationPress(notification)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.notificationContent}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.notificationTitle}>
                                            {notification.title}
                                        </Text>
                                        <Text style={styles.timestamp}>{notification.timestamp}</Text>
                                    </View>
                                    <View style={styles.iconContainer}>
                                        <Icon name="bell" size={32} color="#FFA726" />
                                        <View style={styles.notificationBadge}>
                                            <Icon name="exclamation" size={12} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {notifications.length === 0 && (
                    <View style={styles.emptyState}>
                        <Icon name="bell-off-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No notifications</Text>
                    </View>
                )}
            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        color: '#999',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
    },
    notificationCard: {
        backgroundColor: '#FFF3E0',
        marginHorizontal: 0,
        marginVertical: 4,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    completedCard: {
        backgroundColor: '#fff',
    },
    notificationContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        marginBottom: 8,
        lineHeight: 22,
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    timerText: {
        fontSize: 12,
        color: '#FF5722',
        fontWeight: '600',
    },
    iconContainer: {
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#F44336',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 16,
    },
});

export default NotificationScreen;
