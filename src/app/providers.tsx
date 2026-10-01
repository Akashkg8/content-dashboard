'use client';

import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

/**
 * Client-side providers. The theme lives in next-themes, not Redux: it must be
 * applied by an inline script before React hydrates, or dark-mode users see a
 * white flash. The Redux StoreProvider joins this tree in the store task.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
