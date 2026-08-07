/** Small date helpers (RO copy for now; RU with the i18n pass). */

export function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Bună dimineața';
  if (h >= 12 && h < 18) return 'Bună ziua';
  if (h >= 18 && h < 23) return 'Bună seara';
  return 'Bună noaptea';
}

export function deadlineLabel(iso?: string): string | null {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Închis';
  if (days === 0) return 'Ultima zi';
  if (days === 1) return 'mai e 1 zi';
  return `mai sunt ${days} zile`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'long' });
}

/** Short mono-friendly date, e.g. "12 iul". */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ro-MD', { day: 'numeric', month: 'short' });
}

/** 30-day response window from submission (elapsed / remaining). */
export function responseWindow(createdAt: string, total = 30): { remaining: number; elapsed: number; total: number } {
  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000));
  return { remaining: Math.max(0, total - elapsed), elapsed, total };
}
