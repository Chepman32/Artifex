// Main app navigation structure

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../stores/appStore';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import EditorScreen from '../screens/EditorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
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
  Paywall: undefined;
  ImagePicker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash screen duration matches animation (2.8 seconds)
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Custom headers per screen
          animation: 'default',
        }}
      >
        {!hasSeenOnboarding && (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{
              presentation: 'fullScreenModal',
              gestureEnabled: false, // Can't swipe away onboarding
            }}
          />
        )}

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
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{
              gestureEnabled: false, // Prevent swipe dismiss
            }}
          />
          <Stack.Screen name="ImagePicker" component={ImagePickerScreen} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
