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
import { useThemeColors } from '../../lib/theme-context';

const START = 8;

export function PageRevealOverlay({ onNavigate: _onNavigate }: { onNavigate?: (route: string) => void }) {
  const c = useThemeColors();
  const { pageReveal, finishPageReveal, reduceMotion } = useMotionFx();
  const scale = useSharedValue(0);

  const { width, height } = Dimensions.get('window');
  const maxScale =
    pageReveal
      ? (Math.hypot(Math.max(pageReveal.x, width - pageReveal.x), Math.max(pageReveal.y, height - pageReveal.y)) +
          80) /
          (START / 2)
      : 1;

  useEffect(() => {
    if (!pageReveal) {
      scale.value = 0;
      return;
    }
    if (reduceMotion) {
      finishPageReveal();
      return;
    }
    scale.value = withTiming(
      maxScale,
      { duration: 860, easing: Easing.bezier(0.22, 1, 0.36, 1) },
      (done) => {
        if (done) runOnJS(finishPageReveal)();
      },
    );
  }, [pageReveal, reduceMotion, maxScale, finishPageReveal, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!pageReveal) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        { left: pageReveal.x, top: pageReveal.y, backgroundColor: c.bg },
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
    zIndex: 100,
  },
});
