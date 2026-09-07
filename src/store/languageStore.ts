import { create } from 'zustand';
import { SupportedLanguage } from '../types/compliance';
import { TRANSLATIONS, Translations } from '../i18n/translations';

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof Translations) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'en',
  setLanguage: (lang: SupportedLanguage) => set({ language: lang }),
  t: (key: keyof Translations) => {
    const currentLang = get().language;
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || String(key);
  },
}));
