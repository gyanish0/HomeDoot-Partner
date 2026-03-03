import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import {
  createNotificationChannel,
  requestNotificationPermission,
  setupNotificationOpenedHandler,
  handleInitialNotification,
  setupNotifeeEventHandler,
} from './src/services/notificationHandler';

// Ignore all logs in production
if (!__DEV__) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

LogBox.ignoreAllLogs();

const App = () => {
  const navigationRef = useRef(null);

  useEffect(() => {
    async function initNotifications() {
      // Request notification permissions (Android 13+ & iOS)
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.log('Notification permissions not granted');
      }

      // Create Android notification channels
      await createNotificationChannel();

      // Handle notification that opened app from killed state
      await handleInitialNotification(navigationRef);

      // Handle notification opened from background
      const unsubscribeOpened = setupNotificationOpenedHandler(navigationRef);

      // Handle notifee foreground tap events
      const unsubscribeNotifee = setupNotifeeEventHandler(navigationRef);

      return () => {
        unsubscribeOpened();
        unsubscribeNotifee();
      };
    }

    initNotifications();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
