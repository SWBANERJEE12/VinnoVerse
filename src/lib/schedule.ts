import type { MessMenuItem, ServiceRequest, TimetableEntry } from '../types';
import { formatTime, isoDate, minutesNow, toMinutes, weekdayName } from './dates';

export type ClassStatus = 'completed' | 'ongoing' | 'upcoming';

export type TimetableClass = {
  id: string;
  time: string;
  startMinutes: number;
  endMinutes: number;
  course: string;
  room: string;
  faculty: string;
  status: ClassStatus;
};

export type MessServingState =
  | { kind: 'serving'; mealName: string; items: string[] }
  | { kind: 'next'; mealName: string; startLabel: string; items: string[]; tomorrow?: boolean };

const MESS_WINDOWS: Record<string, { startMinutes: number; endMinutes: number }> = {
  Breakfast: { startMinutes: 7 * 60 + 30, endMinutes: 9 * 60 + 30 },
  Lunch: { startMinutes: 12 * 60, endMinutes: 14 * 60 + 30 },
  Snacks: { startMinutes: 16 * 60 + 30, endMinutes: 18 * 60 },
  Dinner: { startMinutes: 19 * 60, endMinutes: 21 * 60 + 30 },
};

const MEAL_ORDER = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const;

export function getClassStatus(startMinutes: number, endMinutes: number, nowMinutes = minutesNow()): ClassStatus {
  if (nowMinutes >= endMinutes) return 'completed';
  if (nowMinutes >= startMinutes) return 'ongoing';
  return 'upcoming';
}

export function timetableToClasses(entries: TimetableEntry[], studentId?: string, day = weekdayName()): TimetableClass[] {
  const nowMinutes = minutesNow();
  return entries
    .filter((e) => e.student_id === studentId && e.day === day)
    .sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time))
    .map((e) => {
      const startMinutes = toMinutes(e.start_time);
      const endMinutes = toMinutes(e.end_time);
      return {
        id: e.id,
        time: `${formatTime(e.start_time)} – ${formatTime(e.end_time)}`,
        startMinutes,
        endMinutes,
        course: e.subject,
        room: e.room,
        faculty: e.faculty,
        status: getClassStatus(startMinutes, endMinutes, nowMinutes),
      };
    });
}

export function getFocalClassIndex(classes: TimetableClass[]) {
  if (classes.length === 0) return 0;
  const ongoing = classes.findIndex((c) => c.status === 'ongoing');
  if (ongoing !== -1) return ongoing;
  const next = classes.findIndex((c) => c.status === 'upcoming');
  if (next !== -1) return next;
  return classes.length - 1;
}

function formatMinutesLabel(minutes: number) {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return mins === 0 ? `${hours12}:00 ${period}` : `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function getMessServingState(menu: MessMenuItem[], now = new Date()): MessServingState {
  const today = isoDate(now);
  const todayMenu = menu.filter((m) => m.date === today);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const mealName of MEAL_ORDER) {
    const window = MESS_WINDOWS[mealName];
    const row = todayMenu.find((m) => m.meal === mealName);
    if (!window || !row) continue;
    if (nowMinutes >= window.startMinutes && nowMinutes < window.endMinutes) {
      return { kind: 'serving', mealName, items: row.items };
    }
  }

  for (const mealName of MEAL_ORDER) {
    const window = MESS_WINDOWS[mealName];
    const row = todayMenu.find((m) => m.meal === mealName);
    if (!window || !row) continue;
    if (nowMinutes < window.startMinutes) {
      return {
        kind: 'next',
        mealName,
        startLabel: formatMinutesLabel(window.startMinutes),
        items: row.items,
      };
    }
  }

  const first = todayMenu.find((m) => m.meal === 'Breakfast');
  return {
    kind: 'next',
    mealName: 'Breakfast',
    startLabel: '7:30 AM',
    items: first?.items ?? [],
    tomorrow: true,
  };
}

export function getActiveComplaint(requests: ServiceRequest[], studentId?: string) {
  const open = requests.filter((r) => r.student_id === studentId && r.status !== 'Completed');
  if (open.length === 0) return null;
  const inProgress = open.find((r) => r.status === 'In Progress');
  if (inProgress) return inProgress;
  const accepted = open.find((r) => r.status === 'Accepted');
  if (accepted) return accepted;
  return open[0];
}

export const grievanceOptions = [
  'Wi-Fi not working in hostel',
  'Water leakage / plumbing',
  'Power cut in room',
  'Mess food quality',
  'Broken furniture',
  'Other',
] as const;
