import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useEffect } from 'react';

export interface UserSettings {
  id: string;
  user_id: string;
  study_hours_per_day: number;
  preferred_study_start_time: string;
  preferred_study_end_time: string;
  focus_duration_minutes: number;
  short_break_minutes: number;
  long_break_minutes: number;
  sessions_before_long_break: number;
  theme: 'light' | 'dark' | 'system';
  notification_enabled: boolean;
  reminder_before_deadline_hours: number;
  created_at: string;
  updated_at: string;
}

const defaultSettings: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  study_hours_per_day: 4,
  preferred_study_start_time: '09:00:00',
  preferred_study_end_time: '21:00:00',
  focus_duration_minutes: 25,
  short_break_minutes: 5,
  long_break_minutes: 15,
  sessions_before_long_break: 4,
  theme: 'system',
  notification_enabled: true,
  reminder_before_deadline_hours: 24,
};

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['user_settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserSettings | null;
    },
    enabled: !!user,
  });

  const createSettings = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...defaultSettings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_settings'] });
      toast.success('Settings saved');
    },
    onError: () => {
      toast.error('Failed to save settings');
    },
  });

  // Create default settings if none exist
  useEffect(() => {
    if (user && settingsQuery.data === null && !settingsQuery.isLoading && !createSettings.isPending) {
      createSettings.mutate();
    }
  }, [user, settingsQuery.data, settingsQuery.isLoading]);

  // Apply theme
  useEffect(() => {
    const theme = settingsQuery.data?.theme || 'system';
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settingsQuery.data?.theme]);

  return {
    settings: settingsQuery.data || { ...defaultSettings, id: '', user_id: '', created_at: '', updated_at: '' } as UserSettings,
    isLoading: settingsQuery.isLoading,
    updateSettings,
  };
}