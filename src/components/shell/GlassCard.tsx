import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors } from '../../lib/theme-context';
import { radius, shadow } from '../../theme';

/** Card matching `bg-white/80 shadow-sm ring-1 ring-black/5` from the web frontend. */
export function GlassCard({
  children,
  style,
  onPress,
  compact,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  compact?: boolean;
}) {
  const c = useThemeColors();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: c.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
      borderColor: c.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      padding: compact ? 12 : 16,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.card,
  },
});
