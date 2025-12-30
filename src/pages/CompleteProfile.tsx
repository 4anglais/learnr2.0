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

const ICONS = [
  'fas fa-user',
  'fas fa-user-graduate',
  'fas fa-user-tie',
  'fas fa-user-astronaut',
  'fas fa-user-ninja',
  'fas fa-user-secret',
  'fas fa-user-md',
  'fas fa-user-nurse',
  'fas fa-user-robot',
  'fas fa-user-edit',
];

const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-slate-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-500',
];

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { updateProfileData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nickname) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const avatarValue = `${selectedIcon}|${selectedColor}`;
    const { error } = await updateProfileData(fullName, nickname, avatarValue);
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
              <div className="space-y-4">
                <Label>Customize Your Avatar</Label>
                
                <div className="flex justify-center py-4">
                  <div className={cn("h-24 w-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105", selectedColor)}>
                    <i className={cn(selectedIcon, "text-4xl")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Choose Icon</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={cn(
                          "h-10 w-10 rounded-lg border flex items-center justify-center transition-all",
                          selectedIcon === icon 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:border-primary/50 text-muted-foreground"
                        )}
                      >
                        <i className={cn(icon, "text-sm")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Choose Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedColor === color 
                            ? "border-primary scale-110 shadow-md" 
                            : "border-transparent hover:scale-105"
                        )}
                      >
                        <div className={cn("w-full h-full rounded-full", color)} />
                      </button>
                    ))}
                  </div>
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
