// Translations for Stikaro

export type Language =
  | 'en'     // English
  | 'zh'     // Chinese (Simplified)
  | 'ja'     // Japanese
  | 'ko'     // Korean
  | 'de'     // German
  | 'fr'     // French
  | 'es'     // Spanish (Mexican)
  | 'pt'     // Portuguese (Brazilian)
  | 'ar'     // Arabic
  | 'ru'     // Russian
  | 'it'     // Italian
  | 'nl'     // Dutch
  | 'tr'     // Turkish
  | 'th'     // Thai
  | 'vi'     // Vietnamese
  | 'id'     // Indonesian
  | 'pl'     // Polish
  | 'uk'     // Ukrainian
  | 'hi'     // Hindi
  | 'he'     // Hebrew
  | 'sv'     // Swedish
  | 'no'     // Norwegian
  | 'da'     // Danish
  | 'fi'     // Finnish
  | 'cs'     // Czech
  | 'hu'     // Hungarian
  | 'ro'     // Romanian
  | 'el'     // Greek
  | 'ms'     // Malay
  | 'fil';   // Filipino

export interface Translations {
  common: {
    cancel: string;
    save: string;
    delete: string;
    close: string;
    done: string;
    back: string;
    ok: string;
    error: string;
  };
  settings: {
    title: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSolar: string;
    themeMono: string;
    sound: string;
    soundOn: string;
    soundOff: string;
    haptics: string;
    hapticsOn: string;
    hapticsOff: string;
    language: string;
    account: string;
    preferences: string;
    appearance: string;
    about: string;
    dangerZone: string;
    restorePurchases: string;
    restorePurchasesDesc: string;
    exportAllProjects: string;
    exportAllProjectsDesc: string;
    defaultExportFormat: string;
    defaultExportQuality: string;
    autoSaveProjects: string;
    autoSaveProjectsDesc: string;
    hapticFeedback: string;
    hapticFeedbackDesc: string;
    version: string;
    rateApp: string;
    rateAppDesc: string;
    contactSupport: string;
    contactSupportDesc: string;
    privacyPolicy: string;
    privacyPolicyDesc: string;
    termsOfService: string;
    termsOfServiceDesc: string;
    clearCache: string;
    clearCacheDesc: string;
    deleteAllProjects: string;
    deleteAllProjectsDesc: string;
  };
  export: {
    saveToDevice: string;
    shareOnInstagram: string;
    shareOnX: string;
    savedToPhotos: string;
    savedToPhotosDesc: string;
    viewInGallery: string;
    noImageToExport: string;
    failedToExport: string;
    failedToSave: string;
    couldNotShareInstagram: string;
    couldNotShareX: string;
  };
}
