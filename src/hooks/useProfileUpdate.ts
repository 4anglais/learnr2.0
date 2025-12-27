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
      avatar?: File | Blob;
    }) => {
      if (!user) throw new Error('Not authenticated');

      let avatarUrl: string | null = null;

      if (data.avatar) {
        try {
          // Use a unique name for each upload to avoid cache issues
          const fileExtension = data.avatar instanceof File ? data.avatar.name.split('.').pop() : 'jpg';
          const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;
          const storageRef = ref(storage, `avatars/${fileName}`);
          
          // Set metadata for the upload
          const metadata = {
            contentType: data.avatar.type || 'image/jpeg',
          };
          
          const uploadResult = await uploadBytes(storageRef, data.avatar, metadata);
          avatarUrl = await getDownloadURL(uploadResult.ref);
          
          // Optionally delete old avatar here if we had the old URL
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      const updateData: any = {};
      
      if (data.fullName !== undefined) {
        updateData.fullName = data.fullName;
      }
      
      if (data.nickname !== undefined) {
        updateData.nickname = data.nickname;
      }
      
      if (avatarUrl !== null) {
        updateData.profilePic = avatarUrl;
        updateData.avatar_url = avatarUrl;
      }

      // Always update the updatedAt timestamp
      updateData.updatedAt = new Date();

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updateData, { merge: true });

      // Invalidate queries to refresh profile data
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      await queryClient.invalidateQueries({ queryKey: ['user', user.uid] });

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
        profilePic: null,
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
