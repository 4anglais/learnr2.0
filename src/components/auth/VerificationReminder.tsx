import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { AlertCircle, Loader2 } from 'lucide-react';

export function VerificationReminder() {
  const { user, sendVerificationEmail } = useAuth();
  const [isOpen, setIsOpen] = useState(() => {
    // Don't show if already dismissed in this session
    return !sessionStorage.getItem('verification_reminder_dismissed');
  });
  const [isLoading, setIsLoading] = useState(false);

  // Only show if user is logged in, not verified, and it's a password provider
  const shouldShow = user && !user.emailVerified && user.providerData.some(p => p.providerId === 'password');

  if (!shouldShow) return null;

  const handleLater = () => {
    sessionStorage.setItem('verification_reminder_dismissed', 'true');
    setIsOpen(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    const { error } = await sendVerificationEmail();
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Verification email sent!');
      handleLater(); // Mark as dismissed since they just requested an email
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Verify Your Email
          </DialogTitle>
          <DialogDescription>
            Your email address <span className="font-semibold">{user?.email}</span> is not yet verified. 
            Please verify your email to ensure you can recover your account and receive important updates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleLater}>
            Later
          </Button>
          <Button onClick={handleResend} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Resend Verification Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
