import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  position: number;
  created_at: string;
}

export function useSubtasks(taskId: string | null) {
  const queryClient = useQueryClient();

  const subtasksQuery = useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as Subtask[];
    },
    enabled: !!taskId,
  });

  const createSubtask = useMutation({
    mutationFn: async ({ task_id, title }: { task_id: string; title: string }) => {
      const { data: existing } = await supabase
        .from('subtasks')
        .select('position')
        .eq('task_id', task_id)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('subtasks')
        .insert({ task_id, title, position: nextPosition })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
    onError: () => {
      toast.error('Failed to create subtask');
    },
  });

  const toggleSubtask = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from('subtasks')
        .update({ is_completed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
  });

  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
  });

  return {
    subtasks: subtasksQuery.data || [],
    isLoading: subtasksQuery.isLoading,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}