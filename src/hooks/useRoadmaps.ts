import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  updateDoc, 
  deleteDoc, 
  doc, 
  limit,
  Timestamp,
  documentId
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
  milestones?: Milestone[];
}

const convertDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (typeof date.toDate === 'function') return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export function useRoadmaps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roadmaps = [], isLoading } = useQuery({
    queryKey: ['roadmaps', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, 'roadmaps'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: convertDate(doc.data().created_at),
        updated_at: convertDate(doc.data().updated_at),
      })) as Roadmap[];
    },
    enabled: !!user,
  });

  const { data: activeRoadmap } = useQuery({
    queryKey: ['activeRoadmap', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch most recent roadmap
      const q = query(
        collection(db, 'roadmaps'),
        where('user_id', '==', user.uid),
        orderBy('updated_at', 'desc'),
        limit(1)
      );
      
      const roadmapSnapshot = await getDocs(q);
      if (roadmapSnapshot.empty) return null;
      
      const roadmapDoc = roadmapSnapshot.docs[0];
      const roadmapData = {
        id: roadmapDoc.id,
        ...roadmapDoc.data(),
        created_at: convertDate(roadmapDoc.data().created_at),
        updated_at: convertDate(roadmapDoc.data().updated_at),
      } as Roadmap;

      // Fetch milestones
      const milestonesQuery = query(
        collection(db, 'milestones'),
        where('roadmap_id', '==', roadmapData.id),
        orderBy('position', 'asc')
      );
      
      const milestonesSnapshot = await getDocs(milestonesQuery);
      const milestonesData = milestonesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: convertDate(doc.data().created_at),
      })) as Milestone[];

      // Fetch steps for all milestones
      const milestoneIds = milestonesData.map(m => m.id);
      let stepsData: Step[] = [];
      
      if (milestoneIds.length > 0) {
        // Firestore 'in' query supports max 10 values
        const chunks = [];
        for (let i = 0; i < milestoneIds.length; i += 10) {
          chunks.push(milestoneIds.slice(i, i + 10));
        }

        const stepsPromises = chunks.map(chunk => {
          const stepsQuery = query(
            collection(db, 'steps'),
            where('milestone_id', 'in', chunk),
            orderBy('position', 'asc')
          );
          return getDocs(stepsQuery);
        });

        const stepsSnapshots = await Promise.all(stepsPromises);
        
        stepsSnapshots.forEach(snapshot => {
          const steps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: convertDate(doc.data().created_at),
            completed_at: doc.data().completed_at ? convertDate(doc.data().completed_at) : null,
          })) as Step[];
          stepsData = [...stepsData, ...steps];
        });
        
        // Sort all steps by position just in case (though we sorted in query)
        stepsData.sort((a, b) => a.position - b.position);
      }

      // Combine data
      const milestones: Milestone[] = milestonesData.map(m => ({
        ...m,
        steps: stepsData.filter(s => s.milestone_id === m.id),
      }));

      return { ...roadmapData, milestones };
    },
    enabled: !!user,
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
      return {
        id: docRef.id,
        ...newRoadmap,
        created_at: timestamp.toDate().toISOString(),
        updated_at: timestamp.toDate().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      toast({ title: 'Roadmap created!' });
    },
    onError: (error) => {
      console.error('Failed to create roadmap:', error);
      toast({ title: 'Failed to create roadmap', variant: 'destructive' });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (data: { roadmap_id: string; title: string; description?: string; color?: string; position: number }) => {
      const timestamp = Timestamp.now();
      const newMilestone = {
        ...data,
        created_at: timestamp,
      };
      
      const docRef = await addDoc(collection(db, 'milestones'), newMilestone);
      return {
        id: docRef.id,
        ...newMilestone,
        created_at: timestamp.toDate().toISOString(),
      };
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
      const timestamp = Timestamp.now();
      const newStep = {
        ...data,
        is_completed: false,
        created_at: timestamp,
      };
      
      const docRef = await addDoc(collection(db, 'steps'), newStep);
      return {
        id: docRef.id,
        ...newStep,
        created_at: timestamp.toDate().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const toggleStepComplete = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const docRef = doc(db, 'steps', id);
      await updateDoc(docRef, { 
        is_completed, 
        completed_at: is_completed ? new Date() : null 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const deleteRoadmap = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'roadmaps', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
      toast({ title: 'Roadmap deleted' });
    },
  });

  const deleteMilestone = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'milestones', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
    },
  });

  const deleteStep = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'steps', id));
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
