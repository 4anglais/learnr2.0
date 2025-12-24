import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export function ProfileEditCard() {
  const { profile, isLoading } = useProfile();
  const { updateProfile, deleteAvatar, checkUsername } = useProfileUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    username: '',
  });
  const [usernameError, setUsernameError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        username: profile.username || '',
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setSelectedFile(null);
    setUsernameError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, username: value }));
    
    if (value.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    if (value.toLowerCase() === profile?.username?.toLowerCase()) {
      setUsernameError('');
      return;
    }

    const isAvailable = await checkUsername(value);
    if (!isAvailable) {
      setUsernameError('Username is already taken');
    } else {
      setUsernameError('');
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    await updateProfile.mutateAsync({
      fullName: formData.fullName,
      nickname: formData.nickname,
      username: formData.username,
      avatar: selectedFile || undefined,
    });

    setIsEditing(false);
    setAvatarPreview(null);
    setSelectedFile(null);
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
              <Avatar className="h-16 w-16">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{profile?.fullName || 'User'}</p>
                {profile?.nickname && (
                  <p className="text-sm text-muted-foreground">@{profile.nickname}</p>
                )}
                {profile?.username && (
                  <p className="text-xs text-muted-foreground">username: {profile.username}</p>
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
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {avatarPreview && <AvatarImage src={avatarPreview} />}
                  {!avatarPreview && profile?.avatar_url && (
                    <AvatarImage src={profile.avatar_url} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="avatar-input" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </div>
                  </Label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  {(profile?.avatar_url || avatarPreview) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        deleteAvatar.mutate();
                        setAvatarPreview(null);
                      }}
                      disabled={deleteAvatar.isPending}
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
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
                />
                <p className="text-xs text-muted-foreground">
                  How others will see you in the app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username (Unique)</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="john_doe"
                  className={usernameError ? 'border-destructive' : ''}
                />
                {usernameError ? (
                  <p className="text-xs text-destructive">{usernameError}</p>
                ) : formData.username ? (
                  <p className="text-xs text-success">Username available ✓</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    3+ characters, letters, numbers, hyphens, underscores only
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateProfile.isPending || !!usernameError || !formData.fullName.trim()}
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
