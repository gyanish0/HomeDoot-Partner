import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import Colors from '../constants/Colors';
import { updateVendorLeave } from '../services/vendorService';
import { useAuth } from '../context/AuthContext';

const CalendarScreen = () => {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateText, setStartDateText] = useState('');
    const [endDateText, setEndDateText] = useState('');
    const [activePicker, setActivePicker] = useState(null);
    const [dateError, setDateError] = useState('');
    const [loading, setLoading] = useState(false);

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleDateSelect = (date) => {
        const jsDate = date instanceof Date ? date : new Date(date);
        const formatted = formatDate(jsDate);

        if (activePicker === 'start') {
            setStartDate(jsDate);
            setStartDateText(formatted);
            if (endDate && jsDate > endDate) {
                setDateError('Start date cannot be after end date');
            } else {
                setDateError('');
            }
        } else if (activePicker === 'end') {
            setEndDate(jsDate);
            setEndDateText(formatted);
            if (startDate && startDate > jsDate) {
                setDateError('End date cannot be before start date');
            } else {
                setDateError('');
            }
        }
        setActivePicker(null);
    };

    const handleUpdateAvailability = async () => {
        if (!startDate || !endDate) {
            Alert.alert('Error', 'Please select both start and end dates');
            return;
        }

        if (startDate > endDate) {
            setDateError('Start date cannot be after end date');
            return;
        }

        try {
            setLoading(true);
            setDateError('');

            const leaveData = {
                non_availability_from: formatDate(startDate),
                non_availability_to: formatDate(endDate),
            };

            const response = await updateVendorLeave(leaveData);
            console.log(response, '=====response====11=response')
            if (response.success || response.message) {
                Alert.alert(
                    'Success',
                    `Leave period updated successfully from ${formatDate(startDate)} to ${formatDate(endDate)}`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            setStartDate(null);
                            setEndDate(null);
                            setStartDateText('');
                            setEndDateText('');
                        }
                    }]
                );
            } else {
                Alert.alert('Error', 'Failed to update leave period. Please try again.');
            }
        } catch (error) {
            console.error('Error updating leave period:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || error.message || 'Failed to update leave period. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerIconText}>📅</Text>
                <Text style={styles.headerTitle}>Set leave mark Period</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Date Range for leave mark */}
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setActivePicker('start')}
                        >
                            <Icon name="calendar" size={18} color="#666" />
                            <Text style={styles.dateText}>
                                {startDateText || 'YYYY-MM-DD'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setActivePicker('end')}
                        >
                            <Icon name="calendar" size={18} color="#666" />
                            <Text style={styles.dateText}>
                                {endDateText || 'YYYY-MM-DD'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}

                {activePicker && (
                    <View style={styles.calendarContainer}>
                        <CalendarPicker
                            minDate={activePicker === 'end' && startDate ? startDate : new Date()}
                            selectedStartDate={startDate}
                            onDateChange={handleDateSelect}
                            todayBackgroundColor="#E0E0E0"
                            selectedDayColor="#9C27B0"
                            selectedDayTextColor="#FFFFFF"
                        />
                    </View>
                )}

                {/* Note */}
                <Text style={styles.noteText}>
                    Note: You will not receive new job assignments during this period.
                </Text>

                {/* Update Availability Button */}
                <TouchableOpacity
                    style={[styles.updateButton, loading && styles.updateButtonDisabled]}
                    onPress={handleUpdateAvailability}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <>
                            <Icon name="content-save" size={20} color="#fff" />
                            <Text style={styles.updateButtonText}>Update Availability</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Date Display at Bottom */}
                {startDate && endDate && (
                    <View style={styles.dateDisplayContainer}>
                        <View style={styles.dateDisplayBox}>
                            <Text style={styles.dateDisplayLabel}>FROM DATE</Text>
                            <Text style={styles.dateDisplayValue}>{formatDate(startDate)}</Text>
                        </View>

                        <View style={styles.dateDisplayBox}>
                            <Text style={styles.dateDisplayLabel}>TO DATE</Text>
                            <Text style={styles.dateDisplayValue}>{formatDate(endDate)}</Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginTop: 16,
    },
    headerIconText: {
        fontSize: 24,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333333',
    },
    content: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: '#333',
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    closeCalendarButton: {
        marginTop: 12,
        alignSelf: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    closeCalendarText: {
        color: '#9C27B0',
        fontWeight: '600',
        fontSize: 14,
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
    },
    noteText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#666666',
        marginBottom: 32,
        lineHeight: 20,
    },
    updateButton: {
        flexDirection: 'row',
        backgroundColor: '#9C27B0',
        borderRadius: 8,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        gap: 8,
    },
    updateButtonDisabled: {
        backgroundColor: '#CCCCCC',
        opacity: 0.6,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    dateDisplayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 20,
        marginTop: 20,
    },
    dateDisplayBox: {
        flex: 1,
        alignItems: 'center',
    },
    dateDisplayLabel: {
        fontSize: 12,
        color: '#999999',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    dateDisplayValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
    },
});

export default CalendarScreen;
