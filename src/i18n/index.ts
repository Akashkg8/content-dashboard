import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { hi } from './locales/hi';

export const LANGUAGES = ['en', 'hi'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Each language's name, written in that language. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', hi: 'हिन्दी' };

export const resources = { en: { translation: en }, hi: { translation: hi } } as const;

/**
 * A fresh i18next instance per app mount, like the Redux store: no state is
 * shared between server requests. Resources are bundled, so init is synchronous
 * and the first render already has every string.
 */
export function createI18n(): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: LANGUAGES,
    initAsync: false,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  return instance;
}
