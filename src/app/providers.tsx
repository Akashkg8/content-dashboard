'use client';

import { MotionConfig } from 'motion/react';
import { ThemeProvider } from 'next-themes';
import { type ReactNode } from 'react';

import { StoreProvider } from '@/store/StoreProvider';

/**
 * Client-side providers. The theme lives in next-themes, not Redux: it must be
 * applied by an inline script before React hydrates, or dark-mode users see a
 * white flash. `reducedMotion="user"` turns motion animations off for people
 * who ask their OS for less motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StoreProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </StoreProvider>
    </ThemeProvider>
  );
}
