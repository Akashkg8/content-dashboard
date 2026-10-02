'use client';

import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

const noopSubscribe = () => () => {};

/**
 * `t()` that renders English during hydration. The server always renders
 * English (it cannot read localStorage), so the first client render must too,
 * or React reports a mismatch. Right after hydration, components re-render in
 * the saved language.
 */
export function useT() {
  const { t, i18n } = useTranslation();
  const pastHydration = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const fixedT = pastHydration ? t : i18n.getFixedT('en');
  return { t: fixedT as typeof t, language: pastHydration ? i18n.language : 'en' };
}
