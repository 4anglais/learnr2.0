import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
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
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!taskId) {
      setSubtasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, 'subtasks'),
      where('task_id', '==', taskId),
      orderBy('position', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subtasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as Subtask[];
      setSubtasks(subtasksData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching subtasks:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [taskId]);

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
  });

  const deleteSubtask = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'subtasks', id));
    },
  });

  return {
    subtasks,
    isLoading,
    createSubtask,
    toggleSubtask,
    deleteSubtask,
  };
}
