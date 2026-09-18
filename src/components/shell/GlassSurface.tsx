import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors } from '../../lib/theme-context';

/** Liquid-glass panel matching the Next.js frontend dock / cards. */
export function GlassSurface({
  children,
  style,
  intensity = 72,
  borderRadius = 28,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
}) {
  const c = useThemeColors();

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.fallback,
          {
            borderRadius,
            backgroundColor: c.isDark ? 'rgba(23,23,23,0.9)' : 'rgba(255,255,255,0.85)',
            borderColor: c.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)',
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={c.isDark ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      />
      <LinearGradient
        colors={
          c.isDark
            ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.04)', 'rgba(0,0,0,0.08)']
            : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.55)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderWidth: 1,
            borderColor: c.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.55)',
          },
        ]}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  inner: { position: 'relative', zIndex: 2 },
  fallback: {
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
