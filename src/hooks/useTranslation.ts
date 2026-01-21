// Translation hook for accessing current language translations

import { useAppStore } from '../stores/appStore';
import { translations } from '../localization';
import { getDeviceLanguage } from '../localization/deviceLanguage';

export const useCurrentLanguage = () => {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const preferencesLanguage = useAppStore(state => state.preferences?.language || 'en');
  const deviceLanguage = hasSeenOnboarding ? null : getDeviceLanguage();

  return hasSeenOnboarding
    ? preferencesLanguage
    : deviceLanguage || preferencesLanguage;
};

export const useTranslation = () => {
  const language = useCurrentLanguage();
  return translations[language];
};
