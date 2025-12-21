import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  duration_minutes: number;
  started_at: string;
  completed_at: string | null;
  is_completed: boolean;
  session_type: 'focus' | 'short_break' | 'long_break';
  created_at: string;
}

export function useFocusSessions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: ['focus_sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as FocusSession[];
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async (input: {
      task_id?: string;
      duration_minutes: number;
      session_type: 'focus' | 'short_break' | 'long_break';
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          task_id: input.task_id || null,
          duration_minutes: input.duration_minutes,
          session_type: input.session_type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
    },
  });

  const completeSession = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
      toast.success('Focus session completed!');
    },
  });

  // Calculate stats
  const completedSessions = sessionsQuery.data?.filter(s => s.is_completed && s.session_type === 'focus') || [];
  const totalFocusMinutes = completedSessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  
  // Calculate streak (consecutive days with completed sessions)
  const calculateStreak = () => {
    if (completedSessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 365; i++) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasSession = completedSessions.some(s => {
        const sessionDate = new Date(s.completed_at || s.started_at);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });
      
      if (hasSession) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (i === 0) {
        // Check if we have a session today, if not, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  return {
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    createSession,
    completeSession,
    totalFocusMinutes,
    completedSessionsCount: completedSessions.length,
    streak: calculateStreak(),
  };
}