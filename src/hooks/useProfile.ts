import { useQuery } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  fullName: string | null;
  nickname: string | null;
  username: string | null;
  avatar_url: string | null;
  createdAt: string;
  updatedAt: string;
}

const convertDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (typeof date.toDate === 'function') return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export function useProfile() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      
      return {
        id: user.uid,
        user_id: user.uid,
        email: user.email,
        fullName: data?.fullName || user.displayName || null,
        nickname: data?.nickname || null,
        username: data?.username || null,
        avatar_url: data?.avatar_url || user.photoURL || null,
        createdAt: convertDate(data?.createdAt),
        updatedAt: convertDate(data?.updatedAt),
      } as Profile;
    },
    enabled: !!user,
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
  };
}