/**
 * Motore del Cap. 3: esercizio svolto §3.14 ed esempio §3.17.2 confrontati con i numeri della dispensa;
 * proprietà di estremo e τ_max per campionamento casuale (strada indipendente dai moltiplicatori di Lagrange);
 * formule di Mohr confrontate con il calcolo tensoriale; arbelo.
 */
import { describe, it, expect } from 'vitest';
import * as T from '../src/engine/tensor';
import { traction, principalStress, tauMax, mohr, arbelo, inArbelo, ES_314, ES_314_N, ES_3172 } from '../src/engine/tensione';

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const r = T.mulberry32(31);
const randSym = () => T.sym(T.randMat(r));

describe('esercizio svolto §3.14 (pp. 54–56)', () => {
  const p = principalStress(ES_314);
  it('classificazione: III = 0, II = −45, I = 0 → biassiale', () => {
    expect(close(p.invarianti[0], 0) && close(p.invarianti[1], -45) && Math.abs(p.invarianti[2]) < 1e-12).toBe(true);
    expect(p.stato).toBe('biassiale');
  });
  it('tensioni principali 3√5, 0, −3√5 e direzioni della dispensa (a meno del verso)', () => {
    expect(close(p.s[0], 3 * Math.sqrt(5)) && Math.abs(p.s[1]) < 1e-12 && close(p.s[2], -3 * Math.sqrt(5))).toBe(true);
    const n1: T.Vec = [Math.sqrt(10) / 10, -Math.sqrt(2) / 2, -Math.sqrt(10) / 5];
    const n2: T.Vec = [(2 * Math.sqrt(5)) / 5, 0, Math.sqrt(5) / 5];
    expect(close(Math.abs(T.dotv(p.n[0], n1)), 1)).toBe(true);
    expect(close(Math.abs(T.dotv(p.n[1], n2)), 1)).toBe(true);
    // NF-05: T n̂3 = −3√5 n̂3 con n̂3 = n̂1 ∧ n̂2
    const n3 = T.cross(n1, n2);
    const Tn3 = T.apply(ES_314, n3);
    for (let k = 0; k < 3; k++) expect(close(Tn3[k], -3 * Math.sqrt(5) * n3[k])).toBe(true);
    expect(close(n3[0], -Math.sqrt(10) / 10) && close(n3[1], -Math.sqrt(2) / 2) && close(n3[2], Math.sqrt(10) / 5)).toBe(true);
  });
  it('τ_max = 3√5 con σ = 0 sulla sua giacitura', () => {
    const t = tauMax(ES_314);
    expect(close(t.value, 3 * Math.sqrt(5)) && Math.abs(t.sigmaOn) < 1e-12).toBe(true);
    const tr = traction(ES_314, t.m, t.nu);
    expect(close(Math.abs(tr.tauNu), 3 * Math.sqrt(5)) && Math.abs(tr.sigma) < 1e-12).toBe(true);
  });
  it('punto 4: σ_n = 5, τ_n = 2√5, |t_n|² = 45', () => {
    const tr = traction(ES_314, ES_314_N);
    expect(close(tr.sigma, 5) && close(tr.tau, 2 * Math.sqrt(5)) && close(T.dotv(tr.t, tr.t), 45)).toBe(true);
    const mu: T.Vec = T.scalev([1, 5, -2], -Math.sqrt(30) / 30);
    for (let k = 0; k < 3; k++) expect(close(tr.mu[k], mu[k])).toBe(true);
  });
});

describe('estremi (§3.13) per campionamento casuale', () => {
  it('s3 ≤ σ_m ≤ s1 e |τ_mν| ≤ (s1 − s3)/2 per ogni giacitura e direzione', () => {
    for (let k = 0; k < 30; k++) {
      const Tm = randSym();
      const p = principalStress(Tm);
      const tm = tauMax(Tm).value;
      let best = 0;
      for (let j = 0; j < 400; j++) {
        const m = T.unit(T.randVec(r));
        const nu = T.unit(T.cross(m, T.randVec(r)));
        const tr = traction(Tm, m, nu);
        expect(tr.sigma <= p.s[0] + 1e-12 && tr.sigma >= p.s[2] - 1e-12).toBe(true);
        expect(Math.abs(tr.tauNu) <= tm + 1e-12 && tr.tau <= tm + 1e-12).toBe(true);
        best = Math.max(best, tr.tau);
      }
      expect(best).toBeGreaterThan(0.9 * tm); // il campionamento si avvicina al massimo
    }
  });
});

describe('cerchio di Mohr (§3.15)', () => {
  it('formule di σ_m, τ_mν = calcolo tensoriale con m̂ = (cos α, sin α, 0), ν̂ = (−sin α, cos α, 0)', () => {
    for (let k = 0; k < 40; k++) {
      const inp = { s1: 4 * r() - 2, s2: 4 * r() - 2, t12: 4 * r() - 2 };
      const Tm: T.Mat = [inp.s1, inp.t12, 0, inp.t12, inp.s2, 0, 0, 0, 3 * r()];
      const M = mohr(inp);
      const a = 2 * Math.PI * r();
      const tr = traction(Tm, [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0]);
      const q = M.at(a);
      expect(close(q.sigma, tr.sigma) && close(q.tau, tr.tauNu)).toBe(true);
      expect(close((q.sigma - M.C) ** 2 + q.tau ** 2, M.R ** 2)).toBe(true);
      // γ: piano principale di s1, tangenziale nulla
      expect(close(M.at(M.gamma).sigma, M.sMax, 1e-9) && Math.abs(M.at(M.gamma).tau) < 1e-9).toBe(true);
      // facce ortogonali → punti diametralmente opposti
      const o = M.at(a + Math.PI / 2);
      expect(close(o.sigma + q.sigma, 2 * M.C) && close(o.tau, -q.tau)).toBe(true);
    }
  });
  it('esempio §3.17.2: R = 46,96; s = 102,96 e 9,04 MPa; γ = 13,28°; α = 30°: σ = 95,19, τ = −25,87, σ_ν = 16,81', () => {
    const M = mohr(ES_3172);
    const r2 = (x: number) => Math.round(x * 100) / 100;
    expect(r2(M.R)).toBe(46.96);
    expect(r2(M.sMax)).toBe(102.96);
    expect(r2(M.sMin)).toBe(9.04);
    expect(r2((M.gamma * 180) / Math.PI)).toBe(13.28);
    const q = M.at(Math.PI / 6);
    expect(r2(q.sigma)).toBe(95.19);
    expect(r2(q.tau)).toBe(-25.87);
    expect(r2(M.at(Math.PI / 6 + Math.PI / 2).sigma)).toBe(16.81);
    // τ max assoluta (arbelo): s1/2 = 51,48
    expect(r2(arbelo([M.sMax, M.sMin, 0].sort((a, b) => b - a) as [number, number, number])[1].R)).toBe(51.48);
  });
});

describe('arbelo (Teo 3.17.1)', () => {
  it('ogni giacitura cade tra il cerchio massimo e i due minori', () => {
    for (let k = 0; k < 20; k++) {
      const Tm = randSym();
      const p = principalStress(Tm);
      for (let j = 0; j < 200; j++) {
        const tr = traction(Tm, T.randVec(r));
        expect(inArbelo(p.s, tr.sigma, tr.tau, 1e-7)).toBe(true);
      }
    }
  });
});

describe('costruzione con il polo (§3.15.4, come la disegna il diagramma)', () => {
  it('Q_m sta sulla retta per P(σ1, −τ12) parallela a ν̂ (nel piano di Mohr: direzione (−sin α, −cos α))', () => {
    for (let k = 0; k < 40; k++) {
      const inp = { s1: 4 * r() - 2, s2: 4 * r() - 2, t12: 4 * r() - 2 };
      const M = mohr(inp);
      const a = Math.PI * (r() - 0.5);
      const q = M.at(a);
      const vx = q.sigma - M.pole[0];
      const vy = q.tau - M.pole[1];
      expect(Math.abs(vx * -Math.cos(a) - vy * -Math.sin(a))).toBeLessThan(1e-12);
    }
  });
});
