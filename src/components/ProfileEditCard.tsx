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
import { ImageCropper } from './ImageCropper';

export function ProfileEditCard() {
  const { profile, isLoading } = useProfile();
  const { updateProfile, deleteAvatar } = useProfileUpdate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

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
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    setSelectedFile(null);
    setCroppedBlob(null);
    setCropImage(null);
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

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be selected again if canceled
    e.target.value = '';
  };

  const onCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
    setCropImage(null);
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || '',
        avatar: croppedBlob || undefined,
      });

      setIsEditing(false);
      setAvatarPreview(null);
      setSelectedFile(null);
      setCroppedBlob(null);
    } catch (error) {
      // Error is handled by the mutation's onError callback
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
    <>
      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={onCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
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
                      {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                    </div>
                  </Label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={updateProfile.isPending}
                  />
                  {(profile?.avatar_url || avatarPreview) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await deleteAvatar.mutateAsync();
                          setAvatarPreview(null);
                        } catch (err) {
                          console.error("Error deleting avatar:", err);
                        }
                      }}
                      disabled={deleteAvatar.isPending || updateProfile.isPending}
                    >
                      {deleteAvatar.isPending ? (
                        'Removing...'
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Remove
                        </>
                      )}
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
    </>
  );
}
