// Main app navigation structure

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../stores/appStore';
import { getDeviceLanguage } from '../localization/deviceLanguage';

// Screens
import ParticleSplashScreen from '../screens/ParticleSplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ImagePickerScreen from '../screens/ImagePickerScreen';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Editor: {
    projectId?: string;
    imageUri?: string;
    imageDimensions?: { width: number; height: number };
  };
  Settings: undefined;
  ImagePicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const hasHydrated = useAppStore(state => state.hasHydrated);
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const preferencesLanguage = useAppStore(state => state.preferences.language);
  const updatePreferences = useAppStore(state => state.updatePreferences);
  const [showSplash, setShowSplash] = useState(true);

  const shouldSyncLanguage = hasHydrated && !hasSeenOnboarding;
  const deviceLanguage = shouldSyncLanguage ? getDeviceLanguage() : preferencesLanguage;
  const isLanguageSynced = !shouldSyncLanguage || deviceLanguage === preferencesLanguage;

  useEffect(() => {
    // Splash screen duration matches animation (1.5 seconds total)
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldSyncLanguage || isLanguageSynced) {
      return;
    }

    updatePreferences({ language: deviceLanguage });
  }, [deviceLanguage, isLanguageSynced, shouldSyncLanguage, updatePreferences]);

  if (showSplash || !hasHydrated || !isLanguageSynced) {
    return <ParticleSplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasSeenOnboarding ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerShown: false, // Custom headers per screen
          animation: 'default',
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            presentation: 'fullScreenModal',
            gestureEnabled: false, // Can't swipe away onboarding
          }}
        />

        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen
          name="Editor"
          component={EditorScreen}
          options={{
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
          }}
        />

        {/* Modal Screens */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
