'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { IconButton } from './IconButton';

/**
 * Switches between light and dark. Both icons are always rendered and CSS picks
 * the visible one from the `.dark` class, so the server HTML matches the client
 * and there is no hydration mismatch or flash before the theme is known.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <IconButton
      label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      icon={
        <>
          <Moon className="size-5 dark:hidden" />
          <Sun className="hidden size-5 dark:block" />
        </>
      }
    />
  );
}
