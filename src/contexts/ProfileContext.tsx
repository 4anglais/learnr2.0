import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';

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

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const convertDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (date instanceof Timestamp) return date.toDate().toISOString();
  if (typeof date.toDate === 'function') return date.toDate().toISOString();
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return new Date().toISOString();
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      queryClient.clear();
      return;
    }

    setIsLoading(true);
    const userRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProfile({
          id: user.uid,
          user_id: user.uid,
          email: user.email,
          fullName: data?.fullName || null,
          nickname: data?.nickname || null,
          username: data?.username || null,
          avatar_url: data?.avatar_url || null,
          createdAt: convertDate(data?.createdAt),
          updatedAt: convertDate(data?.updatedAt),
        } as Profile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error('Error listening to profile:', err);
      setError(err as Error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
