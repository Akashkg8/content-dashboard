import { Search } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from '@/features/auth/components/UserMenu';
import { SearchBar, SearchBarFallback } from '@/features/search/components/SearchBar';

import { Brand } from './Brand';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="border-line bg-paper/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-4 md:gap-4 md:px-8">
        <MobileNav />
        <Brand className="mr-2 md:hidden" />
        <div className="hidden flex-1 sm:flex">
          {/* The search bar reads the URL. Suspense keeps the rest of the page prerenderable. */}
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar shortcut />
          </Suspense>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="hover:bg-surface-sunken inline-flex size-10 items-center justify-center rounded-full sm:hidden"
          >
            <Search aria-hidden="true" className="size-5" />
          </Link>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
