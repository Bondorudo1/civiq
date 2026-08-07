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
