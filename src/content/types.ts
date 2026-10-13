import type { ModuleId, Source } from '../engine/types';

/**
 * Domanda di richiamo (recupero attivo e ripetizione distanziata).
 * - `vf`: vero/falso con giustificazione; corretta automaticamente.
 * - `scelta`: risposta multipla; corretta automaticamente.
 * - `aperta`: lo studente risponde a memoria (a voce o su carta), poi vede la risposta modello e si autovaluta.
 */
export type RecallQ =
  | { id: string; kind: 'vf'; q: string; answer: boolean; why: string; source?: Source }
  | { id: string; kind: 'scelta'; q: string; options: string[]; correct: number; why: string; source?: Source }
  | { id: string; kind: 'aperta'; q: string; answer: string; source?: Source };

// ---------------------------------------------------------------------------------------------------
// Visual: modelli 3D e diagrammi SVG. Ogni numero e ogni forma vengono dal motore (src/engine).
// ---------------------------------------------------------------------------------------------------

/** Modalità del laboratorio dei tensori (V1): un tensore come trasformazione dello spazio. */
export type TensorMode = 'trasforma' | 'proiettori' | 'assiale' | 'eulero';

export interface TensorScene {
  mode: TensorMode;
  /** matrice del tensore, per righe (9 numeri); modalità «trasforma» */
  A?: number[];
  /** direzione del versore ê (proiettori), del vettore assiale (assiale) o dell'asse (eulero): [inclinazione dal piano xy, azimut] in gradi */
  dir?: [number, number];
  /** modulo del vettore assiale w (modalità «assiale») */
  wLen?: number;
  /** vettore su cui agire */
  u?: [number, number, number];
  /** ampiezza della rotazione φ in gradi (eulero) */
  angle?: number;
  /** eulero: mostra l'approssimazione delle rotazioni infinitesime */
  tangent?: boolean;
  /** trasforma: mostra il cubo unitario deformato e il volume */
  cube?: boolean;
  /** comandi da mostrare accanto alla scena */
  controls?: ('dir' | 'angle' | 'tangent' | 'preset' | 'u' | 'wLen' | 'cube')[];
  /** preimpostazioni del tensore (trasforma) mostrate come pulsanti */
  presets?: string[];
  view?: 'prospettiva' | 'alto' | 'fronte' | 'asse';
}

export type SvgId = 'matrici' | 'simmetrie4' | 'divergenza';

export type LessonVisual = { kind: 'tensori3d'; scene: TensorScene } | { kind: 'svg'; id: SvgId; params?: Record<string, number | string | boolean> };

/** Formula della scheda: LaTeX + etichetta + riferimento della dispensa. */
export interface ConceptFormula {
  tex: string;
  label: string;
  /** Def/Teo/eq. della dispensa (es. "Teo 1.3.3") */
  rif?: string;
}

/**
 * Scheda di un concetto: significato in una frase, formule, spiegazione, errori tipici, domande di richiamo
 * e collegamento alle domande d'orale.
 */
export interface Concept {
  id: string;
  module: ModuleId;
  title: string;
  /** concetti da conoscere prima (grafo di tools/grafo.py) */
  prereq: string[];
  formulas: ConceptFormula[];
  /** significato fisico in 1–3 frasi */
  meaning: string;
  /** spiegazione discorsiva (paragrafi separati da riga vuota; $…$ per le formule) */
  explanation: string;
  /** errori tipici da evitare */
  pitfalls: string[];
  visual?: LessonVisual;
  recall: RecallQ[];
  source: Source;
  /** concetto facoltativo (la dispensa lo dice non richiesto o non trattato): motivo */
  facoltativo?: string;
}

// ---------------------------------------------------------------------------------------------------
// Banca delle domande d'orale.
// ---------------------------------------------------------------------------------------------------

export interface OralQ {
  id: string;
  /** espositiva («ricava…», «enuncia e dimostra…»), di collegamento tra argomenti, trabocchetto */
  kind: 'espositiva' | 'collegamento' | 'trabocchetto';
  q: string;
  concepts: string[];
  /** la domanda viene dalla dispensa (riquadro «Per l'orale», numero n) oppure è dedotta */
  source: Source;
  /** scaletta della risposta: ipotesi → passaggi chiave → risultato → significato → limiti */
  scaletta: string[];
  /** equazioni da scrivere alla lavagna, con riferimento */
  lavagna?: { tex: string; rif?: string }[];
  /** figura da disegnare (a parole) */
  figura?: string;
}

// ---------------------------------------------------------------------------------------------------
// Lezione guidata: il «professore» costruisce il concetto passo passo.
// Le derivazioni sono solo quelle che la dispensa sviluppa; i passaggi impliciti sono marcati `aggiunto`.
// Ogni catena di uguaglianze è verificata numericamente dai test (tests/lezioni.test.ts).
// ---------------------------------------------------------------------------------------------------

/** Riga di una derivazione: formula, motivazione del passaggio, eventuale domanda «qual è il passo successivo?». */
export interface DerivLine {
  tex: string;
  /** perché si fa questo passaggio (parlato del professore) */
  why: string;
  /** riferimento della dispensa se la riga è un risultato numerato (es. "eq. (1.1)", "Teo 1.3.3") */
  eq?: string;
  /** passaggio non scritto nella dispensa (aggiunto per chiarezza): mostrato come tale */
  aggiunto?: boolean;
  /** prima di mostrare la riga, lo studente sceglie il passo giusto */
  ask?: { q: string; options: string[]; correct: number; why: string };
  /** valore numerico della riga su un campione delle variabili (verifica della catena) */
  val?: (v: Record<string, number>) => number;
}

export interface Derivation {
  /** genera un campione valido delle variabili da un numero casuale in [0, 1) */
  sample?: (rnd: () => number) => Record<string, number>;
  lines: DerivLine[];
  /** identità aggiuntive da verificare (coppie di valori che devono coincidere) */
  checks?: { what: string; f: (v: Record<string, number>) => [number, number] }[];
}

export type LessonStep =
  | { id: string; kind: 'spiega'; title?: string; md: string; visual?: LessonVisual }
  | { id: string; kind: 'derivazione'; title: string; md?: string; der: Derivation; source: Source; visual?: LessonVisual }
  | { id: string; kind: 'prova'; title: string; md: string; tasks: string[]; visual: LessonVisual }
  | { id: string; kind: 'domanda'; q: RecallQ; visual?: LessonVisual }
  | { id: string; kind: 'numeri'; title: string; md: string; values: Record<string, number>; visual?: LessonVisual }
  | { id: string; kind: 'riassunto'; md: string; orale?: string[] };

export interface Lesson {
  concept: string;
  title: string;
  /** minuti stimati */
  minutes: number;
  /** visual di partenza */
  visual?: LessonVisual;
  steps: LessonStep[];
  source: Source;
}
