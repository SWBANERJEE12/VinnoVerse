import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/shell/GlassCard';
import { PageShell } from '../components/shell/PageShell';
import { formatDateLabel, isoDate } from '../lib/dates';
import { messMenu } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import type { Meal } from '../types';

const MEAL_ICONS: Record<Meal, keyof typeof Ionicons.glyphMap> = {
  Breakfast: 'sunny-outline',
  Lunch: 'cafe-outline',
  Snacks: 'nutrition-outline',
  Dinner: 'moon-outline',
};

const MEAL_TIMES: Record<Meal, string> = {
  Breakfast: '7:00 – 9:30 AM',
  Lunch: '12:00 – 2:30 PM',
  Snacks: '4:30 – 6:00 PM',
  Dinner: '7:00 – 9:30 PM',
};

const MEALS: Meal[] = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

export function MessScreen() {
  const c = useThemeColors();
  const today = isoDate();
  const rows = useMemo(() => messMenu.filter((m) => m.date === today), [today]);
  const label = formatDateLabel(today);

  return (
    <PageShell>
      <View>
        <Text style={[styles.title, { color: c.ink }]}>Mess</Text>
        <Text style={[styles.sub, { color: c.muted }]}>Campus mess · {label}</Text>
      </View>

      {MEALS.map((meal) => {
        const row = rows.find((r) => r.meal === meal);
        return (
          <GlassCard key={meal}>
            <View style={styles.mealHead}>
              <View style={[styles.iconWrap, { backgroundColor: c.brandSubtle }]}>
                <Ionicons name={MEAL_ICONS[meal]} size={20} color={c.brandSubtleFg} />
              </View>
              <View>
                <Text style={[styles.mealName, { color: c.ink }]}>{meal}</Text>
                <Text style={[styles.mealTime, { color: c.muted }]}>{MEAL_TIMES[meal]}</Text>
              </View>
            </View>
            {(row?.items ?? []).map((item) => (
              <Text key={item} style={[styles.item, { color: c.muted }]}>{item}</Text>
            ))}
          </GlassCard>
        );
      })}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  sub: { marginTop: 4, fontSize: 14 },
  mealHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealName: { fontSize: 16, fontWeight: '700' },
  mealTime: { fontSize: 12, marginTop: 2 },
  item: { fontSize: 14, marginTop: 6 },
});
