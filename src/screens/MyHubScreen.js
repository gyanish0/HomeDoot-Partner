import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


const MyHubScreen = ({ navigation }) => {
    const [selectedHub, setSelectedHub] = useState(0);

    // List of hub areas with pin codes and coordinates
    const hubAreas = [
        {
            id: 0,
            name: 'Panvel',
            pincode: '410206',
            latitude: 18.9894,
            longitude: 73.1175,
        },
        {
            id: 1,
            name: 'Navi Mumbai',
            pincode: '400614',
            latitude: 19.0330,
            longitude: 73.0297,
        },
        {
            id: 2,
            name: 'Vashi',
            pincode: '400703',
            latitude: 19.0768,
            longitude: 73.0169,
        }
    ];

    const handleHubSelect = (hubId) => {
        setSelectedHub(hubId);
    };

    const handleHelpItem = (item) => {
        // Handle navigation to help details
        console.log('Help item pressed:', item);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

                {/* Map Section */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <Icon name="map-marker" size={50} color="#4285F4" />
                        <Text style={styles.mapText}>{hubAreas[selectedHub].name}</Text>
                        <Text style={styles.mapSubtext}>Pincode: {hubAreas[selectedHub].pincode}</Text>
                        <Text style={styles.mapCoords}>
                            {hubAreas[selectedHub].latitude.toFixed(4)}°N, {hubAreas[selectedHub].longitude.toFixed(4)}°E
                        </Text>
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
    mapCoords: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        fontFamily: 'monospace',
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
