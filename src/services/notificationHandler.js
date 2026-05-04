import messaging from '@react-native-firebase/messaging';
import { getApps } from '@react-native-firebase/app';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';

function isFirebaseReady() {
    const apps = getApps();
    if (!apps || apps.length === 0) {
        console.warn('Firebase app is not initialized. Skipping messaging setup.');
        return false;
    }

    return true;
}

// Create Android notification channel with custom sound
export async function createNotificationChannel() {
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        sound: 'ring', // must match file name in android/app/src/main/res/raw/ring.mp3
        importance: AndroidImportance.HIGH,
        vibration: true,
    });

    await notifee.createChannel({
        id: 'booking',
        name: 'New Bookings',
        sound: 'ring',
        importance: AndroidImportance.HIGH,
        vibration: true,
    });
}

// Request notification permissions (Android 13+ and iOS)
export async function requestNotificationPermission() {
    if (!isFirebaseReady()) {
        return false;
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission denied');
            return false;
        }
    }

    // Firebase permission (mainly for iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
        console.log('Firebase notification permission not granted');
        return false;
    }

    return true;
}

// Display a local notification using notifee
export async function displayLocalNotification(remoteMessage) {
    const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'New Notification';
    const body = remoteMessage.notification?.body || remoteMessage.data?.body || '';
    const isBooking = remoteMessage?.data?.type === 'new_order';

    await notifee.displayNotification({
        title,
        body,
        data: remoteMessage.data || {},
        android: {
            channelId: isBooking ? 'booking' : 'default',
            importance: AndroidImportance.HIGH,
            sound: 'ring',
            vibrationPattern: [300, 500],
            pressAction: { id: 'default' },
            smallIcon: 'ic_notification', // optional: add your icon in android/app/src/main/res/drawable
        },
        ios: {
            sound: 'ring.wav', // must exist in iOS bundle
        },
    });
}

// Setup foreground notification listener
export function setupForegroundNotifications(onNewOrder) {
    if (!isFirebaseReady()) {
        return () => { };
    }

    const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log('FCM Foreground Message:', remoteMessage);

        // Display local notification with sound
        await displayLocalNotification(remoteMessage);

        // If it's a new order, trigger the callback (for booking popup)
        if (remoteMessage?.data?.type === 'new_order' && onNewOrder) {
            onNewOrder(remoteMessage.data);
        }
    });

    return unsubscribe;
}

// Handle notification opened from background state
export function setupNotificationOpenedHandler(navigationRef) {
    if (!isFirebaseReady()) {
        return () => { };
    }

    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);
        if (remoteMessage?.data?.type === 'new_order') {
            // Navigate to Jobs/Dashboard when booking notification is tapped
            navigationRef.current?.navigate('Main');
        }
    });

    return unsubscribe;
}

// Handle notification that opened app from killed state
export async function handleInitialNotification(navigationRef) {
    if (!isFirebaseReady()) {
        return;
    }

    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage?.data?.type === 'new_order') {
        // Will navigate after navigation is ready
        setTimeout(() => {
            navigationRef.current?.navigate('Main');
        }, 1000);
    }
}

// Setup notifee foreground event handler (for tap actions on local notifications)
export function setupNotifeeEventHandler(navigationRef) {
    return notifee.onForegroundEvent(({ type, detail }) => {
        if (type === EventType.PRESS) {
            console.log('Notification pressed:', detail.notification);
            if (detail.notification?.data?.type === 'new_order') {
                navigationRef.current?.navigate('Main');
            }
        }
    });
}

// Background event handler for notifee (must be called at app entry point)
export function setupBackgroundHandler() {
    if (!isFirebaseReady()) {
        return;
    }

    // Firebase background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('FCM Background Message:', remoteMessage);
        // Display local notification with sound in background
        await displayLocalNotification(remoteMessage);
    });

    // Notifee background event handler
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        console.log('Notifee background event:', type, detail);
        if (type === EventType.PRESS) {
            console.log('Background notification pressed:', detail.notification);
        }
    });
}
