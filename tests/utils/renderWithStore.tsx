import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';

import { createI18n } from '@/i18n';
import { LanguageSync } from '@/i18n/LanguageSync';
import { makeStore, type AppStore, type RootState } from '@/store';
import { StoreProvider } from '@/store/StoreProvider';

interface Options extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * Render with a real store (and real RTK Query) and real translations, so
 * tests exercise the same code path as the app. MSW answers the network calls.
 */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState, store = makeStore(preloadedState), ...options }: Options = {},
) {
  const i18n = createI18n();
  return {
    store,
    i18n,
    ...render(ui, {
      wrapper: ({ children }) => (
        <ThemeProvider attribute="class">
          <StoreProvider store={store}>
            <I18nextProvider i18n={i18n}>
              <LanguageSync />
              {children}
            </I18nextProvider>
          </StoreProvider>
        </ThemeProvider>
      ),
      ...options,
    }),
  };
}
