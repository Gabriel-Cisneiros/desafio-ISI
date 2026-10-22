import { cn } from 'cn';
import { getInitials } from '@/lib/format';

const COLORS = [
  'bg-avatar-zinc text-avatar-zinc-foreground',
  'bg-avatar-pink text-avatar-pink-foreground',
  'bg-avatar-violet text-avatar-violet-foreground',
  'bg-avatar-cyan text-avatar-cyan-foreground',
  'bg-avatar-teal text-avatar-teal-foreground',
];

interface PlayerAvatarProps {
  id: number;
  name: string;
  size?: 'sm' | 'lg';
}

export function PlayerAvatar({ id, name, size = 'sm' }: PlayerAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium',
        size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm',
        COLORS[id % COLORS.length],
      )}
    >
      {getInitials(name)}
    </span>
  );
}
