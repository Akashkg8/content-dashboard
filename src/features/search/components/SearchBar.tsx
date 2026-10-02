'use client';

import { Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useDebounce } from '@/hooks/useDebounce';
import { useT } from '@/i18n/useT';

export const SEARCH_DEBOUNCE_MS = 400;
export const MIN_QUERY_LENGTH = 2;

const searchHref = (query: string) =>
  query ? `/search?q=${encodeURIComponent(query)}` : '/search';

/**
 * Search-as-you-type. The query lives in the URL (`/search?q=`), so results
 * are shareable and back/forward work. Typing is debounced so we do not fire a
 * request per keystroke. Press "/" anywhere to jump here.
 */
export function SearchBar({
  inputId = 'site-search',
  shortcut = false,
}: {
  inputId?: string;
  /** Focus this box when "/" is pressed. Only one search bar on a page should claim it. */
  shortcut?: boolean;
}) {
  const router = useRouter();
  const { t } = useT();
  const pathname = usePathname();
  const urlQuery = useSearchParams().get('q') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(urlQuery);
  // Follow the URL when it changes from outside (back button, a link, a suggestion chip).
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setValue(urlQuery);
  }

  const debounced = useDebounce(value.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debounced === urlQuery.trim()) return;
    const onSearchPage = pathname === '/search';
    if (debounced.length >= MIN_QUERY_LENGTH) {
      // Replace while refining on the results page, so Back leaves search in one step.
      if (onSearchPage) router.replace(searchHref(debounced));
      else router.push(searchHref(debounced));
    } else if (debounced === '' && onSearchPage) {
      router.replace('/search');
    }
    // Only react to the user's typing, not to URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcut]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (query.length >= MIN_QUERY_LENGTH) router.push(searchHref(query));
  };

  return (
    <form role="search" onSubmit={onSubmit} className="relative w-full max-w-md">
      <label htmlFor={inputId} className="sr-only">
        {t('search.label')}
      </label>
      <Search
        aria-hidden="true"
        className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
      />
      <input
        ref={inputRef}
        id={inputId}
        name="q"
        type="search"
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.preventDefault();
            setValue('');
          }
        }}
        placeholder={t('search.placeholder')}
        aria-keyshortcuts={shortcut ? '/' : undefined}
        className="border-line bg-surface placeholder:text-ink-muted/80 focus:border-accent h-10 w-full rounded-full border pr-10 pl-10 text-sm transition-colors outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label={t('search.clear')}
          onClick={() => {
            setValue('');
            inputRef.current?.focus();
          }}
          className="text-ink-muted hover:text-ink hover:bg-surface-sunken absolute top-1/2 right-2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : shortcut ? (
        <kbd
          aria-hidden="true"
          className="border-line-strong text-ink-muted pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border px-1.5 font-mono text-[0.6875rem] md:block"
        >
          /
        </kbd>
      ) : null}
    </form>
  );
}

/** Same look, no behaviour. Rendered on the server until search params are available. */
export function SearchBarFallback() {
  return (
    <div
      className="border-line bg-surface h-10 w-full max-w-md rounded-full border"
      aria-hidden="true"
    />
  );
}
