'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '@/store/hooks';
import { useStoreHydrated } from '@/store/useStoreHydrated';

/** Applies the saved language to i18next and to `<html lang>` once saved state has loaded. */
export function LanguageSync() {
  const { i18n } = useTranslation();
  const language = useAppSelector((state) => state.preferences.language);
  const hydrated = useStoreHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (i18n.language !== language) void i18n.changeLanguage(language);
    // Screen readers pick their pronunciation from the document language.
    document.documentElement.lang = language;
  }, [hydrated, language, i18n]);

  return null;
}
