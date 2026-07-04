'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  dictionaries,
  LOCALES,
  LOCALE_META,
  type Locale,
} from './i18n-dictionaries';

const STORAGE_KEY = 'careeros-lang';
const DEFAULT_LOCALE: Locale = 'ru';

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** The full dictionary for the active locale (typed). */
  t: (typeof dictionaries)[Locale];
  locales: typeof LOCALES;
  meta: typeof LOCALE_META;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // SSR + first client render use DEFAULT_LOCALE (keeps hydration stable);
  // the stored/browser preference is applied after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    let next: Locale | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLocale(stored)) next = stored;
    } catch {
      /* ignore */
    }
    if (!next) {
      const browser = navigator.language?.slice(0, 2);
      if (isLocale(browser)) next = browser;
    }
    if (next && next !== locale) setLocaleState(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
      locales: LOCALES,
      meta: LOCALE_META,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
