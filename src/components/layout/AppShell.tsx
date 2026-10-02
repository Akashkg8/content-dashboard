import { type ReactNode } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SkipLink } from './SkipLink';

export const MAIN_CONTENT_ID = 'main-content';

/** Page frame: skip link, sidebar, sticky header and the main landmark. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID} />
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
