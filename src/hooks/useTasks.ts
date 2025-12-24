import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  completed_at: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  category_id?: string;
  reminder_at?: string;
}

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const q = query(
        collection(db, 'tasks'),
        where('user_id', '==', user.id),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      
      return tasks;
    },
    enabled: !!user,
  });

  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error('Not authenticated');

      const docRef = await addDoc(collection(db, 'tasks'), {
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        priority: input.priority || 'medium',
        category_id: input.category_id || null,
        reminder_at: input.reminder_at || null,
        is_completed: false,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return {
        id: docRef.id,
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        due_date: input.due_date || null,
        priority: input.priority || 'medium',
        category_id: input.category_id || null,
        reminder_at: input.reminder_at || null,
        is_completed: false,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task created!');
    },
    onError: (error) => {
      toast.error('Failed to create task');
      console.error(error);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const taskRef = doc(db, 'tasks', id);
      const updateData = {
        ...updates,
        updated_at: new Date(),
      };
      
      await updateDoc(taskRef, updateData);
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const taskRef = doc(db, 'tasks', id);
      const updateData = {
        is_completed,
        completed_at: is_completed ? new Date() : null,
        updated_at: new Date(),
      };
      
      await updateDoc(taskRef, updateData);
      return { is_completed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (data.is_completed) {
        toast.success('Task completed! 🎉');
      }
    },
    onError: (error) => {
      toast.error('Failed to update task');
      console.error(error);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete task');
      console.error(error);
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
  };
}