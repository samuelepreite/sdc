/**
 * Simulatore d'orale: regole di scelta delle domande (learning/simulatore).
 */
import { describe, expect, it } from 'vitest';
import { ALL_CONCEPTS } from '../src/content';
import { ALL_ORALI } from '../src/content/orale';
import { defaultState } from '../src/storage/store';
import { examReport, pickExam } from '../src/learning/simulatore';

const base = { scope: 'tutti' as const, mastery: {}, studied: () => false, facoltativi: false };
const modOf = (id: string) => ALL_CONCEPTS.find((c) => c.id === id)!.module;

describe('simulatore', () => {
  it('n domande distinte, moduli diversi finché possibile, almeno un collegamento o trabocchetto con n ≥ 4', () => {
    for (let seed = 1; seed < 30; seed++) {
      const ex = pickExam(defaultState(), ALL_ORALI, ALL_CONCEPTS, { ...base, n: 5, seed });
      expect(ex.length).toBe(5);
      expect(new Set(ex.map((q) => q.id)).size).toBe(5);
      expect(ex.some((q) => q.kind !== 'espositiva')).toBe(true);
      const mods = new Set(ex.map((q) => modOf(q.concepts[0])));
      expect(mods.size).toBeGreaterThanOrEqual(4);
    }
  });
  it('facoltativi esclusi per impostazione predefinita', () => {
    const fac = new Set(ALL_CONCEPTS.filter((c) => c.facoltativo).map((c) => c.id));
    for (let seed = 1; seed < 30; seed++) {
      const ex = pickExam(defaultState(), ALL_ORALI, ALL_CONCEPTS, { ...base, n: 6, seed });
      expect(ex.every((q) => q.concepts.every((c) => !fac.has(c)))).toBe(true);
    }
  });
  it('priorità alle domande mai esposte', () => {
    const s = defaultState();
    const first = pickExam(s, ALL_ORALI, ALL_CONCEPTS, { ...base, n: 3, seed: 3 });
    const s2 = { ...s, oral: first.map((q) => ({ qid: q.id, at: new Date().toISOString(), points: [0], total: 4, seconds: 60 })) };
    const second = pickExam(s2, ALL_ORALI, ALL_CONCEPTS, { ...base, n: 3, seed: 3 });
    expect(second.some((q) => first.includes(q))).toBe(false);
  });
  it('resoconto: quota media dei punti', () => {
    const q = ALL_ORALI[0];
    const r = examReport([
      { q, points: 4, total: 4, seconds: 300 },
      { q, points: 2, total: 4, seconds: 200 },
    ]);
    expect(r.share).toBeCloseTo(0.75, 12);
    expect(r.seconds).toBe(500);
  });
});
