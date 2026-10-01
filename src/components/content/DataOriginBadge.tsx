import { Badge } from '@/components/ui/Badge';
import type { ContentSource, DataOrigin } from '@/types/content';

import { SOURCE_META } from './sourceStyles';

type Origins = Partial<Record<ContentSource, DataOrigin>>;

/**
 * Honest labelling: when NewsAPI or TMDB keys are missing (or the provider is
 * down), the app serves built-in sample stories and says so. Social posts are
 * always sample data by design, so they never trigger the badge.
 */
export function DataOriginBadge({ origins }: { origins: readonly Origins[] }) {
  const mocked = (['news', 'movie'] as const).filter((source) =>
    origins.some((origin) => origin[source] === 'mock'),
  );
  if (mocked.length === 0) return null;
  const names = mocked.map((source) => SOURCE_META[source].plural.toLowerCase()).join(' and ');
  return (
    <Badge
      tone="neutral"
      title={`Showing built-in sample ${names} because no API key is set or the provider is unavailable.`}
    >
      Demo data
      <span className="sr-only">: showing sample {names}</span>
    </Badge>
  );
}
