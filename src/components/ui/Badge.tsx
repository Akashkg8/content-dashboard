import { type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'accent' | 'news' | 'movie' | 'social';

const TONES: Record<BadgeTone, string> = {
  neutral: 'text-ink-muted border-line-strong',
  accent: 'text-accent border-accent/40 bg-accent-soft',
  news: 'text-news border-news/40',
  movie: 'text-movie border-movie/40',
  social: 'text-social border-social/40',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/** Small mono label in the style of a newspaper section marker. */
export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5',
        'font-mono text-[0.6875rem] font-medium tracking-wider uppercase',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
