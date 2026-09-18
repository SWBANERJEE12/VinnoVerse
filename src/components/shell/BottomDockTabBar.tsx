import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotionFx } from '../../lib/motion-context';
import { useSettings } from '../../lib/settings';
import { useThemeColors } from '../../lib/theme-context';
import { GlassSurface } from './GlassSurface';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Academics: 'book-outline',
  VMaps: 'map-outline',
  Services: 'construct-outline',
  Mess: 'restaurant-outline',
  Incoming: 'file-tray-outline',
};

export function BottomDockTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { startPageReveal, pageReveal, dockThemePopKey, reduceMotion, setActiveRoute } = useMotionFx();
  const tabRefs = useRef<Record<string, View | null>>({});

  const dockScale = useSharedValue(1);
  const dockY = useSharedValue(0);

  useEffect(() => {
    if (!dockThemePopKey || reduceMotion) return;
    dockScale.value = withTiming(1.12, { duration: 280, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    dockY.value = withTiming(-14, { duration: 280, easing: Easing.bezier(0.16, 1, 0.3, 1) });
    setTimeout(() => {
      dockScale.value = withSpring(1, { stiffness: 420, damping: 34, mass: 0.82 });
      dockY.value = withSpring(0, { stiffness: 420, damping: 34, mass: 0.82 });
    }, 280);
  }, [dockThemePopKey, reduceMotion, dockScale, dockY]);

  const dockAnim = useAnimatedStyle(() => ({
    transform: [{ scale: dockScale.value }, { translateY: dockY.value }],
  }));

  const onTabPress = (routeName: string, index: number, isFocused: boolean) => {
    if (isFocused || pageReveal) return;
    const node = tabRefs.current[routeName];
    if (!node) {
      navigation.navigate(routeName);
      setActiveRoute(routeName);
      return;
    }
    node.measureInWindow((x, y, w, h) => {
      const cx = x + w / 2;
      const cy = y + h / 2;
      startPageReveal(routeName, cx, cy);
      navigation.navigate(routeName);
      setActiveRoute(routeName);
    });
  };

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
      <Animated.View style={[styles.dockAnimWrap, dockAnim]}>
        <GlassSurface style={styles.dock} borderRadius={28} intensity={85}>
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label = options.title ?? route.name;
              const isFocused = state.index === index;
              const icon = TAB_ICONS[route.name] ?? 'ellipse-outline';

              return (
                <Pressable
                  key={route.key}
                  ref={(r) => {
                    tabRefs.current[route.name] = r as unknown as View;
                  }}
                  onPress={() => onTabPress(route.name, index, isFocused)}
                  style={[styles.tab, !settings.dockLabels && styles.tabCompact]}
                >
                  {isFocused ? (
                    <Animated.View
                      style={[
                        styles.activePill,
                        {
                          backgroundColor: c.dockAccent,
                          shadowColor: c.dockAccent,
                        },
                      ]}
                    />
                  ) : null}
                  <View style={styles.tabInner}>
                    <Ionicons name={icon} size={isFocused ? 24 : 20} color={isFocused ? '#fff' : c.muted} />
                    {settings.dockLabels ? (
                      <Text style={[styles.label, { color: isFocused ? '#fff' : c.muted }]}>{label}</Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </GlassSurface>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 250,
  },
  dockAnimWrap: { transformOrigin: '50% 100%' as unknown as string },
  dock: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tab: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabCompact: { minWidth: 52, paddingVertical: 10 },
  activePill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  tabInner: { alignItems: 'center', gap: 4, zIndex: 1 },
  label: { fontSize: 10, fontWeight: '700' },
});
