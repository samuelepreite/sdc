/**
 * Motore del Cap. 5, seconda parte: Jourawski (§5.7) e torsione (§5.8) confrontati con i risultati della dispensa
 * e con risultati classici di controllo (segnalati come tali).
 */
import { describe, expect, it } from 'vitest';
import * as J from '../src/engine/taglio';
import * as Tor from '../src/engine/torsione';
import { SEZIONI, principal } from '../src/engine/sezioni';

const rel = (a: number, b: number) => Math.abs(a - b) / Math.max(1e-12, Math.abs(b));

describe('Jourawski (§5.7.2)', () => {
  it('rettangolo: τ̄ parabolica, massimo sulla corda baricentrica = 3T/(2A) (controllo classico)', () => {
    const d = J.shearDiagram('rettangolo', 10, 200);
    const m = d.pts.reduce((a, b) => (b.tau > a.tau ? b : a));
    expect(Math.abs(m.y)).toBeLessThan(0.3);
    expect(rel(m.tau, (3 * 10) / (2 * 800))).toBeLessThan(1e-3);
    const c = J.jourawski(d.pr.poly, 10, 0, d.pr.Jx);
    expect(rel(c.tau, (3 * 10) / (2 * 800))).toBeLessThan(1e-12);
  });
  it('S_x = A_r y_Gr (Varignon) nullo ai lembi; τ̄ → 0 ai lembi', () => {
    const d = J.shearDiagram('T', 10, 200);
    expect(Math.abs(d.pts[0].tau)).toBeLessThan(0.02 * Math.max(...d.pts.map((p) => p.tau)));
    expect(Math.abs(d.pts[d.pts.length - 1].tau)).toBeLessThan(0.02 * Math.max(...d.pts.map((p) => p.tau)));
  });
  it('Prop 5.7.3: doppio T e cerchio con massimo sulla corda baricentrica; triangolo no', () => {
    for (const k of ['doppioT', 'cerchio']) {
      const d = J.shearDiagram(k, 10, 400);
      const m = d.pts.reduce((a, b) => (b.tau > a.tau ? b : a));
      expect(Math.abs(m.y), k).toBeLessThan((d.y1 - d.y0) * 0.01);
    }
    const t = J.shearDiagram('triangolo', 10, 400);
    const m = t.pts.reduce((a, b) => (b.tau > a.tau ? b : a));
    expect(Math.abs(m.y)).toBeGreaterThan((t.y1 - t.y0) * 0.05);
  });
  it('cerchio: massimo 4T/(3A) (controllo classico)', () => {
    const pr = principal(SEZIONI.cerchio.poly);
    const c = J.jourawski(pr.poly, 10, 0, pr.Jx);
    expect(rel(c.tau, (4 * 10) / (3 * pr.A))).toBeLessThan(2e-3);
  });
  it('doppio T: salto all’attacco ala–anima nel rapporto B/b (§5.7.2, oss. 5)', () => {
    const pr = principal(SEZIONI.doppioT.poly);
    const yj = 20 - 3;
    const ala = J.jourawski(pr.poly, 10, yj + 1e-6, pr.Jx);
    const anima = J.jourawski(pr.poly, 10, yj - 1e-6, pr.Jx);
    expect(rel(anima.tau / ala.tau, 20 / 1.5)).toBeLessThan(1e-4);
  });
  it('regola delle tangenti: rettangolo τ_zx ≡ 0, cerchio τ_zx = 0 sulla baricentrica, lineare e antisimmetrico', () => {
    const r = principal(SEZIONI.rettangolo.poly);
    const cr = J.jourawski(r.poly, 10, 7, r.Jx);
    expect(J.tangentRule(r.poly, 7, cr.tau)!.tauB).toBe(0);
    const c = principal(J.SEZ_TAGLIO.triangolo.poly);
    const yb = 5;
    const ch = J.jourawski(c.poly, 10, yb, c.Jx);
    const tr = J.tangentRule(c.poly, yb, ch.tau)!;
    expect(tr.at(-tr.xB)).toBeCloseTo(-tr.tauB, 12);
    expect(tr.at(0)).toBe(0);
    // τ_z · n̂ = 0 all'estremo B
    const k = principal(SEZIONI.cerchio.poly);
    const cc = J.jourawski(k.poly, 10, 0.4, k.Jx);
    const tc = J.tangentRule(k.poly, 0.4, cc.tau)!;
    expect(Math.abs(tc.tauB)).toBeLessThan(Math.abs(cc.tau) * 0.1);
  });
});

describe('torsione (§5.8)', () => {
  it('cerchio: q ≈ 1 e τ_max ≈ 2M_z/(πR³) dal risolutore numerico', () => {
    const g = Tor.prandtl(SEZIONI.cerchio.poly, 80);
    expect(Math.abs(g.q - 1)).toBeLessThan(0.04);
    const ex = Tor.circle(12, 100);
    const t = Tor.tauAt(g, 100, 0, 6);
    expect(rel(Math.hypot(...t), (2 * 100 * 6) / (Math.PI * 12 ** 4))).toBeLessThan(0.04);
    expect(ex.q).toBe(1);
  });
  it('rettangolo 20×40: β e α della tabella di §5.8.6 entro il 3%', () => {
    const g = Tor.prandtl(SEZIONI.rettangolo.poly, 100);
    const { alpha, beta } = Tor.rectCoeff(2);
    expect(rel(g.I, beta * 20 ** 3 * 40)).toBeLessThan(0.03);
    const tauMax = (100 / g.I) * g.gmax;
    expect(rel(tauMax, 100 / (alpha * 20 ** 2 * 40))).toBeLessThan(0.05);
    // massimo ai punti medi dei lati lunghi
    expect(Math.abs(g.at[1])).toBeLessThan(4);
    expect(g.q).toBeGreaterThan(1);
  });
  it('ellisse: F esatta soddisfa ∇²F = 2 e F = 0 sul bordo', () => {
    const e = Tor.ellipse(5, 3, 1);
    const h = 1e-3;
    const lap = (x: number, y: number) => (e.F(x + h, y) + e.F(x - h, y) + e.F(x, y + h) + e.F(x, y - h) - 4 * e.F(x, y)) / (h * h);
    expect(lap(1, 0.5)).toBeCloseTo(2, 4);
    expect(e.F(5 * Math.cos(0.3), 3 * Math.sin(0.3))).toBeCloseTo(0, 12);
  });
  it('rettangolo molto allungato: α, β → 1/3', () => {
    expect(Tor.rectCoeff(1e6).alpha).toBeCloseTo(1 / 3, 4);
  });
  it('tubolare chiuso e aperto: rapporto 3(B−t)/(2t) con Bredt e rettangoli allungati; la dispensa riporta 3(B−t)/t (NF-14)', () => {
    const c = Tor.tubeCompare(100, 2, 1000);
    expect(rel(c.ratio, (3 * 98) / 4)).toBeLessThan(1e-12);
    expect(c.dispensa).toBe(147);
  });
  it('Bredt: τ massima dove lo spessore è minimo', () => {
    expect(Tor.bredt(10, 50, 1)).toBeGreaterThan(Tor.bredt(10, 50, 2));
  });
});
