import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSettings } from './settings';

export type PageRevealState = {
  routeName: string;
  x: number;
  y: number;
} | null;

export type ThemeRevealState = {
  next: 'light' | 'dark';
  x: number;
  y: number;
} | null;

type MotionContextValue = {
  activeRoute: string;
  pageReveal: PageRevealState;
  themeReveal: ThemeRevealState;
  dockThemePopKey: number;
  reduceMotion: boolean;
  startPageReveal: (routeName: string, x: number, y: number) => void;
  finishPageReveal: () => void;
  startThemeReveal: (next: 'light' | 'dark', x: number, y: number) => void;
  clearThemeReveal: () => void;
  setActiveRoute: (route: string) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [activeRoute, setActiveRoute] = useState('Home');
  const [pageReveal, setPageReveal] = useState<PageRevealState>(null);
  const [themeReveal, setThemeReveal] = useState<ThemeRevealState>(null);
  const [dockThemePopKey, setDockThemePopKey] = useState(0);

  const startPageReveal = useCallback((routeName: string, x: number, y: number) => {
    setActiveRoute(routeName);
    setPageReveal({ routeName, x, y });
  }, []);

  const finishPageReveal = useCallback(() => setPageReveal(null), []);

  const startThemeReveal = useCallback(
    (next: 'light' | 'dark', x: number, y: number) => {
      setThemeReveal({ next, x, y });
      if (!settings.reduceMotion) setDockThemePopKey((k) => k + 1);
    },
    [settings.reduceMotion],
  );

  const clearThemeReveal = useCallback(() => setThemeReveal(null), []);

  const value = useMemo(
    () => ({
      activeRoute,
      pageReveal,
      themeReveal,
      dockThemePopKey,
      reduceMotion: settings.reduceMotion,
      startPageReveal,
      finishPageReveal,
      startThemeReveal,
      clearThemeReveal,
      setActiveRoute,
    }),
    [
      activeRoute,
      pageReveal,
      themeReveal,
      dockThemePopKey,
      settings.reduceMotion,
      startPageReveal,
      finishPageReveal,
      startThemeReveal,
      clearThemeReveal,
    ],
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionFx() {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotionFx must be used within MotionProvider');
  return ctx;
}
