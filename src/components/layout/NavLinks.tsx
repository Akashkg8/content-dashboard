'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { selectFavoriteCount } from '@/features/favorites/selectors';
import { useT } from '@/i18n/useT';
import { isActivePath, NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';

export interface NavLinksProps {
  /** Called after a link is chosen. The mobile drawer uses it to close itself. */
  onNavigate?: () => void;
}

export function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const { t } = useT();
  const hydrated = useStoreHydrated();
  const favoriteCount = useAppSelector(selectFavoriteCount);
  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors',
                active
                  ? 'bg-surface text-ink shadow-card'
                  : 'text-ink-muted hover:bg-surface/60 hover:text-ink',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'bg-accent absolute top-2 bottom-2 left-0 w-0.5 rounded-full transition-opacity',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon
                aria-hidden="true"
                className={cn('size-[1.125rem]', active ? 'text-accent' : 'text-current')}
              />
              {t(labelKey)}
              {href === '/favorites' && hydrated && favoriteCount > 0 ? (
                <span className="bg-accent text-on-accent ml-auto rounded-full px-2 py-0.5 font-mono text-[0.6875rem] font-medium">
                  {favoriteCount}
                  <span className="sr-only"> {t('nav.saved')}</span>
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
