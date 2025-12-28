import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string;
}

export function UserAvatar({ avatarUrl, displayName, className }: UserAvatarProps) {
  const isIcon = avatarUrl?.startsWith('fas ') || avatarUrl?.startsWith('fab ') || avatarUrl?.startsWith('far ');
  
  const initials = displayName
    ?.split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  return (
    <Avatar className={cn(className)}>
      {avatarUrl && !isIcon && <AvatarImage src={avatarUrl} alt={displayName || 'User'} />}
      <AvatarFallback className={cn("bg-primary text-primary-foreground font-medium")}>
        {isIcon ? (
          <i className={cn(avatarUrl, "text-[1.2em]")} />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  );
}
