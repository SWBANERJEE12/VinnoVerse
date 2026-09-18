import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground } from '../components/shell/AppBackground';
import { GlassCard } from '../components/shell/GlassCard';
import { ThemeReveal } from '../components/shell/ThemeReveal';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import { radius, spacing } from '../theme';

export function LoginScreen() {
  const c = useThemeColors();
  const { login, loginAs, users } = useApp();
  const [reg, setReg] = useState('23BCE1847');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <ThemeReveal />
      <AppBackground />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.wrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.hero}>
            <Text style={[styles.kicker, { color: c.brand }]}>VIT Vellore</Text>
            <Text style={[styles.brand, { color: c.ink }]}>VinnoVerse</Text>
            <Text style={[styles.lede, { color: c.muted }]}>
              Campus services, mess, maps and academics — in one place.
            </Text>
          </View>

          <GlassCard>
            <Text style={[styles.label, { color: c.muted }]}>Register number</Text>
            <TextInput
              value={reg}
              onChangeText={setReg}
              autoCapitalize="characters"
              placeholder="23BCE1847"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink, backgroundColor: c.bg }]}
            />
            <Text style={[styles.label, { marginTop: 14, color: c.muted }]}>PIN</Text>
            <TextInput
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="number-pad"
              placeholder="1234"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink, backgroundColor: c.bg }]}
            />
            {error ? <Text style={{ color: c.danger, marginTop: 10, fontWeight: '600' }}>{error}</Text> : null}
            <View style={{ height: 14 }} />
            <PrimaryButton
              label="Enter campus"
              loading={busy}
              onPress={async () => {
                setBusy(true);
                const msg = await login(reg, pin);
                setError(msg);
                setBusy(false);
              }}
            />
          </GlassCard>

          <Text style={[styles.or, { color: c.muted }]}>Demo identities</Text>
          {users.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => loginAs(u.id)}
              style={[
                styles.demo,
                {
                  backgroundColor: c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
                  borderColor: c.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <View style={[styles.demoIcon, { backgroundColor: c.brandSubtle }]}>
                <Ionicons
                  name={u.role === 'warden' ? 'shield-outline' : 'school-outline'}
                  size={18}
                  color={c.brandSubtleFg}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', color: c.ink }}>{u.name}</Text>
                <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>
                  {u.role === 'warden' ? 'Hostel warden' : 'Student'} · {u.reg_no}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={c.muted} />
            </Pressable>
          ))}
          <Text style={[styles.hint, { color: c.muted }]}>PIN for both accounts is 1234.</Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  safe: { flex: 1, zIndex: 10 },
  wrap: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  hero: { marginBottom: 22 },
  kicker: { fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', fontSize: 12 },
  brand: { fontSize: 40, fontWeight: '800', letterSpacing: -1.2, marginTop: 6 },
  lede: { marginTop: 8, fontSize: 16, lineHeight: 22, maxWidth: 320 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
  },
  or: { marginTop: 22, marginBottom: 10, fontWeight: '700' },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  demoIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hint: { marginTop: 12, fontSize: 13, lineHeight: 18 },
});
