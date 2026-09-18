import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'vinnoverse.settings';

export type AccentColor = 'auto' | 'sky' | 'violet';
export type ThemeMode = 'light' | 'dark' | 'system';

export type AppSettings = {
  reduceMotion: boolean;
  dockLabels: boolean;
  accent: AccentColor;
  compactHomeCards: boolean;
  showComplaintOnHome: boolean;
  theme: ThemeMode;
};

const defaults: AppSettings = {
  reduceMotion: false,
  dockLabels: true,
  accent: 'auto',
  compactHomeCards: false,
  showComplaintOnHome: true,
  theme: 'system',
};

type SettingsContextValue = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  ready: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) });
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => undefined);
  }, [settings, ready]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, updateSettings, ready }), [settings, updateSettings, ready]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
