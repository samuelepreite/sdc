/**
 * Motore del Cap. 2: teorema spettrale (Jacobi) e parametri di misura, con verifiche indipendenti
 * (definizioni geometriche dirette: lunghezze, angoli, aree, volumi dei trasformati; limite infinitesimo).
 */
import { describe, it, expect } from 'vitest';
import * as T from '../src/engine/tensor';
import { eigSym, spectralSum, classify } from '../src/engine/spettro';
import { finiteMeasures, linearMeasures, representation, principal, H_PRESETS, ellipsoid } from '../src/engine/deformazione';

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const r = T.mulberry32(7);
const N = 60;
const randSym = () => T.sym(T.randMat(r));
const orthoPair = (): [T.Vec, T.Vec] => {
  const n = T.unit(T.randVec(r));
  const m = T.unit(T.cross(n, T.randVec(r)));
  return [n, m];
};

describe('teorema spettrale (Teo 2.9.2) e invarianti', () => {
  it('E n̂_i = λ_i n̂_i, terna ortonormale destrorsa, λ1 ≥ λ2 ≥ λ3, ricostruzione spettrale', () => {
    for (let k = 0; k < N; k++) {
      const E = randSym();
      const s = eigSym(E);
      expect(s.values[0] >= s.values[1] && s.values[1] >= s.values[2]).toBe(true);
      for (let i = 0; i < 3; i++) {
        const En = T.apply(E, s.vectors[i]);
        for (let c = 0; c < 3; c++) expect(close(En[c], s.values[i] * s.vectors[i][c], 1e-8)).toBe(true);
        for (let j = 0; j < 3; j++) expect(close(T.dotv(s.vectors[i], s.vectors[j]), i === j ? 1 : 0, 1e-9)).toBe(true);
      }
      expect(close(T.triple(s.vectors[0], s.vectors[1], s.vectors[2]), 1)).toBe(true);
      const S = spectralSum(s);
      for (let c = 0; c < 9; c++) expect(close(S[c], E[c], 1e-8)).toBe(true);
      const [I, II, III] = T.invariants(E);
      const [a, b, cc] = s.values;
      expect(close(I, a + b + cc, 1e-8) && close(II, a * b + b * cc + cc * a, 1e-8) && close(III, a * b * cc, 1e-8)).toBe(true);
    }
  });
  it('radice doppia e tripla riconosciute; equazione secolare soddisfatta', () => {
    expect(eigSym(H_PRESETS.omotetia.H).caso).toBe('tripla');
    expect(eigSym(H_PRESETS.rivoluzione.H).caso).toBe('doppia');
    expect(eigSym(T.sym(H_PRESETS.generico.H)).caso).toBe('distinti');
    for (let k = 0; k < 20; k++) {
      const E = randSym();
      const [I, II, III] = T.invariants(E);
      for (const l of eigSym(E).values) expect(Math.abs(l ** 3 - I * l * l + II * l - III)).toBeLessThan(1e-8);
    }
  });
  it('lettura dagli invarianti (§2.10): 0, 1, 2 autovalori nulli', () => {
    expect(classify(T.sym(H_PRESETS.generico.H)).stato).toBe('triassiale');
    expect(classify(H_PRESETS.piana.H).stato).toBe('biassiale');
    expect(classify(H_PRESETS.allungamento.H).stato).toBe('monoassiale');
    expect(principal(H_PRESETS.piana.H).values.some((l) => Math.abs(l) < 1e-12)).toBe(true);
  });
  it('proprietà di estremo (Prop 2.9.4): e3 ≤ ε_n ≤ e1 per ogni n̂', () => {
    for (let k = 0; k < N; k++) {
      const E = randSym();
      const s = eigSym(E);
      const n = T.unit(T.randVec(r));
      const e = T.dotv(T.apply(E, n), n);
      expect(e <= s.values[0] + 1e-12 && e >= s.values[2] - 1e-12).toBe(true);
    }
  });
});

describe('parametri di misura finiti (§2.5) dalla geometria diretta', () => {
  it('ε_n, γ, ΔS, Θ coincidono con lunghezze, angoli, aree e volumi dei vettori trasformati', () => {
    for (let k = 0; k < N; k++) {
      const F = T.add(T.I3, T.scale(T.randMat(r), 0.15));
      const [n, m] = orthoPair();
      const f = finiteMeasures(F, n, m);
      const Fn = T.apply(F, n);
      const Fm = T.apply(F, m);
      expect(close(f.epsN, T.norm(Fn) - 1)).toBe(true);
      const theta = Math.acos(T.dotv(Fn, Fm) / (T.norm(Fn) * T.norm(Fm)));
      expect(close(f.gamma, Math.PI / 2 - theta, 1e-8)).toBe(true);
      expect(close(f.dS, T.norm(T.cross(Fn, Fm)) - 1, 1e-9)).toBe(true);
      const p = T.cross(n, m);
      expect(close(f.Theta, T.triple(Fn, Fm, T.apply(F, p)) / T.triple(n, m, p) - 1, 1e-9)).toBe(true);
      // D simmetrico e ε_n = √(2Dn·n + 1) − 1
      expect(close(f.epsN, Math.sqrt(2 * T.dotv(T.apply(f.D, n), n) + 1) - 1)).toBe(true);
    }
  });
  it('limite infinitesimo (§2.6.3): i parametri finiti con F = I + εH tendono ai linearizzati, errore O(ε²)', () => {
    for (let k = 0; k < 20; k++) {
      const H = T.randMat(r);
      const [n, m] = orthoPair();
      const lin = linearMeasures(H, n, m);
      for (const eps of [1e-3, 1e-4]) {
        const fin = finiteMeasures(T.add(T.I3, T.scale(H, eps)), n, m);
        const tol = 50 * eps * eps;
        expect(Math.abs(fin.epsN - eps * lin.epsN)).toBeLessThan(tol);
        expect(Math.abs(fin.gamma - eps * lin.gamma)).toBeLessThan(tol);
        expect(Math.abs(fin.dS - eps * lin.dS)).toBeLessThan(tol);
        expect(Math.abs(fin.Theta - eps * lin.Theta)).toBeLessThan(tol);
      }
    }
  });
  it('rotazione rigida finita: nessuna deformazione (D = O, ε = γ = Θ = 0)', () => {
    const R = T.eulerR(T.unit([1, 2, 3]), 0.9);
    const f = finiteMeasures(R, [1, 0, 0], [0, 1, 0]);
    expect(T.fnorm(f.D)).toBeLessThan(1e-12);
    expect(Math.abs(f.epsN) + Math.abs(f.gamma) + Math.abs(f.Theta)).toBeLessThan(1e-12);
  });
});

describe('teoria infinitesima (§2.6–2.7)', () => {
  it('E_ii = ε_i, E_ij = γ_ij/2, Θ = tr E; spostamento rigido infinitesimo: E = O', () => {
    for (let k = 0; k < 20; k++) {
      const H = T.randMat(r);
      const l = linearMeasures(H, [1, 0, 0], [0, 1, 0]);
      expect(close(l.epsN, l.E[0]) && close(l.gamma, 2 * l.E[1]) && close(l.Theta, T.trace(H))).toBe(true);
      const W = T.skw(H);
      expect(T.fnorm(linearMeasures(W, [1, 0, 0], [0, 1, 0]).E)).toBeLessThan(1e-14);
    }
  });
  it('formula di rappresentazione (Teo 2.7.1): somma esatta per un campo affine; W(Y−X) ⊥ (Y−X)', () => {
    for (let k = 0; k < N; k++) {
      const H = T.randMat(r);
      const u0 = T.randVec(r);
      const X = T.randVec(r);
      const Y = T.randVec(r);
      const uX = T.addv(u0, T.apply(H, X));
      const uY = T.addv(u0, T.apply(H, Y));
      const rep = representation(H, uX, T.subv(Y, X));
      for (let c = 0; c < 3; c++) expect(close(rep.uY[c], uY[c], 1e-9)).toBe(true);
      expect(Math.abs(rep.rotDotD)).toBeLessThan(1e-12);
    }
  });
  it('ellissoide: la sfera sotto I + kE ha semiassi 1 + kλ_i lungo le direzioni principali', () => {
    const E = T.sym(H_PRESETS.generico.H);
    const el = ellipsoid(E, 10);
    for (let i = 0; i < 3; i++) {
      const img = T.apply(T.add(T.I3, T.scale(E, 10)), el.axes[i]);
      expect(close(T.norm(img), el.semi[i], 1e-9)).toBe(true);
    }
  });
});

describe('compatibilità (§2.8)', () => {
  it('residuo di Saint-Venant: 0 per il campo che viene da uno spostamento, 2c per E11 = c y²', async () => {
    const { COMPAT_FIELDS, saintVenantResidual } = await import('../src/engine/deformazione');
    const c = 0.12;
    expect(Math.abs(saintVenantResidual(COMPAT_FIELDS.compatibile.E(c), 0.4, -0.3))).toBeLessThan(1e-6);
    expect(Math.abs(saintVenantResidual(COMPAT_FIELDS.incompatibile.E(c), 0.4, -0.3) - 2 * c)).toBeLessThan(1e-5);
    // il campo compatibile è proprio sym ∇u dello spostamento dichiarato
    const h = 1e-6;
    const u = (x: number, y: number) => COMPAT_FIELDS.compatibile.u(x, y, c);
    const [x, y] = [0.7, -0.2];
    const E11 = (u(x + h, y)[0] - u(x - h, y)[0]) / (2 * h);
    const E12 = 0.5 * ((u(x, y + h)[0] - u(x, y - h)[0]) / (2 * h) + (u(x + h, y)[1] - u(x - h, y)[1]) / (2 * h));
    expect(Math.abs(E11 - COMPAT_FIELDS.compatibile.E(c)(x, y)[0]) + Math.abs(E12)).toBeLessThan(1e-6);
  });
});
