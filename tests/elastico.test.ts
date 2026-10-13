/**
 * Motore del Cap. 4: lemma fondamentale (integrali calcolati davvero, esatti per i polinomi usati), simmetrie del tensore
 * elastico, lavoro lungo cammini diversi, simmetrie materiali, Voigt, isotropia e restrizioni di plausibilità.
 */
import { describe, it, expect } from 'vitest';
import * as T from '../src/engine/tensor';
import * as El from '../src/engine/elastico';
import { eigSym } from '../src/engine/spettro';

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const r = T.mulberry32(44);
const randQV = (): El.QuadVec => ({ a: T.randVec(r), b: T.randMat(r), c: T.randMat(r) });
const randLT = (): El.LinTen => ({ p: T.randMat(r), q: Array.from({ length: 27 }, () => 4 * r() - 2) });
const rand81 = () => Array.from({ length: 81 }, () => 2 * r() - 1);
const samples = Array.from({ length: 4 }, () => T.sym(T.randMat(r)));

describe('lemma fondamentale e TLV (§4.2–4.3)', () => {
  it('∫∂B Tn·u = ∫B divT·u + ∫B T·H per campi qualsiasi (cubo unitario)', () => {
    for (let k = 0; k < 15; k++) {
      const [s, a, b] = El.lemmaTerms(randLT(), randQV());
      expect(close(s, a + b, 1e-10)).toBe(true);
    }
  });
  it('con T simmetrico solo E = sym H lavora: T·H = T·E (Sym ⊥ Skw)', () => {
    for (let k = 0; k < 20; k++) {
      const Ts = T.sym(T.randMat(r));
      const H = T.randMat(r);
      expect(close(T.ddot(Ts, H), T.ddot(Ts, T.sym(H)))).toBe(true);
    }
  });
});

describe('tensore elastico e iperelasticità (§4.8–4.9)', () => {
  it('simmetrie minori: 𝔸W = O per W antisimmetrico; 𝔸E simmetrico', () => {
    const A = El.symmetrize4(rand81(), false);
    const W = T.skw(T.randMat(r));
    expect(T.fnorm(T.apply4(A, W))).toBeLessThan(1e-12);
    const S = T.apply4(A, T.randMat(r));
    expect(T.fnorm(T.skw(S))).toBeLessThan(1e-12);
    expect(T.distinctComponents({ minor1: true, minor2: true })).toBe(36);
    expect(T.distinctComponents({ minor1: true, minor2: true, major: true })).toBe(21);
  });
  it('con la simmetria maggiore il lavoro non dipende dal cammino e vale ½𝔸E·E; senza, un cammino chiuso dà lavoro ≠ 0', () => {
    const Am = El.symmetrize4(rand81(), true);
    const E1 = T.sym(T.randMat(r));
    const E2 = T.sym(T.randMat(r));
    const straight = (a: number) => T.scale(E1, a);
    const curved = (a: number) => T.add(T.scale(E1, a * a), T.scale(E2, Math.sin(Math.PI * a)));
    const w1 = El.pathWork(Am, straight);
    const w2 = El.pathWork(Am, curved);
    expect(close(w1, El.energy(Am, E1), 1e-6) && close(w2, w1, 1e-6)).toBe(true);
    const An = El.symmetrize4(rand81(), false);
    const loop = (a: number) => T.add(T.scale(E1, Math.sin(2 * Math.PI * a)), T.scale(E2, 1 - Math.cos(2 * Math.PI * a)));
    expect(Math.abs(El.pathWork(An, loop))).toBeGreaterThan(1e-3);
    expect(Math.abs(El.pathWork(Am, loop))).toBeLessThan(1e-6);
  });
});

describe('simmetrie materiali e Voigt (§4.10–4.11)', () => {
  const iso = El.lameTensor(3, 2);
  it('isotropo: ogni ortogonale è trasformazione di simmetria; Voigt = blocchi λ+2μ, λ, μ', () => {
    for (let k = 0; k < 10; k++) {
      const Q = T.eulerR(T.unit(T.randVec(r)), 6 * r());
      expect(El.isSymmetryOf(iso, Q, samples)).toBe(true);
      expect(El.isSymmetryOf(iso, T.scale(Q, -1), samples)).toBe(true);
    }
    const C = El.voigtOf(iso);
    expect(C[0][0]).toBe(8);
    expect(C[0][1]).toBe(2);
    expect(C[3][3]).toBe(3);
    expect(C[0][3]).toBe(0);
    // {σ} = [C]{ε} con γ = 2E
    const E = T.sym(T.randMat(r));
    const s = El.toVoigtStress(T.apply4(iso, E));
    const e = El.toVoigtStrain(E);
    for (let i = 0; i < 6; i++) expect(close(s[i], C[i].reduce((acc, c, j) => acc + c * e[j], 0))).toBe(true);
  });
  it('ortotropo: riflessioni sui piani coordinati sì, rotazione generica no; −I sempre', () => {
    const O = El.orthotropic({ c11: 10, c22: 7, c33: 5, c12: 2, c13: 1.5, c23: 1, c44: 2, c55: 3, c66: 4 });
    for (const Q of [
      [-1, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, -1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, -1],
      T.scale(T.I3, -1),
    ])
      expect(El.isSymmetryOf(O, Q, samples)).toBe(true);
    expect(El.isSymmetryOf(O, T.eulerR(T.unit([1, 2, 3]), 0.7), samples)).toBe(false);
    const C = El.voigtOf(O);
    for (let i = 0; i < 3; i++) for (let j = 3; j < 6; j++) expect(C[i][j]).toBe(0);
  });
});

describe('elasticità isotropa (§4.12–4.15)', () => {
  it('legame inverso, moduli tecnici, E = 2G(1+ν), Θ = σm/K, coassialità', () => {
    for (let k = 0; k < 20; k++) {
      const Ey = 1 + 200 * r();
      const nu = -0.9 + 1.35 * r();
      const { mu, lambda } = El.lameFromTech(Ey, nu);
      const t = El.techFromLame(mu, lambda);
      expect(close(t.E, Ey) && close(t.nu, nu) && close(t.E, 2 * t.G * (1 + t.nu))).toBe(true);
      const E = T.sym(T.randMat(r));
      const S = El.stressIso(mu, lambda, E);
      const back = El.strainIso(Ey, nu, S);
      for (let n = 0; n < 9; n++) expect(close(back[n], E[n], 1e-8)).toBe(true);
      expect(close(T.trace(E), T.trace(S) / 3 / t.K, 1e-8)).toBe(true);
      const se = eigSym(E);
      for (const v of se.vectors) {
        const Sv = T.apply(S, v);
        expect(T.norm(T.cross(Sv, v))).toBeLessThan(1e-8 * (1 + T.norm(Sv)));
      }
      // energia con le tensioni principali = ½ T·E
      const ss = eigSym(S).values;
      expect(close(El.energyPrincipal(Ey, nu, ss), 0.5 * T.ddot(S, E), 1e-8)).toBe(true);
    }
  });
  it('Sylvester ⟺ μ > 0, 2μ + 3λ > 0 ⟺ E > 0, G > 0, −1 < ν < ½ (campioni casuali)', () => {
    for (let k = 0; k < 500; k++) {
      const mu = 4 * r() - 1;
      const lambda = 8 * r() - 4;
      const s = El.sylvester(mu, lambda);
      expect(s.pos).toBe(s.lame);
      if (Math.abs(mu + lambda) > 1e-6) {
        const t = El.techFromLame(mu, lambda);
        const tech = t.E > 0 && t.G > 0 && t.nu > -1 && t.nu < 0.5;
        expect(tech).toBe(s.lame);
      }
      // definita positività verificata direttamente: ½𝔸E·E > 0 su campioni
      if (s.lame) for (const E of samples) expect(El.energy(El.lameTensor(mu, lambda), E)).toBeGreaterThan(0);
    }
  });
});
