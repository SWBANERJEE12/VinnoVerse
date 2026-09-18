import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TimetableClass } from '../../lib/schedule';
import { useThemeColors } from '../../lib/theme-context';
import { radius, spacing } from '../../theme';

const statusLabels = { completed: 'Done', ongoing: 'Now', upcoming: 'Next' } as const;

export function TimetableStrip({ classes, focalIndex }: { classes: TimetableClass[]; focalIndex: number }) {
  const c = useThemeColors();
  const scrollRef = useRef<ScrollView>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    if (!scrollRef.current || classes.length === 0) return;
    const cardWidth = 300;
    const x = Math.max(0, focalIndex * (cardWidth + 12));
    scrollRef.current.scrollTo({ x, animated: scrolled.current });
    scrolled.current = true;
  }, [focalIndex, classes.length]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      decelerationRate="fast"
    >
      {classes.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            {
              backgroundColor: c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)',
              borderColor: item.status === 'ongoing' ? c.brandStrong : c.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderWidth: item.status === 'ongoing' ? 2 : 1,
            },
          ]}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.time, { color: c.brandEmphasis }]}>{item.time}</Text>
            <View
              style={[
                styles.badge,
                item.status === 'ongoing'
                  ? { backgroundColor: c.brandStrong }
                  : item.status === 'completed'
                    ? { backgroundColor: c.line }
                    : { backgroundColor: c.brandSubtle },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      item.status === 'ongoing'
                        ? '#fff'
                        : item.status === 'completed'
                          ? c.muted
                          : c.brandSubtleFg,
                  },
                ]}
              >
                {statusLabels[item.status]}
              </Text>
            </View>
          </View>
          <Text style={[styles.course, { color: c.ink }]}>{item.course}</Text>
          <Text style={[styles.room, { color: c.muted }]}>{item.room}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12, paddingHorizontal: spacing.md, paddingBottom: 4 },
  card: {
    width: 300,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  time: { fontSize: 14, fontWeight: '700' },
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  course: { marginTop: 12, fontSize: 16, fontWeight: '700' },
  room: { marginTop: 4, fontSize: 12 },
});
