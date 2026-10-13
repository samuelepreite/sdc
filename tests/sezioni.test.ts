/**
 * Motore del Cap. 5, prima parte: geometria delle aree e soluzioni di Saint-Venant confrontate con le formule della
 * dispensa (§5.4–5.6). Ogni campo di spostamento è derivato numericamente e confrontato con il legame inverso.
 */
import { describe, expect, it } from 'vitest';
import * as S from '../src/engine/sezioni';

const close = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

describe('geometria delle aree', () => {
  it('rettangolo: A = BH, J_x = BH³/12, J_y = HB³/12', () => {
    const p = S.principal(S.SEZIONI.rettangolo.poly);
    expect(close(p.A, 800)).toBe(true);
    expect(close(p.Jx, (20 * 40 ** 3) / 12)).toBe(true);
    expect(close(p.Jy, (40 * 20 ** 3) / 12)).toBe(true);
  });
  it('cerchio: J ≈ πR⁴/4 (poligono di 96 lati, errore < 0,2%)', () => {
    const p = S.principal(S.SEZIONI.cerchio.poly);
    expect(Math.abs(p.Jx / ((Math.PI * 12 ** 4) / 4) - 1)).toBeLessThan(2e-3);
  });
  it('L a lati uguali: APCdI sulla bisettrice, baricentro fuori dalla figura, J_xy = 0 negli assi principali', () => {
    const q = S.areaProps(S.SEZIONI.L.poly);
    expect(close(q.xG, q.yG)).toBe(true);
    expect(S.inside(S.SEZIONI.L.poly, [q.xG, q.yG])).toBe(false);
    const p = S.principal(S.SEZIONI.L.poly);
    expect(Math.abs(Math.abs(p.psi) - Math.PI / 4)).toBeLessThan(1e-9);
    expect(p.Jxy).toBe(0);
    expect(p.Jx).toBeGreaterThan(p.Jy);
  });
  it('per ogni sezione: x di inerzia massima e J(ψ) massimo sull’APCdI', () => {
    for (const k of Object.keys(S.SEZIONI)) {
      const p = S.principal(S.SEZIONI[k].poly);
      expect(p.Jx + 1e-9).toBeGreaterThanOrEqual(p.Jy);
      for (let a = 0; a < Math.PI; a += 0.1) expect(S.inertiaAt(p, a)).toBeLessThanOrEqual(p.Jx * (1 + 1e-12));
    }
  });
  it('doppio T più rigido del rettangolo di pari area (§5.5.3, osservazione sulla forma)', () => {
    const dt = S.principal(S.SEZIONI.doppioT.poly);
    const B = dt.A / 40;
    expect(dt.Jx).toBeGreaterThan((B * 40 ** 3) / 12);
  });
});

describe('Saint-Venant: spostamenti congruenti con il legame inverso', () => {
  const sec = S.principal(S.SEZIONI.T.poly);
  const E = 3,
    nu = 0.27;
  const cases: S.Loads[] = [
    { N: 5, Mx: 0, My: 0 },
    { N: 0, Mx: 7, My: 0 },
    { N: 0, Mx: 0, My: -4 },
    { N: 2, Mx: -3, My: 6 },
  ];
  for (const L of cases)
    it(`N=${L.N}, Mx=${L.Mx}, My=${L.My}`, () => {
      for (const p of [
        [0.3, -0.7, 1.1],
        [-1.2, 2.5, 0.4],
        [4, 1, 3],
      ] as [number, number, number][]) {
        const e = S.strainOf((q) => S.displacement(L, sec, E, nu, q), p);
        const s = S.sigmaZ(L, sec, p[0], p[1]);
        expect(close(e.zz, s / E, 1e-6)).toBe(true);
        expect(close(e.xx, (-nu * s) / E, 1e-6)).toBe(true);
        expect(close(e.yy, (-nu * s) / E, 1e-6)).toBe(true);
        for (const c of [e.xy, e.yz, e.zx]) expect(Math.abs(c)).toBeLessThan(1e-6);
      }
    });
  it('flessione retta: v dell’asse = −M_x z²/(2EJ_x), curvatura M_x/(EJ_x), anticlastica ρ′ = −EJ_x/(νM_x)', () => {
    const L = { N: 0, Mx: 5, My: 0 };
    const v = (z: number) => S.displacement(L, sec, E, nu, [0, 0, z])[1];
    expect(close(v(2), (-5 * 4) / (2 * E * sec.Jx))).toBe(true);
    const k = -(v(1.001) - 2 * v(1) + v(0.999)) / 1e-6;
    expect(close(k, 5 / (E * sec.Jx), 1e-4)).toBe(true);
    const vx = (x: number) => S.displacement(L, sec, E, nu, [x, 0, 0])[1];
    const kp = (vx(0.001) - 2 * vx(0) + vx(-0.001)) / 1e-6;
    expect(close(1 / kp, (E * sec.Jx) / (nu * 5), 1e-4)).toBe(true);
  });
});

describe('flessione deviata (§5.5.5)', () => {
  const sec = S.principal(S.SEZIONI.rettangolo.poly);
  it('binomia = monomia; I e II teorema; M ha componente positiva lungo n', () => {
    for (let a = -3; a < 3.1; a += 0.37) {
      const g = S.bendingAngles(a, sec.rx2, sec.ry2);
      expect(close(Math.tan(g.beta) * Math.tan(g.gamma), -sec.rx2 / sec.ry2, 1e-8)).toBe(true);
      expect(close(Math.tan(g.theta) * Math.tan(g.beta), -1, 1e-8)).toBe(true);
      expect(Math.cos(g.delta)).toBeGreaterThan(0);
      const L = { N: 0, Mx: 9 * Math.cos(a), My: 9 * Math.sin(a) };
      for (const [x, y] of [
        [3, -7],
        [-8, 15],
      ])
        expect(close(S.monomia(9, a, sec, x, y).sigma, S.sigmaZ(L, sec, x, y), 1e-9)).toBe(true);
    }
  });
  it('retta: α = 0 ⇒ β = 0 (n ≡ x), θ = π/2 (f ≡ y)', () => {
    const g = S.bendingAngles(0, sec.rx2, sec.ry2);
    expect(g.beta).toBe(0);
    expect(close(g.theta, Math.PI / 2)).toBe(true);
  });
});

describe('CdS e sforzo normale eccentrico', () => {
  it('leggi di variazione (Teo 5.2.3) = equilibrio del tratto di destra', () => {
    const b = { Tx: 2, Ty: -3, N: 4, Mx: 5, My: 1, Mz: 0.5 };
    const c = S.cds(1, 4, b);
    expect(c.Mx).toBe(5 + 3 * 3);
    expect(c.My).toBe(1 + 2 * 3);
  });
  it('rettangolo: nocciolo = rombo dei terzi medi (±H/6, ±B/6)', () => {
    const p = S.principal(S.SEZIONI.rettangolo.poly);
    const n = S.nocciolo(p);
    const xs = n.map((q) => Math.abs(q[0])),
      ys = n.map((q) => Math.abs(q[1]));
    expect(close(Math.max(...ys), 40 / 6)).toBe(true);
    expect(close(Math.max(...xs), 20 / 6)).toBe(true);
    expect(n.length).toBe(4);
  });
  it('cerchio: nocciolo di raggio R/4', () => {
    const p = S.principal(S.SEZIONI.cerchio.poly);
    const r = S.nocciolo(p).map((q) => Math.hypot(q[0], q[1]));
    expect(Math.abs(Math.max(...r) / 3 - 1)).toBeLessThan(5e-3);
  });
  it('centro sul contorno del nocciolo ⇒ asse neutro radente (σ = 0 a un lembo)', () => {
    const p = S.principal(S.SEZIONI.T.poly);
    const n = S.nocciolo(p);
    const c = n[1];
    const vals = p.poly.map(([x, y]) => S.trinomia(-10, c, p, x, y));
    expect(Math.max(...vals)).toBeLessThan(1e-9);
    expect(Math.min(...vals.map(Math.abs))).toBeLessThan(1e-9);
  });
  it('regola delle 3u: il triangolo di tensioni ha risultante N applicata nel centro', () => {
    const B = 20,
      H = 40,
      N = 100,
      e = 12;
    const r = S.treU(N, B, H, e);
    expect(r.parzializzata).toBe(true);
    expect(close(0.5 * r.sMax * B * r.reag, N)).toBe(true);
    // risultante a un terzo della parte reagente dal lembo compresso = a distanza u dal lembo: il centro
    expect(close(r.reag / 3, H / 2 - e)).toBe(true);
    const f = S.treU(N, B, H, H / 6);
    expect(close(f.sMin, 0)).toBe(true);
  });
});
