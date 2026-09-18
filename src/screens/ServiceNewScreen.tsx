import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../lib/store';
import type { ServicesStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';
import type { ServiceCategory } from '../types';

const CATEGORIES: ServiceCategory[] = [
  'Room cleaning',
  'Toilet cleaning',
  'Maintenance/repair',
  'Other',
];

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServiceNew'>;

export function ServiceNewScreen({ navigation }: Props) {
  const { user, createRequest } = useApp();
  const [category, setCategory] = useState<ServiceCategory>('Maintenance/repair');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(user ? `${user.hostel}, ${user.room}` : '');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <Screen title="New request" subtitle="The warden sees this immediately">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Category</Text>
          <View style={styles.wrap}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
                <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>What’s wrong?</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Fan sparking, tap leaking, room not cleaned…"
            placeholderTextColor={colors.muted}
            multiline
            style={[styles.input, styles.area]}
          />
          <Text style={styles.label}>Location / room</Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="LD-406"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable
            style={styles.photo}
            onPress={async () => {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) return;
              const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
              if (!result.canceled) setImage(result.assets[0].uri);
            }}
          >
            <Text style={styles.photoText}>{image ? 'Change photo' : 'Add photo (optional)'}</Text>
          </Pressable>
          {image ? <Image source={{ uri: image }} style={styles.preview} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label="Submit to warden"
            loading={busy}
            onPress={async () => {
              if (description.trim().length < 8) {
                setError('Add a short description (at least 8 characters).');
                return;
              }
              if (!location.trim()) {
                setError('Add your room or block.');
                return;
              }
              setBusy(true);
              setError(null);
              try {
                const created = await createRequest({
                  category,
                  description: description.trim(),
                  location: location.trim(),
                  image_uri: image,
                });
                navigation.replace('ServiceDetail', { id: created.id });
              } catch {
                setError('Could not submit. Try again.');
              } finally {
                setBusy(false);
              }
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  label: {
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 8,
    marginTop: 12,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipOn: {
    backgroundColor: colors.teal,
    borderColor: colors.teal,
  },
  chipText: {
    fontWeight: '700',
    color: colors.ink,
    fontSize: 13,
  },
  chipTextOn: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    color: colors.ink,
    fontSize: 16,
  },
  area: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  photo: {
    marginTop: 16,
    marginBottom: 10,
  },
  photoText: {
    color: colors.teal,
    fontWeight: '700',
  },
  preview: {
    height: 160,
    borderRadius: radius.md,
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontWeight: '600',
  },
});
