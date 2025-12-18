'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations, TranslationKey } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'vi',
      setLanguage: (lang: Language) => set({ language: lang }),
      t: (key: TranslationKey) => {
        const lang = get().language;
        return translations[lang][key] || translations.vi[key] || key;
      },
    }),
    {
      name: 'language-storage',
    }
  )
);
