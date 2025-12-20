import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const createDefaultCategories = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const categoriesToCreate = DEFAULT_CATEGORIES.map(cat => ({
        user_id: user.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      }));

      const { data, error } = await supabase
        .from('categories')
        .insert(categoriesToCreate)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (input: { name: string; color: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color,
          icon: input.icon || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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