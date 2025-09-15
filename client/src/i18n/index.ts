import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation files
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';
import paTranslations from './locales/pa.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
  pa: {
    translation: paTranslations,
  },
};

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('swatch-janta-language') || 'en';
const supportedLanguages = ['en', 'hi', 'pa'];
const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'en';

// Set the HTML lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: false, // Disable suspense mode to avoid loading issues
    },
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
  // Save language preference to localStorage
  localStorage.setItem('swatch-janta-language', lng);
});

export default i18n;