import { Appearance, Platform } from 'react-native';
import type { AccentColor, ThemeMode } from './lib/settings';

export type ThemeColors = {
  bg: string;
  paper: string;
  ink: string;
  muted: string;
  line: string;
  brand: string;
  brandMuted: string;
  brandSubtle: string;
  brandSubtleFg: string;
  brandEmphasis: string;
  brandSoft: string;
  brandStrong: string;
  dockAccent: string;
  danger: string;
  accepted: string;
  acceptedSoft: string;
  progress: string;
  progressSoft: string;
  done: string;
  doneSoft: string;
  overlay: string;
  blobPrimary: string;
  blobSecondary: string;
  isDark: boolean;
};

const skyLight: Omit<ThemeColors, 'isDark'> = {
  bg: '#F8FAFC',
  paper: '#FFFFFF',
  ink: '#0F172A',
  muted: '#64748B',
  line: '#E2E8F0',
  brand: '#0284C7',
  brandMuted: '#E0F2FE',
  brandSubtle: '#F0F9FF',
  brandSubtleFg: '#0369A1',
  brandEmphasis: '#0369A1',
  brandSoft: '#7DD3FC',
  brandStrong: '#0EA5E9',
  dockAccent: '#38BDF8',
  danger: '#DC2626',
  accepted: '#2563EB',
  acceptedSoft: '#DBEAFE',
  progress: '#D97706',
  progressSoft: '#FEF3C7',
  done: '#15803D',
  doneSoft: '#DCFCE7',
  overlay: 'rgba(15,23,42,0.45)',
  blobPrimary: 'rgba(56,189,248,0.22)',
  blobSecondary: 'rgba(186,230,253,0.35)',
};

const skyDark: Omit<ThemeColors, 'isDark'> = {
  bg: '#0F172A',
  paper: '#1E293B',
  ink: '#F8FAFC',
  muted: '#94A3B8',
  line: 'rgba(255,255,255,0.1)',
  brand: '#7DD3FC',
  brandMuted: '#1E3A5F',
  brandSubtle: 'rgba(30,58,95,0.5)',
  brandSubtleFg: '#BAE6FD',
  brandEmphasis: '#7DD3FC',
  brandSoft: '#BAE6FD',
  brandStrong: '#38BDF8',
  dockAccent: '#38BDF8',
  danger: '#F87171',
  accepted: '#60A5FA',
  acceptedSoft: 'rgba(37,99,235,0.2)',
  progress: '#FBBF24',
  progressSoft: 'rgba(217,119,6,0.2)',
  done: '#4ADE80',
  doneSoft: 'rgba(21,128,61,0.2)',
  overlay: 'rgba(0,0,0,0.55)',
  blobPrimary: 'rgba(56,189,248,0.18)',
  blobSecondary: 'rgba(14,165,233,0.12)',
};

const violetLight: Omit<ThemeColors, 'isDark'> = {
  ...skyLight,
  brand: '#7C3AED',
  brandMuted: '#EDE9FE',
  brandSubtle: '#F5F3FF',
  brandSubtleFg: '#5B21B6',
  brandEmphasis: '#6D28D9',
  brandSoft: '#C4B5FD',
  brandStrong: '#8B5CF6',
  dockAccent: '#A78BFA',
  blobPrimary: 'rgba(167,139,250,0.25)',
  blobSecondary: 'rgba(196,181,253,0.3)',
};

const violetDark: Omit<ThemeColors, 'isDark'> = {
  ...skyDark,
  brand: '#C4B5FD',
  brandMuted: '#312E81',
  brandSubtle: 'rgba(49,46,129,0.45)',
  brandSubtleFg: '#DDD6FE',
  brandEmphasis: '#C4B5FD',
  brandSoft: '#DDD6FE',
  brandStrong: '#8B5CF6',
  dockAccent: '#A78BFA',
  blobPrimary: 'rgba(139,92,246,0.22)',
  blobSecondary: 'rgba(167,139,250,0.15)',
};

function resolveDark(theme: ThemeMode) {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return Appearance.getColorScheme() === 'dark';
}

function resolveAccent(accent: AccentColor, isDark: boolean): AccentColor {
  if (accent === 'auto') return isDark ? 'violet' : 'sky';
  return accent;
}

export function getThemeColors(theme: ThemeMode, accent: AccentColor): ThemeColors {
  const isDark = resolveDark(theme);
  const resolved = resolveAccent(accent, isDark);
  const palette =
    resolved === 'violet' ? (isDark ? violetDark : violetLight) : isDark ? skyDark : skyLight;
  return { ...palette, isDark };
}

/** @deprecated Use useThemeColors() — kept for gradual migration */
export const colors = {
  bg: skyLight.bg,
  paper: skyLight.paper,
  ink: skyLight.ink,
  muted: skyLight.muted,
  line: skyLight.line,
  teal: skyLight.brandStrong,
  tealSoft: skyLight.brandSubtle,
  copper: '#B85C38',
  copperSoft: '#F7E7DF',
  gold: '#C4A574',
  accepted: skyLight.accepted,
  acceptedSoft: skyLight.acceptedSoft,
  progress: skyLight.progress,
  progressSoft: skyLight.progressSoft,
  done: skyLight.done,
  doneSoft: skyLight.doneSoft,
  danger: skyLight.danger,
  overlay: skyLight.overlay,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 32,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
};

export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(15,23,42,0.08)' },
    default: {
      shadowColor: '#0F172A',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  }),
};
