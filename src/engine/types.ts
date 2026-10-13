/**
 * Tipi condivisi: moduli e fonti.
 * Regola di progetto: ogni contenuto ha una fonte nella dispensa (capitolo, paragrafo, Def/Teo/eq., pagina);
 * ciò che non è nella dispensa è marcato come deduzione o fonte esterna, con spiegazione (tests/contenuti.test.ts).
 */

export type ModuleId = 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7' | 'm8';
export type Cap = 1 | 2 | 3 | 4 | 5 | 6;

export type Source =
  /** dispensa: `par` = paragrafo (es. "1.3.3"), `rif` = Def/Teo/Prop/eq. (es. "Teo 1.3.3" o "eq. (1.1)") */
  | { kind: 'dispensa'; cap: Cap; par?: string; rif?: string; page?: number | string }
  | { kind: 'esterna'; ref: string; note: string }
  | { kind: 'deduzione'; da: string; spiegazione: string };

export function sourceLabel(s: Source): string {
  switch (s.kind) {
    case 'dispensa':
      return `Cap. ${s.cap}${s.par ? ` §${s.par}` : ''}${s.rif ? `, ${s.rif}` : ''}${s.page !== undefined ? `, p. ${s.page}` : ''}`;
    case 'esterna':
      return `Fonte esterna: ${s.ref}`;
    case 'deduzione':
      return `Deduzione (da ${s.da})`;
  }
}

/** scorciatoia per le fonti della dispensa */
export const D = (cap: Cap, par?: string, rif?: string, page?: number | string): Source => ({ kind: 'dispensa', cap, par, rif, page });
