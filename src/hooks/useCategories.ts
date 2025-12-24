import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}

const DEFAULT_CATEGORIES = [
  { name: 'Homework', color: '#8b5cf6', icon: '📚' },
  { name: 'Exam Prep', color: '#ef4444', icon: '📝' },
  { name: 'Projects', color: '#22c55e', icon: '🎯' },
  { name: 'Reading', color: '#f59e0b', icon: '📖' },
  { name: 'Revision', color: '#0ea5e9', icon: '🔄' },
];

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const q = query(
        collection(db, 'categories'),
        where('user_id', '==', user.id),
        orderBy('created_at', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      
      return categories;
    },
    enabled: !!user,
  });

  const createDefaultCategories = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const promises = DEFAULT_CATEGORIES.map(cat =>
        addDoc(collection(db, 'categories'), {
          user_id: user.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          created_at: new Date(),
        })
      );

      await Promise.all(promises);
      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (input: { name: string; color: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const docRef = await addDoc(collection(db, 'categories'), {
        user_id: user.id,
        name: input.name,
        color: input.color,
        icon: input.icon || null,
        created_at: new Date(),
      });

      return {
        id: docRef.id,
        user_id: user.id,
        name: input.name,
        color: input.color,
        icon: input.icon || null,
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created!');
    },
    onError: (error) => {
      toast.error('Failed to create category');
      console.error(error);
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory,
    createDefaultCategories,
  };
}