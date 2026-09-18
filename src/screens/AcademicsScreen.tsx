import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GlassCard } from '../components/shell/GlassCard';
import { PageShell } from '../components/shell/PageShell';
import { SectionTitle } from '../components/shell/SectionTitle';
import { PrimaryButton } from '../components/ui';
import { addDays, formatDateLabel, formatDateTime, formatTime, isoDate, weekdayName } from '../lib/dates';
import { notificationsAvailable, scheduleQuizReminders } from '../lib/notifications';
import { timetableToClasses } from '../lib/schedule';
import { timetable, useApp } from '../lib/store';
import { useThemeColors } from '../lib/theme-context';
import { radius, spacing } from '../theme';

export function AcademicsScreen() {
  const c = useThemeColors();
  const { user, exams, quizzes, addQuiz } = useApp();
  const classes = useMemo(() => timetableToClasses(timetable, user?.id, weekdayName()), [user?.id]);
  const [modal, setModal] = useState(false);
  const [subject, setSubject] = useState('CSE2001');
  const [title, setTitle] = useState('');
  const tomorrow = isoDate(addDays(new Date(), 1));
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState<string | null>(null);

  const upcomingExams = useMemo(() => {
    const today = isoDate();
    return [...exams]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  }, [exams]);

  const myQuizzes = useMemo(
    () =>
      [...quizzes]
        .filter((q) => q.student_id === user?.id)
        .sort((a, b) => +new Date(a.date_time) - +new Date(b.date_time)),
    [quizzes, user?.id],
  );

  return (
    <PageShell>
      <Text style={[styles.title, { color: c.ink }]}>Academics</Text>

      <View>
        <SectionTitle>Classes today</SectionTitle>
        {classes.length === 0 ? (
          <GlassCard><Text style={{ color: c.muted }}>No classes today.</Text></GlassCard>
        ) : (
          classes.map((item) => (
            <GlassCard key={item.id} style={{ marginBottom: 8 }}>
              <Text style={[styles.course, { color: c.ink }]}>{item.course}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>{item.time} · {item.room}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>{item.faculty}</Text>
            </GlassCard>
          ))
        )}
      </View>

      <View>
        <View style={styles.rowBetween}>
          <SectionTitle>Upcoming quizzes</SectionTitle>
          <Pressable onPress={() => setModal(true)}>
            <Text style={{ color: c.brandEmphasis, fontWeight: '700' }}>+ Add</Text>
          </Pressable>
        </View>
        {myQuizzes.length === 0 ? (
          <Text style={{ color: c.muted }}>No quizzes scheduled.</Text>
        ) : (
          myQuizzes.map((q) => (
            <GlassCard key={q.id} style={{ marginBottom: 8 }}>
              <View style={styles.rowBetween}>
                <Text style={[styles.course, { color: c.ink, flex: 1 }]}>{q.title}</Text>
                <View style={[styles.pill, { backgroundColor: c.brandSubtle }]}>
                  <Text style={{ color: c.brandSubtleFg, fontSize: 10, fontWeight: '700' }}>Quiz</Text>
                </View>
              </View>
              <Text style={[styles.meta, { color: c.muted }]}>{q.subject}</Text>
              <Text style={[styles.due, { color: c.brandEmphasis }]}>{formatDateTime(q.date_time)}</Text>
            </GlassCard>
          ))
        )}
      </View>

      <View>
        <SectionTitle>Exams</SectionTitle>
        {upcomingExams.length === 0 ? (
          <Text style={{ color: c.muted }}>No upcoming exams.</Text>
        ) : (
          upcomingExams.map((exam) => (
            <GlassCard key={exam.id} style={{ marginBottom: 8 }}>
              <Text style={[styles.course, { color: c.ink }]}>{exam.subject}</Text>
              <Text style={[styles.meta, { color: c.muted }]}>
                {formatDateLabel(exam.date)} · {formatTime(exam.start_time)} – {formatTime(exam.end_time)}
              </Text>
              <Text style={[styles.due, { color: c.brandEmphasis }]}>{exam.venue}</Text>
            </GlassCard>
          ))
        )}
      </View>

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: c.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: c.paper }]}>
            <Text style={[styles.modalTitle, { color: c.ink }]}>Add quiz reminder</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Subject code"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink }]}
            />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Quiz title"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink }]}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink }]}
            />
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              placeholderTextColor={c.muted}
              style={[styles.input, { borderColor: c.line, color: c.ink }]}
            />
            {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
            <PrimaryButton
              label="Save quiz"
              onPress={async () => {
                if (!title.trim()) {
                  setError('Enter a title');
                  return;
                }
                const dateTime = new Date(`${date}T${time}:00`);
                if (Number.isNaN(dateTime.getTime())) {
                  setError('Invalid date or time');
                  return;
                }
                const quiz = await addQuiz({ subject, title, date_time: dateTime.toISOString() });
                if (notificationsAvailable) await scheduleQuizReminders(quiz);
                setModal(false);
                setTitle('');
                setError(null);
                Alert.alert('Saved', 'Quiz reminder added.');
              }}
            />
            <Pressable onPress={() => setModal(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: c.muted, fontWeight: '700' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </PageShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  course: { fontSize: 16, fontWeight: '700' },
  meta: { marginTop: 4, fontSize: 14 },
  due: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.lg, gap: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    fontSize: 16,
  },
});
