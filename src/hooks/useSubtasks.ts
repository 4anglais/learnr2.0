import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  limit,
} from 'firebase/firestore';
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
      
      const q = query(
        collection(db, 'subtasks'),
        where('task_id', '==', taskId),
        orderBy('position', 'asc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as Subtask[];
    },
    enabled: !!taskId,
  });

  const createSubtask = useMutation({
    mutationFn: async ({ task_id, title }: { task_id: string; title: string }) => {
      // Get current max position
      const q = query(
        collection(db, 'subtasks'),
        where('task_id', '==', task_id),
        orderBy('position', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(q);
      const existing = snapshot.docs.map(doc => doc.data());
      
      const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0;

      const newSubtask = {
        task_id,
        title,
        position: nextPosition,
        is_completed: false,
        created_at: new Date()
      };

      const docRef = await addDoc(collection(db, 'subtasks'), newSubtask);
      
      return {
        id: docRef.id,
        ...newSubtask,
        created_at: newSubtask.created_at.toISOString()
      };
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
      const docRef = doc(db, 'subtasks', id);
      await updateDoc(docRef, { is_completed });
      return { id, is_completed };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks'] });
    },
  });

  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'subtasks', id));
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
