import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../lib/theme-context';
import { spacing } from '../theme';

export function Screen({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const c = useThemeColors();
  const navigation = useNavigation();
  const state = navigation.getState();
  const canGoBack = state?.type === 'stack' && navigation.canGoBack();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]} edges={['top']}>
      {title ? (
        <View style={styles.header}>
          {canGoBack ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={c.ink} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: c.ink }]}>{title}</Text>
            {subtitle ? <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text> : null}
          </View>
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
}

export function LoadingScreen() {
  const c = useThemeColors();
  return (
    <View style={[styles.loading, { backgroundColor: c.bg }]}>
      <ActivityIndicator color={c.brandStrong} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  back: {
    marginTop: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
