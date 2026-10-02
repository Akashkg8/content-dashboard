'use client';

import { Badge } from '@/components/ui/Badge';
import { useT } from '@/i18n/useT';
import type { ContentSource, DataOrigin } from '@/types/content';

import { SOURCE_META } from './sourceStyles';

type Origins = Partial<Record<ContentSource, DataOrigin>>;

/**
 * Honest labelling: when NewsAPI or TMDB keys are missing (or the provider is
 * down), the app serves built-in sample stories and says so. Social posts are
 * always sample data by design, so they never trigger the badge.
 */
export function DataOriginBadge({ origins }: { origins: readonly Origins[] }) {
  const { t } = useT();
  const mocked = (['news', 'movie'] as const).filter((source) =>
    origins.some((origin) => origin[source] === 'mock'),
  );
  if (mocked.length === 0) return null;
  const names = mocked
    .map((source) => t(SOURCE_META[source].pluralKey).toLowerCase())
    .join(t('common.and'));
  return (
    <Badge tone="neutral" title={t('common.demoTitle', { names })}>
      {t('common.demoData')}
      <span className="sr-only">{t('common.demoSr', { names })}</span>
    </Badge>
  );
}
