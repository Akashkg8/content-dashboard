import {
  Clapperboard,
  Cpu,
  Film,
  FlaskConical,
  HeartPulse,
  MessageCircle,
  Newspaper,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import type { BadgeTone } from '@/components/ui/Badge';
import type { Category, ContentSource } from '@/types/content';

export const SOURCE_META: Record<
  ContentSource,
  { label: string; plural: string; tone: BadgeTone; icon: LucideIcon; text: string; bg: string }
> = {
  news: {
    label: 'News',
    plural: 'News',
    tone: 'news',
    icon: Newspaper,
    text: 'text-news',
    bg: 'bg-news',
  },
  movie: {
    label: 'Movie',
    plural: 'Movies',
    tone: 'movie',
    icon: Film,
    text: 'text-movie',
    bg: 'bg-movie',
  },
  social: {
    label: 'Post',
    plural: 'Posts',
    tone: 'social',
    icon: MessageCircle,
    text: 'text-social',
    bg: 'bg-social',
  },
};

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  technology: Cpu,
  business: TrendingUp,
  sports: Trophy,
  entertainment: Clapperboard,
  health: HeartPulse,
  science: FlaskConical,
};
