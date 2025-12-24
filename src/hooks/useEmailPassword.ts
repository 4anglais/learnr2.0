import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

export function useEmailPassword() {
  const { sendVerificationEmail, changePassword, changeEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const requestEmailVerification = async () => {
    setIsLoading(true);
    const { error } = await sendVerificationEmail();
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success('Verification email sent. Please check your inbox.');
    return true;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return false;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return false;
    }

    setIsLoading(true);
    const { error } = await changePassword(currentPassword, newPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('wrong-password')) {
        toast.error('Current password is incorrect');
      } else {
        toast.error(error.message);
      }
      return false;
    }

    toast.success('Password changed successfully');
    return true;
  };

  const updateEmail = async (currentPassword: string, newEmail: string) => {
    if (!currentPassword || !newEmail) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    setIsLoading(true);
    const { error } = await changeEmail(currentPassword, newEmail);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('wrong-password')) {
        toast.error('Current password is incorrect');
      } else if (error.message.includes('email-already-in-use')) {
        toast.error('This email is already in use');
      } else {
        toast.error(error.message);
      }
      return false;
    }

    toast.success('Email changed successfully');
    return true;
  };

  return {
    requestEmailVerification,
    updatePassword,
    updateEmail,
    isLoading,
  };
}
