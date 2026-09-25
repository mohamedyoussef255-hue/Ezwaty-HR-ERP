/**
 * Language Context for Arabic & English Bilingual Support
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translations, TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ar'); // Default to Arabic as requested by user

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ezwaty_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    const saved = localStorage.getItem('ezwaty_lang') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (isRtl) {
      document.body.classList.add('font-[\'Cairo\',sans-serif]');
      document.body.classList.remove('font-[\'Plus_Jakarta_Sans\',sans-serif]');
    } else {
      document.body.classList.add('font-[\'Plus_Jakarta_Sans\',sans-serif]');
      document.body.classList.remove('font-[\'Cairo\',sans-serif]');
    }
  }, [language, isRtl]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: TRANSLATIONS[language],
    isRtl,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
