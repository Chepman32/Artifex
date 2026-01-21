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
    clear: string;
    discard: string;
    loading: string;
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
    clearCacheAlertMessage: string;
    clearCacheSuccess: string;
    deleteAllProjects: string;
    deleteAllProjectsDesc: string;
    deleteAllProjectsAlertMessage: string;
    deleteAllProjectsSuccess: string;
    resetOnboarding: string;
    exportAllProjectsAlertMessage: string;
    rateAppAlertMessage: string;
    contactSupportAlertMessage: string;
    privacyPolicyAlertMessage: string;
    termsOfServiceAlertMessage: string;
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
  onboarding: {
    skip: string;
    panel1HeroTitle: string;
    panel1HeroWatermark: string;
    panel1Title: string;
    panel1Body: string;
    panel2GestureLabel: string;
    panel2SampleText: string;
    panel2Title: string;
    panel2Body: string;
    panel3Title: string;
    panel3Body: string;
    panel3FeatureAssets: string;
    panel3FeatureTools: string;
    panel3FeatureNoWatermarks: string;
    getStarted: string;
  };
  home: {
    emptyTitle: string;
    emptySubtitle: string;
    selectionTitle: string;
    deleteProjectsTitle: string;
    deleteProjectSingle: string;
    deleteProjectMultiple: string;
    timestampToday: string;
    timestampDayAgo: string;
    timestampDaysAgo: string;
  };
  imagePicker: {
    title: string;
    loadingSubtitle: string;
    photoAvailable: string;
    photosAvailable: string;
    loadingText: string;
  };
  editor: {
    backToGallery: string;
    export: string;
    saveChangesTitle: string;
    saveChangesMessage: string;
    noImageLoaded: string;
    paramsLabel: string;
  };
  filters: {
    title: string;
    intensity: string;
    apply: string;
    names: {
      none: string;
      bw: string;
      sepia: string;
      vintage: string;
      cool: string;
      warm: string;
      juno: string;
      gingham: string;
      clarendon: string;
      lark: string;
      ludwig: string;
      xproii: string;
      lofi: string;
      mayfair: string;
      sierra: string;
      tattoo: string;
      inkwell: string;
      rise: string;
      cinematic: string;
      film: string;
      hdr: string;
      portrait: string;
      landscape: string;
      neon: string;
      cyberpunk: string;
      retro: string;
    };
  };
  textToolbar: {
    fonts: {
      system: string;
      archivo: string;
      bitcount: string;
      firaSans: string;
      homemade: string;
    };
    colors: {
      white: string;
      black: string;
      red: string;
      orange: string;
      yellow: string;
      green: string;
      blue: string;
      purple: string;
      pink: string;
    };
    effects: {
      none: string;
      neon: string;
      glow: string;
      shadow: string;
      outline: string;
    };
    backgrounds: {
      none: string;
      black: string;
      white: string;
      gray: string;
      red: string;
      blue: string;
    };
  };
  textTool: {
    title: string;
    placeholder: string;
    fontLabel: string;
    sizeLabel: string;
    colorLabel: string;
    addToCanvas: string;
  };
  stickers: {
    title: string;
    emptyCategory: string;
    categories: {
      all: string;
      emoji: string;
      'social-media': string;
      'text-labels': string;
      seasonal: string;
      'brand-icons': string;
      food: string;
      miscellaneous: string;
    };
  };
  stamps: {
    title: string;
    emptyCategory: string;
    categories: {
      all: string;
      approval: string;
      labels: string;
      seals: string;
    };
  };
  watermark: {
    title: string;
    defaultText: string;
    textLabel: string;
    textPlaceholder: string;
    apply: string;
    backToPresets: string;
    globalAdjustments: string;
    opacity: string;
    size: string;
    rotation: string;
    confirmAdjustments: string;
    selectedPreset: string;
    markCount: string;
    densities: {
      dense: string;
      moderate: string;
      sparse: string;
    };
    presets: {
      'tile-pattern': { name: string; description: string };
      'corner-branding': { name: string; description: string };
      'diagonal-stripe': { name: string; description: string };
      'scattered-protection': { name: string; description: string };
      'minimal-single': { name: string; description: string };
      'border-guard': { name: string; description: string };
      'photographer-style': { name: string; description: string };
      'dense-grid': { name: string; description: string };
      'moderate-coverage': { name: string; description: string };
      'large-watermarks': { name: string; description: string };
      'small-watermarks': { name: string; description: string };
      'micro-watermarks': { name: string; description: string };
    };
  };
  layers: {
    title: string;
    emptyTitle: string;
    emptySubtitle: string;
    layerCountSingle: string;
    layerCountMultiple: string;
    elementTypes: {
      text: string;
      sticker: string;
      watermark: string;
      stamp: string;
      element: string;
    };
  };
}
