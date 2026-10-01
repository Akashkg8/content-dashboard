import { z } from 'zod';

import { CATEGORIES, SOURCES } from '@/types/content';

/** Runtime mirror of `ContentItem`, for data we did not create ourselves (localStorage). */
export const contentItemSchema = z.object({
  id: z.string().min(1).max(300),
  source: z.enum(SOURCES),
  category: z.enum(CATEGORIES),
  title: z.string().max(500),
  description: z.string().max(5000),
  imageUrl: z.url({ protocol: /^https$/ }).nullable(),
  url: z.url({ protocol: /^https$/ }),
  ctaLabel: z.enum(['Read More', 'Play Now', 'View Post']),
  publishedAt: z.string(),
  author: z.string().max(200),
  popularity: z.number(),
  genreIds: z.array(z.number().int()).optional(),
  hashtags: z.array(z.string()).optional(),
});
