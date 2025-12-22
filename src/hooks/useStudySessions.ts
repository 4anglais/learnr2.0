import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';

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
    queryKey: ['studySessions', user?.id, format(currentWeekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .gte('scheduled_date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(currentWeekEnd, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as StudySession[];
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
      const { data: session, error } = await supabase
        .from('study_sessions')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...data }: Partial<StudySession> & { id: string }) => {
      const { error } = await supabase
        .from('study_sessions')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('study_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studySessions'] });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from('study_sessions')
        .update({ is_completed })
        .eq('id', id);

      if (error) throw error;
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
