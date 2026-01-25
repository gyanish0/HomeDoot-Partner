import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Modal } from 'react-native';
import Colors from '../constants/Colors';

const CalendarScreen = () => {
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [tempFromDate, setTempFromDate] = useState(null);
    const [tempToDate, setTempToDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = () => {
        if (!fromDate && !toDate) return 'Select date range';
        if (fromDate && !toDate) return formatDate(fromDate);
        return `${formatDate(fromDate)} to ${formatDate(toDate)}`;
    };

    const handleDateRangePress = () => {
        setTempFromDate(fromDate);
        setTempToDate(toDate);
        setShowDatePicker(true);
    };

    const handleDateSelect = (date) => {
        if (!tempFromDate || (tempFromDate && tempToDate)) {
            // Start new selection
            setTempFromDate(date);
            setTempToDate(null);
        } else {
            // Select end date
            if (date < tempFromDate) {
                setTempFromDate(date);
                setTempToDate(tempFromDate);
            } else {
                setTempToDate(date);
            }
        }
    };

    const handleApply = () => {
        setFromDate(tempFromDate);
        setToDate(tempToDate);
        setShowDatePicker(false);
    };

    const handleClear = () => {
        setTempFromDate(null);
        setTempToDate(null);
    };

    const handleClosePicker = () => {
        setShowDatePicker(false);
    };

    const handleUpdateAvailability = () => {
        if (!fromDate || !toDate) {
            Alert.alert('Error', 'Please select a date range');
            return;
        }
        Alert.alert(
            'Update Availability',
            `Leave period set from ${formatDate(fromDate)} to ${formatDate(toDate)}`,
            [{ text: 'OK' }]
        );
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty slots for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
            days.push({ date: prevMonthDate, isCurrentMonth: false });
        }

        // Add days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: new Date(year, month, i), isCurrentMonth: true });
        }

        // Add empty slots for days after month ends
        const remainingSlots = 42 - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            const nextMonthDate = new Date(year, month + 1, i);
            days.push({ date: nextMonthDate, isCurrentMonth: false });
        }

        return days;
    };

    const getMonthName = (date) => {
        return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const isDateInRange = (date) => {
        if (!tempFromDate || !tempToDate) return false;
        const time = date.getTime();
        return time >= tempFromDate.getTime() && time <= tempToDate.getTime();
    };

    const isDateSelected = (date) => {
        if (!tempFromDate) return false;
        const time = date.getTime();
        if (tempFromDate && time === tempFromDate.getTime()) return true;
        if (tempToDate && time === tempToDate.getTime()) return true;
        return false;
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
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
                {/* Select Date Range Section */}

                <View style={styles.dateRangeContainer}>
                    <TouchableOpacity
                        style={styles.dateRangeDisplay}
                        onPress={handleDateRangePress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.dateRangeText}>
                            {formatDisplayDate()}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Note */}
                <Text style={styles.noteText}>
                    Note: You will not receive new job assignments during this period.
                </Text>

                {/* Update Availability Button */}
                <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateAvailability}
                >
                    <Text style={styles.updateButtonIcon}>💾</Text>
                    <Text style={styles.updateButtonText}>Update Availability</Text>
                </TouchableOpacity>

                {/* Date Display at Bottom */}
                {fromDate && toDate && (
                    <View style={styles.dateDisplayContainer}>
                        <View style={styles.dateDisplayBox}>
                            <Text style={styles.dateDisplayLabel}>FROM DATE</Text>
                            <Text style={styles.dateDisplayValue}>{formatDate(fromDate)}</Text>
                        </View>

                        <View style={styles.dateDisplayBox}>
                            <Text style={styles.dateDisplayLabel}>TO DATE</Text>
                            <Text style={styles.dateDisplayValue}>{formatDate(toDate)}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Calendar Date Picker Modal */}
            <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
                onRequestClose={handleClosePicker}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.calendarModalContent}>
                        {/* Month Navigation */}
                        <View style={styles.monthNavigation}>
                            <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
                                <Text style={styles.navButtonText}>‹</Text>
                            </TouchableOpacity>
                            <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>
                            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                                <Text style={styles.navButtonText}>›</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Weekday Headers */}
                        <View style={styles.weekdayHeader}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                                <View key={index} style={styles.weekdayCell}>
                                    <Text style={styles.weekdayText}>{day}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar Grid */}
                        <View style={styles.calendarGrid}>
                            {getDaysInMonth(currentMonth).map((dayObj, index) => {
                                const isInRange = isDateInRange(dayObj.date);
                                const isSelected = isDateSelected(dayObj.date);

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.dayCell,
                                            isInRange && styles.dayCellInRange,
                                            isSelected && styles.dayCellSelected,
                                        ]}
                                        onPress={() => handleDateSelect(dayObj.date)}
                                        disabled={!dayObj.isCurrentMonth}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                !dayObj.isCurrentMonth && styles.dayTextDisabled,
                                                isSelected && styles.dayTextSelected,
                                            ]}
                                        >
                                            {dayObj.date.getDate()}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Selected Range Display */}
                        <View style={styles.rangeDisplay}>
                            <Text style={styles.rangeText}>
                                {tempFromDate && tempToDate
                                    ? `${formatDate(tempFromDate)} - ${formatDate(tempToDate)}`
                                    : tempFromDate
                                        ? `${formatDate(tempFromDate)} - Select end date`
                                        : 'Select start date'}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClear}
                            >
                                <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.applyButton, (!tempFromDate || !tempToDate) && styles.applyButtonDisabled]}
                                onPress={handleApply}
                                disabled={!tempFromDate || !tempToDate}
                            >
                                <Text style={styles.applyButtonText}>Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    headerIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#9C27B0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 16,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    calendarIconBox: {
        width: 80,
        height: 56,
        backgroundColor: '#A94442',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarButtonIcon: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    dateRangeDisplay: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dateRangeText: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
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
    },
    updateButtonIcon: {
        fontSize: 20,
        marginRight: 8,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    calendarModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    navButton: {
        padding: 10,
        minWidth: 40,
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 28,
        color: '#333333',
        fontWeight: 'bold',
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    weekdayHeader: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingBottom: 10,
    },
    weekdayCell: {
        flex: 1,
        alignItems: 'center',
    },
    weekdayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    dayCellInRange: {
        backgroundColor: '#E3F2FD',
    },
    dayCellSelected: {
        backgroundColor: '#5B8DB8',
        borderRadius: 20,
    },
    dayText: {
        fontSize: 16,
        color: '#333333',
    },
    dayTextDisabled: {
        color: '#CCCCCC',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    rangeDisplay: {
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginVertical: 16,
        alignItems: 'center',
    },
    rangeText: {
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#666666',
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#9C27B0',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CalendarScreen;
