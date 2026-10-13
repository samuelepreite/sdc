import { describe, it, expect } from 'vitest';
import { defaultState, exportJSON, importJSON, load, save, migrate, type AppState } from '../src/storage/store';
import { masteryByConcept, moduleMastery, MASTERY_OK } from '../src/learning/mastery';
import { planSession, studyOrder } from '../src/learning/session';
import { addOral, addRecall, lessonStep, rebuildAll } from '../src/learning/actions';
import { gradeOral, Rating, dueCards } from '../src/learning/srs';
import { buildPlan } from '../src/learning/plan';
import { ALL_CONCEPTS, conceptIdsByModule, conceptsOf } from '../src/content';
import { ALL_ORALI } from '../src/content/orale';
import { MODULES } from '../src/content/modules';

const T0 = '2026-10-01T10:00:00Z';
const c1 = ALL_CONCEPTS[0];
const studiedAll = (): AppState => {
  const s = defaultState();
  for (const c of ALL_CONCEPTS) s.concepts[c.id] = { theorySeenAt: T0 };
  return s;
};

describe('impostazioni e persistenza', () => {
  it('export → import conserva i dati', () => {
    const s = defaultState();
    s.settings.examDate = '2027-01-20';
    const s2 = addOral(s, { qid: ALL_ORALI[0].id, at: T0, points: [0, 1], total: 4, seconds: 300 });
    const back = importJSON(exportJSON(s2));
    expect(back.settings.examDate).toBe('2027-01-20');
    expect(back.oral).toHaveLength(1);
    expect(Object.keys(back.srs)).toContain(`o:${ALL_ORALI[0].id}`);
  });
  it('import rifiuta file di altre app o di versione futura', () => {
    expect(() => importJSON('{"app":"seimafi","version":1}')).toThrow();
    expect(() => migrate({ version: 99 })).toThrow();
  });
  it('load/save su uno storage finto; dati corrotti → stato di default', () => {
    const mem: Record<string, string> = {};
    const st = { getItem: (k: string) => mem[k] ?? null, setItem: (k: string, v: string) => void (mem[k] = v) };
    const s = defaultState();
    s.settings.hoursPerWeek = 14;
    expect(save(s, st)).toBe(true);
    expect(load(st).settings.hoursPerWeek).toBe(14);
    mem['sdc:v1'] = '{rotto';
    expect(load(st).settings.hoursPerWeek).toBe(10);
  });
});

describe('orale: voto e ripetizione', () => {
  it('voto dalla quota di punti della scaletta', () => {
    expect(gradeOral({ points: [0], total: 4 })).toBe(Rating.Again);
    expect(gradeOral({ points: [0, 1], total: 4 })).toBe(Rating.Hard);
    expect(gradeOral({ points: [0, 1, 2], total: 4 })).toBe(Rating.Good);
    expect(gradeOral({ points: [0, 1, 2, 3], total: 4 })).toBe(Rating.Easy);
  });
  it('un\'esposizione scarsa torna il giorno dopo', () => {
    const o = ALL_ORALI[0];
    const s = addOral(defaultState(), { qid: o.id, at: T0, points: [], total: o.scaletta.length });
    expect(dueCards(s, new Date('2026-10-02T10:00:01Z'), 'o').map((d) => d.id)).toContain(`o:${o.id}`);
    expect(dueCards(s, new Date('2026-10-02T09:00:00Z'), 'o')).toHaveLength(0);
  });
  it('rebuildAll ricostruisce le stesse schede dalla storia', () => {
    let s = defaultState();
    s = addRecall(s, { qid: c1.recall[0].id, conceptId: c1.id, at: T0, correct: true });
    s = addOral(s, { qid: ALL_ORALI[0].id, at: '2026-10-01T11:00:00Z', points: [0, 1, 2], total: 4 });
    expect(rebuildAll({ ...s, srs: {} }).srs).toEqual(s.srs);
  });
});

describe('padronanza', () => {
  it('l\'esposizione completa alza la padronanza, quella vuota la abbassa', () => {
    const o = ALL_ORALI.find((x) => x.concepts.length === 1)!;
    const now = new Date('2026-10-01T12:00:00Z');
    const good = addOral(defaultState(), { qid: o.id, at: T0, points: o.scaletta.map((_, i) => i), total: o.scaletta.length });
    const bad = addOral(good, { qid: o.id, at: '2026-10-01T11:00:00Z', points: [], total: o.scaletta.length });
    const m1 = masteryByConcept(good, now)[o.concepts[0]];
    const m2 = masteryByConcept(bad, now)[o.concepts[0]];
    expect(m1).toBeGreaterThan(0);
    expect(m2).toBeLessThan(m1);
  });
  it('padronanza del modulo: media sui concetti, i mai esercitati contano 0', () => {
    const ids = conceptIdsByModule();
    const mm = moduleMastery({ [c1.id]: 0.7 }, ids);
    expect(mm.m1).toBeCloseTo(0.7 / ids.m1.length, 12);
    expect(MASTERY_OK).toBe(0.7);
  });
});

describe('sessione', () => {
  it('ordine di studio rispetta i prerequisiti', () => {
    const order = studyOrder(ALL_CONCEPTS).map((c) => c.id);
    for (const c of ALL_CONCEPTS) for (const p of c.prereq) expect(order.indexOf(p)).toBeLessThan(order.indexOf(c.id));
  });
  it('prima sessione: nessun richiamo, nessun orale, lezione del primo concetto della dispensa', () => {
    const plan = planSession(defaultState(), ALL_CONCEPTS, ALL_ORALI, { seed: 1 });
    expect(plan.recall).toHaveLength(0);
    expect(plan.oral).toBeUndefined();
    expect(plan.lesson?.id).toBe('c1.1');
  });
  it('dopo la lezione: richiami del concetto, una domanda d\'orale sui concetti studiati, lezione successiva', () => {
    const s = lessonStep(defaultState(), 'c1.1', 5, true);
    const plan = planSession(s, ALL_CONCEPTS, ALL_ORALI, { seed: 2 });
    expect(plan.recall.length).toBeGreaterThan(0);
    expect(plan.recall.length).toBeLessThanOrEqual(2);
    for (const r of plan.recall) expect(r.concept.id).toBe('c1.1');
    if (plan.oral) expect(plan.oral.concepts.every((c) => c === 'c1.1')).toBe(true);
    expect(plan.lesson?.id).not.toBe('c1.1');
    expect(plan.lesson?.prereq.every((p) => p === 'c1.1')).toBe(true);
  });
  it('con tutto studiato: 5 richiami al più 2 per concetto, nessuna lezione M1', () => {
    const plan = planSession(studiedAll(), ALL_CONCEPTS, ALL_ORALI, { seed: 3 });
    expect(plan.recall).toHaveLength(5);
    const per = new Map<string, number>();
    for (const r of plan.recall) per.set(r.concept.id, (per.get(r.concept.id) ?? 0) + 1);
    for (const n of per.values()) expect(n).toBeLessThanOrEqual(2);
    expect(plan.oral).toBeDefined();
    expect(plan.lesson).toBeUndefined();
  });
});

describe('piano settimanale', () => {
  const plan = (s: AppState, now: Date) => {
    const mastery = masteryByConcept(s, now);
    return buildPlan(s, { now, masteryByModule: moduleMastery(mastery, conceptIdsByModule()), conceptsByModule: Object.fromEntries(MODULES.map((m) => [m.id, conceptsOf(m.id)])), masteryByConcept: mastery });
  };
  it('senza data: 8 settimane; ore totali = ore a settimana × settimane', () => {
    const s = defaultState();
    const p = plan(s, new Date('2026-10-12T10:00:00'));
    expect(p.assumedWeeks).toBe(true);
    expect(p.weeks).toHaveLength(8);
    const tot = p.weeks.reduce((a, w) => a + w.reviewHours + w.simulationHours + w.items.reduce((b, it) => b + it.hours, 0), 0);
    expect(tot).toBeCloseTo(8 * s.settings.hoursPerWeek, 6);
  });
  it('con data: settimane fino al giorno prima; si parte da M1; ultima settimana con simulazione', () => {
    const s = defaultState();
    s.settings.examDate = '2026-11-09';
    const p = plan(s, new Date('2026-10-12T10:00:00'));
    expect(p.weeks).toHaveLength(4);
    expect(p.weeks[0].items[0].module).toBe('m1');
    expect(p.weeks[0].items[0].focus[0]).toBe('c1.1');
    expect(p.weeks.at(-1)!.simulationHours).toBeGreaterThan(0);
  });
});
