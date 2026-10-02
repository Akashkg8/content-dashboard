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
  {
    labelKey: `sources.${ContentSource}`;
    pluralKey: `sources.${ContentSource}Plural`;
    tone: BadgeTone;
    icon: LucideIcon;
    text: string;
    bg: string;
  }
> = {
  news: {
    labelKey: 'sources.news',
    pluralKey: 'sources.newsPlural',
    tone: 'news',
    icon: Newspaper,
    text: 'text-news',
    bg: 'bg-news',
  },
  movie: {
    labelKey: 'sources.movie',
    pluralKey: 'sources.moviePlural',
    tone: 'movie',
    icon: Film,
    text: 'text-movie',
    bg: 'bg-movie',
  },
  social: {
    labelKey: 'sources.social',
    pluralKey: 'sources.socialPlural',
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
