import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, EmptyState, PrimaryButton, StatusBadge } from '../components/ui';
import { formatDateTime } from '../lib/dates';
import { useApp } from '../lib/store';
import type { ServicesStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import type { ServiceStatus } from '../types';

const FLOW: ServiceStatus[] = ['Submitted', 'Accepted', 'In Progress', 'Completed'];

type Props = NativeStackScreenProps<ServicesStackParamList, 'ServiceDetail'>;

export function ServiceDetailScreen({ route }: Props) {
  const { user, requests, updateRequestStatus } = useApp();
  const request = requests.find((r) => r.id === route.params.id);

  const nextStatus = useMemo(() => {
    if (!request) return null;
    const i = FLOW.indexOf(request.status);
    return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
  }, [request]);

  if (!request) {
    return (
      <Screen title="Request">
        <EmptyState icon="alert-circle-outline" title="Not found" body="This ticket may have been removed." />
      </Screen>
    );
  }

  return (
    <Screen title={request.category} subtitle={request.location}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <StatusBadge status={request.status} />
          <Text style={styles.time}>Updated {formatDateTime(request.updated_at)}</Text>
        </View>
        <Card>
          <Text style={styles.body}>{request.description}</Text>
        </Card>
        {request.image_uri ? <Image source={{ uri: request.image_uri }} style={styles.image} /> : null}
        <Text style={styles.section}>Timeline</Text>
        {request.timeline.map((event, index) => (
          <View key={`${event.status}-${event.at}`} style={styles.event}>
            <View style={[styles.dot, index === request.timeline.length - 1 && styles.dotNow]} />
            <View>
              <Text style={styles.eventTitle}>{event.status}</Text>
              <Text style={styles.eventMeta}>{formatDateTime(event.at)}</Text>
            </View>
          </View>
        ))}
        {user?.role === 'warden' && nextStatus ? (
          <View style={{ marginTop: 20 }}>
            <PrimaryButton
              label={nextStatus === 'Accepted' ? 'Accept request' : `Mark ${nextStatus}`}
              onPress={() => updateRequestStatus(request.id, nextStatus)}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  time: {
    color: colors.muted,
    fontSize: 13,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
  },
  image: {
    height: 180,
    borderRadius: 16,
    marginTop: 12,
  },
  section: {
    marginTop: 22,
    marginBottom: 12,
    fontWeight: '800',
    color: colors.ink,
    fontSize: 16,
  },
  event: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.line,
    marginTop: 5,
  },
  dotNow: {
    backgroundColor: colors.teal,
  },
  eventTitle: {
    fontWeight: '700',
    color: colors.ink,
  },
  eventMeta: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 13,
  },
});
