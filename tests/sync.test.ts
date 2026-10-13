/** Sincronizzazione tra dispositivi: fusione, documenti a blocchi, ciclo lettura → fusione → scrittura. */
import { describe, it, expect } from 'vitest';
import { defaultState, type AppState, type OralLog } from '../src/storage/store';
import { mergeStates, toDocs, fromDocs, changedDocs, SyncController, historyKey, REC_CHUNK, ORAL_CHUNK, type CloudStore, type Docs } from '../src/storage/sync';
import { addOral, addRecall, lessonStep, rebuildAll } from '../src/learning/actions';
import { ALL_CONCEPTS } from '../src/content';
import { ALL_ORALI } from '../src/content/orale';

const T = (h: number) => new Date(Date.UTC(2026, 9, 12) + h * 3600000).toISOString();
const c1 = ALL_CONCEPTS[0];
const q1 = c1.recall[0].id;
const o1 = ALL_ORALI[0];
const oral = (at: string, n = 2): OralLog => ({ qid: o1.id, at, points: Array.from({ length: n }, (_, i) => i), total: o1.scaletta.length, seconds: 240 });

function fakeStore(): CloudStore & { docs: Docs; writes: number } {
  const st = {
    docs: {} as Docs,
    writes: 0,
    async pull() {
      return JSON.parse(JSON.stringify(st.docs));
    },
    async push(d: Docs, ids: string[]) {
      for (const i of ids) {
        st.docs[i] = JSON.parse(JSON.stringify(d[i]));
        st.writes++;
      }
    },
  };
  return st;
}

function device(store: CloudStore, init: AppState) {
  let s = init;
  const c = new SyncController(store, () => s, (n) => (s = n), rebuildAll, () => {}, defaultState, 0);
  return { get: () => s, c };
}

describe('fusione', () => {
  it('unione di richiami ed esposizioni orali, senza doppioni', () => {
    let a = addOral(defaultState(), oral(T(1)));
    let b = addOral(defaultState(), oral(T(1)));
    b = addOral(b, oral(T(2), 3));
    a = addRecall(a, { qid: q1, conceptId: c1.id, at: T(3), correct: true });
    b = addRecall(b, { qid: q1, conceptId: c1.id, at: T(3), correct: true });
    const m = mergeStates(a, b);
    expect(m.oral.map((x) => x.at)).toEqual([T(1), T(2)]);
    expect(m.recall).toHaveLength(1);
  });
  it('vincono le impostazioni modificate più di recente', () => {
    const a = defaultState();
    a.settings.examDate = '2027-01-10';
    a.meta = { settingsAt: T(5) };
    const b = defaultState();
    b.settings.examDate = '2027-02-14';
    b.meta = { settingsAt: T(9) };
    expect(mergeStates(a, b).settings.examDate).toBe('2027-02-14');
    expect(mergeStates(b, a).settings.examDate).toBe('2027-02-14');
  });
  it('lezioni: passo più avanzato, prima fine, giudizio più recente', () => {
    let a = lessonStep(defaultState(), c1.id, 2);
    let b = lessonStep(defaultState(), c1.id, 5, true);
    a = { ...a, lessons: { [c1.id]: { ...a.lessons[c1.id], feedback: { x: { v: 'confuso', at: T(1) } } } } };
    b = { ...b, lessons: { [c1.id]: { ...b.lessons[c1.id], feedback: { x: { v: 'chiaro', at: T(2) } } } } };
    const m = mergeStates(a, b).lessons[c1.id];
    expect(m.step).toBe(5);
    expect(m.doneAt).toBeDefined();
    expect(m.feedback.x.v).toBe('chiaro');
  });
  it('«Azzera» su un dispositivo scarta la storia precedente anche dall\'altro', () => {
    const old = addOral(defaultState(), oral(T(1)));
    old.concepts[c1.id] = { theorySeenAt: T(1) };
    const reset = { ...defaultState(), meta: { resetAt: T(5), settingsAt: T(5) } };
    const m = mergeStates(old, reset);
    expect(m.oral).toHaveLength(0);
    expect(m.concepts[c1.id]).toBeUndefined();
    const later = addOral(reset, oral(T(6)));
    expect(mergeStates(old, later).oral.map((x) => x.at)).toEqual([T(6)]);
  });
});

describe('documenti', () => {
  it('andata e ritorno, con più blocchi', () => {
    let s = defaultState();
    for (let i = 0; i < REC_CHUNK * 2 + 7; i++) s.recall.push({ qid: q1, conceptId: c1.id, at: T(i), correct: i % 3 > 0 });
    for (let i = 0; i < ORAL_CHUNK + 3; i++) s.oral.push(oral(T(i + 0.5), i % 4));
    s.concepts[c1.id] = { theorySeenAt: T(0), ownWords: 'A ê_j · ê_i' };
    s = rebuildAll(s);
    const docs = toDocs(s);
    expect(Object.keys(docs).filter((k) => k.startsWith('rec-'))).toHaveLength(3);
    expect(Object.keys(docs).filter((k) => k.startsWith('ora-'))).toHaveLength(2);
    const back = rebuildAll(fromDocs(docs, defaultState())!);
    expect(historyKey(back)).toBe(historyKey(s));
    expect(JSON.stringify(back.srs)).toBe(JSON.stringify(s.srs));
  });
  it('ogni documento resta sotto il limite di 256 KiB (blocchi pieni)', () => {
    const s = defaultState();
    for (let i = 0; i < REC_CHUNK; i++) s.recall.push({ qid: `${q1}-molto-lungo-${i}`, conceptId: c1.id, at: T(i), correct: true, grade: 3 });
    for (let i = 0; i < ORAL_CHUNK; i++) s.oral.push({ ...oral(T(i)), points: [0, 1, 2, 3, 4, 5, 6], total: 7, seconds: 9999 });
    for (const [k, d] of Object.entries(toDocs(s))) expect(new TextEncoder().encode(JSON.stringify(d)).length, k).toBeLessThan(256 * 1024);
  });
  it('si riscrivono solo i documenti cambiati', () => {
    const s = defaultState();
    for (let i = 0; i < REC_CHUNK + 1; i++) s.recall.push({ qid: q1, conceptId: c1.id, at: T(i), correct: true });
    const known = Object.fromEntries(Object.entries(toDocs(s)).map(([k, v]) => [k, JSON.stringify(v)]));
    s.recall.push({ qid: q1, conceptId: c1.id, at: T(999), correct: false });
    expect(changedDocs(toDocs(s), known)).toEqual(['rec-1']);
  });
});

describe('due dispositivi', () => {
  it('telefono e computer convergono sulla stessa storia e sulle stesse schede', async () => {
    const store = fakeStore();
    const phone = device(store, addOral(defaultState(), oral(T(1))));
    const laptop = device(store, addRecall(defaultState(), { qid: q1, conceptId: c1.id, at: T(3), correct: false }));
    await phone.c.sync();
    await laptop.c.sync();
    await phone.c.sync();
    expect(historyKey(phone.get())).toBe(historyKey(laptop.get()));
    expect(JSON.stringify(phone.get().srs)).toBe(JSON.stringify(laptop.get().srs));
    expect(Object.keys(phone.get().srs).sort()).toEqual([`o:${o1.id}`, `q:${q1}`]);
  });
  it('senza modifiche un nuovo ciclo non scrive nulla', async () => {
    const store = fakeStore();
    const d = device(store, addOral(defaultState(), oral(T(1))));
    await d.c.sync();
    const w = store.writes;
    await d.c.sync();
    expect(store.writes).toBe(w);
  });
  it('un dispositivo nuovo (vuoto) scarica tutto senza cancellare il server', async () => {
    const store = fakeStore();
    const old = device(store, addOral(addOral(defaultState(), oral(T(1))), oral(T(2))));
    await old.c.sync();
    const fresh = device(store, defaultState());
    await fresh.c.sync();
    expect(fresh.get().oral).toHaveLength(2);
    expect(fromDocs(store.docs, defaultState())!.oral).toHaveLength(2);
  });
  it('un errore del server non perde i dati locali', async () => {
    const broken: CloudStore = { pull: async () => Promise.reject({ code: 'unavailable' }), push: async () => {} };
    let status = '';
    let s = addOral(defaultState(), oral(T(1)));
    const c = new SyncController(broken, () => s, (n) => (s = n), rebuildAll, (st) => (status = st), defaultState, 0);
    await c.sync();
    expect(status).toBe('errore');
    expect(s.oral).toHaveLength(1);
  });
});
