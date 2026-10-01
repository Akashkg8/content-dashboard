import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { type ReactElement } from 'react';

import { makeStore, type AppStore, type RootState } from '@/store';
import { StoreProvider } from '@/store/StoreProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Render with a real store (and real RTK Query), so tests exercise the same
 * code path as the app. MSW answers the network calls.
 */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState), ...options }: Options = {},
) {
  return {
    store,
    ...render(ui, {
      wrapper: ({ children }) => (
        <ThemeProvider attribute="class">
          <StoreProvider store={store}>{children}</StoreProvider>
        </ThemeProvider>
      ),
      ...options,
    }),
  };
}
