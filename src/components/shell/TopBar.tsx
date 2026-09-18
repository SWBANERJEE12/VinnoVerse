import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotionFx } from '../../lib/motion-context';
import { useSettings } from '../../lib/settings';
import { useThemeColors } from '../../lib/theme-context';
import { spacing } from '../../theme';

export function TopBar({ overlay }: { overlay?: boolean }) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { settings, updateSettings } = useSettings();
  const { startThemeReveal, themeReveal, startPageReveal, pageReveal } = useMotionFx();
  const profileRef = useRef<View>(null);
  const themeRef = useRef<View>(null);
  const [visualDark, setVisualDark] = useState(c.isDark);

  const sunX = useSharedValue(c.isDark ? -22 : 0);
  const sunY = useSharedValue(c.isDark ? -22 : 0);
  const sunOpacity = useSharedValue(c.isDark ? 0 : 1);
  const moonX = useSharedValue(c.isDark ? 0 : 22);
  const moonY = useSharedValue(c.isDark ? 0 : 22);
  const moonOpacity = useSharedValue(c.isDark ? 1 : 0);

  const animateIcons = (dark: boolean) => {
    const ease = Easing.bezier(0.22, 1, 0.36, 1);
    const cfg = { duration: 820, easing: ease };
    sunX.value = withTiming(dark ? -22 : 0, cfg);
    sunY.value = withTiming(dark ? -22 : 0, cfg);
    sunOpacity.value = withTiming(dark ? 0 : 1, cfg);
    moonX.value = withTiming(dark ? 0 : 22, cfg);
    moonY.value = withTiming(dark ? 0 : 22, cfg);
    moonOpacity.value = withTiming(dark ? 1 : 0, cfg);
  };

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sunX.value }, { translateY: sunY.value }, { scale: sunOpacity.value * 0.55 + 0.45 }],
    opacity: sunOpacity.value,
  }));
  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: moonX.value }, { translateY: moonY.value }, { scale: moonOpacity.value * 0.55 + 0.45 }],
    opacity: moonOpacity.value,
  }));

  const toggleTheme = () => {
    if (themeReveal || pageReveal) return;
    const node = themeRef.current;
    const isDark = c.isDark;
    const next = isDark ? 'light' : 'dark';
    const apply = () => {
      updateSettings({ theme: next });
      setVisualDark(next === 'dark');
      animateIcons(next === 'dark');
    };
    if (node?.measureInWindow) {
      node.measureInWindow((x, y, w, h) => {
        startThemeReveal(next, x + w / 2, y + h / 2);
        apply();
      });
    } else apply();
  };

  const openProfile = () => {
    if (pageReveal) return;
    const node = profileRef.current as unknown as { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void };
    if (node?.measureInWindow) {
      node.measureInWindow((x, y, w, h) => {
        startPageReveal('Profile', x + w / 2, y + h / 2);
        const parent = navigation.getParent();
        if (parent) parent.navigate('Profile' as never);
      });
    } else {
      const parent = navigation.getParent();
      if (parent) parent.navigate('Profile' as never);
    }
  };

  const wrapStyle = [
    styles.wrap,
    { paddingTop: insets.top + 10 },
    overlay ? styles.overlay : null,
  ];

  const ThemeBtn = (
    <Pressable ref={themeRef as never} onPress={toggleTheme} style={styles.themeBtn}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={60} tint={c.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={[styles.themeInner, { borderColor: c.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)' }]}>
        <Animated.View style={[styles.iconAbs, sunStyle]}>
          <Ionicons name="sunny" size={20} color={c.brand} />
        </Animated.View>
        <Animated.View style={[styles.iconAbs, moonStyle]}>
          <Ionicons name="moon" size={20} color={c.brandSoft} />
        </Animated.View>
      </View>
    </Pressable>
  );

  return (
    <View style={wrapStyle}>
      <View>
        <Text style={[styles.brand, { color: c.brand }]}>VinnoVerse</Text>
        <Text style={[styles.sub, { color: c.muted }]}>VIT Vellore</Text>
      </View>
      <View style={styles.actions}>
        {ThemeBtn}
        <Pressable ref={profileRef as never} onPress={openProfile} style={[styles.profileBtn, { backgroundColor: c.dockAccent }]}>
          <Ionicons name="person" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 20,
  },
  brand: { fontSize: 11, fontWeight: '700', letterSpacing: 2.8, textTransform: 'uppercase' },
  sub: { fontSize: 14, fontWeight: '500', marginTop: 1 },
  actions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  themeBtn: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  themeInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  iconAbs: { position: 'absolute' },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
