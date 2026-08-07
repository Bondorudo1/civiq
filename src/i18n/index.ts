/**
 * Localisation for CiviQ (Romanian and Russian — Cahul speaks both).
 *
 * Copy lives in per-screen slices rather than one global dictionary: a slice is
 * a plain object of strings and functions, so parameterised copy and Russian's
 * three-way plurals are ordinary code instead of a template mini-language, and
 * two screens can never fight over the same file.
 *
 *   // src/i18n/home.ts
 *   const ro = { hello: (name: string) => `Bună, ${name}` };
 *   export const homeText: Slice<typeof ro> = { ro, ru: { … } };
 *
 *   // in the screen
 *   const t = useT(homeText);
 *   <Text>{t.hello(me.fullName)}</Text>
 *
 * Typing `ru` against `typeof ro` means a missing or misspelled Russian key is
 * a compile error, not a Romanian string leaking into a Russian screen.
 */

import type { Locale } from '@/api/types';
import { useLocaleStore } from '@/store/locale';

/** The same shape in both languages, enforced by the compiler. */
export type Slice<T> = { ro: T; ru: T };

/**
 * The active UI language. Backed by a Zustand store (see src/store/locale.ts)
 * so navigator layouts re-render on change, not just screens.
 */
export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}

/** A screen's copy in the current language. */
export function useT<T>(slice: Slice<T>): T {
  return slice[useLocale()];
}
