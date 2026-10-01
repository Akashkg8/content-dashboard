import { cn } from '@/lib/utils';

import { initialsOf, type AvatarColor } from '../authSlice';

/** Fixed palette, each checked for readable white or ink initials. */
export const AVATAR_STYLES: Record<AvatarColor, string> = {
  vermilion: 'bg-[#b93a0a] text-[#fffcf5]',
  ink: 'bg-[#1c1a16] text-[#f5f0e6] dark:bg-[#f2ece0] dark:text-[#1c1a16]',
  forest: 'bg-[#04694b] text-[#fffcf5]',
  ocean: 'bg-[#1e48c4] text-[#fffcf5]',
  plum: 'bg-[#7a2e6e] text-[#fffcf5]',
  mustard: 'bg-[#eab657] text-[#1c1a16]',
};

export function Avatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string;
  color: AvatarColor;
  size?: 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'font-display inline-flex shrink-0 items-center justify-center rounded-full font-semibold italic',
        size === 'md' ? 'size-9 text-sm' : 'size-20 text-3xl',
        AVATAR_STYLES[color],
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
