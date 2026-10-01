import { Brand } from './Brand';
import { NavLinks } from './NavLinks';

/** Desktop navigation. Hidden below `md`, where `MobileNav` takes over. */
export function Sidebar() {
  return (
    <aside className="border-line sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r px-4 py-6 md:flex">
      <Brand className="px-3" />
      <p className="text-ink-muted mt-2 px-3 font-mono text-[0.6875rem] tracking-[0.2em] uppercase">
        Your personal edition
      </p>
      <nav aria-label="Main" className="mt-10">
        <NavLinks />
      </nav>
      <p className="text-ink-muted mt-auto px-3 font-mono text-[0.6875rem] leading-relaxed">
        News, films and posts,
        <br />
        arranged your way.
      </p>
    </aside>
  );
}
