/**
 * Sincronizzazione dei progressi sull'account dello studente.
 *
 * Quando l'app gira come pagina pubblicata su claude.ai, la capability `db` offre a ogni utente uno spazio privato
 * (`data/users/<id>/…`, invisibile a chiunque altro, proprietario della pagina compreso). Lì salviamo la storia
 * dello studio; localStorage resta come copia locale e per l'uso offline. Fuori da claude.ai (sviluppo, file singolo)
 * la sincronizzazione semplicemente non c'è.
 *
 * Scelte:
 *  - si sincronizza solo la STORIA (richiami, esposizioni orali, concetti studiati, lezioni, impostazioni): le schede FSRS
 *    si ricalcolano dalla storia (`rebuildSrs`), quindi due dispositivi non possono avere schede incoerenti;
 *  - fusione per unione: richiami ed esposizioni per (domanda, istante); le impostazioni vincono le più recenti;
 *  - «Azzera» registra `resetAt`: la fusione scarta tutto ciò che è precedente, anche sugli altri dispositivi;
 *  - documenti a blocchi di dimensione fissa (limite 256 KiB per documento): `core`, `rec-<i>`, `ora-<i>`;
 *  - prima di ogni scrittura si rilegge e si fonde (lettura → fusione → scrittura), così due dispositivi aperti
 *    insieme non si cancellano a vicenda i dati; si scrivono solo i documenti cambiati.
 */
import type { AppState, ConceptState, OralLog, RecallLog } from './store';
import { SCHEMA_VERSION } from './store';

export const REC_CHUNK = 400;
export const ORAL_CHUNK = 300;

export type Docs = Record<string, Record<string, unknown>>;

const recKey = (r: RecallLog) => `${r.qid}|${r.at}`;
const oralKey = (o: OralLog) => `${o.qid}|${o.at}`;
const maxIso = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);
const minIso = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);

/** Fonde due stati (stesso studente, due dispositivi). Le schede FSRS vanno ricalcolate dopo (rebuildSrs). */
export function mergeStates(a: AppState, b: AppState): AppState {
  const resetAt = maxIso(a.meta?.resetAt, b.meta?.resetAt);
  const after = (iso?: string) => !resetAt || (!!iso && iso >= resetAt);

  const recall = new Map<string, RecallLog>();
  for (const r of [...a.recall, ...b.recall]) if (after(r.at)) recall.set(recKey(r), r);
  const oral = new Map<string, OralLog>();
  for (const o of [...(a.oral ?? []), ...(b.oral ?? [])]) if (after(o.at)) oral.set(oralKey(o), o);

  const concepts: Record<string, ConceptState> = {};
  for (const src of [a.concepts, b.concepts])
    for (const [id, c] of Object.entries(src)) {
      if (c.theorySeenAt && !after(c.theorySeenAt)) continue;
      const prev = concepts[id];
      concepts[id] = !prev
        ? { ...c }
        : {
            theorySeenAt: minIso(prev.theorySeenAt, c.theorySeenAt),
            ownWords: (c.ownWords?.length ?? 0) > (prev.ownWords?.length ?? 0) ? c.ownWords : prev.ownWords,
          };
    }

  const lessons: AppState['lessons'] = {};
  for (const src of [a.lessons ?? {}, b.lessons ?? {}])
    for (const [id, l] of Object.entries(src)) {
      if (!after(l.startedAt)) continue;
      const prev = lessons[id];
      if (!prev) {
        lessons[id] = { ...l, feedback: { ...l.feedback } };
        continue;
      }
      const feedback = { ...prev.feedback };
      for (const [k, f] of Object.entries(l.feedback)) if (!feedback[k] || feedback[k].at < f.at) feedback[k] = f;
      lessons[id] = { step: Math.max(prev.step, l.step), startedAt: minIso(prev.startedAt, l.startedAt)!, doneAt: minIso(prev.doneAt, l.doneAt), feedback };
    }

  const aNewer = (a.meta?.settingsAt ?? '') >= (b.meta?.settingsAt ?? '');
  return {
    version: SCHEMA_VERSION,
    settings: aNewer ? a.settings : b.settings,
    recall: [...recall.values()].sort((x, y) => x.at.localeCompare(y.at) || x.qid.localeCompare(y.qid)),
    oral: [...oral.values()].sort((x, y) => x.at.localeCompare(y.at) || x.qid.localeCompare(y.qid)),
    concepts,
    srs: {},
    meta: { settingsAt: aNewer ? a.meta?.settingsAt : b.meta?.settingsAt, resetAt },
    lessons,
  };
}

/** Stato → documenti del database (blocchi di dimensione fissa, limite 256 KiB per documento). */
export function toDocs(s: AppState): Docs {
  const docs: Docs = {};
  const nR = Math.ceil(s.recall.length / REC_CHUNK);
  const nO = Math.ceil((s.oral ?? []).length / ORAL_CHUNK);
  for (let i = 0; i < nR; i++) docs[`rec-${i}`] = { items: s.recall.slice(i * REC_CHUNK, (i + 1) * REC_CHUNK) };
  for (let i = 0; i < nO; i++) docs[`ora-${i}`] = { items: s.oral.slice(i * ORAL_CHUNK, (i + 1) * ORAL_CHUNK) };
  docs.core = { v: SCHEMA_VERSION, settings: s.settings, concepts: s.concepts, meta: s.meta ?? {}, lessons: s.lessons ?? {}, chunks: { rec: nR, ora: nO } };
  return docs;
}

/** Documenti → stato (senza schede FSRS). Documenti mancanti o malformati vengono ignorati. */
export function fromDocs(docs: Docs, base: AppState): AppState | null {
  const core = docs.core as { settings?: AppState['settings']; concepts?: AppState['concepts']; meta?: AppState['meta']; lessons?: AppState['lessons'] } | undefined;
  if (!core) return null;
  const items = (prefix: string) =>
    Object.keys(docs)
      .filter((k) => k.startsWith(prefix))
      .sort((x, y) => Number(x.split('-')[1]) - Number(y.split('-')[1]))
      .flatMap((k) => (Array.isArray(docs[k].items) ? (docs[k].items as unknown[]) : []));
  return {
    ...base,
    settings: { ...base.settings, ...(core.settings ?? {}) },
    concepts: core.concepts ?? {},
    meta: core.meta ?? {},
    lessons: core.lessons ?? {},
    recall: items('rec-') as RecallLog[],
    oral: items('ora-') as OralLog[],
    srs: {},
  };
}

/** Documenti da scrivere: solo quelli cambiati rispetto all'ultima versione nota del server. */
export function changedDocs(next: Docs, known: Record<string, string>): string[] {
  return Object.keys(next).filter((k) => JSON.stringify(next[k]) !== known[k]);
}

// ------------------------------------------------------------------ adattatore per la capability `db`

interface DocSnap {
  id: string;
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DbLike {
  collection(path: string): { get(): Promise<{ docs: DocSnap[] }>; doc(id: string): { set(d: Record<string, unknown>): Promise<void> } };
}
interface ClaudeLike {
  use(name: string): Promise<unknown>;
}

export interface CloudStore {
  /** legge tutti i documenti dello studente */
  pull(): Promise<Docs>;
  /** scrive i documenti indicati (uno alla volta, `core` per ultimo) */
  push(docs: Docs, ids: string[]): Promise<void>;
}

/** Collega lo spazio privato dell'utente; `null` se la pagina non gira su claude.ai o l'utente non può scrivere. */
export async function connectCloud(): Promise<CloudStore | null> {
  const claude = (globalThis as unknown as { claude?: ClaudeLike }).claude;
  if (!claude?.use) return null;
  try {
    const [db, user] = (await Promise.all([claude.use('db'), claude.use('user')])) as [DbLike | null, { id(): Promise<string | null> } | null];
    if (!db || !user) return null;
    const uid = await user.id();
    if (!uid) return null;
    return cloudFromDb(db, uid);
  } catch {
    return null;
  }
}

export function cloudFromDb(db: DbLike, uid: string): CloudStore {
  const col = db.collection(`data/users/${uid}`);
  return {
    async pull() {
      const snap = await col.get();
      const out: Docs = {};
      for (const d of snap.docs) if (d.exists) out[d.id] = d.data() ?? {};
      return out;
    },
    async push(docs, ids) {
      const order = [...ids.filter((i) => i !== 'core'), ...ids.filter((i) => i === 'core')];
      for (const id of order) await col.doc(id).set(docs[id]); // uno alla volta (regola del db)
    },
  };
}

// ------------------------------------------------------------------ controllore (lettura → fusione → scrittura)

export type SyncStatus = 'locale' | 'collegamento' | 'sincronizzato' | 'errore';

/** Chiave della storia: due stati con la stessa chiave non hanno nulla da sincronizzare. */
export const historyKey = (s: AppState) => JSON.stringify(toDocs(s));

export class SyncController {
  private known: Record<string, string> = {};
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<void> | null = null;
  private again = false;
  lastKey = '';

  constructor(
    private store: CloudStore,
    private getState: () => AppState,
    private setState: (s: AppState) => void,
    /** ricalcola ciò che non si sincronizza (schede FSRS, sblocchi) */
    private finalize: (s: AppState) => AppState,
    private onStatus: (s: SyncStatus, detail?: string) => void,
    private empty: () => AppState,
    private delayMs = 2500,
  ) {}

  /** Un ciclo completo; se ne è già in corso uno, ne accoda un altro. */
  sync(): Promise<void> {
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.cycle().finally(() => {
      this.running = null;
      if (this.again) {
        this.again = false;
        void this.sync();
      }
    });
    return this.running;
  }

  /** Sincronizza dopo una pausa (raggruppa le modifiche ravvicinate). */
  schedule() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.sync();
    }, this.delayMs);
  }

  private async cycle() {
    try {
      const docs = await this.store.pull();
      this.known = Object.fromEntries(Object.entries(docs).map(([k, v]) => [k, JSON.stringify(v)]));
      const remote = fromDocs(docs, this.empty());
      const cur = this.getState();
      const merged = remote ? this.finalize(mergeStates(cur, remote)) : cur;
      const key = historyKey(merged);
      if (key !== historyKey(cur)) this.setState(merged);
      const next = toDocs(merged);
      const ids = changedDocs(next, this.known);
      if (ids.length) {
        await this.store.push(next, ids);
        for (const id of ids) this.known[id] = JSON.stringify(next[id]);
      }
      this.lastKey = key;
      this.onStatus('sincronizzato');
    } catch (e) {
      const code = (e as { code?: string })?.code;
      this.onStatus('errore', code === 'quota_exceeded' ? 'spazio esaurito sul server' : code === 'revoked' || code === 'not_granted' ? 'accesso non disponibile' : 'connessione non riuscita, riprovo più tardi');
    }
  }
}
