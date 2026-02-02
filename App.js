import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

// Ignore all logs in production
if (!__DEV__) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

LogBox.ignoreAllLogs();

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
