import { Search } from 'lucide-react';
import Form from 'next/form';

/**
 * Search box that submits to `/search?q=`. `next/form` turns the submit into a
 * client-side navigation, and the plain form still works before JavaScript loads.
 * Debounced search-as-you-type replaces this in the search task.
 */
export function HeaderSearch() {
  return (
    <Form action="/search" role="search" className="relative w-full max-w-md">
      <label htmlFor="site-search" className="sr-only">
        Search news, movies and posts
      </label>
      <Search
        aria-hidden="true"
        className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
      />
      <input
        id="site-search"
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search news, movies, posts"
        className="border-line bg-surface placeholder:text-ink-muted/80 focus:border-accent h-10 w-full rounded-full border pr-4 pl-10 text-sm transition-colors outline-none focus-visible:outline-none"
      />
    </Form>
  );
}
