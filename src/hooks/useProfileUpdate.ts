import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/integrations/firebase/config';
import { storage } from '@/integrations/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { doc, updateDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
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

      let newUsername = data.username;

      // Handle auto-generation if username is empty string (cleared by user)
      if (data.username === '') {
        const currentUserRef = doc(db, 'users', user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const currentData = currentUserDoc.data();
        const fullNameToUse = data.fullName || currentData?.fullName || 'User';

        const baseUsername = fullNameToUse
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_-]/g, '');
        
        let generatedUsername = baseUsername;
        let counter = 1;

        // Ensure uniqueness for generated username
        // Note: This might collide if user repeatedly clears username, but we check availability
        while (!(await checkUsername(generatedUsername))) {
           generatedUsername = `${baseUsername}${counter}`;
           counter++;
        }
        newUsername = generatedUsername;
      }

      if (newUsername) {
        // Check if username is different from current
        const currentUserRef = doc(db, 'users', user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        const currentUsername = currentUserDoc.data()?.username;

        if (currentUsername !== newUsername.toLowerCase()) {
          const isAvailable = await checkUsername(newUsername);
          if (!isAvailable) {
            throw new Error('Username is already taken');
          }
        }
      }

      const updateData: Record<string, string | null> = {};
      if (data.fullName) updateData.fullName = data.fullName;
      if (data.nickname) updateData.nickname = data.nickname;
      if (newUsername) updateData.username = newUsername.toLowerCase();
      if (avatarUrl) updateData.avatar_url = avatarUrl;

      if (Object.keys(updateData).length === 0) {
        throw new Error('No data to update');
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date(),
      });

      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['profile', user.uid] });
      queryClient.invalidateQueries({ queryKey: ['user', user.uid] });

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
