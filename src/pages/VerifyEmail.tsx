import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, signOut, sendVerificationEmail, reloadUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
    } else if (user.emailVerified) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    const { error } = await sendVerificationEmail();
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Verification email sent!');
    }
  };

  const handleCheckVerification = async () => {
    setIsReloading(true);
    await reloadUser();
    setIsReloading(false);
    
    // The useEffect will handle redirect if verified
    if (user?.emailVerified) {
      toast.success('Email verified!');
    } else {
      toast.error('Email not yet verified. Please check your inbox.');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">learnr</h1>
          <p className="text-muted-foreground mt-2">Verify your email address</p>
        </div>

        <Card className="border-border/50 shadow-card text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to <span className="font-semibold text-foreground">{user.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please click the link in the email to verify your account. If you don't see it, check your spam folder.
            </p>
            
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={handleCheckVerification} 
                className="w-full"
                disabled={isReloading}
              >
                {isReloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                I've verified my email
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleResendEmail} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Resend verification email
              </Button>

              {user.email && !user.email.endsWith('@gmail.com') && (
                <Button 
                  variant="secondary" 
                  className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                  onClick={() => navigate('/complete-profile')}
                >
                  Verify later (Non-Gmail)
                </Button>
              )}

              <Button 
                variant="ghost" 
                onClick={() => signOut()} 
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
