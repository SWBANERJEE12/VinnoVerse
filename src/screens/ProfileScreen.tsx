import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../components/shell/GlassCard';
import { PageShell } from '../components/shell/PageShell';
import { SectionTitle } from '../components/shell/SectionTitle';
import { GhostButton } from '../components/ui';
import type { AccentColor, ThemeMode } from '../lib/settings';
import { useSettings } from '../lib/settings';
import { useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import { radius, spacing } from '../theme';

function DetailRow({ label, value }: { label: string; value: string }) {
  const c = useThemeColors();
  return (
    <View style={[styles.detail, { backgroundColor: c.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
      <Text style={{ color: c.muted }}>{label}</Text>
      <Text style={{ color: c.ink, fontWeight: '600', maxWidth: '58%', textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const c = useThemeColors();
  return (
    <Pressable onPress={() => onChange(!checked)} style={[styles.toggle, { borderColor: c.line, backgroundColor: c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.82)' }]}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.ink, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{description}</Text>
      </View>
      <View style={[styles.switch, { backgroundColor: checked ? c.dockAccent : c.line }]}>
        <View style={[styles.knob, checked && styles.knobOn]} />
      </View>
    </Pressable>
  );
}

export function ProfileScreen() {
  const c = useThemeColors();
  const navigation = useNavigation();
  const { user, users, loginAs, logout, usingSupabase } = useApp();
  const { settings, updateSettings } = useSettings();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  const themeOptions: { id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
    { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  const accentOptions: { id: AccentColor; label: string; color: string }[] = [
    { id: 'auto', label: 'Auto', color: c.brandStrong },
    { id: 'sky', label: 'Sky', color: '#38BDF8' },
    { id: 'violet', label: 'Violet', color: '#A78BFA' },
  ];

  return (
    <PageShell>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={20} color={c.ink} />
      </Pressable>

      <GlassCard>
        <View style={styles.hero}>
          <View style={[styles.avatar, { backgroundColor: c.brandMuted }]}>
            <Text style={{ color: c.brand, fontSize: 20, fontWeight: '700' }}>{initials}</Text>
          </View>
          <View>
            <Text style={[styles.name, { color: c.ink }]}>{user.name}</Text>
            <Text style={{ color: c.muted }}>{user.reg_no}</Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 4, textTransform: 'capitalize' }}>
              {user.role} · {user.hostel}
            </Text>
          </View>
        </View>
      </GlassCard>

      <View>
        <SectionTitle>Student details</SectionTitle>
        <DetailRow label="Hostel" value={user.hostel} />
        <DetailRow label="Room" value={user.room} />
        <DetailRow label="Role" value={user.role} />
      </View>

      <View>
        <SectionTitle>Settings</SectionTitle>
        <GlassCard>
          <Text style={{ color: c.ink, fontWeight: '600', marginBottom: 10 }}>Theme</Text>
          <View style={styles.row}>
            {themeOptions.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => updateSettings({ theme: opt.id })}
                style={[
                  styles.themeBtn,
                  settings.theme === opt.id
                    ? { backgroundColor: c.dockAccent }
                    : { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <Ionicons name={opt.icon} size={16} color={settings.theme === opt.id ? '#fff' : c.muted} />
                <Text style={{ color: settings.theme === opt.id ? '#fff' : c.muted, fontSize: 11, fontWeight: '700' }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <SettingToggle
          label="Reduce motion"
          description="Shorter transitions in the app."
          checked={settings.reduceMotion}
          onChange={(next) => updateSettings({ reduceMotion: next })}
        />
        <SettingToggle
          label="Dock labels"
          description="Show text under navigation icons."
          checked={settings.dockLabels}
          onChange={(next) => updateSettings({ dockLabels: next })}
        />
        <SettingToggle
          label="Compact home cards"
          description="Tighter spacing on Home."
          checked={settings.compactHomeCards}
          onChange={(next) => updateSettings({ compactHomeCards: next })}
        />
        <SettingToggle
          label="Complaint on Home"
          description="Show latest complaint status on Home."
          checked={settings.showComplaintOnHome}
          onChange={(next) => updateSettings({ showComplaintOnHome: next })}
        />

        <GlassCard>
          <Text style={{ color: c.ink, fontWeight: '600', marginBottom: 10 }}>Accent color</Text>
          <View style={styles.row}>
            {accentOptions.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => updateSettings({ accent: opt.id })}
                style={[
                  styles.accentBtn,
                  settings.accent === opt.id
                    ? { backgroundColor: c.dockAccent }
                    : { backgroundColor: c.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <View style={[styles.swatch, { backgroundColor: opt.color }]} />
                <Text style={{ color: settings.accent === opt.id ? '#fff' : c.muted, fontWeight: '600', fontSize: 12 }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>
      </View>

      <View>
        <SectionTitle>Demo roles</SectionTitle>
        {users
          .filter((u) => u.id !== user.id)
          .map((u) => (
            <Pressable key={u.id} onPress={() => loginAs(u.id)} style={[styles.switchRow, { borderColor: c.line }]}>
              <Text style={{ color: c.ink, fontWeight: '700' }}>Switch to {u.name} ({u.role})</Text>
              <Ionicons name="swap-horizontal" size={18} color={c.brandEmphasis} />
            </Pressable>
          ))}
      </View>

      <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
        {usingSupabase
          ? 'Live Supabase connected — service requests sync in realtime.'
          : 'Running on local demo data. Add EXPO_PUBLIC_SUPABASE_URL and ANON_KEY to connect.'}
      </Text>
      <GhostButton label="Sign out" onPress={logout} />
      <Text style={{ textAlign: 'center', color: c.muted, fontSize: 11 }}>
        VinnoVerse · preferences saved on this device
      </Text>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  back: { marginBottom: 4, width: 36 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '700' },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  switch: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', marginLeft: 2 },
  knobOn: { marginLeft: 22 },
  row: { flexDirection: 'row', gap: 8 },
  themeBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, borderRadius: radius.lg },
  accentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radius.lg },
  swatch: { width: 12, height: 12, borderRadius: 6 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
  },
});
