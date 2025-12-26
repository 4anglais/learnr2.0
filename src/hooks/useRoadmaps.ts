import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  Timestamp,
} from 'firebase/firestore';

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
  createdAt?: string;
  updatedAt?: string;
  milestones?: Milestone[];
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

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to all roadmaps for the user
  useEffect(() => {
    if (!user) {
      setRoadmaps([]);
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'roadmaps'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roadmapsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: convertDate(data.createdAt || data.created_at),
          updatedAt: convertDate(data.updatedAt || data.updated_at),
          // Keep these for backward compatibility if needed by other components
          created_at: convertDate(data.createdAt || data.created_at),
          updated_at: convertDate(data.updatedAt || data.updated_at),
        } as Roadmap;
      });
      
      setRoadmaps(roadmapsData);
      
      // If activeRoadmap is not set yet, or a new roadmap was created, set it to the latest one
      if (roadmapsData.length > 0) {
        const latest = [...roadmapsData].sort((a, b) => 
          new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
        )[0];
        
        setActiveRoadmap(prev => {
          if (!prev) return latest;
          const current = roadmapsData.find(r => r.id === prev.id);
          
          // Only switch automatically if a NEW roadmap was created (different ID and newer createdAt)
          const isNewRoadmap = latest.id !== prev.id && 
            new Date(latest.createdAt || latest.created_at).getTime() > new Date(prev.createdAt || prev.created_at).getTime();

          if (isNewRoadmap) {
            return latest;
          }
          
          return current ? { ...current, milestones: current.milestones || prev.milestones } : latest;
        });
      }
      
      setIsLoading(false);
    }, (error) => {
      console.error('Error listening to roadmaps:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Listen to the active roadmap's milestones and steps
  useEffect(() => {
    if (!user || !activeRoadmap?.id) {
      return;
    }

    const currentRoadmapId = activeRoadmap.id;

    // Listen to milestones
    const milestonesQ = query(
      collection(db, 'milestones'),
      where('roadmap_id', '==', currentRoadmapId),
      orderBy('position', 'asc')
    );

    let unsubSteps: (() => void)[] = [];

    const unsubscribeMilestones = onSnapshot(milestonesQ, (mSnapshot) => {
      // Clean up previous step listeners
      unsubSteps.forEach(unsub => unsub());
      unsubSteps = [];

      const milestonesData = mSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          created_at: convertDate(data.created_at),
        } as Milestone;
      });

      if (milestonesData.length === 0) {
        setActiveRoadmap(prev => prev?.id === currentRoadmapId ? { ...prev, milestones: [] } : prev);
        return;
      }

      const milestoneIds = milestonesData.map(m => m.id);
      const chunks: string[][] = [];
      for (let i = 0; i < milestoneIds.length; i += 10) {
        chunks.push(milestoneIds.slice(i, i + 10));
      }

      const allSteps: Map<string, Step[]> = new Map();

      chunks.forEach((chunk, index) => {
        const stepsQ = query(
          collection(db, 'steps'),
          where('milestone_id', 'in', chunk),
          orderBy('position', 'asc')
        );

        const unsub = onSnapshot(stepsQ, (sSnapshot) => {
          const steps = sSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              created_at: convertDate(data.created_at),
              completed_at: data.completed_at ? convertDate(data.completed_at) : null,
            } as Step;
          });

          allSteps.set(`chunk-${index}`, steps);

          const flattenedSteps = Array.from(allSteps.values()).flat();
          const milestonesWithSteps = milestonesData.map(m => ({
            ...m,
            steps: flattenedSteps.filter(s => s.milestone_id === m.id).sort((a, b) => a.position - b.position),
          }));

          setActiveRoadmap(prev => prev?.id === currentRoadmapId ? { ...prev, milestones: milestonesWithSteps } : prev);
        });
        unsubSteps.push(unsub);
      });
    }, (error) => {
      console.error('Error listening to milestones:', error);
    });

    return () => {
      unsubscribeMilestones();
      unsubSteps.forEach(unsub => unsub());
    };
  }, [user, activeRoadmap?.id]);

  const createRoadmap = useMutation({
    mutationFn: async (data: { title: string; description?: string; duration_weeks?: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const timestamp = Timestamp.now();
      const newRoadmap = {
        ...data,
        user_id: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
        // Also keep snake_case for compatibility if needed
        created_at: timestamp,
        updated_at: timestamp,
        is_completed: false,
      };
      
      const docRef = await addDoc(collection(db, 'roadmaps'), newRoadmap);
      return {
        id: docRef.id,
        ...newRoadmap,
        createdAt: timestamp.toDate().toISOString(),
        updatedAt: timestamp.toDate().toISOString(),
      };
    },
    onSuccess: () => {
      toast({ title: 'Roadmap created!' });
    },
    onError: (error) => {
      console.error('Failed to create roadmap:', error);
      toast({ title: 'Failed to create roadmap', variant: 'destructive' });
    },
  });

  const updateRoadmap = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Roadmap> & { id: string }) => {
      const timestamp = Timestamp.now();
      const docRef = doc(db, 'roadmaps', id);
      
      // Destructure to remove milestones from updates (id is already extracted)
      const { milestones: __, ...cleanUpdates } = updates;
      
      const updateData = {
        ...cleanUpdates,
        updatedAt: timestamp,
        updated_at: timestamp,
      };
      
      await setDoc(docRef, updateData, { merge: true });
    },
    onSuccess: () => {
      toast({ title: 'Roadmap updated' });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: { roadmap_id: string; title: string; description?: string; color?: string; position: number }) => {
      const timestamp = Timestamp.now();
      const newMilestone = {
        ...data,
        createdAt: timestamp,
        created_at: timestamp,
      };
      
      const docRef = await addDoc(collection(db, 'milestones'), newMilestone);
      
      // Update roadmap updatedAt
      await setDoc(doc(db, 'roadmaps', data.roadmap_id), {
        updatedAt: timestamp,
        updated_at: timestamp,
      }, { merge: true });

      return {
        id: docRef.id,
        ...newMilestone,
        createdAt: timestamp.toDate().toISOString(),
      };
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
        title: data.title,
        difficulty: data.difficulty,
        resource_url: data.resource_url,
        position: data.position,
        is_completed: false,
        createdAt: timestamp,
        created_at: timestamp,
      };
      
      const docRef = await addDoc(collection(db, 'steps'), newStep);
      
      // Update roadmap updatedAt
      if (data.roadmap_id) {
        await setDoc(doc(db, 'roadmaps', data.roadmap_id), {
          updatedAt: timestamp,
          updated_at: timestamp,
        }, { merge: true });
      }

      return {
        id: docRef.id,
        ...newStep,
        createdAt: timestamp.toDate().toISOString(),
      };
    },
  });

  const toggleStepComplete = useMutation({
    mutationFn: async ({ id, roadmap_id, is_completed }: { id: string; roadmap_id?: string; is_completed: boolean }) => {
      const timestamp = Timestamp.now();
      const docRef = doc(db, 'steps', id);
      await setDoc(docRef, { 
        is_completed, 
        completed_at: is_completed ? timestamp : null 
      }, { merge: true });

      // Update roadmap updatedAt
      if (roadmap_id) {
        await setDoc(doc(db, 'roadmaps', roadmap_id), {
          updatedAt: timestamp,
          updated_at: timestamp,
        }, { merge: true });
      }
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'roadmaps', id));
    },
    onSuccess: (_, id) => {
      if (activeRoadmap?.id === id) {
        setActiveRoadmap(null);
      }
      toast({ title: 'Roadmap deleted' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async ({ id, roadmap_id }: { id: string; roadmap_id?: string }) => {
      await deleteDoc(doc(db, 'milestones', id));
      if (roadmap_id) {
        const timestamp = Timestamp.now();
        await setDoc(doc(db, 'roadmaps', roadmap_id), {
          updatedAt: timestamp,
          updated_at: timestamp,
        }, { merge: true });
      }
    },
  });

  const deleteStep = useMutation({
    mutationFn: async ({ id, roadmap_id }: { id: string; roadmap_id?: string }) => {
      await deleteDoc(doc(db, 'steps', id));
      if (roadmap_id) {
        const timestamp = Timestamp.now();
        await setDoc(doc(db, 'roadmaps', roadmap_id), {
          updatedAt: timestamp,
          updated_at: timestamp,
        }, { merge: true });
      }
    },
  });

  return {
    roadmaps,
    activeRoadmap,
    setActiveRoadmap,
    isLoading,
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
