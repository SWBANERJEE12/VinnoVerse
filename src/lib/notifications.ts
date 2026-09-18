import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Quiz } from '../types';
import { formatDateTime } from './dates';

/** Push + native notification APIs are unavailable in Expo Go (SDK 53+). */
export const notificationsAvailable = Constants.appOwnership !== 'expo';

const OFFSETS = [
  { label: '2 days before', ms: 2 * 24 * 60 * 60 * 1000 },
  { label: '1 day before', ms: 24 * 60 * 60 * 1000 },
  { label: '12 hours before', ms: 12 * 60 * 60 * 1000 },
  { label: '15 minutes before', ms: 15 * 60 * 1000 },
];

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsAvailable) return null;
  if (notificationsModule) return notificationsModule;
  try {
    notificationsModule = await import('expo-notifications');
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    return notificationsModule;
  } catch {
    return null;
  }
}

export async function ensureNotificationPermission() {
  const Notifications = await loadNotifications();
  if (!Notifications) return false;
  if (!Device.isDevice && Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('quizzes', {
      name: 'Quiz reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted || asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function scheduleQuizReminders(quiz: Quiz) {
  if (!notificationsAvailable) return 0;
  try {
    const Notifications = await loadNotifications();
    if (!Notifications) return 0;
    const ok = await ensureNotificationPermission();
    if (!ok) return 0;
    const due = new Date(quiz.date_time).getTime();
    let scheduled = 0;
    for (const offset of OFFSETS) {
      const when = due - offset.ms;
      if (when <= Date.now() + 5000) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${offset.label}: ${quiz.title}`,
          body: `${quiz.subject} · ${formatDateTime(quiz.date_time)}`,
          data: { quizId: quiz.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(when),
          channelId: Platform.OS === 'android' ? 'quizzes' : undefined,
        },
      });
      scheduled += 1;
    }
    return scheduled;
  } catch {
    return 0;
  }
}
