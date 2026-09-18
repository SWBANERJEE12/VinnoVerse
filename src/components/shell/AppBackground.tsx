import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../lib/theme-context';

export function AppBackground() {
  const c = useThemeColors();
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg }]} pointerEvents="none">
      <View style={[styles.blob, styles.blobLeft, { backgroundColor: c.blobPrimary }]} />
      <View style={[styles.blob, styles.blobRight, { backgroundColor: c.blobSecondary }]} />
      <BlurView intensity={40} tint={c.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    width: 208,
    height: 208,
    opacity: 0.95,
  },
  blobLeft: { top: 40, left: -64 },
  blobRight: { top: 160, right: -40, width: 192, height: 192 },
});
