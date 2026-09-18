import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useThemeColors } from '../../lib/theme-context';

export function SectionTitle({ children }: { children: string }) {
  const c = useThemeColors();
  return <Text style={[styles.title, { color: c.muted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
});
