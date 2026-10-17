/**
 * Transizioni di stato dell'app (pure): registrano un evento e aggiornano la ripetizione distanziata.
 * La UI chiama solo queste funzioni, così la logica è testabile senza interfaccia.
 */
import type { AppState, OralLog, RecallLog } from '../storage/store';
import { getOral } from '../content/orale';
import { rebuildSrs, scheduleOral, scheduleRecall } from './srs';

const conceptsOfOral = (qid: string) => getOral(qid)?.concepts ?? [];

export function addRecall(s: AppState, r: RecallLog): AppState {
  return scheduleRecall({ ...s, recall: [...s.recall, r] }, r);
}

export function addOral(s: AppState, o: OralLog): AppState {
  return scheduleOral({ ...s, oral: [...(s.oral ?? []), o] }, o, conceptsOfOral(o.qid));
}

/** Dati senza schede (import, prima apertura): le ricostruisce dalla storia. */
export function ensureSrs(s: AppState): AppState {
  const hasHistory = s.recall.length > 0 || (s.oral ?? []).length > 0;
  return hasHistory && Object.keys(s.srs).length === 0 ? rebuildSrs(s, conceptsOfOral) : s;
}

/** Ricalcola le schede FSRS dalla storia (dopo una fusione tra dispositivi). */
export const rebuildAll = (s: AppState): AppState => rebuildSrs(s, conceptsOfOral);

export function markStudied(s: AppState, conceptId: string, ownWords?: string): AppState {
  const prev = s.concepts[conceptId] ?? {};
  return { ...s, concepts: { ...s.concepts, [conceptId]: { ...prev, theorySeenAt: prev.theorySeenAt ?? new Date().toISOString(), ownWords: ownWords ?? prev.ownWords } } };
}

/** Lezione: avanza al passo `step` (non torna indietro); a fine lezione il concetto risulta studiato */
export function lessonStep(s: AppState, conceptId: string, step: number, done = false): AppState {
  const now = new Date().toISOString();
  const prev = s.lessons?.[conceptId] ?? { step: 0, startedAt: now, feedback: {} };
  const next = { ...prev, step: Math.max(prev.step, step), doneAt: prev.doneAt ?? (done ? now : undefined) };
  const out = { ...s, lessons: { ...(s.lessons ?? {}), [conceptId]: next } };
  return done ? markStudied(out, conceptId) : out;
}

