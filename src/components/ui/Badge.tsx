import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../../lib/theme-context';
import { radius } from '../../theme';

export function Badge({ label, tone = 'brand' }: { label: string; tone?: 'brand' | 'amber' | 'muted' }) {
  const c = useThemeColors();
  const bg =
    tone === 'amber'
      ? c.isDark
        ? 'rgba(245,158,11,0.2)'
        : '#FEF3C7'
      : tone === 'muted'
        ? c.line
        : c.brandSubtle;
  const fg =
    tone === 'amber'
      ? c.isDark
        ? '#FDE68A'
        : '#92400E'
      : tone === 'muted'
        ? c.muted
        : c.brandSubtleFg;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
});
