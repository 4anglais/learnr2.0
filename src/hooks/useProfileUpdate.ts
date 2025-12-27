import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db, storage } from '@/integrations/firebase/config';
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
  updatedAt?: Date;
  profilePic?: string | null;
}

// Type for data passed into updateProfile
export interface UpdateProfileInput {
  fullName?: string;
  nickname?: string;
  avatar?: File | Blob;
}

// Type for Firestore update data
type UserProfileUpdate = Partial<Pick<UserProfile, 'fullName' | 'nickname' | 'avatar_url'>> & {
  profilePic?: string | null;
  updatedAt: Date;
};

export function useProfileUpdate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      if (!user) throw new Error('Not authenticated');

      let avatarUrl: string | null = null;

      if (data.avatar) {
        try {
          const fileExtension =
            data.avatar instanceof File ? data.avatar.name.split('.').pop() : 'jpg';
          const fileName = `${user.uid}_${Date.now()}.${fileExtension}`;
          const storageRef = ref(storage, `avatars/${fileName}`);

          const metadata = {
            contentType: data.avatar.type || 'image/jpeg',
          };

          const uploadResult = await uploadBytes(storageRef, data.avatar, metadata);
          avatarUrl = await getDownloadURL(uploadResult.ref);

          // Optionally delete old avatar here if you have the old URL
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error('Failed to upload image. Please try again.');
        }
      }

      // Build update data
      const updateData: UserProfileUpdate = {
        updatedAt: new Date(),
      };

      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.nickname !== undefined) updateData.nickname = data.nickname;
      if (avatarUrl !== null) {
        updateData.avatar_url = avatarUrl;
        updateData.profilePic = avatarUrl;
      }

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updateData, { merge: true });

      // Refresh queries
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
      await setDoc(
        userRef,
        {
          avatar_url: null,
          profilePic: null,
          updatedAt: new Date(),
        },
        { merge: true }
      );
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
