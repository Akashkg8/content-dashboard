import { Search } from 'lucide-react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

import { Brand } from './Brand';
import { HeaderSearch } from './HeaderSearch';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="border-line bg-paper/85 sticky top-0 z-30 border-b backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-4 md:gap-4 md:px-8">
        <MobileNav />
        <Brand className="mr-2 md:hidden" />
        <div className="hidden flex-1 sm:flex">
          <HeaderSearch />
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
          {/* Account menu with sign-in arrives in the auth task. */}
          <Link
            href="/profile"
            aria-label="Your profile"
            className="border-line-strong bg-surface font-display text-ink hover:border-accent ml-1 inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold italic transition-colors"
          >
            G
          </Link>
        </div>
      </div>
    </header>
  );
}
