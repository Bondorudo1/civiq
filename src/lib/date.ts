/**
 * Date helpers. Anything with words takes a locale, because Russian inflects the
 * noun by count ("1 день / 2 дня / 5 дней") where Romanian only needs the
 * article — a template string can't cover both.
 */

import type { Locale } from '@/api/types';

const INTL: Record<Locale, string> = { ro: 'ro-MD', ru: 'ru-MD' };

export function greeting(loc: Locale = 'ro'): string {
  const h = new Date().getHours();
  const slot = h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'day' : h >= 18 && h < 23 ? 'evening' : 'night';
  const words = {
    ro: { morning: 'Bună dimineața', day: 'Bună ziua', evening: 'Bună seara', night: 'Bună noaptea' },
    ru: { morning: 'Доброе утро', day: 'Добрый день', evening: 'Добрый вечер', night: 'Доброй ночи' },
  } as const;
  return words[loc][slot];
}

/**
 * Russian plural category for a count: 1 день, 2–4 дня, 5–20 дней.
 * Exported because several screens count days, complaints and messages.
 */
export function ruPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

/** "5 дней" / "5 zile" — the count with its correctly inflected noun. */
export function days(n: number, loc: Locale): string {
  return loc === 'ru' ? `${n} ${ruPlural(n, 'день', 'дня', 'дней')}` : `${n} ${n === 1 ? 'zi' : 'zile'}`;
}

export function deadlineLabel(iso?: string, loc: Locale = 'ro'): string | null {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (loc === 'ru') {
    if (d < 0) return 'Закрыто';
    if (d === 0) return 'Последний день';
    return `осталось ${days(d, 'ru')}`;
  }
  if (d < 0) return 'Închis';
  if (d === 0) return 'Ultima zi';
  return d === 1 ? 'mai e 1 zi' : `mai sunt ${d} zile`;
}

export function formatDate(iso: string, loc: Locale = 'ro'): string {
  return new Date(iso).toLocaleDateString(INTL[loc], { day: 'numeric', month: 'long' });
}

/** Short mono-friendly date, e.g. "12 iul" / "12 июл". */
export function shortDate(iso: string, loc: Locale = 'ro'): string {
  return new Date(iso).toLocaleDateString(INTL[loc], { day: 'numeric', month: 'short' });
}

/** 30-day response window from submission (elapsed / remaining). */
export function responseWindow(createdAt: string, total = 30): { remaining: number; elapsed: number; total: number } {
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
  return { remaining: Math.max(0, total - elapsed), elapsed, total };
}
