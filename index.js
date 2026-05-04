/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setupBackgroundHandler } from './src/services/notificationHandler';

// Register background handlers before app registration
setupBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
