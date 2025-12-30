import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();

  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const isProfileComplete = profile?.fullName && profile?.nickname;
  const isCompletingProfile = location.pathname === '/complete-profile';
  const isVerifyingEmail = location.pathname === '/verify-email';
  const isGmail = user.email?.endsWith('@gmail.com');

  // For new users (no complete profile), enforce email verification ONLY for Gmail users
  // Non-Gmail users (iCloud, etc.) can skip this step via the "Verify later" button
  if (!user.emailVerified && !isProfileComplete && !isVerifyingEmail && isGmail) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!isProfileComplete && !isCompletingProfile && !isVerifyingEmail) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (isProfileComplete && isCompletingProfile) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
