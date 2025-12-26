import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth, db } from '@/integrations/firebase/config';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  sendVerificationEmail: () => Promise<{ error: Error | null }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  changeEmail: (currentPassword: string, newEmail: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initializeUser = async (currentUser: User, fullName?: string) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        const name = fullName || currentUser.displayName || 'User';
        const baseUsername = name
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
          nickname: '',
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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile immediately to ensure consistency
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      await initializeUser(userCredential.user, fullName);

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
      const result = await signInWithPopup(auth, provider);
      
      await initializeUser(result.user);

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Google sign in failed') };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to send reset email') };
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }
      await sendEmailVerification(auth.currentUser);
      return { error: null };
    } catch (error) {
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

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, sendVerificationEmail, changePassword, changeEmail }}>
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