import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { getThemeColors, type ThemeColors } from '../theme';
import { useSettings } from './settings';

const ThemeContext = createContext<ThemeColors | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [scheme, setScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    if (settings.theme !== 'system') return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => setScheme(colorScheme));
    return () => sub.remove();
  }, [settings.theme]);

  const colors = useMemo(
    () => getThemeColors(settings.theme, settings.accent),
    [settings.accent, settings.theme, scheme],
  );

  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useThemeColors() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeColors must be used within ThemeProvider');
  return ctx;
}
