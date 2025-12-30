import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, updateProfile, deleteUser } from 'firebase/auth';
import { auth, db } from '@/integrations/firebase/config';
import { doc, setDoc, getDoc, query, collection, where, getDocs, deleteDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  sendVerificationEmail: () => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  updateProfileData: (fullName: string, nickname: string, avatarUrl?: string) => Promise<{ error: Error | null }>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  const initializeUser = async (currentUser: User, fullName?: string, nickname?: string) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const name = fullName || currentUser.displayName || null;
        const userNickname = nickname || null;
        const baseUsername = (name || 'user')
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_-]/g, '');
        let username = baseUsername;
        let counter = 1;

        const checkUsernameExists = async (testUsername: string) => {
          const q = query(
            collection(db, 'users'),
            where('username', '==', testUsername)
          );
          const snapshot = await getDocs(q);
          return !snapshot.empty;
        };

        while (await checkUsernameExists(username)) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          fullName: name,
          nickname: userNickname,
          username,
          avatar_url: currentUser.photoURL || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true });
      } else {
        // If document exists, still ensure basic fields are there
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          updatedAt: new Date(),
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        await initializeUser(currentUser);
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign up failed') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Sign in failed') };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      
      await initializeUser(result.user);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  };

  const signOut = async () => {
    // Clear dismissal flag on sign out so they see it again next login
    sessionStorage.removeItem('verification_reminder_dismissed');
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Attempting to send password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email request successful');
      return { error: null };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { error: error instanceof Error ? error : new Error('Failed to send reset email') };
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        console.warn('Attempted to send verification email but no user is logged in');
        throw new Error('No user logged in');
      }
      console.log('Attempting to send verification email to:', auth.currentUser.email);
      await sendEmailVerification(auth.currentUser);
      console.log('Verification email request successful');
      return { error: null };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { error: error instanceof Error ? error : new Error('Failed to send verification email') };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user logged in');
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to change password') };
    }
  };

  const changeEmail = async (currentPassword: string, newEmail: string) => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No user logged in');
      }

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        email: newEmail,
      }, { merge: true });

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to change email') };
    }
  };

  const deleteAccount = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const uid = currentUser.uid;
      const isGoogleUser = currentUser.providerData.some(
        (provider) => provider.providerId === 'google.com'
      );

      // Re-authenticate if necessary
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        // For Google users, we try to reauthenticate with a popup
        // This is often required for sensitive operations like account deletion
        try {
          await reauthenticateWithCredential(currentUser, GoogleAuthProvider.credentialFromResult(await signInWithPopup(auth, provider))!);
        } catch (reauthError: unknown) {
          // If popup is blocked or fails, we might need the UI to handle it, 
          // but for now we'll try this direct approach.
          console.error('Google reauth failed:', reauthError);
          const error = reauthError as { code?: string; message?: string };
          if (error.code === 'auth/requires-recent-login') {
             throw new Error('Please sign out and sign back in to delete your account.');
          }
          throw reauthError;
        }
      }

      // Delete user data from Firestore first
      // In a real app, you might want to delete tasks and categories too
      // or use a Cloud Function to clean up everything
      await deleteDoc(doc(db, 'users', uid));
      
      // Delete user in Firebase Auth
      await deleteUser(currentUser);

      return { error: null };
    } catch (error) {
      console.error('Error during account deletion:', error);
      return { error: error instanceof Error ? error : new Error('Failed to delete account') };
    }
  };
  
  const updateProfileData = async (fullName: string, nickname: string, avatarUrl?: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: fullName,
        photoURL: avatarUrl?.startsWith('fas ') ? null : avatarUrl // Don't put icon class in Firebase photoURL
      });

      // Update Firestore document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        fullName,
        nickname,
        avatar_url: avatarUrl,
        profilePic: avatarUrl,
        updatedAt: new Date(),
      }, { merge: true });

      return { error: null };
    } catch (error) {
      console.error('Error updating profile data:', error);
      return { error: error instanceof Error ? error : new Error('Failed to update profile') };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, sendVerificationEmail, changePassword, changeEmail, deleteAccount, updateProfileData, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}