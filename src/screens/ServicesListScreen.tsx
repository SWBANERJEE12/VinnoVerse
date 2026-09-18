import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassCard } from '../components/shell/GlassCard';
import { PageShell } from '../components/shell/PageShell';
import { EmptyState, PrimaryButton, StatusBadge } from '../components/ui';
import { formatDateTime } from '../lib/dates';
import { grievanceOptions } from '../lib/schedule';
import { useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import type { ServicesStackParamList } from '../navigation/types';
import { radius, spacing } from '../theme';

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServicesList'>;
type ServicesView = 'menu' | 'grievances' | 'cleaning' | 'list';

export function ServicesListScreen({ navigation }: Props) {
  const c = useThemeColors();
  const { user, requests, createRequest } = useApp();
  const isWarden = user?.role === 'warden' || user?.role === 'admin';

  const [view, setView] = useState<ServicesView>(isWarden ? 'list' : 'menu');
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<'Active' | 'All'>('Active');

  const mine = useMemo(
    () =>
      requests
        .filter((r) => (isWarden ? true : r.student_id === user?.id))
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
    [isWarden, requests, user?.id],
  );
  const shown = mine.filter((r) => (filter === 'All' ? true : r.status !== 'Completed'));

  const resetGrievance = () => {
    setView('menu');
    setSubmitted(false);
    setSelectedIssue(null);
    setOtherText('');
  };

  if (!isWarden && view === 'grievances') {
    return (
      <PageShell>
        <Pressable onPress={resetGrievance} style={styles.back}>
          <Ionicons name="chevron-back" size={18} color={c.brandEmphasis} />
          <Text style={{ color: c.brandEmphasis, fontWeight: '600' }}>Services</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]}>Grievances</Text>
        <Text style={{ color: c.muted, fontSize: 14 }}>Pick a common issue, or choose Other to type your own.</Text>

        {submitted ? (
          <GlassCard>
            <Text style={{ color: c.brandSubtleFg, fontWeight: '600' }}>
              Complaint sent. Hostel office will follow up shortly.
            </Text>
          </GlassCard>
        ) : (
          <>
            {grievanceOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSelectedIssue(option)}
                style={[
                  styles.option,
                  {
                    backgroundColor: selectedIssue === option ? c.brandStrong : c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)',
                    borderColor: c.line,
                  },
                ]}
              >
                <Text style={{ color: selectedIssue === option ? '#fff' : c.ink, fontWeight: '600' }}>
                  {option}
                </Text>
              </Pressable>
            ))}
            {selectedIssue === 'Other' ? (
              <TextInput
                value={otherText}
                onChangeText={setOtherText}
                placeholder="Type your problem here"
                placeholderTextColor={c.muted}
                multiline
                style={[styles.textarea, { borderColor: c.line, color: c.ink, backgroundColor: c.paper }]}
              />
            ) : null}
            <PrimaryButton
              label="Submit complaint"
              loading={busy}
              disabled={!selectedIssue || (selectedIssue === 'Other' && !otherText.trim())}
              onPress={async () => {
                setBusy(true);
                const description =
                  selectedIssue === 'Other' ? otherText.trim() : (selectedIssue ?? 'Complaint');
                await createRequest({
                  category: 'Other',
                  description,
                  location: user ? `${user.hostel}, ${user.room}` : 'Campus',
                });
                setBusy(false);
                setSubmitted(true);
              }}
            />
          </>
        )}
      </PageShell>
    );
  }

  if (!isWarden && view === 'cleaning') {
    return (
      <PageShell>
        <Pressable onPress={() => setView('menu')} style={styles.back}>
          <Ionicons name="chevron-back" size={18} color={c.brandEmphasis} />
          <Text style={{ color: c.brandEmphasis, fontWeight: '600' }}>Services</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]}>Room cleaning</Text>
        <PrimaryButton
          label="Call for room cleaning"
          loading={busy}
          onPress={async () => {
            setBusy(true);
            await createRequest({
              category: 'Room cleaning',
              description: 'Housekeeping requested for my room.',
              location: user ? `${user.hostel}, ${user.room}` : 'Campus',
            });
            setBusy(false);
            setSubmitted(true);
          }}
        />
        {submitted ? (
          <GlassCard>
            <Text style={{ color: c.ink, fontWeight: '600' }}>
              Request sent to housekeeping for {user?.hostel}, {user?.room}.
            </Text>
          </GlassCard>
        ) : null}
      </PageShell>
    );
  }

  if (!isWarden && view === 'menu') {
    return (
      <PageShell>
        <Text style={[styles.title, { color: c.ink }]}>Services</Text>
        <GlassCard onPress={() => setView('grievances')}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: c.brandSubtle }]}>
              <Ionicons name="warning-outline" size={22} color={c.brandSubtleFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: c.ink }]}>Grievances and complaints</Text>
              <Text style={{ color: c.muted, fontSize: 14 }}>Report hostel or campus issues</Text>
            </View>
          </View>
        </GlassCard>
        <GlassCard onPress={() => { setSubmitted(false); setView('cleaning'); }}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: c.brandSubtle }]}>
              <Ionicons name="sparkles-outline" size={22} color={c.brandSubtleFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: c.ink }]}>Call for room cleaning</Text>
              <Text style={{ color: c.muted, fontSize: 14 }}>Request housekeeping for your room</Text>
            </View>
          </View>
        </GlassCard>
        <GlassCard onPress={() => setView('list')}>
          <View style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: c.brandSubtle }]}>
              <Ionicons name="list-outline" size={22} color={c.brandSubtleFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuTitle, { color: c.ink }]}>My requests</Text>
              <Text style={{ color: c.muted, fontSize: 14 }}>Track status of your tickets</Text>
            </View>
          </View>
        </GlassCard>
      </PageShell>
    );
  }

  return (
    <PageShell scroll={false}>
      {!isWarden ? (
        <Pressable onPress={() => setView('menu')} style={styles.back}>
          <Ionicons name="chevron-back" size={18} color={c.brandEmphasis} />
          <Text style={{ color: c.brandEmphasis, fontWeight: '600' }}>Services</Text>
        </Pressable>
      ) : null}
      <Text style={[styles.title, { color: c.ink }]}>{isWarden ? 'Incoming' : 'My requests'}</Text>
      <View style={styles.filters}>
        {(['Active', 'All'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && { backgroundColor: c.brandStrong }]}
          >
            <Text style={{ color: filter === f ? '#fff' : c.ink, fontWeight: '700' }}>{f}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {shown.length === 0 ? (
          <EmptyState
            icon="file-tray-outline"
            title={filter === 'Active' ? 'No open requests' : 'No requests yet'}
            body="Submit a grievance or cleaning request from the Services menu."
          />
        ) : (
          shown.map((r) => (
            <GlassCard key={r.id} onPress={() => navigation.navigate('ServiceDetail', { id: r.id })}>
              <View style={styles.rowBetween}>
                <Text style={{ color: c.ink, fontWeight: '700' }}>{r.category}</Text>
                <StatusBadge status={r.status} />
              </View>
              <Text style={{ color: c.muted, marginTop: 6 }} numberOfLines={2}>{r.description}</Text>
              <Text style={{ color: c.muted, marginTop: 4, fontSize: 12 }}>
                {r.location} · {formatDateTime(r.created_at)}
              </Text>
            </GlassCard>
          ))
        )}
      </ScrollView>
      {!isWarden ? (
        <Pressable style={[styles.fab, { backgroundColor: c.brandStrong }]} onPress={() => navigation.navigate('ServiceNew')}>
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      ) : null}
    </PageShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 16, fontWeight: '700' },
  option: { borderRadius: radius.lg, borderWidth: 1, padding: 14, marginBottom: 8 },
  textarea: { minHeight: 100, borderRadius: radius.lg, borderWidth: 1, padding: 14, textAlignVertical: 'top', marginBottom: 8 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: 100,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
