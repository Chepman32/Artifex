// Localization system for Stikaro

import { Language, Translations } from './translations';
import { en } from './languages/en';
import { zh } from './languages/zh';
import { ja } from './languages/ja';
import { ko } from './languages/ko';
import { de } from './languages/de';
import { fr } from './languages/fr';
import { es } from './languages/es';
import { pt } from './languages/pt';
import { ar } from './languages/ar';
import { ru } from './languages/ru';
import { it } from './languages/it';
import { nl } from './languages/nl';
import { tr } from './languages/tr';
import { th } from './languages/th';
import { vi } from './languages/vi';
import { id } from './languages/id';
import { pl } from './languages/pl';
import { uk } from './languages/uk';
import { hi } from './languages/hi';
import { he } from './languages/he';
import { sv } from './languages/sv';
import { no } from './languages/no';
import { da } from './languages/da';
import { fi } from './languages/fi';
import { cs } from './languages/cs';
import { hu } from './languages/hu';
import { ro } from './languages/ro';
import { el } from './languages/el';
import { ms } from './languages/ms';
import { fil } from './languages/fil';

export const translations: Record<Language, Translations> = {
  en,
  zh,
  ja,
  ko,
  de,
  fr,
  es,
  pt,
  ar,
  ru,
  it,
  nl,
  tr,
  th,
  vi,
  id,
  pl,
  uk,
  hi,
  he,
  sv,
  no,
  da,
  fi,
  cs,
  hu,
  ro,
  el,
  ms,
  fil,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  zh: '中文 (简体)',
  ja: '日本語',
  ko: '한국어',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español (México)',
  pt: 'Português (Brasil)',
  ar: 'العربية',
  ru: 'Русский',
  it: 'Italiano',
  nl: 'Nederlands',
  tr: 'Türkçe',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  pl: 'Polski',
  uk: 'Українська',
  hi: 'हिन्दी',
  he: 'עברית',
  sv: 'Svenska',
  no: 'Norsk',
  da: 'Dansk',
  fi: 'Suomi',
  cs: 'Čeština',
  hu: 'Magyar',
  ro: 'Română',
  el: 'Ελληνικά',
  ms: 'Bahasa Melayu',
  fil: 'Filipino',
};

export type { Language, Translations };
