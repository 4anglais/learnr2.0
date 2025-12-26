import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { storage } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, setDoc } from 'firebase/firestore';
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

  const updateProfile = useMutation({
    mutationFn: async (data: {
      fullName?: string;
      nickname?: string;
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

      const updateData: Record<string, any> = {};
      
      // Always include fullName if provided
      if (data.fullName !== undefined) {
        updateData.fullName = data.fullName;
      }
      
      // Always include nickname if provided (can be empty string)
      if (data.nickname !== undefined) {
        updateData.nickname = data.nickname;
      }
      
      // Include avatar_url if a new avatar was uploaded
      if (avatarUrl !== null) {
        updateData.avatar_url = avatarUrl;
      }

      // Only update if we have fields to update (besides updatedAt)
      if (Object.keys(updateData).length === 0) {
        // If no fields to update but avatar was attempted, throw error
        if (data.avatar) {
          throw new Error('Failed to process avatar upload');
        }
        throw new Error('No data to update');
      }

      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updateData, { merge: true });

      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user.uid] });
      queryClient.invalidateQueries({ queryKey: ['user', user.uid] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Profile update error:', error);
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
      await setDoc(userRef, {
        avatar_url: null,
        updatedAt: new Date(),
      }, { merge: true });
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
  };
}
