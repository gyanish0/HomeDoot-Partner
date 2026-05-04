import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../services/axiosInstance';


const MyHubScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [selectedHub, setSelectedHub] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hubAreas, setHubAreas] = useState([]);

    useEffect(() => {
        fetchServiceAreas();
    }, []);

    useEffect(() => {
        if (hubAreas.length > 0) {
            setSelectedHub(hubAreas[0].id);
        }
    }, [hubAreas]);

    const fetchServiceAreas = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get('/service-area');
            if (response.data) {
                const { assignments } = response.data;

                const transformedAreas = assignments.map((assignment, index) => ({
                    id: index,
                    assignmentId: assignment.id,
                    name: assignment.area.state.state_name,
                    pincode: assignment.area.pincode.toString(),
                    stateId: assignment.area.state_id,
                    areaId: assignment.area.id,
                }));

                setHubAreas(transformedAreas);
            }
        } catch (err) {
            console.error('Error fetching service areas:', err);
            setError(err.message || 'Failed to load service areas');
        } finally {
            setLoading(false);
        }
    };

    const handleHubSelect = (hubId) => {
        setSelectedHub(hubId);
    };

    const handleHelpItem = (item) => {
        // Handle navigation to help details
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Loading service areas...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={60} color="#FF5252" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchServiceAreas}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : hubAreas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icon name="map-marker-off" size={60} color="#999" />
                    <Text style={styles.emptyText}>No service areas assigned</Text>
                    <TouchableOpacity
                        style={styles.emptyAddHubButton}
                        onPress={() => navigation.navigate('ManageHub')}
                    >
                        <Icon name="plus-circle" size={22} color="#fff" />
                        <Text style={styles.emptyAddHubButtonText}>Add Hub Area</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={{ paddingBottom: insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hub Areas Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.tabsContainer}
                        contentContainerStyle={styles.tabsContent}
                    >
                        {hubAreas.map((hub) => (
                            <TouchableOpacity
                                key={hub.id}
                                style={styles.tabWrapper}
                                onPress={() => handleHubSelect(hub.id)}
                            >
                                <Text style={[
                                    styles.tabName,
                                    selectedHub === hub.id && styles.tabNameSelected
                                ]}>
                                    {hub.name}
                                </Text>
                                {selectedHub === hub.id && (
                                    <View style={styles.tabUnderline} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Manage Hub Button */}
                    <TouchableOpacity
                        style={styles.manageHubButton}
                        onPress={() => navigation.navigate('ManageHub')}
                    >
                        <Icon name="plus-circle" size={24} color="#fff" />
                        <Text style={styles.manageHubButtonText}>Manage Hub Areas</Text>
                    </TouchableOpacity>

                    {/* Map Section */}
                    <View style={styles.mapContainer}>
                        <View style={styles.mapPlaceholder}>
                            <Icon name="map-marker" size={50} color="#4285F4" />
                            <Text style={styles.mapText}>{hubAreas[selectedHub]?.name}</Text>
                            <Text style={styles.mapSubtext}>Pincode: {hubAreas[selectedHub]?.pincode}</Text>
                            <Text style={styles.mapInfoText}>Service Area ID: {hubAreas[selectedHub]?.areaId}</Text>
                        </View>
                        {/* Google Maps logo */}
                        <View style={styles.googleLogo}>
                            <Text style={styles.googleText}>Google</Text>
                        </View>
                    </View>

                    {/* Need Help Section */}
                    <View style={styles.helpSection}>
                        <Text style={styles.helpTitle}>Need help?</Text>

                        <TouchableOpacity
                            style={styles.helpItem}
                            onPress={() => handleHelpItem('What is a Hub?')}
                        >
                            <Text style={styles.helpItemText}>What is a Hub?</Text>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>

                        <View style={styles.helpDivider} />

                        <TouchableOpacity
                            style={styles.helpItem}
                            onPress={() => handleHelpItem('Getting rebooking leads outside hub')}
                        >
                            <Text style={styles.helpItemText}>Getting rebooking leads outside hub</Text>
                            <Icon name="chevron-right" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
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
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    scrollView: {
        flex: 1,
    },
    tabsContainer: {
        paddingLeft: 16,
        paddingTop: 20,
        paddingBottom: 10,
        maxHeight: 60,
    },
    tabsContent: {
        paddingRight: 16,
        gap: 24,
    },
    tabWrapper: {
        marginRight: 24,
    },
    tabName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        paddingBottom: 8,
    },
    tabNameSelected: {
        color: '#000',
    },
    tabUnderline: {
        height: 3,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    manageHubButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1DBFAF',
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 10,
        paddingVertical: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    manageHubButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    tableContainer: {
        marginHorizontal: 16,
        marginTop: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
    },
    tableTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        padding: 16,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    tableRowSelected: {
        backgroundColor: '#E8F5E9',
    },
    tableRowContent: {
        flex: 1,
    },
    hubName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    hubNameSelected: {
        color: '#2E7D32',
    },
    pincode: {
        fontSize: 14,
        color: '#666',
    },
    pincodeSelected: {
        color: '#4CAF50',
    },
    tabContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 10,
    },
    tabItem: {
        alignSelf: 'flex-start',
    },
    tabText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        paddingBottom: 8,
    },
    tabUnderline: {
        height: 3,
        backgroundColor: '#000',
        borderRadius: 2,
    },
    mapContainer: {
        marginHorizontal: 16,
        marginTop: 20,
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#E8F5E9',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    mapText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginTop: 12,
    },
    mapSubtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 6,
    },
    mapInfoText: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: '#4285F4',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#999',
    },
    emptyAddHubButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1DBFAF',
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
    },
    emptyAddHubButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
    googleLogo: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    googleText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4285F4',
    },
    helpSection: {
        marginHorizontal: 16,
        marginTop: 40,
        marginBottom: 40,
    },
    helpTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 20,
    },
    helpItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    helpItemText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    helpDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
});

export default MyHubScreen;
