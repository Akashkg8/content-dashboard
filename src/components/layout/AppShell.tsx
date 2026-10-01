import { type ReactNode } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MAIN_CONTENT_ID = 'main-content';

/** Page frame: skip link, sidebar, sticky header and the main landmark. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="bg-accent text-on-accent sr-only z-50 rounded-full px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none md:px-8 md:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
