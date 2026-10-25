/**
 * Stikaro - Offline Photo Annotation App
 * Main application entry point
 */

import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { useAppStore } from './src/stores/appStore';
import { themes } from './src/constants/themes';
import { startSubscriptions } from './src/services/subscriptions';

function App(): React.JSX.Element {
  useEffect(() => startSubscriptions(), []);
  const preferences = useAppStore(state => state.preferences);
  const theme = themes[preferences?.theme || 'dark'];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme.statusBar}
          backgroundColor={theme.backgrounds.primary}
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
