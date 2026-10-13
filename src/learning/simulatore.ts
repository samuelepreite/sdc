/**
 * Simulatore d'orale (Fase 3): sceglie un'interrogazione di n domande miste. Regole (scelte didattiche, deduzione):
 *  - domande su moduli diversi finché possibile, nell'ordine della dispensa;
 *  - priorità alle domande mai esposte e a quelle sui concetti con padronanza più bassa;
 *  - con n ≥ 4 almeno una domanda di collegamento o trabocchetto; le altre espositive (quelle della dispensa);
 *  - concetti facoltativi esclusi, salvo impostazione; ambito «studiati» = solo concetti già studiati (se ce ne sono abbastanza).
 */
import type { AppState } from '../storage/store';
import type { OralQ, Concept } from '../content/types';
import { rng } from './session';

export interface ExamOpts {
  n: number;
  seed: number;
  scope: 'tutti' | 'studiati';
  mastery: Record<string, number>;
  studied: (id: string) => boolean;
  facoltativi: boolean;
}

export function pickExam(state: AppState, orals: OralQ[], concepts: Concept[], o: ExamOpts): OralQ[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const done = new Set((state.oral ?? []).map((x) => x.qid));
  const okConcept = (id: string) => {
    const c = byId.get(id);
    if (!c) return false;
    if (c.facoltativo && !o.facoltativi) return false;
    return true;
  };
  let pool = orals.filter((q) => q.concepts.every(okConcept));
  if (o.scope === 'studiati') {
    const st = pool.filter((q) => q.concepts.every((c) => o.studied(c)));
    if (st.length >= o.n) pool = st;
  }
  const r = rng(o.seed);
  const modOf = (q: OralQ) => byId.get(q.concepts[0])?.module ?? 'm0';
  const score = (q: OralQ) => {
    const m = Math.min(...q.concepts.map((c) => o.mastery[c] ?? 0));
    return (done.has(q.id) ? 1 : 0) + m + 0.35 * r();
  };
  const sorted = [...pool].sort((a, b) => score(a) - score(b));
  const out: OralQ[] = [];
  const used = new Set<string>();
  const wantOther = o.n >= 4;
  if (wantOther) {
    const other = sorted.find((q) => q.kind !== 'espositiva');
    if (other) {
      out.push(other);
      used.add(modOf(other));
    }
  }
  for (const q of sorted) {
    if (out.length >= o.n) break;
    if (out.includes(q) || q.kind !== 'espositiva' || used.has(modOf(q))) continue;
    out.push(q);
    used.add(modOf(q));
  }
  for (const q of sorted) {
    if (out.length >= o.n) break;
    if (!out.includes(q) && q.kind === 'espositiva') out.push(q);
  }
  for (const q of sorted) {
    if (out.length >= o.n) break;
    if (!out.includes(q)) out.push(q);
  }
  return out.sort((a, b) => modOf(a).localeCompare(modOf(b)));
}

/** esito dell'interrogazione: quota di punti della scaletta e un giudizio indicativo (scelta didattica, non un voto d'esame) */
export function examReport(results: { q: OralQ; points: number; total: number; seconds: number }[]) {
  const share = results.length ? results.reduce((s, x) => s + (x.total ? x.points / x.total : 0), 0) / results.length : 0;
  const giudizio = share >= 0.85 ? 'pronto: esposizioni complete' : share >= 0.65 ? 'quasi: completa i punti mancanti' : share >= 0.45 ? 'incerto: ripassa le lezioni collegate' : 'da preparare: riparti dalle lezioni';
  return { share, giudizio, seconds: results.reduce((s, x) => s + x.seconds, 0) };
}
