import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useMotionFx } from '../../lib/motion-context';
import { getThemeColors } from '../../theme';
import { useSettings } from '../../lib/settings';

const START = 12;

export function ThemeReveal() {
  const { themeReveal, clearThemeReveal, reduceMotion } = useMotionFx();
  const { settings } = useSettings();
  const scale = useSharedValue(0);

  const { width, height } = Dimensions.get('window');
  const cover =
    themeReveal
      ? Math.hypot(
          Math.max(themeReveal.x, width - themeReveal.x),
          Math.max(themeReveal.y, height - themeReveal.y),
        ) + 72
      : 0;
  const targetScale = (cover * 2) / START;

  useEffect(() => {
    if (!themeReveal) {
      scale.value = 0;
      return;
    }
    if (reduceMotion) {
      clearThemeReveal();
      return;
    }
    scale.value = withTiming(
      targetScale,
      { duration: 820, easing: Easing.bezier(0, 0, 0.2, 1) },
      (done) => {
        if (done) runOnJS(clearThemeReveal)();
      },
    );
  }, [themeReveal, reduceMotion, targetScale, clearThemeReveal, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!themeReveal) return null;

  const nextTheme = themeReveal.next === 'dark' ? 'dark' : 'light';
  const bg = getThemeColors(nextTheme, settings.accent).bg;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          left: themeReveal.x,
          top: themeReveal.y,
          backgroundColor: bg,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: START,
    height: START,
    borderRadius: START / 2,
    marginLeft: -START / 2,
    marginTop: -START / 2,
    zIndex: 0,
  },
});
