// Global app state using Zustand

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';
import { getDeviceLanguage } from '../localization/deviceLanguage';

interface AppState {
  hasSeenOnboarding: boolean;
  hasHydrated: boolean;
  preferences: UserPreferences;

  // Actions
  setOnboardingSeen: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (hydrated: boolean) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      hasSeenOnboarding: false,
      hasHydrated: false,
      preferences: {
        defaultExportFormat: 'png',
        defaultExportQuality: 100,
        autoSaveProjects: true,
        hapticFeedback: true,
        colorScheme: 'auto',
        theme: 'dark',
        soundEnabled: true,
        language: getDeviceLanguage(),
      },

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      resetOnboarding: () => set({ hasSeenOnboarding: false }),
      setHasHydrated: hydrated => set({ hasHydrated: hydrated }),
      updatePreferences: prefs =>
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate app state:', error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
