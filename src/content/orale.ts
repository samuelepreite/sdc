/** Banca delle domande d'orale (dalla dispensa, più quelle dedotte e marcate come tali). */
import type { OralQ } from './types';
import { M1_ORALE } from './m1/orale';
import { M2_ORALE } from './m2/orale';

export const ALL_ORALI: OralQ[] = [...M1_ORALE, ...M2_ORALE];
const byId = new Map(ALL_ORALI.map((o) => [o.id, o]));
export const getOral = (id: string) => byId.get(id);
export const oralsOfConcept = (c: string) => ALL_ORALI.filter((o) => o.concepts.includes(c));
