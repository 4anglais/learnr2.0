import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface StudySession {
  id: string;
  user_id: string;
  task_id: string | null;
  step_id: string | null;
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  is_completed: boolean;
  created_at: string;
}

export function useStudySessions(weekStart?: Date) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentWeekStart = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['studySessions', user?.uid, format(currentWeekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user) return [];
      
      const startDateStr = format(currentWeekStart, 'yyyy-MM-dd');
      const endDateStr = format(currentWeekEnd, 'yyyy-MM-dd');
      
      const q = query(
        collection(db, 'study_sessions'),
        where('user_id', '==', user.uid),
        where('scheduled_date', '>=', startDateStr),
        where('scheduled_date', '<=', endDateStr),
        orderBy('scheduled_date', 'asc'),
        orderBy('start_time', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
      }) as StudySession[];
      
      return sessions;
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async (data: {
      task_id?: string;
      step_id?: string;
      scheduled_date: string;
      start_time: string;
      duration_minutes?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const docRef = await addDoc(collection(db, 'study_sessions'), {
        ...data,
        user_id: user.uid,
        is_completed: false,
        created_at: new Date(),
      });

      return {
        id: docRef.id,
        ...data,
        user_id: user.uid,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...data }: Partial<StudySession> & { id: string }) => {
      const sessionRef = doc(db, 'study_sessions', id);
      await updateDoc(sessionRef, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const sessionRef = doc(db, 'study_sessions', id);
      await deleteDoc(sessionRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const sessionRef = doc(db, 'study_sessions', id);
      await updateDoc(sessionRef, { is_completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  // Get sessions grouped by day
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = session.scheduled_date;
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {} as Record<string, StudySession[]>);

  // Calculate daily load (minutes per day)
  const dailyLoad = Object.entries(sessionsByDay).reduce((acc, [day, daySessions]) => {
    acc[day] = daySessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    return acc;
  }, {} as Record<string, number>);

  return {
    sessions,
    sessionsByDay,
    dailyLoad,
    isLoading,
    createSession,
    updateSession,
    deleteSession,
    toggleComplete,
  };
}
