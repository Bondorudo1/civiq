/**
 * The API identifies complaints by UUID only — there is no registry number in the
 * contract. We show a short, stable slice of the real id so a citizen has something
 * quotable at the counter, without inventing a number the backend can't resolve.
 */
export function shortRef(id: string): string {
  return `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
