/**
 * Piano di studio settimanale fino alla data dell'orale (impianto di SEIMAFI; regole = scelte didattiche, deduzione).
 *  - settimane disponibili = da oggi al giorno prima dell'orale (l'ultima può essere parziale, con ore in proporzione
 *    ai giorni); senza data: 8 settimane, segnalato;
 *  - ogni settimana: prima il tempo per i ripassi già programmati da FSRS (stima: 2 min per domanda di richiamo,
 *    10 min per esposizione orale), poi lo studio dei moduli;
 *  - ultima settimana (se ce ne sono almeno 2): metà del tempo alla simulazione d'orale;
 *  - ore per modulo ∝ pagine della dispensa × (1 − padronanza del modulo): le pagine sono la misura più vicina
 *    al peso del modulo, non avendo statistiche sugli orali (ANALISI §3);
 *  - i moduli si susseguono nell'ordine della dispensa (M1 → M8);
 *  - per il modulo in corso si indicano i concetti da fare per primi (non studiati o con padronanza più bassa).
 * Il fabbisogno totale indicativo (100 h per l'intera dispensa) è una stima, usata solo per avvisare se il tempo è poco.
 */
import type { ModuleId } from '../engine/types';
import type { Concept } from '../content/types';
import type { AppState } from '../storage/store';
import { addDays, daysBetween, DAY_MS, parseLocalDate } from './dates';
import { MASTERY_OK, MODULE_ORDER } from './mastery';
import { isStudied } from './session';
import { cardsOf } from './srs';

export const EXAM_WEIGHT: Record<ModuleId, number> = { m1: 14, m2: 21, m3: 30, m4: 21, m5: 12, m6: 27, m7: 17, m8: 16 };
export const TOTAL_HOURS_ESTIMATE = 100;
export const REVIEW_MIN = { q: 2, o: 10 };
const DAY = DAY_MS;

export interface PlanItem {
  module: ModuleId;
  hours: number;
  /** concetti da cui partire (id) */
  focus: string[];
  /** il modulo non ha ancora contenuti nell'app */
  pending: boolean;
}
export interface WeekPlan {
  index: number;
  start: Date;
  end: Date;
  capacity: number; // ore disponibili
  reviewHours: number;
  simulationHours: number;
  items: PlanItem[];
}
export interface StudyPlan {
  weeks: WeekPlan[];
  examDate?: Date;
  assumedWeeks: boolean;
  needByModule: Record<string, number>;
  hoursByModule: Record<string, number>;
  warnings: string[];
  /** ore a settimana che coprirebbero la stima (solo se il tempo è stretto) */
  suggestedHours?: number;
}

/** Minuti di ripasso già programmati per ciascuna settimana (le scadenze arretrate cadono nella prima). */
export function reviewMinutesByWeek(state: AppState, start: Date, weeks: number): number[] {
  const out = Array(weeks).fill(0);
  for (const [id, c] of cardsOf(state)) {
    const w = Math.max(0, Math.floor(daysBetween(start, new Date(c.due)) / 7));
    if (w < weeks) out[w] += id.startsWith('q:') ? REVIEW_MIN.q : REVIEW_MIN.o;
  }
  return out;
}

export function buildPlan(
  state: AppState,
  opts: { now?: Date; masteryByModule: Record<string, number>; conceptsByModule: Record<string, Concept[]>; masteryByConcept: Record<string, number> },
): StudyPlan {
  const now = opts.now ?? new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const warnings: string[] = [];
  const exam = state.settings.examDate ? parseLocalDate(state.settings.examDate) : undefined;
  let nWeeks: number;
  if (exam && exam.getTime() > start.getTime()) nWeeks = Math.max(1, Math.ceil(Math.round((exam.getTime() - start.getTime()) / DAY) / 7)); // giorni arrotondati: l'ora legale non aggiunge una settimana
  else {
    nWeeks = 8;
    if (exam) warnings.push("La data dell'orale è già passata: piano su 8 settimane.");
  }
  const assumedWeeks = !exam;
  const H = Math.max(1, state.settings.hoursPerWeek ?? 8);
  const reviews = reviewMinutesByWeek(state, start, nWeeks).map((m) => m / 60);

  const totalDays = exam && !assumedWeeks && exam.getTime() > start.getTime() ? Math.round((exam.getTime() - start.getTime()) / DAY) : nWeeks * 7;
  const weeks: WeekPlan[] = Array.from({ length: nWeeks }, (_, i) => {
    // l'ultima settimana può essere parziale: finisce il giorno prima dell'esame e ha ore in proporzione
    const days = Math.min(7, totalDays - i * 7);
    const cap = (H * days) / 7;
    const reviewHours = Math.min(cap, reviews[i]);
    const simulationHours = nWeeks >= 2 && i === nWeeks - 1 ? (cap - reviewHours) / 2 : 0;
    return {
      index: i + 1,
      start: addDays(start, i * 7),
      end: addDays(start, i * 7 + days - 1),
      capacity: cap,
      reviewHours,
      simulationHours,
      items: [],
    };
  });
  const free = weeks.map((w) => w.capacity - w.reviewHours - w.simulationHours);
  const totalFree = free.reduce((a, b) => a + b, 0);

  const need: Record<string, number> = {};
  for (const m of MODULE_ORDER) need[m] = EXAM_WEIGHT[m] * (1 - Math.min(1, opts.masteryByModule[m] ?? 0));
  const needSum = Object.values(need).reduce((a, b) => a + b, 0);
  const hoursBy: Record<string, number> = {};
  for (const m of MODULE_ORDER) hoursBy[m] = needSum > 0 ? (totalFree * need[m]) / needSum : 0;

  const estimate = TOTAL_HOURS_ESTIMATE * (needSum / Object.values(EXAM_WEIGHT).reduce((a, b) => a + b, 0));
  // ore di studio libere con h ore a settimana (stesse regole delle settimane qui sopra)
  const freeWith = (h: number) =>
    weeks.reduce((acc, wk, i) => {
      const cap = (h * wk.capacity) / H;
      const rev = Math.min(cap, reviews[i]);
      return acc + cap - rev - (wk.simulationHours > 0 ? (cap - rev) / 2 : 0);
    }, 0);
  let suggestedHours: number | undefined;
  if (totalFree < estimate * 0.8) {
    suggestedHours = H;
    while (suggestedHours < 60 && freeWith(suggestedHours) < estimate) suggestedHours++;
    warnings.push(
      `Tempo stretto: circa ${Math.round(totalFree)} h di studio disponibili contro una stima indicativa di ${Math.round(estimate)} h. ` +
        (suggestedHours > H && freeWith(suggestedHours) >= estimate ? `Con ${suggestedHours} ore a settimana il piano la coprirebbe.` : 'Il tempo resta poco anche con 60 ore a settimana: concentrati sulle domande d\'orale.'),
    );
  }

  // riempimento sequenziale delle settimane nell'ordine dei prerequisiti
  let w = 0;
  let left = free[0] ?? 0;
  for (const m of MODULE_ORDER) {
    let h = hoursBy[m];
    while (h > 1e-9 && w < nWeeks) {
      const take = Math.min(h, left);
      if (take > 1e-9) {
        const prev = weeks[w].items.find((it) => it.module === m);
        if (prev) prev.hours += take;
        else weeks[w].items.push({ module: m, hours: take, focus: [], pending: (opts.conceptsByModule[m] ?? []).length === 0 });
      }
      h -= take;
      left -= take;
      if (left <= 1e-9) {
        w++;
        left = free[w] ?? 0;
      }
    }
  }

  // concetti su cui concentrarsi: per ogni comparsa del modulo, i successivi nell'ordine di studio non ancora padroneggiati
  const cursor: Record<string, number> = {};
  for (const wk of weeks)
    for (const it of wk.items) {
      const list = (opts.conceptsByModule[it.module] ?? []).filter((c) => !isStudied(state, c.id) || (opts.masteryByConcept[c.id] ?? 0) < MASTERY_OK);
      const per = Math.max(1, Math.round(it.hours / 1.5)); // circa un concetto ogni ora e mezza
      const from = cursor[it.module] ?? 0;
      it.focus = list.slice(from, from + per).map((c) => c.id);
      cursor[it.module] = from + per;
    }

  return { weeks, examDate: exam, assumedWeeks, needByModule: need, hoursByModule: hoursBy, warnings, suggestedHours };
}
