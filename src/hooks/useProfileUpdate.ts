import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { storage } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  nickname: string;
  username: string;
  avatar_url: string | null;
  createdAt: string;
}

export function useProfileUpdate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const checkUsernameAvailability = useQuery({
    queryKey: ['checkUsername'],
    queryFn: () => Promise.resolve(null),
    enabled: false,
  });

  const checkUsername = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;
    
    const q = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const updateProfile = useMutation({
    mutationFn: async (data: {
      fullName?: string;
      nickname?: string;
      username?: string;
      avatar?: File;
    }) => {
      if (!user) throw new Error('Not authenticated');

      let avatarUrl: string | null = null;

      if (data.avatar) {
        try {
          const storageRef = ref(storage, `avatars/${user.uid}`);
          await uploadBytes(storageRef, data.avatar);
          avatarUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload image');
        }
      }

      if (data.username) {
        const isAvailable = await checkUsername(data.username);
        if (!isAvailable) {
          throw new Error('Username is already taken');
        }
      }

      const updateData: Record<string, string | null> = {};
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.nickname) updateData.nickname = data.nickname;
      if (data.username) updateData.username = data.username.toLowerCase();
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No data to update');
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date(),
      });

      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    },
  });

  const deleteAvatar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      try {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting avatar:', error);
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        avatar_url: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Avatar removed');
    },
    onError: () => {
      toast.error('Failed to remove avatar');
    },
  });

  return {
    updateProfile,
    deleteAvatar,
    checkUsername,
  };
}
