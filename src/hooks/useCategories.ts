import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { categoryService, Category } from '@/services/categoryService';

export type { Category };

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      return await categoryService.fetchCategories(user.uid);
    },
    enabled: !!user,
  });

  const createDefaultCategories = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      await categoryService.createDefaultCategories(user.uid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (input: { name: string; color: string; icon?: string }) => {
      if (!user) throw new Error('Not authenticated');
      return await categoryService.createCategory(user.uid, input);
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
