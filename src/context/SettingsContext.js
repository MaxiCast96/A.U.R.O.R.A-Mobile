import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

const STORAGE_KEY = 'app_settings_v1';

export const SettingsProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' | 'dark' | 'system'
  const [language, setLanguage] = useState('es'); // 'es' | 'en'
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'SVC' | 'EUR'
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.theme) setTheme(saved.theme);
          if (saved.language) setLanguage(saved.language);
          if (typeof saved.notifications === 'boolean') setNotifications(saved.notifications);
          if (saved.currency) setCurrency(saved.currency);
          if (saved.dateFormat) setDateFormat(saved.dateFormat);
        }
      } finally { setLoading(false); }
    })();
  }, []);

  // Track system color scheme if theme === 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'light');
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme || 'light'));
    return () => { sub && sub.remove && sub.remove(); };
  }, []);

  useEffect(() => {
    if (loading) return;
    const toSave = { theme, language, notifications, currency, dateFormat };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [theme, language, notifications, currency, dateFormat, loading]);

  const resolvedTheme = theme === 'system' ? (systemScheme || 'light') : theme;

  const value = useMemo(() => ({
    loading,
    theme, setTheme,
    resolvedTheme,
    language, setLanguage,
    notifications, setNotifications,
    currency, setCurrency,
    dateFormat, setDateFormat,
  }), [loading, theme, resolvedTheme, language, notifications, currency, dateFormat]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
