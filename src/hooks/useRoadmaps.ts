import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  addDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  getDoc,
  documentId,
  Timestamp,
} from 'firebase/firestore';

export interface Step {
  id: string;
  milestone_id: string;
  roadmap_id: string;
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
  steps: Step[];
}

export interface Roadmap {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  duration_weeks: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  milestones: Milestone[];
}

const convertDate = (date: Timestamp | Date | string | { toDate: () => Date } | null | undefined): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate().toISOString();
  }
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export function useRoadmaps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeRoadmapId, setActiveRoadmapId] = useState<string | null>(null);

  // Query all roadmaps for the user
  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'roadmaps'),
        where('user_id', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: convertDate(data.created_at || data.createdAt),
            updated_at: convertDate(data.updated_at || data.updatedAt),
            milestones: [],
          } as Roadmap;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!user,
  });

  // Set initial active roadmap if none selected
  useEffect(() => {
    if (roadmapsQuery.data && roadmapsQuery.data.length > 0 && !activeRoadmapId) {
      setActiveRoadmapId(roadmapsQuery.data[0].id);
    }
  }, [roadmapsQuery.data, activeRoadmapId]);

  // Query details (milestones and steps) for the active roadmap
  const activeRoadmapQuery = useQuery({
    queryKey: ['roadmap', activeRoadmapId],
    queryFn: async () => {
      if (!activeRoadmapId) return null;

      // 1. Fetch the roadmap basic info
      const roadmapDocRef = doc(db, 'roadmaps', activeRoadmapId);
      const roadmapSnapshot = await getDoc(roadmapDocRef);
      
      if (!roadmapSnapshot.exists()) {
        console.error('Roadmap not found:', activeRoadmapId);
        return null;
      }
      
      const roadmapData = roadmapSnapshot.data();
      const baseRoadmap = {
        id: roadmapSnapshot.id,
        ...roadmapData,
        created_at: convertDate(roadmapData.created_at || roadmapData.createdAt),
        updated_at: convertDate(roadmapData.updated_at || roadmapData.updatedAt),
      } as Roadmap;

      // 2. Fetch milestones
      const milestonesQ = query(
        collection(db, 'milestones'),
        where('roadmap_id', '==', activeRoadmapId)
      );
      const mSnapshot = await getDocs(milestonesQ);
      const milestones = mSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            created_at: convertDate(data.created_at),
            steps: [],
          } as Milestone;
        })
        .sort((a, b) => (a.position || 0) - (b.position || 0));

      if (milestones.length === 0) {
        return { ...baseRoadmap, milestones: [] };
      }

      // 3. Fetch steps (handling chunking for 'in' query)
      const milestoneIds = milestones.map(m => m.id);
      const chunks: string[][] = [];
      for (let i = 0; i < milestoneIds.length; i += 10) {
        chunks.push(milestoneIds.slice(i, i + 10));
      }

      const allSteps: Step[] = [];
      await Promise.all(chunks.map(async (chunk) => {
        const stepsQ = query(
          collection(db, 'steps'),
          where('milestone_id', 'in', chunk)
        );
        const sSnapshot = await getDocs(stepsQ);
        sSnapshot.docs.forEach(doc => {
          const data = doc.data();
          allSteps.push({
            id: doc.id,
            ...data,
            created_at: convertDate(data.created_at),
            completed_at: data.completed_at ? convertDate(data.completed_at) : null,
          } as Step);
        });
      }));

      // 4. Merge data
      const milestonesWithSteps = milestones.map(m => ({
        ...m,
        steps: allSteps
          .filter(s => s.milestone_id === m.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0)),
      }));

      return {
        ...baseRoadmap,
        milestones: milestonesWithSteps,
      };
    },
    enabled: !!activeRoadmapId,
  });

  const createRoadmap = useMutation({
    mutationFn: async (data: { title: string; description?: string; duration_weeks?: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const timestamp = Timestamp.now();
      const newRoadmap = {
        ...data,
        user_id: user.uid,
        created_at: timestamp,
        updated_at: timestamp,
        is_completed: false,
      };
      
      const docRef = await addDoc(collection(db, 'roadmaps'), newRoadmap);
      return docRef.id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps', user?.uid] });
      setActiveRoadmapId(id);
      toast({ title: 'Roadmap created!' });
    },
    onError: (error: Error) => {
      console.error('Failed to create roadmap:', error);
      toast({ title: 'Failed to create roadmap', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoadmap = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Roadmap> & { id: string }) => {
      const timestamp = Timestamp.now();
      const docRef = doc(db, 'roadmaps', id);
      const { milestones: __, ...cleanUpdates } = updates;
      
      await setDoc(docRef, {
        ...cleanUpdates,
        updated_at: timestamp,
      }, { merge: true });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', variables.id] });
      toast({ title: 'Roadmap updated' });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: { roadmap_id: string; title: string; description?: string; color?: string; position: number }) => {
      const timestamp = Timestamp.now();
      const newMilestone = {
        roadmap_id: data.roadmap_id,
        title: data.title,
        description: data.description || null,
        color: data.color || '#6b7280',
        position: data.position,
        created_at: timestamp,
      };
      
      const docRef = await addDoc(collection(db, 'milestones'), newMilestone);
      
      await setDoc(doc(db, 'roadmaps', data.roadmap_id), {
        updated_at: timestamp,
      }, { merge: true });

      return data.roadmap_id;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      toast({ title: 'Milestone added!' });
    },
    onError: (error: Error) => {
      console.error('Failed to create milestone:', error);
      toast({ title: 'Failed to create milestone', description: error.message, variant: 'destructive' });
    },
  });

  const createStep = useMutation({
    mutationFn: async (data: { 
      milestone_id: string; 
      roadmap_id: string;
      title: string; 
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      resource_url?: string;
      position: number;
    }) => {
      const timestamp = Timestamp.now();
      const newStep = {
        milestone_id: data.milestone_id,
        roadmap_id: data.roadmap_id,
        title: data.title,
        difficulty: data.difficulty || 'beginner',
        resource_url: data.resource_url || null,
        position: data.position,
        is_completed: false,
        created_at: timestamp,
      };
      
      await addDoc(collection(db, 'steps'), newStep);
      
      await setDoc(doc(db, 'roadmaps', data.roadmap_id), {
        updated_at: timestamp,
      }, { merge: true });

      return data.roadmap_id;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      toast({ title: 'Step added!' });
    },
    onError: (error: Error) => {
      console.error('Failed to create step:', error);
      toast({ title: 'Failed to create step', description: error.message, variant: 'destructive' });
    },
  });

  const toggleStepComplete = useMutation({
    mutationFn: async ({ id, roadmap_id, is_completed }: { id: string; roadmap_id: string; is_completed: boolean }) => {
      const timestamp = Timestamp.now();
      const docRef = doc(db, 'steps', id);
      await setDoc(docRef, { 
        is_completed, 
        completed_at: is_completed ? timestamp : null 
      }, { merge: true });

      await setDoc(doc(db, 'roadmaps', roadmap_id), {
        updated_at: timestamp,
      }, { merge: true });

      return roadmap_id;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'roadmaps', id));
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps', user?.uid] });
      if (activeRoadmapId === id) {
        setActiveRoadmapId(null);
      }
      toast({ title: 'Roadmap deleted' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async ({ id, roadmap_id }: { id: string; roadmap_id: string }) => {
      await deleteDoc(doc(db, 'milestones', id));
      const timestamp = Timestamp.now();
      await setDoc(doc(db, 'roadmaps', roadmap_id), {
        updated_at: timestamp,
      }, { merge: true });
      return roadmap_id;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      toast({ title: 'Milestone deleted' });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async ({ id, roadmap_id }: { id: string; roadmap_id: string }) => {
      await deleteDoc(doc(db, 'steps', id));
      const timestamp = Timestamp.now();
      await setDoc(doc(db, 'roadmaps', roadmap_id), {
        updated_at: timestamp,
      }, { merge: true });
      return roadmap_id;
    },
    onSuccess: (roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
      toast({ title: 'Step deleted' });
    },
  });

  return {
    roadmaps: roadmapsQuery.data || [],
    activeRoadmap: activeRoadmapQuery.data || null,
    activeRoadmapId,
    setActiveRoadmap: (roadmap: Roadmap) => setActiveRoadmapId(roadmap.id),
    isLoading: roadmapsQuery.isLoading || activeRoadmapQuery.isLoading,
    isError: roadmapsQuery.isError || activeRoadmapQuery.isError,
    createRoadmap,
    updateRoadmap,
    createMilestone,
    createStep,
    toggleStepComplete,
    deleteRoadmap,
    deleteMilestone,
    deleteStep,
  };
}
