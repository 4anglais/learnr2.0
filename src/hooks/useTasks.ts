import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { taskService, Task, CreateTaskInput, mapDocToTask } from '@/services/taskService';
import { db } from '@/integrations/firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// Re-export types for compatibility
export type { Task, CreateTaskInput };

export function useTasks() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, 'tasks'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => mapDocToTask(doc));
        setTasks(tasksData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading]);

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error('Not authenticated');
      return await taskService.createTask(user.uid, input);
    },
    onSuccess: () => {
      toast.success('Task created!');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error(error);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      await taskService.updateTask(id, updates);
      return { id, ...updates };
    },
    onSuccess: () => {
      // Tasks will update automatically via onSnapshot
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      await taskService.toggleComplete(id, is_completed);
      return { is_completed };
    },
    onSuccess: (data) => {
      // Tasks will update automatically via onSnapshot
      if (data.is_completed) {
        toast.success('Task completed!');
      }
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await taskService.deleteTask(id);
    },
    onSuccess: () => {
      // Tasks will update automatically via onSnapshot
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete task');
      console.error(error);
    },
  });

  return {
    tasks,
    isLoading,
    error: null,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  };
}
