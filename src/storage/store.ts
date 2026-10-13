/**
 * Persistenza locale (nessun backend): localStorage con chiave versionata + export/import JSON.
 * Lo schema è versionato: `migrate` porta i dati vecchi alla versione corrente.
 * (Impianto ripreso da SEIMAFI; tolti matricola, esercizi e prove scritte, che qui non esistono.)
 */

export const STORAGE_KEY = 'sdc:v1';
export const SCHEMA_VERSION = 1;
export const APP_ID = 'sdc';

export interface Settings {
  examDate?: string; // ISO yyyy-mm-dd
  /** ore di studio disponibili a settimana (piano di studio) */
  hoursPerWeek: number;
  /** includi nel piano e nelle sessioni i concetti facoltativi (NF-07) */
  facoltativi?: boolean;
}

export interface RecallLog {
  qid: string;
  conceptId: string;
  at: string;
  correct: boolean;
  /** autovalutazione per le domande aperte: 1 non ricordavo, 2 parziale, 3 bene, 4 facilissimo */
  grade?: 1 | 2 | 3 | 4;
}

export interface ConceptState {
  /** scheda letta per intero (o lezione finita) */
  theorySeenAt?: string;
  /** spiegazione con parole proprie (elaborazione) */
  ownWords?: string;
}

/** Giudizio dello studente su un passo di una lezione guidata (serve a tarare le lezioni). */
export type StepFeedback = 'chiaro' | 'veloce' | 'lento' | 'confuso';
export interface LessonState {
  /** indice del passo più avanzato raggiunto */
  step: number;
  startedAt: string;
  doneAt?: string;
  /** stepId → giudizio (l'ultimo dato vince) */
  feedback: Record<string, { v: StepFeedback; note?: string; at: string }>;
}

/** Esposizione orale autovalutata («spiegalo a voce»): punti della scaletta toccati. */
export interface OralLog {
  qid: string;
  at: string;
  /** indici dei punti della scaletta toccati */
  points: number[];
  total: number;
  /** secondi impiegati */
  seconds?: number;
}

export interface AppState {
  version: number;
  settings: Settings;
  recall: RecallLog[];
  concepts: Record<string, ConceptState>;
  /** schede della ripetizione distanziata: id → stato serializzato della scheda */
  srs: Record<string, unknown>;
  /** metadati per la sincronizzazione tra dispositivi (storage/sync.ts) */
  meta?: { settingsAt?: string; resetAt?: string };
  /** lezioni guidate: conceptId → avanzamento e giudizi sui passi */
  lessons: Record<string, LessonState>;
  /** esposizioni orali autovalutate */
  oral: OralLog[];
}

export const defaultState = (): AppState => ({
  version: SCHEMA_VERSION,
  settings: { hoursPerWeek: 10 },
  recall: [],
  concepts: {},
  srs: {},
  meta: {},
  lessons: {},
  oral: [],
});

export function migrate(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  if (typeof r.version !== 'number' || r.version > SCHEMA_VERSION) throw new Error("File non riconosciuto o creato da una versione più recente dell'app.");
  return {
    version: SCHEMA_VERSION,
    settings: { ...base.settings, ...(r.settings ?? {}) },
    recall: Array.isArray(r.recall) ? r.recall : [],
    concepts: r.concepts && typeof r.concepts === 'object' ? r.concepts : {},
    srs: r.srs && typeof r.srs === 'object' ? r.srs : {},
    meta: r.meta && typeof r.meta === 'object' ? r.meta : {},
    lessons: r.lessons && typeof r.lessons === 'object' ? r.lessons : {},
    oral: Array.isArray(r.oral) ? r.oral : [],
  };
}

export function load(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): AppState {
  try {
    const txt = storage?.getItem(STORAGE_KEY);
    return txt ? migrate(JSON.parse(txt)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function save(state: AppState, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportJSON(state: AppState): string {
  return JSON.stringify({ app: APP_ID, exportedAt: new Date().toISOString(), ...state }, null, 1);
}

export function importJSON(text: string): AppState {
  const raw = JSON.parse(text);
  if (raw?.app !== undefined && raw.app !== APP_ID) throw new Error("Il file non è un export di quest'app.");
  return migrate(raw);
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

export const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
