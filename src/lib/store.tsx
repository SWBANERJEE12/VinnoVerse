import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  exams as seedExams,
  messMenu as seedMess,
  quizzes as seedQuizzes,
  serviceRequests as seedRequests,
  timetable as seedTimetable,
  users as seedUsers,
} from '../data/seed';
import type {
  Exam,
  Quiz,
  ServiceCategory,
  ServiceRequest,
  ServiceStatus,
  User,
} from '../types';
import { supabase, supabaseConfigured } from './supabase';

const USER_KEY = 'vinnoverse.user';
const REQUESTS_KEY = 'vinnoverse.requests';
const QUIZZES_KEY = 'vinnoverse.quizzes';

type NewRequest = {
  category: ServiceCategory;
  description: string;
  location: string;
  image_uri?: string | null;
};

type AppContextValue = {
  ready: boolean;
  usingSupabase: boolean;
  user: User | null;
  users: User[];
  requests: ServiceRequest[];
  quizzes: Quiz[];
  exams: Exam[];
  login: (regNo: string, pin: string) => Promise<string | null>;
  loginAs: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  createRequest: (input: NewRequest) => Promise<ServiceRequest>;
  updateRequestStatus: (id: string, status: ServiceStatus) => Promise<void>;
  addQuiz: (input: Omit<Quiz, 'id' | 'student_id'>) => Promise<Quiz>;
};

const AppContext = createContext<AppContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function mapRequestRow(row: Record<string, unknown>): ServiceRequest {
  return {
    id: String(row.id),
    student_id: String(row.student_id),
    category: row.category as ServiceRequest['category'],
    description: String(row.description),
    location: String(row.location),
    status: row.status as ServiceStatus,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    image_uri: (row.image_url as string | null) ?? null,
    timeline: (row.timeline as ServiceRequest['timeline']) ?? [],
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>(seedRequests);
  const [quizzes, setQuizzes] = useState<Quiz[]>(seedQuizzes);
  const usingSupabase = supabaseConfigured && Boolean(supabase);

  const persistRequests = useCallback(async (rows: ServiceRequest[]) => {
    setRequests(rows);
    await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(rows));
  }, []);

  const persistQuizzes = useCallback(async (rows: Quiz[]) => {
    setQuizzes(rows);
    await AsyncStorage.setItem(QUIZZES_KEY, JSON.stringify(rows));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedUser, savedRequests, savedQuizzes] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          AsyncStorage.getItem(REQUESTS_KEY),
          AsyncStorage.getItem(QUIZZES_KEY),
        ]);
        if (!active) return;
        if (savedUser) setUser(JSON.parse(savedUser) as User);
        if (savedRequests) setRequests(JSON.parse(savedRequests) as ServiceRequest[]);
        if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes) as Quiz[]);

        if (usingSupabase && supabase) {
          const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
          if (data && active) setRequests(data.map(mapRequestRow));
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [usingSupabase]);

  useEffect(() => {
    if (!usingSupabase || !supabase) return;
    const client = supabase;
    const channel = client
      .channel('service-requests-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, async () => {
        const { data } = await client.from('service_requests').select('*').order('created_at', { ascending: false });
        if (data) setRequests(data.map(mapRequestRow));
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [usingSupabase]);

  const login = useCallback(async (regNo: string, pin: string) => {
    if (pin !== '1234') return 'Use demo PIN 1234';
    const found = seedUsers.find((u) => u.reg_no.toLowerCase() === regNo.trim().toLowerCase());
    if (!found) return 'Unknown register number';
    setUser(found);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(found));
    return null;
  }, []);

  const loginAs = useCallback(async (userId: string) => {
    const found = seedUsers.find((u) => u.id === userId);
    if (!found) return;
    setUser(found);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(found));
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  const createRequest = useCallback(
    async (input: NewRequest) => {
      const created = nowIso();
      const request: ServiceRequest = {
        id: `req-${Date.now()}`,
        student_id: user?.id ?? 'stu-ananya',
        category: input.category,
        description: input.description,
        location: input.location,
        status: 'Submitted',
        created_at: created,
        updated_at: created,
        image_uri: input.image_uri,
        timeline: [{ status: 'Submitted', at: created }],
      };

      if (usingSupabase && supabase) {
        const { data, error } = await supabase
          .from('service_requests')
          .insert({
            student_id: request.student_id,
            category: request.category,
            description: request.description,
            location: request.location,
            status: request.status,
            image_url: request.image_uri,
            timeline: request.timeline,
          })
          .select('*')
          .single();
        if (error) throw error;
        const mapped = mapRequestRow(data);
        setRequests((prev) => [mapped, ...prev]);
        return mapped;
      }

      await persistRequests([request, ...requests]);
      return request;
    },
    [persistRequests, requests, user, usingSupabase],
  );

  const updateRequestStatus = useCallback(
    async (id: string, status: ServiceStatus) => {
      const stamp = nowIso();
      const next = requests.map((row) =>
        row.id === id
          ? {
              ...row,
              status,
              updated_at: stamp,
              timeline: [...row.timeline, { status, at: stamp }],
            }
          : row,
      );
      const updated = next.find((row) => row.id === id);
      if (usingSupabase && supabase && updated) {
        await supabase
          .from('service_requests')
          .update({ status, updated_at: stamp, timeline: updated.timeline })
          .eq('id', id);
        setRequests(next);
        return;
      }
      await persistRequests(next);
    },
    [persistRequests, requests, usingSupabase],
  );

  const addQuiz = useCallback(
    async (input: Omit<Quiz, 'id' | 'student_id'>) => {
      const quiz: Quiz = {
        id: `qz-${Date.now()}`,
        student_id: user?.id ?? 'stu-ananya',
        ...input,
      };
      if (usingSupabase && supabase) {
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            student_id: quiz.student_id,
            subject: quiz.subject,
            title: quiz.title,
            date_time: quiz.date_time,
          })
          .select('*')
          .single();
        if (!error && data) {
          const mapped: Quiz = {
            id: String(data.id),
            student_id: String(data.student_id),
            subject: String(data.subject),
            title: String(data.title),
            date_time: String(data.date_time),
          };
          setQuizzes((prev) => [...prev, mapped]);
          return mapped;
        }
      }
      await persistQuizzes([...quizzes, quiz]);
      return quiz;
    },
    [persistQuizzes, quizzes, user, usingSupabase],
  );

  const value = useMemo(
    () => ({
      ready,
      usingSupabase,
      user,
      users: seedUsers,
      requests,
      quizzes,
      exams: seedExams,
      login,
      loginAs,
      logout,
      createRequest,
      updateRequestStatus,
      addQuiz,
    }),
    [addQuiz, createRequest, login, loginAs, logout, quizzes, ready, requests, updateRequestStatus, user, usingSupabase],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export { vitPois as campusLocations } from '../data/vitPois';
export const messMenu = seedMess;
export const timetable = seedTimetable;
