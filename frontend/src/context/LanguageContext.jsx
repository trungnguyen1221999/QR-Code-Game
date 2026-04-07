import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../translations/index.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('language') || 'FI'
  );

  // Persist language in localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const value = useMemo(() => {
    return {
      language,
      setLanguage,
      t: translations[language] || translations.FI,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}