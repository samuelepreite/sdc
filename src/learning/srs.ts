/**
 * Ripetizione distanziata con FSRS (libreria ts-fsrs, licenza MIT), dietro un'interfaccia nostra:
 * il resto dell'app usa solo `review`, `dueCards`, `retrievability`, `forecast`. Per passare a SM-2
 * basterebbe riscrivere questo file.
 *
 * Schede: ogni domanda di richiamo (`q:<id>`) e ogni domanda d'orale esposta a voce (`o:<id>`).
 * Parametri: ritenzione richiesta 0.9 (default FSRS), senza «fuzz» (intervalli riproducibili) e senza passi
 * di apprendimento a breve termine (l'unità di tempo dell'app è il giorno). Una scheda con voto Again viene
 * riprogrammata al giorno dopo (FSRS darebbe 1–2 giorni): gli errori tornano il prima possibile.
 *
 * Mappatura sui voti FSRS: V/F e scelta multipla giusta → Good, sbagliata → Again; aperta: voto 1–4 → Again/Hard/Good/Easy.
 * Esposizione orale («spiegalo a voce»): quota di punti della scaletta toccati < 50 % → Again, < 75 % → Hard,
 * < 100 % → Good, tutti → Easy. Le domande dentro le lezioni (`lezione:`) e le previsioni (`previsione:`) non vengono
 * programmate (servono a costruire il concetto, non a tornare).
 */
import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';
import type { AppState, OralLog, RecallLog } from '../storage/store';
import { daysBetween } from './dates';

export const SRS_PARAMS = generatorParameters({ request_retention: 0.9, enable_fuzz: false, enable_short_term: false });
const scheduler = fsrs(SRS_PARAMS);

/** Scheda serializzabile in JSON (date come stringhe ISO). */
export interface StoredCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
  /** concetti a cui la scheda appartiene (per la padronanza e la dashboard) */
  concepts: string[];
  /** ultimo voto dato */
  lastGrade?: number;
}

export type CardId = `q:${string}` | `o:${string}`;

const toCard = (s: StoredCard): Card => ({
  due: new Date(s.due),
  stability: s.stability,
  difficulty: s.difficulty,
  elapsed_days: s.elapsed_days,
  scheduled_days: s.scheduled_days,
  learning_steps: s.learning_steps,
  reps: s.reps,
  lapses: s.lapses,
  state: s.state as State,
  last_review: s.last_review ? new Date(s.last_review) : undefined,
});
const fromCard = (c: Card, concepts: string[], grade?: number): StoredCard => ({
  due: c.due.toISOString(),
  stability: c.stability,
  difficulty: c.difficulty,
  elapsed_days: c.elapsed_days,
  scheduled_days: c.scheduled_days,
  learning_steps: c.learning_steps,
  reps: c.reps,
  lapses: c.lapses,
  state: c.state,
  last_review: c.last_review?.toISOString(),
  concepts,
  lastGrade: grade,
});

/** voto di un'esposizione orale dalla quota di punti della scaletta toccati */
export function gradeOral(o: Pick<OralLog, 'points' | 'total'>): Grade {
  const q = o.total ? o.points.length / o.total : 0;
  return q < 0.5 ? Rating.Again : q < 0.75 ? Rating.Hard : q < 1 ? Rating.Good : Rating.Easy;
}

export function gradeRecall(r: Pick<RecallLog, 'correct' | 'grade'>): Grade {
  if (r.grade) return ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as Grade[])[r.grade - 1];
  return r.correct ? Rating.Good : Rating.Again;
}

/** Aggiorna (o crea) la scheda dopo un ripasso. */
export function review(prev: StoredCard | undefined, grade: Grade, now: Date, concepts: string[]): StoredCard {
  const card = prev ? toCard(prev) : createEmptyCard(now);
  const next = scheduler.next(card, now, grade).card;
  if (grade === Rating.Again) {
    // un errore torna il giorno dopo (la stabilità resta quella calcolata da FSRS)
    next.due = new Date(now.getTime() + 86400000);
    next.scheduled_days = 1;
  }
  return fromCard(next, concepts, grade);
}

/** Probabilità di ricordare ora (0–1); 0 per una scheda mai ripassata. */
export function retrievability(c: StoredCard | undefined, now: Date): number {
  if (!c || !c.last_review) return 0;
  return scheduler.get_retrievability(toCard(c), now, false);
}

/** Applica allo stato un'esposizione orale (dopo che è stata registrata). */
export function scheduleOral(state: AppState, o: OralLog, concepts: string[]): AppState {
  const id: CardId = `o:${o.qid}`;
  return { ...state, srs: { ...state.srs, [id]: review(state.srs[id] as StoredCard | undefined, gradeOral(o), new Date(o.at), concepts) } };
}

/**
 * Richiami registrati nello storico ma non programmati: le previsioni («prevedi, poi verifica») si fanno una volta sola,
 * le domande dentro le lezioni guidate servono a costruire il concetto (il ripasso usa le domande della scheda).
 */
export const UNSCHEDULED_PREFIX = 'previsione:';
export const UNSCHEDULED_PREFIXES = [UNSCHEDULED_PREFIX, 'lezione:'];
export const isUnscheduled = (qid: string) => UNSCHEDULED_PREFIXES.some((p) => qid.startsWith(p));

export function scheduleRecall(state: AppState, r: RecallLog): AppState {
  if (isUnscheduled(r.qid)) return state;
  const id: CardId = `q:${r.qid}`;
  return { ...state, srs: { ...state.srs, [id]: review(state.srs[id] as StoredCard | undefined, gradeRecall(r), new Date(r.at), [r.conceptId]) } };
}

export const cardsOf = (state: AppState) => Object.entries(state.srs) as [CardId, StoredCard][];

/** Schede scadute a `now`, dalla meno ricordata. */
export function dueCards(state: AppState, now: Date, kind?: 'q' | 'o'): { id: CardId; card: StoredCard; r: number }[] {
  return cardsOf(state)
    .filter(([id, c]) => (!kind || id.startsWith(kind + ':')) && new Date(c.due) <= now)
    .map(([id, card]) => ({ id, card, r: retrievability(card, now) }))
    .sort((x, y) => x.r - y.r);
}

/** Numero di schede in scadenza per ciascuno dei prossimi `days` giorni (il giorno 0 comprende le arretrate). */
export function forecast(state: AppState, now: Date, days = 7): number[] {
  const out = Array(days).fill(0);
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  for (const [, c] of cardsOf(state)) {
    const d = daysBetween(start, new Date(c.due));
    const i = Math.max(0, d);
    if (i < days) out[i]++;
  }
  return out;
}

/** Ritenibilità prevista alla data `when` (es. il giorno dell'esame) se la scheda non viene più ripassata. */
export function retrievabilityAt(c: StoredCard, when: Date): number {
  return retrievability(c, when);
}

/** Ricostruisce tutte le schede dalla storia (dopo una fusione tra dispositivi o un import). */
export function rebuildSrs(state: AppState, conceptsOfOral: (qid: string) => string[]): AppState {
  const events: ({ at: string } & ({ kind: 'o'; o: OralLog } | { kind: 'r'; r: RecallLog }))[] = [
    ...(state.oral ?? []).map((o) => ({ at: o.at, kind: 'o' as const, o })),
    ...state.recall.map((r) => ({ at: r.at, kind: 'r' as const, r })),
  ].sort((x, y) => x.at.localeCompare(y.at));
  let s: AppState = { ...state, srs: {} };
  for (const e of events) s = e.kind === 'o' ? scheduleOral(s, e.o, conceptsOfOral(e.o.qid)) : scheduleRecall(s, e.r);
  return s;
}

export { Rating, State };
