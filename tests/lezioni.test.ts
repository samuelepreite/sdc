/**
 * Lezioni guidate: struttura, fedeltà alle fonti e verifica numerica di ogni derivazione (ogni riga con `val` deve dare
 * lo stesso valore della prima su 25 campioni casuali; ogni `check` deve tornare).
 */
import { describe, it, expect } from 'vitest';
import { ALL_LESSONS } from '../src/content/lezioni';
import { ALL_CONCEPTS } from '../src/content';
import type { Derivation } from '../src/content/types';

const concepts = new Set(ALL_CONCEPTS.map((c) => c.id));
/** generatore pseudo-casuale riproducibile (mulberry32) */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function verify(der: Derivation, where: string) {
  const withVal = der.lines.filter((l) => l.val);
  if (!withVal.length && !der.checks?.length) return; // catena solo logica
  expect(der.sample, `${where}: serve sample`).toBeDefined();
  const r = rng(12345);
  for (let k = 0; k < 25; k++) {
    const s = der.sample!(r);
    const ref = withVal[0]?.val!(s);
    for (const l of withVal) expect(close(l.val!(s), ref!), `${where}: ${l.tex}`).toBe(true);
    for (const c of der.checks ?? []) {
      const [a, b] = c.f(s);
      expect(close(a, b), `${where}: ${c.what}`).toBe(true);
    }
  }
}

describe('lezioni guidate', () => {
  it('una lezione per concetto esistente; id dei passi e delle domande unici', () => {
    const seen = new Set<string>();
    for (const l of ALL_LESSONS) {
      expect(concepts.has(l.concept), l.concept).toBe(true);
      for (const s of l.steps) {
        expect(seen.has(s.id), s.id).toBe(false);
        seen.add(s.id);
        if (s.kind === 'domanda') {
          expect(seen.has(s.q.id), s.q.id).toBe(false);
          seen.add(s.q.id);
        }
      }
    }
    expect(new Set(ALL_LESSONS.map((l) => l.concept)).size).toBe(ALL_LESSONS.length);
  });
  for (const l of ALL_LESSONS)
    describe(l.concept, () => {
      it('derivazioni verificate numericamente', () => {
        for (const s of l.steps) if (s.kind === 'derivazione') verify(s.der, `${l.concept}/${s.id}`);
      });
      it('ogni derivazione ha almeno una riga con un riferimento della dispensa (Def/Teo/eq.) e fonte nella dispensa', () => {
        for (const s of l.steps)
          if (s.kind === 'derivazione') {
            expect(s.der.lines.some((x) => x.eq), s.id).toBe(true);
            expect(s.source.kind).toBe('dispensa');
          }
      });
      it('domande «qual è il passo successivo?» con risposta valida; testi senza segnaposto', () => {
        for (const s of l.steps) {
          if (s.kind === 'derivazione')
            for (const x of s.der.lines) if (x.ask) expect(x.ask.correct).toBeLessThan(x.ask.options.length);
          const txt = JSON.stringify(s);
          expect(txt).not.toMatch(/undefined|NaN/);
        }
      });
      it('finisce con un riassunto', () => {
        expect(l.steps[l.steps.length - 1].kind).toBe('riassunto');
      });
    });
  it('ogni concetto ha la sua lezione, nell\'ordine della dispensa', () => {
    const have = ALL_LESSONS.map((l) => l.concept);
    expect(ALL_CONCEPTS.map((c) => c.id).filter((id) => !have.includes(id))).toEqual([]);
    expect(have).toEqual(ALL_CONCEPTS.map((c) => c.id).filter((id) => have.includes(id)));
  });
  it('lezioni di 10–25 minuti, con almeno una prova sul modello o una domanda', () => {
    for (const l of ALL_LESSONS) {
      expect(l.minutes).toBeGreaterThanOrEqual(10);
      expect(l.minutes).toBeLessThanOrEqual(25);
      expect(l.steps.some((s) => s.kind === 'prova' || s.kind === 'domanda'), l.concept).toBe(true);
    }
  });
});
