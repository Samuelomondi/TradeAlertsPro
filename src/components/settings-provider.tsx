
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type AppSettings = {
  geminiApiKey: string | null;
  twelveDataApiKey: string | null;
  telegramChatId: string | null;
};

type SettingsContextType = {
  settings: AppSettings;
  setSettings: (newSettings: AppSettings) => void;
  loaded: boolean;
};

const SETTINGS_STORAGE_KEY = 'tradeAlertSettings';

const defaultSettings: AppSettings = {
  geminiApiKey: null,
  twelveDataApiKey: null,
  telegramChatId: null,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  setSettings: () => {},
  loaded: false,
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        setSettingsState(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const setSettings = useCallback((newSettings: AppSettings) => {
    try {
      const settingsToSave = { ...settings, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
      setSettingsState(settingsToSave);
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, [settings]);

  const value = { settings, setSettings, loaded };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
