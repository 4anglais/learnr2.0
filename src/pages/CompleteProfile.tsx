import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const AVATAR_OPTIONS = [
  'fas fa-user|bg-blue-500',
  'fas fa-user-graduate|bg-green-500',
  'fas fa-user-tie|bg-indigo-500',
  'fas fa-user-astronaut|bg-purple-500',
  'fas fa-user-ninja|bg-rose-500',
  'fas fa-user-secret|bg-slate-500',
  'fas fa-user-md|bg-emerald-500',
  'fas fa-user-nurse|bg-sky-500',
  'fas fa-user-robot|bg-violet-500',
  'fas fa-user-edit|bg-amber-500',
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { updateProfileData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(AVATAR_OPTIONS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nickname) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfileData(fullName, nickname, selectedAvatar || undefined);
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile completed!');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">learnr</h1>
          <p className="text-muted-foreground mt-2">Finish setting up your account</p>
        </div>

        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Tell us a bit more about yourself to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label>Choose Your Avatar</Label>
                <div className="grid grid-cols-5 gap-4 py-2">
                  {AVATAR_OPTIONS.map((avatarValue) => {
                    const [iconClass, bgColor] = avatarValue.split('|');
                    return (
                      <button
                        key={avatarValue}
                        type="button"
                        onClick={() => setSelectedAvatar(avatarValue)}
                        className={cn(
                          "relative h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
                          selectedAvatar === avatarValue 
                            ? "border-primary scale-110 shadow-lg" 
                            : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <div className={cn("w-full h-full rounded-full flex items-center justify-center text-white", bgColor)}>
                          <i className={cn(iconClass, "text-lg")} />
                        </div>
                        {selectedAvatar === avatarValue && (
                          <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5 border-2 border-background">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Johnny"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
