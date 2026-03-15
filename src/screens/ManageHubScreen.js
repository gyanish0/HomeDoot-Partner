import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../services/axiosInstance';
import { BASE_URL } from '../config/api';

const ManageHubScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [areas, setAreas] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showAreasDropdown, setShowAreasDropdown] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedState) {
            fetchAreas(selectedState.id);
        }
    }, [selectedState]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/service-area');

            if (response.data) {
                const { states, assignments } = response.data;
                setStates(states || []);
                setAssignments(assignments || []);
            }
        } catch (err) {
            console.error('Error fetching initial data:', err);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAreas = async (stateId) => {
        try {
            const response = await axiosInstance.get(`${BASE_URL}/api/vendor/states/${stateId}/areas`);
            console.log('Areas response:', response.data);
            if (response.data) {
                setAreas(Array.isArray(response.data) ? response.data : []);
            }
        } catch (err) {
            console.error('Error fetching areas:', err);
            Alert.alert('Error', 'Failed to load areas for selected state');
            setAreas([]);
        }
    };

    const handleStateSelect = (state) => {
        setSelectedState(state);
        setSelectedAreas([]);
        setShowStateDropdown(false);
    };

    const toggleAreaSelection = (area) => {
        const isSelected = selectedAreas.find(a => a.id === area.id);
        if (isSelected) {
            setSelectedAreas(selectedAreas.filter(a => a.id !== area.id));
        } else {
            setSelectedAreas([...selectedAreas, area]);
        }
    };

    const handleAssignAreas = async () => {
        if (!selectedState || selectedAreas.length === 0) {
            Alert.alert('Error', 'Please select a state and at least one area');
            return;
        }

        try {
            setSubmitting(true);
            const areaPincodeIds = selectedAreas.map(area => area.id);
            const response = await axiosInstance.post('/service-area/update', {
                state_id: selectedState.id,
                area_ids: areaPincodeIds,
            });

            if (response.success) {
                Alert.alert('Success', response?.message || 'Areas assigned successfully');
                setSelectedAreas([]);
                fetchInitialData();
            }

        } catch (err) {
            console.error('Error assigning areas:', err);
            Alert.alert('Error', err.response?.data?.message || 'Failed to assign areas');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this assignment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await axiosInstance.delete(`/service-area/${assignmentId}`);
                            Alert.alert('Success', 'Assignment deleted successfully');
                            fetchInitialData();
                        } catch (err) {
                            console.error('Error deleting assignment:', err);
                            Alert.alert('Error', 'Failed to delete assignment');
                        }
                    },
                },
            ]
        );
    };

    const filteredAssignments = assignments.filter(assignment =>
        assignment.area.state.state_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.area.pincode.toString().includes(searchQuery)
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DBFAF" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Assign Areas Section */}
                <View style={styles.assignSection}>
                    {/* State Selection */}
                    <Text style={styles.label}>State</Text>
                    <TouchableOpacity
                        style={styles.dropdown}
                        onPress={() => setShowStateDropdown(true)}
                    >
                        <Text style={styles.dropdownText}>
                            {selectedState ? selectedState.state_name : 'Select State'}
                        </Text>
                        <Icon name="chevron-down" size={24} color="#666" />
                    </TouchableOpacity>

                    {/* State Dropdown Modal */}
                    <Modal
                        visible={showStateDropdown}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowStateDropdown(false)}
                    >
                        <TouchableOpacity
                            style={styles.modalOverlay}
                            activeOpacity={1}
                            onPress={() => setShowStateDropdown(false)}
                        >
                            <View style={styles.dropdownModal}>
                                <View style={styles.dropdownHeader}>
                                    <Text style={styles.dropdownHeaderText}>Select State</Text>
                                    <TouchableOpacity onPress={() => setShowStateDropdown(false)}>
                                        <Icon name="close" size={24} color="#666" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.dropdownList}>
                                    {states.map((state) => (
                                        <TouchableOpacity
                                            key={state.id}
                                            style={[
                                                styles.dropdownItem,
                                                selectedState?.id === state.id && styles.dropdownItemSelected
                                            ]}
                                            onPress={() => handleStateSelect(state)}
                                        >
                                            <Text style={[
                                                styles.dropdownItemText,
                                                selectedState?.id === state.id && styles.dropdownItemTextSelected
                                            ]}>
                                                {state.state_name}
                                            </Text>
                                            {selectedState?.id === state.id && (
                                                <Icon name="check" size={20} color="#1DBFAF" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>

                    {/* Areas Selection */}
                    {selectedState && (
                        <>
                            <Text style={styles.label}>Areas</Text>

                            {/* Selected Areas Chips */}
                            {selectedAreas.length > 0 && (
                                <View style={styles.areasContainer}>
                                    {selectedAreas.map((area) => (
                                        <View key={area.id} style={styles.selectedAreaChip}>
                                            <Text style={styles.selectedAreaText}>
                                                {area.area_name} ({area.pincode})
                                            </Text>
                                            <TouchableOpacity onPress={() => toggleAreaSelection(area)}>
                                                <Icon name="close" size={16} color="#fff" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Areas Dropdown */}
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowAreasDropdown(true)}
                            >
                                <Text style={styles.dropdownText}>
                                    {selectedAreas.length > 0
                                        ? `${selectedAreas.length} area(s) selected`
                                        : 'Select Areas'}
                                </Text>
                                <Icon name="chevron-down" size={24} color="#666" />
                            </TouchableOpacity>

                            {/* Areas Dropdown Modal */}
                            <Modal
                                visible={showAreasDropdown}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setShowAreasDropdown(false)}
                            >
                                <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowAreasDropdown(false)}
                                >
                                    <View style={styles.dropdownModal}>
                                        <View style={styles.dropdownHeader}>
                                            <Text style={styles.dropdownHeaderText}>Select Areas</Text>
                                            <TouchableOpacity onPress={() => setShowAreasDropdown(false)}>
                                                <Icon name="close" size={24} color="#666" />
                                            </TouchableOpacity>
                                        </View>
                                        <ScrollView style={styles.dropdownList}>
                                            {areas.length === 0 ? (
                                                <View style={styles.emptyDropdown}>
                                                    <Text style={styles.emptyDropdownText}>No areas available</Text>
                                                </View>
                                            ) : (
                                                areas.map((area) => {
                                                    const isSelected = selectedAreas.find(a => a.id === area.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={area.id}
                                                            style={[
                                                                styles.dropdownItem,
                                                                isSelected && styles.dropdownItemSelected
                                                            ]}
                                                            onPress={() => toggleAreaSelection(area)}
                                                        >
                                                            <View style={styles.dropdownItemContent}>
                                                                <View style={[
                                                                    styles.checkbox,
                                                                    isSelected && styles.checkboxSelected
                                                                ]}>
                                                                    {isSelected && (
                                                                        <Icon name="check" size={16} color="#fff" />
                                                                    )}
                                                                </View>
                                                                <Text style={[
                                                                    styles.dropdownItemText,
                                                                    isSelected && styles.dropdownItemTextSelected
                                                                ]}>
                                                                    {area.area_name} ({area.pincode})
                                                                </Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            )}
                                        </ScrollView>
                                        <View style={styles.dropdownFooter}>
                                            <TouchableOpacity
                                                style={styles.dropdownDoneButton}
                                                onPress={() => setShowAreasDropdown(false)}
                                            >
                                                <Text style={styles.dropdownDoneButtonText}>Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            <TouchableOpacity
                                style={[
                                    styles.assignButton,
                                    (submitting || selectedAreas.length === 0) && styles.assignButtonDisabled
                                ]}
                                onPress={handleAssignAreas}
                                disabled={submitting || selectedAreas.length === 0}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.assignButtonText}>Assign Areas</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Area Assignments Table */}
                <View style={styles.tableSection}>
                    <Text style={styles.tableTitle}>Area Assignments</Text>

                    {/* Cards */}
                    {filteredAssignments.length === 0 ? (
                        <View style={styles.emptyTable}>
                            <Icon name="map-marker-off" size={60} color="#ccc" />
                            <Text style={styles.emptyTableText}>No assignments found</Text>
                        </View>
                    ) : (
                        filteredAssignments.map((assignment, index) => (
                            <View key={assignment.id} style={styles.assignmentCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardNumberBadge}>
                                        <Text style={styles.cardNumberText}>{index + 1}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteButtonCard}
                                        onPress={() => handleDeleteAssignment(assignment.id)}
                                    >
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.cardRowContainer}>
                                        <View style={styles.cardRowHalf}>
                                            <Icon name="map-marker" size={20} color="#1DBFAF" />
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardLabel}>Area</Text>
                                                <Text style={styles.cardValue}>
                                                    {assignment.area.area_name || 'Laxmi nagar'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardRowHalf}>
                                            <Icon name="mailbox" size={20} color="#7B68EE" />
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardLabel}>Pincode</Text>
                                                <Text style={styles.cardValue}>{assignment.area.pincode}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.cardRowContainer}>
                                        <View style={styles.cardRowHalf}>
                                            <Icon name="map" size={20} color="#FF9800" />
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardLabel}>State</Text>
                                                <Text style={styles.cardValue}>
                                                    {assignment.area.state.state_name}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.cardRowHalf}>
                                            <Icon name="calendar-clock" size={20} color="#666" />
                                            <View style={styles.cardInfo}>
                                                <Text style={styles.cardLabel}>Assigned At</Text>
                                                <Text style={styles.cardValue}>
                                                    {(() => {
                                                        const d = new Date(assignment.created_at);
                                                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                                        return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
                                                    })()}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    scrollView: {
        flex: 1,
    },
    assignSection: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 20,
    },
    dropdownText: {
        fontSize: 15,
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    dropdownModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxHeight: '70%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    dropdownHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    dropdownList: {
        maxHeight: 400,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemSelected: {
        backgroundColor: '#E8F8F7',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#1DBFAF',
        fontWeight: '600',
    },
    dropdownItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ccc',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#1DBFAF',
        borderColor: '#1DBFAF',
    },
    dropdownFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    dropdownDoneButton: {
        backgroundColor: '#1DBFAF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    dropdownDoneButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyDropdown: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyDropdownText: {
        fontSize: 14,
        color: '#999',
    },
    areasContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    selectedAreaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7B68EE',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    selectedAreaText: {
        color: '#fff',
        fontSize: 12,
        marginRight: 6,
    },
    assignButton: {
        backgroundColor: '#1DBFAF',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    assignButtonDisabled: {
        backgroundColor: '#ccc',
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tableSection: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
    },
    assignmentCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardNumberBadge: {
        backgroundColor: '#1DBFAF',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    cardContent: {
        gap: 12,
    },
    cardRowContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    cardRowHalf: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardInfo: {
        marginLeft: 12,
        flex: 1,
    },
    cardLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    deleteButtonCard: {
        backgroundColor: '#FF5252',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    emptyTable: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyTableText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    deleteButton: {
        backgroundColor: '#FF5252',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default ManageHubScreen;
