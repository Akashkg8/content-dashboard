'use client';

import { MotionConfig } from 'motion/react';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '@/i18n';
import { LanguageSync } from '@/i18n/LanguageSync';
import { StoreProvider } from '@/store/StoreProvider';

/**
 * Client-side providers. The theme lives in next-themes, not Redux: it must be
 * applied by an inline script before React hydrates, or dark-mode users see a
 * white flash. `reducedMotion="user"` turns motion animations off for people
 * who ask their OS for less motion.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [i18n] = useState(createI18n);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StoreProvider>
        <I18nextProvider i18n={i18n}>
          <LanguageSync />
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </I18nextProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
