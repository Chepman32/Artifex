// Device language detection with fallbacks to supported languages

import { I18nManager, NativeModules, Platform } from 'react-native';
import { translations } from './index';
import type { Language } from './translations';

const supportedLanguages = Object.keys(translations) as Language[];

let cachedLocalizeLocale: string | null | undefined;

const getLocalizeLocale = (): string | null => {
  if (cachedLocalizeLocale !== undefined) {
    return cachedLocalizeLocale;
  }

  try {
    // Lazy-load to avoid crashing if native module isn't linked yet.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rnLocalize = require('react-native-localize');
    const locales = rnLocalize?.getLocales?.();
    if (Array.isArray(locales) && locales.length > 0) {
      const primary = locales[0];
      cachedLocalizeLocale =
        typeof primary?.languageTag === 'string'
          ? primary.languageTag
          : typeof primary?.languageCode === 'string'
            ? primary.languageCode
            : null;
      return cachedLocalizeLocale;
    }
  } catch {
    cachedLocalizeLocale = null;
  }

  cachedLocalizeLocale = null;
  return cachedLocalizeLocale;
};

const getDeviceLocale = (): string | null => {
  try {
    const localizeLocale = getLocalizeLocale();
    if (localizeLocale) {
      return localizeLocale;
    }
  } catch (error) {
    console.warn('Failed to read react-native-localize locales:', error);
  }

  try {
    if (Platform.OS === 'ios') {
      const settingsManager = NativeModules.SettingsManager;
      const settings =
        settingsManager?.settings || settingsManager?.getConstants?.().settings;
      const appleLanguages = settings?.AppleLanguages;
      if (Array.isArray(appleLanguages) && typeof appleLanguages[0] === 'string') {
        return appleLanguages[0];
      }

      const appleLocale = settings?.AppleLocale;
      return typeof appleLocale === 'string' ? appleLocale : null;
    }

    if (Platform.OS === 'android') {
      const locale =
        I18nManager.getConstants?.().localeIdentifier ||
        NativeModules.I18nManager?.getConstants?.().localeIdentifier ||
        NativeModules.I18nManager?.localeIdentifier;
      return typeof locale === 'string' ? locale : null;
    }
  } catch (error) {
    console.warn('Failed to read device locale:', error);
  }

  try {
    const locale = I18nManager.getConstants?.().localeIdentifier;
    if (typeof locale === 'string') {
      return locale;
    }
  } catch (error) {
    console.warn('Failed to read I18nManager locale:', error);
  }

  try {
    const fallbackLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    return typeof fallbackLocale === 'string' ? fallbackLocale : null;
  } catch (error) {
    console.warn('Failed to resolve fallback locale:', error);
    return null;
  }
};

const normalizeLanguage = (locale: string): Language | null => {
  const normalized = locale.replace('_', '-').toLowerCase();
  const base = normalized.split('-')[0];

  const aliasMap: Record<string, Language> = {
    iw: 'he',
    in: 'id',
    tl: 'fil',
    nb: 'no',
    nn: 'no',
  };

  if (aliasMap[base]) {
    return aliasMap[base];
  }

  if (supportedLanguages.includes(base as Language)) {
    return base as Language;
  }

  return null;
};

export const getDeviceLanguage = (): Language => {
  const locale = getDeviceLocale();
  if (!locale) {
    return 'en';
  }

  return normalizeLanguage(locale) ?? 'en';
};

export const getLanguageLocale = (language: Language): string => {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    de: 'de-DE',
    fr: 'fr-FR',
    es: 'es-MX',
    pt: 'pt-BR',
    ar: 'ar-SA',
    ru: 'ru-RU',
    it: 'it-IT',
    nl: 'nl-NL',
    tr: 'tr-TR',
    th: 'th-TH',
    vi: 'vi-VN',
    id: 'id-ID',
    pl: 'pl-PL',
    uk: 'uk-UA',
    hi: 'hi-IN',
    he: 'he-IL',
    sv: 'sv-SE',
    no: 'nb-NO',
    da: 'da-DK',
    fi: 'fi-FI',
    cs: 'cs-CZ',
    hu: 'hu-HU',
    ro: 'ro-RO',
    el: 'el-GR',
    ms: 'ms-MY',
    fil: 'fil-PH',
  };

  return localeMap[language] || language;
};
