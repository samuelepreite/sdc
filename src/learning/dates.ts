/**
 * Date di calendario nel fuso dello studente. Un giorno non dura sempre 24 h (ora legale): i conti sui giorni
 * si fanno sulle mezzanotti locali, mai sommando 86 400 000 ms.
 */
export const DAY_MS = 86400000;

/** mezzanotte locale di d più n giorni di calendario */
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** giorni di calendario dalla data di a a quella di b (negativo se b viene prima) */
export const daysBetween = (a: Date, b: Date) => Math.round((addDays(b, 0).getTime() - addDays(a, 0).getTime()) / DAY_MS);

/** «yyyy-mm-dd» → mezzanotte locale (new Date('yyyy-mm-dd') darebbe la mezzanotte UTC) */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
