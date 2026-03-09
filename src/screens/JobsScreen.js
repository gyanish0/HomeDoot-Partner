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
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import Colors from '../constants/Colors';
import { formatDisplayDate } from '../utils/dateUtils';
import {
    getVendorPendingOrders,
    getVendorAssignedOrders,
    getVendorCompletedOrders,
    getVendorCancelledOrders,
    acceptVendorOrder,
    sendJobStartOTP,
    resendJobStartOTP,
    verifyJobStartOTP,
    sendJobStopOTP,
    verifyJobStopOTP,
    rescheduleVendorOrder,
} from '../services/vendorService';
import { getVendorId } from '../utils/storage';

const JobsScreen = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleLoading, setRescheduleLoading] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    // Time options for reschedule
    const timeOptions = [
        { label: '8 AM', value: 8 },
        { label: '9 AM', value: 9 },
        { label: '10 AM', value: 10 },
        { label: '11 AM', value: 11 },
        { label: '12 PM', value: 12 },
        { label: '1 PM', value: 13 },
        { label: '2 PM', value: 14 },
        { label: '3 PM', value: 15 },
        { label: '4 PM', value: 16 },
        { label: '5 PM', value: 17 },
        { label: '6 PM', value: 18 },
        { label: '7 PM', value: 19 },
    ];

    // Set active tab from navigation params every time screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (route.params?.selectedTab) {
                const tabName = route.params.selectedTab.charAt(0).toUpperCase() + route.params.selectedTab.slice(1);
                setActiveTab(tabName);
            }
        }, [route.params?.selectedTab])
    );

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
                        date: formatDisplayDate(order.service_date || order.created_at?.split('T')[0]) || 'Today',
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
                        job_start_sms_ver: order.job_start_sms_ver,
                        vendor_ids: order.vendor_ids
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
                                loadJobs();
                            } else {
                                Alert.alert('Error', response?.message || 'Failed to accept order');
                            }
                        } catch (error) {
                            console.error('Error accepting order:', error.message);
                            Alert.alert('Error', error.message || 'Failed to accept order. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReschedule = (job) => {
        setSelectedJob(job);
        setShowCalendar(false); // Reset calendar visibility
        setShowTimePicker(false); // Reset time picker visibility
        setRescheduleTime(''); // Reset time selection

        // Calculate date range: tomorrow to 5 days from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 5);

        if (job.date) {
            const jobDate = new Date(job.date);
            jobDate.setHours(0, 0, 0, 0);

            // Only pre-fill if the job date is within valid range (tomorrow to +5 days)
            if (jobDate >= tomorrow && jobDate <= maxDate) {
                setRescheduleDate(job.date);
                setSelectedDate(jobDate);
            } else {
                // Job date is outside valid range, start with tomorrow
                const formatted = tomorrow.toISOString().split('T')[0];
                setRescheduleDate(formatted);
                setSelectedDate(tomorrow);
            }
        } else {
            // No date, start with tomorrow
            const formatted = tomorrow.toISOString().split('T')[0];
            setRescheduleDate(formatted);
            setSelectedDate(tomorrow);
        }
        setRescheduleModalVisible(true);
    };

    const handleDateSelect = (date) => {
        const jsDate = date instanceof Date ? date : new Date(date);
        jsDate.setHours(0, 0, 0, 0);

        // Validate date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 5);

        if (jsDate < tomorrow) {
            Alert.alert('Invalid Date', 'Please select a date from tomorrow onwards.');
            return;
        }

        if (jsDate > maxDate) {
            Alert.alert('Invalid Date', 'Please select a date within the next 5 days.');
            return;
        }

        const formatted = jsDate.toISOString().split('T')[0];
        setSelectedDate(jsDate);
        setRescheduleDate(formatted);
        setShowCalendar(false);
    };

    const handleRescheduleSubmit = async () => {
        if (!rescheduleDate || !rescheduleTime) {
            Alert.alert('Error', 'Please select both date and time');
            return;
        }

        // Validate date range before submitting
        const selectedDateObj = new Date(rescheduleDate);
        selectedDateObj.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + 5);

        if (selectedDateObj < tomorrow || selectedDateObj > maxDate) {
            Alert.alert('Invalid Date', 'Please select a date from tomorrow to 5 days from today.');
            return;
        }

        try {
            setRescheduleLoading(true);

            const vendorId = selectedJob.vendor_ids // Use job's vendor_ids or fallback to current vendor ID

            // Find the time value from the selected label
            const timeOption = timeOptions.find(opt => opt.label === rescheduleTime);
            const timeValue = timeOption ? timeOption.value : rescheduleTime;

            const response = await rescheduleVendorOrder(
                selectedJob.orderNo,
                rescheduleDate,
                timeValue,
                vendorId
            );

            if (response?.success || response?.status) {
                Alert.alert('Success', response?.message || 'Order rescheduled successfully');
                setRescheduleModalVisible(false);
                setRescheduleDate('');
                setRescheduleTime('');
                setSelectedJob(null);
                setShowCalendar(false);
                setSelectedDate(null);
                loadJobs(); // Refresh the list
            } else {
                Alert.alert('Error', response?.message || 'Failed to reschedule order');
            }
        } catch (error) {
            console.error('Error rescheduling order:', error);
            Alert.alert('Error', error?.message || 'Failed to reschedule order. Please try again.');
        } finally {
            setRescheduleLoading(false);
        }
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
    const handleJobStopSendSMS = async (job) => {
        try {
            setOtpLoading(true);
            const response = await sendJobStopOTP(job.orderNo);
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
            const response = selectedJob.job_start_sms_ver === null
                ? await verifyJobStartOTP(selectedJob.orderNo, otp)
                : await verifyJobStopOTP(selectedJob.orderNo, otp);
            if (response?.success) {
                const successMessage = selectedJob.job_start_sms_ver === null ? 'Job started successfully' : 'Job stopped successfully';
                Alert.alert('Success', response?.message || successMessage);
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
            const response = selectedJob.job_start_sms_ver === null
                ? await resendJobStartOTP(selectedJob.orderNo)
                : await sendJobStopOTP(selectedJob.orderNo);
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
        <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
        >
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
                {activeTab !== 'Completed' && (
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
                )}
            </View>
            {activeTab !== 'Completed' && (
                <>
                    <Text style={styles.customerName}>{job.customerName}</Text>
                    <Text style={styles.locationText} numberOfLines={2}>{job.location}</Text>
                    {(job.houseNo || job.locality) && (
                        <Text style={styles.addressDetails}>
                            {job.houseNo ? `${job.houseNo}, ` : ''}{job.locality || ''}
                        </Text>
                    )}
                </>
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
                    {/* handleJobStopSendSMS */}
                    <TouchableOpacity
                        style={styles.smsButton}
                        onPress={() => {
                            job.job_start_sms_ver === null ? handleSendSMS(job) : handleJobStopSendSMS(job)
                        }}
                        disabled={otpLoading}
                    >
                        {otpLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.smsButtonText}>{job.job_start_sms_ver === null ? 'Job Start' : 'Job Stop'}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
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

            {/* Reschedule Modal */}
            <Modal
                visible={rescheduleModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => {
                    setRescheduleModalVisible(false);
                    setRescheduleDate('');
                    setRescheduleTime('');
                    setSelectedJob(null);
                    setShowCalendar(false);
                    setSelectedDate(null);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.rescheduleModalContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setRescheduleModalVisible(false);
                                setRescheduleDate('');
                                setRescheduleTime('');
                                setSelectedJob(null);
                                setShowCalendar(false);
                                setSelectedDate(null);
                            }}
                        >
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.otpModalTitle}>Reschedule Order</Text>
                        <Text style={styles.orderNoText}>Order #{selectedJob?.orderNo}</Text>

                        <ScrollView style={styles.rescheduleScrollView} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Service Date</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowCalendar(!showCalendar)}
                                >
                                    <Icon name="calendar" size={18} color="#666" />
                                    <Text style={[styles.dateText, !rescheduleDate && styles.placeholderText]}>
                                        {rescheduleDate ? formatDisplayDate(rescheduleDate) : 'Select Date'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showCalendar && (
                                <View style={styles.calendarContainer}>
                                    <CalendarPicker
                                        selectedStartDate={selectedDate}
                                        initialDate={selectedDate || (() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            return tomorrow;
                                        })()}
                                        onDateChange={handleDateSelect}
                                        todayBackgroundColor="#E0E0E0"
                                        selectedDayColor="#2196F3"
                                        selectedDayTextColor="#FFFFFF"
                                        minDate={(() => {
                                            const tomorrow = new Date();
                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                            return tomorrow;
                                        })()}
                                        maxDate={(() => {
                                            const maxDate = new Date();
                                            maxDate.setDate(maxDate.getDate() + 5);
                                            return maxDate;
                                        })()}
                                        width={350}
                                        textStyle={{
                                            fontFamily: 'System',
                                            color: '#000',
                                        }}
                                    />
                                </View>
                            )}

                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Service Time</Text>
                                <TouchableOpacity
                                    style={styles.timePickerButton}
                                    onPress={() => setShowTimePicker(!showTimePicker)}
                                >
                                    <Text style={[styles.timePickerText, !rescheduleTime && styles.placeholderText]}>
                                        {rescheduleTime || 'Select Time'}
                                    </Text>
                                    <Icon name={showTimePicker ? "chevron-up" : "chevron-down"} size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            {showTimePicker && (
                                <View style={styles.timePickerContainer}>
                                    <ScrollView style={styles.timePickerScroll} nestedScrollEnabled={true}>
                                        <TouchableOpacity
                                            style={[styles.timeOption, !rescheduleTime && styles.selectedTimeOption]}
                                            onPress={() => {
                                                setRescheduleTime('');
                                                setShowTimePicker(false);
                                            }}
                                        >
                                            <Text style={[styles.timeOptionText, !rescheduleTime && styles.selectedTimeOptionText]}>
                                                Select
                                            </Text>
                                        </TouchableOpacity>
                                        {timeOptions.map((timeOpt) => (
                                            <TouchableOpacity
                                                key={timeOpt.value}
                                                style={[styles.timeOption, rescheduleTime === timeOpt.label && styles.selectedTimeOption]}
                                                onPress={() => {
                                                    setRescheduleTime(timeOpt.label);
                                                    setShowTimePicker(false);
                                                }}
                                            >
                                                <Text style={[styles.timeOptionText, rescheduleTime === timeOpt.label && styles.selectedTimeOptionText]}>
                                                    {timeOpt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.verifyButton}
                                onPress={handleRescheduleSubmit}
                                disabled={rescheduleLoading}
                            >
                                {rescheduleLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.verifyButtonText}>Reschedule</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
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
    rescheduleModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 420,
        maxHeight: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
        position: 'relative',
    },
    rescheduleScrollView: {
        maxHeight: '100%',
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
    timePickerButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timePickerText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    timePickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 16,
        maxHeight: 200,
        overflow: 'hidden',
    },
    timePickerScroll: {
        maxHeight: 200,
    },
    timeOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectedTimeOption: {
        backgroundColor: '#2196F3',
    },
    timeOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedTimeOptionText: {
        color: '#fff',
        fontWeight: '600',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        gap: 8,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 0,
        paddingTop: 8,
        paddingBottom: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        width: '100%',
        overflow: 'hidden',
    },
    closeCalendarButton: {
        marginTop: 8,
        marginBottom: 8,
        alignSelf: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginRight: 16,
    },
    closeCalendarText: {
        color: '#2196F3',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default JobsScreen;
