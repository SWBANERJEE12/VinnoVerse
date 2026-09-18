import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useThemeColors } from '../lib/theme-context';
import { colors, radius, shadow, spacing } from '../theme';

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && { opacity: 0.92 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: c.brandStrong },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.88 },
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={22} color={colors.teal} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Completed'
      ? { bg: colors.doneSoft, fg: colors.done }
      : status === 'In Progress'
        ? { bg: colors.progressSoft, fg: colors.progress }
        : status === 'Accepted' || status === 'Submitted'
          ? { bg: colors.acceptedSoft, fg: colors.accepted }
          : { bg: colors.tealSoft, fg: colors.teal };
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{status}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  },
  primary: {
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  ghost: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.teal,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  emptyBody: {
    marginTop: 6,
    textAlign: 'center',
    color: colors.muted,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
});
