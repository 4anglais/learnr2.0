import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Step {
  id: string;
  milestone_id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resource_url: string | null;
  is_completed: boolean;
  completed_at: string | null;
  position: number;
  linked_task_id: string | null;
  created_at: string;
}

export interface Milestone {
  id: string;
  roadmap_id: string;
  title: string;
  description: string | null;
  position: number;
  color: string;
  created_at: string;
  steps?: Step[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  duration_weeks: number;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export function useRoadmaps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roadmaps = [], isLoading } = useQuery({
    queryKey: ['roadmaps', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Roadmap[];
    },
    enabled: !!user,
  });

  const { data: activeRoadmap } = useQuery({
    queryKey: ['activeRoadmap', user?.id],
    queryFn: async () => {
      const { data: roadmapData, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (roadmapError) throw roadmapError;
      if (!roadmapData) return null;

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('roadmap_id', roadmapData.id)
        .order('position', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Fetch steps for all milestones
      const milestoneIds = milestonesData?.map(m => m.id) || [];
      let stepsData: Step[] = [];
      
      if (milestoneIds.length > 0) {
        const { data: steps, error: stepsError } = await supabase
          .from('steps')
          .select('*')
          .in('milestone_id', milestoneIds)
          .order('position', { ascending: true });

        if (stepsError) throw stepsError;
        stepsData = steps as Step[];
      }

      // Combine data
      const milestones: Milestone[] = (milestonesData || []).map(m => ({
        ...m,
        steps: stepsData.filter(s => s.milestone_id === m.id),
      }));

      return { ...roadmapData, milestones } as Roadmap;
    },
    enabled: !!user,
  });

  const createRoadmap = useMutation({
    mutationFn: async (data: { title: string; description?: string; duration_weeks?: number }) => {
      const { data: roadmap, error } = await supabase
        .from('roadmaps')
        .insert({ ...data, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return roadmap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      toast({ title: 'Roadmap created!' });
    },
    onError: () => {
      toast({ title: 'Failed to create roadmap', variant: 'destructive' });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: { roadmap_id: string; title: string; description?: string; color?: string; position: number }) => {
      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return milestone;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const createStep = useMutation({
    mutationFn: async (data: { 
      milestone_id: string; 
      title: string; 
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      resource_url?: string;
      position: number;
    }) => {
      const { data: step, error } = await supabase
        .from('steps')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return step;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const toggleStepComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { error } = await supabase
        .from('steps')
        .update({ 
          is_completed, 
          completed_at: is_completed ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roadmaps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      toast({ title: 'Roadmap deleted' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('milestones').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('steps').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  return {
    roadmaps,
    activeRoadmap,
    isLoading,
    createRoadmap,
    createMilestone,
    createStep,
    toggleStepComplete,
    deleteRoadmap,
    deleteMilestone,
    deleteStep,
  };
}
