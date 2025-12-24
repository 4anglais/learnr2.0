import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailPassword } from '@/hooks/useEmailPassword';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, Mail } from 'lucide-react';

export function AccountSecurityCard() {
  const { user } = useAuth();
  const { requestEmailVerification, updatePassword, updateEmail, isLoading } = useEmailPassword();
  
  const [activeTab, setActiveTab] = useState<'email' | 'password'>('email');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: '',
  });

  const handleRequestVerification = async () => {
    const success = await requestEmailVerification();
    if (success) {
      setEmailVerificationSent(true);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return;
    }

    const success = await updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleEmailChange = async () => {
    const success = await updateEmail(
      emailForm.currentPassword,
      emailForm.newEmail
    );

    if (success) {
      setEmailForm({
        newEmail: '',
        currentPassword: '',
      });
      setActiveTab('password');
    }
  };

  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Account Security
        </CardTitle>
        <CardDescription>
          Manage your account security settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Verification
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Current email: <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {user?.emailVerified ? (
                <span className="text-green-600">✓ Email verified</span>
              ) : (
                <span className="text-amber-600">Email not verified</span>
              )}
            </p>
            {!user?.emailVerified && (
              <Button
                onClick={handleRequestVerification}
                disabled={isLoading || emailVerificationSent}
                className="mt-3 w-full"
              >
                {emailVerificationSent
                  ? 'Verification email sent'
                  : 'Send Verification Email'}
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Change Password
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your new password"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm your new password"
                />
                {passwordForm.newPassword &&
                  passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={
                  isLoading ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-foreground mb-4">
              Change Email
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  placeholder="Enter your new email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-password">Current Password</Label>
                <Input
                  id="email-password"
                  type="password"
                  value={emailForm.currentPassword}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                />
                <p className="text-xs text-muted-foreground">
                  For security, we need to verify your password
                </p>
              </div>

              <Button
                onClick={handleEmailChange}
                disabled={
                  isLoading ||
                  !emailForm.newEmail ||
                  !emailForm.currentPassword
                }
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Email'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
