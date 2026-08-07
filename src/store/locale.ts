/**
 * UI language, as a Zustand store.
 *
 * It lived in the React Query `me` object, which works for screens but not for
 * navigator layouts — React Navigation caches those, so the tab bar kept its old
 * language after a switch. A Zustand store re-renders every subscriber reliably,
 * including the root layout, which remounts the navigation tree on change.
 *
 * The account's saved locale (PATCH /me) is still the source of truth across
 * devices; this store is synced from it on load and updated alongside it on toggle.
 */

import { getLocales } from 'expo-localization';
import { create } from 'zustand';

import type { Locale } from '@/api/types';

const deviceLocale: Locale = getLocales()[0]?.languageCode === 'ru' ? 'ru' : 'ro';

type LocaleState = {
  locale: Locale;
  setLocale: (l: Locale) => void;
};

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: deviceLocale,
  setLocale: (locale) => set({ locale }),
}));
