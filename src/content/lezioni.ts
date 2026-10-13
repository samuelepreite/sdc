/** Tutte le lezioni guidate, una per concetto, nell'ordine della dispensa. */
import type { Lesson } from './types';
import { M1_LEZIONI } from './m1/lezioni';
import { M2_LEZIONI } from './m2/lezioni';
import { M3_LEZIONI } from './m3/lezioni';
import { M4_LEZIONI } from './m4/lezioni';
import { M5_LEZIONI } from './m5/lezioni';

export const ALL_LESSONS: Lesson[] = [...M1_LEZIONI, ...M2_LEZIONI, ...M3_LEZIONI, ...M4_LEZIONI, ...M5_LEZIONI];
const byConcept = new Map(ALL_LESSONS.map((l) => [l.concept, l]));
export const getLesson = (conceptId: string) => byConcept.get(conceptId);
/** id della domanda di una lezione nello storico dei richiami (non entra nel ripasso FSRS) */
export const lessonQid = (stepQid: string) => `lezione:${stepQid}`;
