/**
 * Test strutturali su TUTTI i contenuti: id univoci, prerequisiti coerenti con il grafo della Fase 0 (tools/grafo.json),
 * fonti presenti (dispensa, o deduzione/fonte esterna con spiegazione), nessun segnaposto, ogni formula compilabile
 * da KaTeX con le macro della dispensa, domande d'orale agganciate a concetti esistenti.
 */
import { describe, it, expect } from 'vitest';
import katex from 'katex';
import grafoJson from '../tools/grafo.json';
import { ALL_CONCEPTS } from '../src/content';
import { ALL_LESSONS } from '../src/content/lezioni';
import { ALL_ORALI } from '../src/content/orale';
import { MODULES } from '../src/content/modules';
import { MACROS } from '../src/ui/components/Tex';
import { SVG_IDS } from '../src/diagrams/DiagramHost';
import type { Source } from '../src/engine/types';

/** modalità ammesse per ogni modello 3D */
const MODES: Record<string, string[]> = {
  tensori3d: ['trasforma', 'proiettori', 'assiale', 'eulero'],
  deforma3d: ['intorno', 'ellissoide', 'rappresentazione'],
  tensione3d: ['taglio', 'tetraedro', 'parallelepipedo', 'principali'],
  trave3d: ['fibre', 'normale', 'flessione', 'anticlastica'],
};
const grafo = grafoJson as { id: string; modulo: string; titolo: string; prereq: string[]; flag: string }[];
const byId = new Map(grafo.map((g) => [g.id, g]));

function strings(x: unknown, out: string[] = []): string[] {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => strings(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => strings(y, out));
  return out;
}
/** formule in un testo con $…$ / $$…$$ */
const formulasIn = (s: string) => [...s.matchAll(/\$\$([^$]+)\$\$|\$([^$]+)\$/g)].map((m) => (m[1] !== undefined ? `\\displaystyle ${m[1]}` : m[2]));

function okSource(s: Source) {
  if (s.kind === 'dispensa') return s.cap >= 1 && s.cap <= 6;
  if (s.kind === 'deduzione') return s.spiegazione.length > 20;
  return s.note.length > 20;
}

describe('contenuti', () => {
  it('concetti: id univoci, nel grafo della Fase 0, stesso modulo e stessi prerequisiti', () => {
    const ids = ALL_CONCEPTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of ALL_CONCEPTS) {
      const g = byId.get(c.id);
      expect(g, c.id).toBeDefined();
      expect(c.module).toBe(g!.modulo);
      expect([...c.prereq].sort()).toEqual([...g!.prereq].sort());
      expect(!!c.facoltativo).toBe(!!g!.flag);
    }
  });
  it('ordine dei concetti = ordine della dispensa (grafo); prerequisiti sempre prima', () => {
    const order = grafo.map((g) => g.id);
    const pos = ALL_CONCEPTS.map((c) => order.indexOf(c.id));
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    for (const c of ALL_CONCEPTS) for (const p of c.prereq) expect(order.indexOf(p)).toBeLessThan(order.indexOf(c.id));
  });
  it('moduli: 8, nell\'ordine m1…m8', () => {
    expect(MODULES.map((m) => m.id)).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']);
  });
  it('ogni concetto, domanda e lezione ha una fonte valida', () => {
    for (const c of ALL_CONCEPTS) {
      expect(okSource(c.source), c.id).toBe(true);
      for (const q of c.recall) if (q.source) expect(okSource(q.source), q.id).toBe(true);
    }
    for (const o of ALL_ORALI) expect(okSource(o.source), o.id).toBe(true);
    for (const l of ALL_LESSONS) expect(okSource(l.source), l.concept).toBe(true);
  });
  it('id delle domande di richiamo univoci in tutta l\'app; 3–4 domande per scheda', () => {
    const qs = ALL_CONCEPTS.flatMap((c) => c.recall.map((q) => q.id));
    const lq = ALL_LESSONS.flatMap((l) => l.steps.flatMap((s) => (s.kind === 'domanda' ? [s.q.id] : [])));
    expect(new Set([...qs, ...lq]).size).toBe(qs.length + lq.length);
    for (const c of ALL_CONCEPTS) {
      expect(c.recall.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.recall.length, c.id).toBeLessThanOrEqual(4);
      for (const q of c.recall) if (q.kind === 'scelta') expect(q.correct).toBeLessThan(q.options.length);
    }
  });
  it('domande d\'orale: id univoci, concetti esistenti, scaletta di 3–7 punti; ogni concetto ne ha almeno una', () => {
    const ids = ALL_ORALI.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    const cs = new Set(ALL_CONCEPTS.map((c) => c.id));
    for (const o of ALL_ORALI) {
      for (const c of o.concepts) expect(cs.has(c), `${o.id}: ${c}`).toBe(true);
      expect(o.scaletta.length, o.id).toBeGreaterThanOrEqual(3);
      expect(o.scaletta.length, o.id).toBeLessThanOrEqual(7);
    }
    for (const c of ALL_CONCEPTS) if (!c.facoltativo) expect(ALL_ORALI.some((o) => o.concepts.includes(c.id)), c.id).toBe(true);
  });
  it('le domande della dispensa ci sono tutte (11, 13, 14, 14, 12, 10 per capitolo, se il modulo è presente)', () => {
    const fromDisp = (cap: number) => ALL_ORALI.filter((o) => o.source.kind === 'dispensa' && o.source.cap === cap && /domanda \d+/.test(o.source.rif ?? ''));
    const attese: Record<number, number> = { 1: 11, 2: 13, 3: 14, 4: 14, 5: 12, 6: 10 };
    const capDi: Record<string, number> = { m1: 1, m2: 2, m3: 3, m4: 4, m5: 4, m6: 5, m7: 5, m8: 6 };
    const presenti = new Set(ALL_CONCEPTS.map((c) => capDi[c.module]));
    for (const cap of presenti) if (cap !== 4 && cap !== 5) expect(fromDisp(cap).length, `Cap. ${cap}`).toBe(attese[cap]);
    const pieni = (mods: string[]) => mods.every((m) => ALL_CONCEPTS.some((c) => c.module === m));
    if (pieni(['m4', 'm5'])) expect(fromDisp(4).length).toBe(14);
    if (pieni(['m6', 'm7'])) expect(fromDisp(5).length).toBe(12);
  });
  it('nessun segnaposto (undefined, NaN, TODO) nei testi', () => {
    for (const s of strings([ALL_CONCEPTS, ALL_LESSONS, ALL_ORALI])) expect(s, s.slice(0, 60)).not.toMatch(/undefined|NaN|TODO|lorem ipsum/);
  });
  it('ogni formula si compila con KaTeX (con le macro della dispensa)', () => {
    const texts = strings([ALL_CONCEPTS, ALL_ORALI, ALL_LESSONS.map((l) => l.steps.map((s) => ({ ...s, der: undefined })))]);
    const lines = ALL_LESSONS.flatMap((l) => l.steps.flatMap((s) => (s.kind === 'derivazione' ? s.der.lines.map((x) => x.tex) : [])));
    const formule = [...texts.flatMap(formulasIn), ...lines, ...ALL_CONCEPTS.flatMap((c) => c.formulas.map((f) => f.tex)), ...ALL_ORALI.flatMap((o) => (o.lavagna ?? []).map((x) => x.tex))];
    expect(formule.length).toBeGreaterThan(200);
    for (const f of formule) {
      const display = f.startsWith('\\displaystyle ');
      expect(() => katex.renderToString(display ? f.slice(14) : f, { throwOnError: true, displayMode: display, macros: { ...MACROS } }), f).not.toThrow();
    }
  });
  it('visual: id dei diagrammi validi; scene 3D con modalità nota', () => {
    const visuals = [...ALL_CONCEPTS.map((c) => c.visual), ...ALL_LESSONS.flatMap((l) => [l.visual, ...l.steps.map((s) => ('visual' in s ? s.visual : undefined))])].filter(Boolean);
    for (const v of visuals) {
      if (v!.kind === 'svg') expect(SVG_IDS).toContain(v!.id);
      else expect(MODES[v!.kind], v!.kind).toContain((v!.scene as { mode: string }).mode);
    }
  });
});
