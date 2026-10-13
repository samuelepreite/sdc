/** Banca delle domande d'orale (dalla dispensa, più quelle dedotte e marcate come tali). */
import type { OralQ } from './types';
import { M1_ORALE } from './m1/orale';
import { M2_ORALE } from './m2/orale';
import { M3_ORALE } from './m3/orale';
import { M4_ORALE } from './m4/orale';
import { M5_ORALE } from './m5/orale';
import { M6_ORALE } from './m6/orale';
import { M7_ORALE } from './m7/orale';
import { M8_ORALE } from './m8/orale';

export const ALL_ORALI: OralQ[] = [...M1_ORALE, ...M2_ORALE, ...M3_ORALE, ...M4_ORALE, ...M5_ORALE, ...M6_ORALE, ...M7_ORALE, ...M8_ORALE];
const byId = new Map(ALL_ORALI.map((o) => [o.id, o]));
export const getOral = (id: string) => byId.get(id);
export const oralsOfConcept = (c: string) => ALL_ORALI.filter((o) => o.concepts.includes(c));
