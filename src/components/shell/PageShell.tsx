import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../lib/theme-context';
import { spacing } from '../../theme';
import { AppBackground } from './AppBackground';
import { ThemeReveal } from './ThemeReveal';
import { TopBar } from './TopBar';

export function PageShell({
  children,
  scroll = true,
  mapMode,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  mapMode?: boolean;
  contentStyle?: ScrollViewProps['contentContainerStyle'];
}) {
  const c = useThemeColors();

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ThemeReveal />
      {!mapMode ? <AppBackground /> : null}
      <SafeAreaView style={styles.safe} edges={mapMode ? [] : ['bottom']}>
        <TopBar overlay={mapMode} />
        {scroll ? (
          <ScrollView
            contentContainerStyle={[styles.content, mapMode && styles.mapContent, contentStyle]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.fill, mapMode && styles.mapContent]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  safe: { flex: 1, zIndex: 10 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 130,
    gap: 20,
  },
  mapContent: { paddingHorizontal: 0, paddingBottom: 0, flex: 1 },
  fill: { flex: 1 },
});
