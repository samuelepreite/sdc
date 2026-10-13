/**
 * Padronanza per concetto (scelte didattiche, deduzione: non vengono dalla dispensa; impianto di SEIMAFI).
 *
 * - padronanza = rendimento × ricordo. Il rendimento è la media mobile esponenziale (α = 0.35) degli esiti, in ordine
 *   cronologico, a partire da 0; il ricordo è la ritenibilità media FSRS delle schede del concetto già ripassate
 *   (1 se non ce ne sono ancora). Così la padronanza cala con il tempo se il concetto non viene ripassato.
 * - esiti: domanda di richiamo 1/0 (aperte: voto/4, peso 0.5); esposizione orale = quota di punti della scaletta
 *   toccati (peso 1, conta per tutti i concetti della domanda); lezione finita = 0.3 con peso 0.5 (un inizio).
 * - nessun blocco tra moduli: all'orale si porta tutto; l'ordine di studio lo dà il grafo dei prerequisiti.
 */
import type { ModuleId } from '../engine/types';
import type { AppState } from '../storage/store';
import { getOral } from '../content/orale';
import { cardsOf, retrievability } from './srs';

export const ALPHA = 0.35;

interface Ev {
  at: string;
  score: number;
  weight: number;
}

export interface ConceptMastery {
  perf: number;
  recall: number;
  mastery: number;
  cards: number;
}

export function performanceByConcept(state: AppState): Record<string, number> {
  const events: Record<string, Ev[]> = {};
  const push = (c: string, e: Ev) => (events[c] ??= []).push(e);
  for (const r of state.recall) {
    if (r.qid.startsWith('previsione:')) continue;
    push(r.conceptId, { at: r.at, score: r.grade ? r.grade / 4 : r.correct ? 1 : 0, weight: r.qid.startsWith('lezione:') ? 0.3 : 0.5 });
  }
  for (const o of state.oral ?? []) for (const c of getOral(o.qid)?.concepts ?? []) push(c, { at: o.at, score: o.total ? o.points.length / o.total : 0, weight: 1 });
  for (const [c, l] of Object.entries(state.lessons ?? {})) if (l.doneAt) push(c, { at: l.doneAt, score: 0.3, weight: 0.5 });
  const out: Record<string, number> = {};
  for (const [c, evs] of Object.entries(events)) {
    evs.sort((x, y) => x.at.localeCompare(y.at));
    let m = 0;
    for (const e of evs) m += Math.min(1, ALPHA * e.weight) * (e.score - m);
    out[c] = m;
  }
  return out;
}

export function masteryDetail(state: AppState, now: Date = new Date()): Record<string, ConceptMastery> {
  const perf = performanceByConcept(state);
  const rs: Record<string, number[]> = {};
  for (const [, c] of cardsOf(state)) {
    if (!c.last_review) continue;
    const r = retrievability(c, now);
    for (const k of c.concepts) (rs[k] ??= []).push(r);
  }
  const out: Record<string, ConceptMastery> = {};
  for (const [k, p] of Object.entries(perf)) {
    const list = rs[k] ?? [];
    const rec = list.length ? list.reduce((a, b) => a + b, 0) / list.length : 1;
    out[k] = { perf: p, recall: rec, mastery: p * rec, cards: list.length };
  }
  return out;
}

export function masteryByConcept(state: AppState, now: Date = new Date()): Record<string, number> {
  return Object.fromEntries(Object.entries(masteryDetail(state, now)).map(([k, v]) => [k, v.mastery]));
}

export const MODULE_ORDER: ModuleId[] = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
/** soglia di «concetto padroneggiato» (scelta didattica) */
export const MASTERY_OK = 0.7;

/** Padronanza media del modulo (i concetti mai esercitati contano 0). */
export function moduleMastery(mastery: Record<string, number>, conceptsByModule: Record<string, string[]>): Record<string, number> {
  return Object.fromEntries(Object.entries(conceptsByModule).map(([m, cs]) => [m, cs.length ? cs.reduce((s, c) => s + (mastery[c] ?? 0), 0) / cs.length : 0]));
}
