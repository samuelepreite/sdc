import type { Concept } from './types';
import { MODULES } from './modules';
import { M1_CONCETTI } from './m1/concetti';
import { M2_CONCETTI } from './m2/concetti';
import { M3_CONCETTI } from './m3/concetti';
import { M4_CONCETTI } from './m4/concetti';
import { M5_CONCETTI } from './m5/concetti';
import { M6_CONCETTI } from './m6/concetti';

/** Tutte le schede, nell'ordine della dispensa. I moduli M2–M8 arrivano una sessione alla volta. */
export const ALL_CONCEPTS: Concept[] = [...M1_CONCETTI, ...M2_CONCETTI, ...M3_CONCETTI, ...M4_CONCETTI, ...M5_CONCETTI, ...M6_CONCETTI];
const conceptById = new Map(ALL_CONCEPTS.map((c) => [c.id, c]));
export const getConcept = (id: string) => conceptById.get(id);
export const conceptsOf = (module: string) => ALL_CONCEPTS.filter((c) => c.module === module);
/** id dei concetti di ogni modulo (per statistiche e piano) */
export const conceptIdsByModule = (): Record<string, string[]> => Object.fromEntries(MODULES.map((m) => [m.id, conceptsOf(m.id).map((c) => c.id)]));
