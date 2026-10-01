import { useSyncExternalStore } from 'react';

import { useAppSelector } from './hooks';

const noopSubscribe = () => () => {};

/**
 * True once saved state is loaded AND this component is past its hydration
 * render. The second part matters: pages sit inside Suspense boundaries
 * (loading.tsx), so they can hydrate after the store has already loaded
 * localStorage. During hydration React uses the server snapshot (false), so the
 * first client render matches the server HTML; then it re-renders with true.
 */
export function useStoreHydrated(): boolean {
  const pastHydration = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const loaded = useAppSelector((state) => state.app.hydrated);
  return pastHydration && loaded;
}
