'use client';

import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';

import { hydrated } from './actions';
import { makeStore, type AppStore } from './index';
import { loadState, saveState, selectPersisted } from './persistence';

export function StoreProvider({ children, store }: { children: ReactNode; store?: AppStore }) {
  // Lazy state initializer: the store is created once per mount, never shared between requests.
  const [appStore] = useState(() => store ?? makeStore());

  useEffect(() => {
    // Load saved state after the first render so server and client HTML match.
    appStore.dispatch(hydrated(loadState()));
    // Saves are debounced. Flush immediately if the tab is closed or hidden mid-debounce.
    const flush = () => saveState(selectPersisted(appStore.getState()));
    window.addEventListener('pagehide', flush);
    // Refetch on window focus and reconnect.
    const unsubscribe = setupListeners(appStore.dispatch);
    return () => {
      window.removeEventListener('pagehide', flush);
      unsubscribe();
    };
  }, [appStore]);

  return <Provider store={appStore}>{children}</Provider>;
}
