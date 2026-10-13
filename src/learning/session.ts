/**
 * Sessione del giorno (principi didattici, impianto di SEIMAFI adattato all'orale):
 *  1. recupero attivo: domande a memoria sui concetti già studiati — prima le schede scadute secondo FSRS
 *     (dalla meno ricordata), poi domande nuove dei concetti studiati più di recente (al massimo 2 per concetto);
 *  2. orale: una domanda d'orale da esporre a voce, scaduta o mai fatta, i cui concetti sono tutti studiati;
 *  3. lezione nuova: il primo concetto non ancora studiato (ordine della dispensa) i cui prerequisiti sono studiati.
 * I concetti facoltativi (NF-07) entrano solo se lo studente li ha attivati nelle impostazioni.
 */
import type { Concept, OralQ, RecallQ } from '../content/types';
import type { AppState } from '../storage/store';
import { dueCards } from './srs';

export interface SessionPlan {
  recall: { concept: Concept; q: RecallQ }[];
  oral?: OralQ;
  lesson?: Concept;
}

/** Ordine di studio: rispetta i prerequisiti e l'ordine dei concetti (che è quello della dispensa). */
export function studyOrder(concepts: Concept[]): Concept[] {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const out: Concept[] = [];
  const seen = new Set<string>();
  const visit = (c: Concept) => {
    if (seen.has(c.id)) return;
    seen.add(c.id);
    for (const p of c.prereq) {
      const pc = byId.get(p);
      if (pc) visit(pc);
    }
    out.push(c);
  };
  concepts.forEach(visit);
  return out;
}

/** Generatore pseudo-casuale deterministico (per test riproducibili). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

export const isStudied = (state: AppState, id: string) => !!state.concepts[id]?.theorySeenAt || !!state.lessons?.[id]?.doneAt;

export function planSession(state: AppState, concepts: Concept[], orals: OralQ[], opts: { recallCount?: number; seed?: number; now?: Date } = {}): SessionPlan {
  const rand = rng(opts.seed ?? Date.now());
  const now = opts.now ?? new Date();
  const pool = concepts.filter((c) => !c.facoltativo || state.settings.facoltativi);
  const studied = pool.filter((c) => isStudied(state, c.id));
  const studiedIds = new Set(studied.map((c) => c.id));
  const seenAt = (id: string) => state.concepts[id]?.theorySeenAt ?? state.lessons?.[id]?.doneAt ?? '';

  // 1. recupero attivo
  const qById = new Map(studied.flatMap((c) => c.recall.map((q) => [q.id, { concept: c, q }] as const)));
  const due = dueCards(state, now, 'q')
    .map((d) => qById.get(d.id.slice(2)))
    .filter((x): x is { concept: Concept; q: RecallQ } => !!x);
  const fresh = [...qById.values()].filter((it) => !state.srs[`q:${it.q.id}`]);
  fresh.sort((a, b) => seenAt(b.concept.id).localeCompare(seenAt(a.concept.id)) || rand() - 0.5);
  const limit = Math.max(opts.recallCount ?? 5, Math.min(due.length, 10));
  const recall: SessionPlan['recall'] = [];
  const perConcept = new Map<string, number>();
  for (const it of [...due, ...fresh]) {
    if (recall.length >= limit) break;
    const n = perConcept.get(it.concept.id) ?? 0;
    if (n >= 2) continue;
    perConcept.set(it.concept.id, n + 1);
    recall.push(it);
  }

  // 2. orale: prima le scadute, poi quelle mai esposte
  const okOral = orals.filter((o) => o.concepts.every((c) => studiedIds.has(c)));
  const dueO = new Set(dueCards(state, now, 'o').map((d) => d.id.slice(2)));
  const doneO = new Set((state.oral ?? []).map((o) => o.qid));
  const oral = okOral.find((o) => dueO.has(o.id)) ?? okOral.find((o) => !doneO.has(o.id));

  // 3. lezione nuova
  const lesson = studyOrder(pool).find((c) => !studiedIds.has(c.id) && c.prereq.every((p) => studiedIds.has(p) || !pool.some((x) => x.id === p)));

  return { recall, oral, lesson };
}
