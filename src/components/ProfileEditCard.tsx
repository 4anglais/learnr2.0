import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Check } from 'lucide-react';
import { UserAvatar } from './profile/UserAvatar';
import { cn } from '@/lib/utils';

const AVATAR_OPTIONS = [
  'fas fa-user',
  'fas fa-user-graduate',
  'fas fa-user-tie',
  'fas fa-user-astronaut',
  'fas fa-user-ninja',
];

export function ProfileEditCard() {
  const { profile, isLoading } = useProfile();
  const { updateProfile } = useProfileUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const initials = profile?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';

  const handleEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        nickname: profile.nickname || '',
      });
      setSelectedAvatar(profile.avatar_url);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedAvatar(null);
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      return;
    }

    try {
      await updateProfile.mutateAsync({
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || '',
        avatar: selectedAvatar || '',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Edit your profile information' : 'Your personal information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div className="flex items-center gap-4">
              <UserAvatar 
                avatarUrl={profile?.avatar_url} 
                displayName={profile?.fullName} 
                className="h-16 w-16" 
              />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{profile?.fullName || 'User'}</p>
                {profile?.nickname && (
                  <p className="text-sm text-muted-foreground">@{profile.nickname}</p>
                )}
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full">
              Edit Profile
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Choose Avatar</Label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_OPTIONS.map((iconClass) => (
                    <button
                      key={iconClass}
                      type="button"
                      onClick={() => setSelectedAvatar(iconClass)}
                      className={cn(
                        "relative h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
                        selectedAvatar === iconClass 
                          ? "border-primary bg-primary text-primary-foreground scale-110" 
                          : "border-border bg-muted text-muted-foreground"
                      )}
                    >
                      <i className={cn(iconClass, "text-lg")} />
                      {selectedAvatar === iconClass && (
                        <div className="absolute -top-1 -right-1 bg-background text-primary rounded-full border border-primary p-0.5">
                          <Check className="h-2 w-2" />
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(null)}
                    className={cn(
                      "relative h-12 w-12 rounded-full border-2 border-dashed flex items-center justify-center transition-all hover:scale-110",
                      selectedAvatar === null 
                        ? "border-primary bg-primary/10 text-primary scale-110" 
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <span className="text-[10px] font-bold">NONE</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                  placeholder="John Doe"
                  disabled={updateProfile.isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Display Name)</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nickname: e.target.value }))
                  }
                  placeholder="Your nickname"
                  disabled={updateProfile.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  How others will see you in the app
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending || !formData.fullName.trim()}
                className="flex-1"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
