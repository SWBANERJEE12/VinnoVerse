import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TimetableStrip } from '../components/home/TimetableStrip';
import { GlassCard } from '../components/shell/GlassCard';
import { PageShell } from '../components/shell/PageShell';
import { SectionTitle } from '../components/shell/SectionTitle';
import { Badge } from '../components/ui/Badge';
import { formatDateTime } from '../lib/dates';
import {
  getActiveComplaint,
  getFocalClassIndex,
  getMessServingState,
  timetableToClasses,
} from '../lib/schedule';
import { useSettings } from '../lib/settings';
import { messMenu, timetable, useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import { spacing } from '../theme';

export function HomeScreen() {
  const c = useThemeColors();
  const { user, requests } = useApp();
  const { settings } = useSettings();
  const compact = settings.compactHomeCards;
  const [classes, setClasses] = useState(() => timetableToClasses(timetable, user?.id));
  const [messState, setMessState] = useState(() => getMessServingState(messMenu));
  const focalIndex = getFocalClassIndex(classes);
  const complaint = getActiveComplaint(requests, user?.id);

  useEffect(() => {
    const tick = () => {
      setClasses(timetableToClasses(timetable, user?.id));
      setMessState(getMessServingState(messMenu));
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [user?.id]);

  return (
    <PageShell contentStyle={{ gap: compact ? 14 : 20 }}>
      <GlassCard compact={compact}>
        <Text style={[styles.kicker, { color: c.brand }]}>Student</Text>
        <Text style={[styles.name, { color: c.ink, fontSize: compact ? 20 : 24 }]}>{user?.name}</Text>
        <Text style={[styles.meta, { color: c.muted }]}>{user?.reg_no}</Text>
      </GlassCard>

      <View>
        <SectionTitle>Timetable</SectionTitle>
        {classes.length === 0 ? (
          <GlassCard>
            <Text style={{ color: c.muted }}>No classes scheduled for today.</Text>
          </GlassCard>
        ) : (
          <TimetableStrip classes={classes} focalIndex={focalIndex} />
        )}
      </View>

      <View>
        <SectionTitle>Mess</SectionTitle>
        <GlassCard compact={compact}>
          {messState.kind === 'serving' ? (
            <>
              <Text style={[styles.kicker, { color: c.brand }]}>Now serving</Text>
              <Text style={[styles.blockTitle, { color: c.ink }]}>{messState.mealName}</Text>
              {messState.items.map((item) => (
                <Text key={item} style={[styles.listItem, { color: c.muted }]}>{item}</Text>
              ))}
            </>
          ) : (
            <>
              <Text style={[styles.kicker, { color: c.muted }]}>
                {messState.tomorrow ? 'Tomorrow' : 'Up next'}
              </Text>
              <Text style={[styles.blockTitle, { color: c.ink }]}>
                {messState.tomorrow ? 'Next: ' : ''}
                {messState.mealName} at {messState.startLabel}
              </Text>
              {messState.items.map((item) => (
                <Text key={item} style={[styles.listItem, { color: c.muted }]}>{item}</Text>
              ))}
            </>
          )}
        </GlassCard>
      </View>

      {settings.showComplaintOnHome ? (
        <View>
          <SectionTitle>Complaint status</SectionTitle>
          {complaint ? (
            <GlassCard compact={compact}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.blockTitle, { color: c.ink }]}>{complaint.category}</Text>
                  <Text style={[styles.meta, { color: c.muted }]} numberOfLines={2}>
                    {complaint.description}
                  </Text>
                  <Text style={[styles.meta, { color: c.muted, marginTop: 4 }]}>
                    Submitted {formatDateTime(complaint.created_at)}
                  </Text>
                </View>
                <Badge
                  label={complaint.status}
                  tone={complaint.status === 'In Progress' ? 'amber' : 'brand'}
                />
              </View>
            </GlassCard>
          ) : (
            <Text style={{ color: c.muted, fontSize: 14 }}>No open complaints</Text>
          )}
        </View>
      ) : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  name: { marginTop: 4, fontWeight: '700' },
  meta: { marginTop: 4, fontSize: 14 },
  blockTitle: { marginTop: 4, fontSize: 17, fontWeight: '700' },
  listItem: { marginTop: 4, fontSize: 14 },
  rowBetween: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
});
