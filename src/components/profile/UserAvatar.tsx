import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  className?: string;
}

export function UserAvatar({ avatarUrl, displayName, className }: UserAvatarProps) {
  const [iconClass, bgColor] = (avatarUrl || '').split('|');
  const isIcon = iconClass.startsWith('fas ') || iconClass.startsWith('fab ') || iconClass.startsWith('far ');
  
  const initials = displayName
    ?.split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'U';

  return (
    <Avatar className={cn(className)}>
      {avatarUrl && !isIcon && <AvatarImage src={avatarUrl} alt={displayName || 'User'} />}
      <AvatarFallback className={cn(bgColor || "bg-primary", "text-white font-medium")}>
        {isIcon ? (
          <i className={cn(iconClass, "text-[1.2em]")} />
        ) : (
          initials
        )}
      </AvatarFallback>
    </Avatar>
  );
}
