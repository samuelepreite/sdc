/**
 * Motore del Cap. 6: criteri di resistenza confrontati con le formule e le verifiche della dispensa.
 */
import { describe, expect, it } from 'vitest';
import * as C from '../src/engine/criteri';
import * as T from '../src/engine/tensor';
import * as El from '../src/engine/elastico';
import { eigSym } from '../src/engine/spettro';

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const symRand = (): T.Mat => {
  const a = Array.from({ length: 6 }, rnd);
  return [a[0], a[3], a[5], a[3], a[1], a[4], a[5], a[4], a[2]];
};

describe('criteri in tensioni principali', () => {
  it('stato monoassiale: tutte le tensioni ideali valgono σ (equivalenza del cimento)', () => {
    const s: C.S3 = [3, 0, 0];
    expect(C.tresca(s)).toBe(3);
    expect(C.vonMises(s)).toBeCloseTo(3, 12);
    expect(C.beltrami(s, 0.3)).toBeCloseTo(3, 12);
    expect(C.grashof(s, 0.3).t).toBe(3);
    expect(C.galileo(s).t).toBe(3);
  });
  it('Beltrami: σ_id = √(2Eφ) con φ di Prop 4.14.1', () => {
    for (let k = 0; k < 20; k++) {
      const s = C.sortS([rnd(), rnd(), rnd()]);
      const phi = El.energyPrincipal(2, 0.25, s);
      expect(close(C.beltrami(s, 0.25), Math.sqrt(2 * 2 * phi))).toBe(true);
    }
  });
  it('Huber: Beltrami prevede la crisi a h_L, von Mises e Tresca mai (pressure insensitive)', () => {
    const p = 5;
    const s: C.S3 = [-p, -p, -p];
    expect(close(C.beltrami(s, 0.3), p * Math.sqrt(3 - 6 * 0.3))).toBe(true);
    expect(C.vonMises(s)).toBe(0);
    expect(C.tresca(s)).toBe(0);
    expect(close(C.huberDepth(10, 2, 0.3) * 2 * Math.sqrt(3 - 1.8), 10)).toBe(true);
    // segni invertiti: trazione uniforme
    expect(C.beltrami([p, p, p], 0.3)).toBeGreaterThan(0);
    expect(C.sceltaCriterio([p, p, p])).toBe('Beltrami');
    expect(C.sceltaCriterio(s)).toBe('von Mises');
  });
});

describe('secondo teorema di decomposizione ed energia distorcente (§6.5)', () => {
  it('sph + dev = A, tr dev = 0, sph · dev = 0', () => {
    for (let k = 0; k < 10; k++) {
      const A = symRand();
      expect(T.fnorm(T.sub(T.add(C.sph(A), C.dev(A)), A))).toBeLessThan(1e-14);
      expect(Math.abs(T.trace(C.dev(A)))).toBeLessThan(1e-14);
      expect(Math.abs(T.ddot(C.sph(A), C.dev(A)))).toBeLessThan(1e-14);
    }
  });
  it('isotropi: T_d = 2μE_d, φ = φ(E_s) + φ(E_d), φ_d = ½𝔸E_d·E_d = forma in principali', () => {
    const mu = 1.3,
      la = 0.7;
    const A = El.lameTensor(mu, la);
    for (let k = 0; k < 10; k++) {
      const E = symRand();
      const S = El.stressIso(mu, la, E);
      expect(T.fnorm(T.sub(C.dev(S), T.scale(C.dev(E), 2 * mu)))).toBeLessThan(1e-12);
      expect(close(El.energy(A, E), El.energy(A, C.sph(E)) + El.energy(A, C.dev(E)))).toBe(true);
      const phid = El.energy(A, C.dev(E));
      expect(close(phid, C.phiD(S, mu))).toBe(true);
      const s = C.sortS(eigSym(S).values);
      expect(close(phid, C.phiDprincipal(s, mu), 1e-8)).toBe(true);
    }
  });
  it('von Mises: φ_d(s) ≤ φ_d(σ_L,0,0) ⟺ σ_id ≤ σ_L', () => {
    const mu = 0.8;
    for (let k = 0; k < 20; k++) {
      const s = C.sortS([rnd(), rnd(), rnd()]);
      const sL = C.vonMises(s);
      expect(close(C.phiDprincipal(s, mu), C.phiDprincipal([sL, 0, 0], mu))).toBe(true);
    }
  });
});

describe('Mohr–Coulomb (§6.6)', () => {
  it('F ≤ 2c cos φ ⟺ il cerchio massimo non supera la retta del dominio', () => {
    for (let k = 0; k < 200; k++) {
      const s = C.sortS([3 * rnd(), 3 * rnd(), 3 * rnd()]);
      const c = 1 + rnd() * 0.5,
        phi = 0.3 + 0.3 * rnd();
      const mc = C.mohrCoulomb(s, c, phi);
      expect(mc.ok, `${s}`).toBe(C.mcMargin(s, c, phi) >= -1e-12);
    }
  });
  it('la coppia (1,3) dà il massimo', () => {
    const s: C.S3 = [2, 0.5, -1];
    const phi = 0.5;
    expect(C.mohrCoulomb(s, 1, phi).F).toBeCloseTo(s[0] - s[2] + (s[0] + s[2]) * Math.sin(phi), 12);
  });
});

describe('stati alla Saint-Venant (§6.7)', () => {
  it('formule chiuse = criteri generali sulle principali del tensore', () => {
    for (let k = 0; k < 30; k++) {
      const sz = 2 * rnd(),
        tx = rnd(),
        ty = rnd(),
        nu = 0.25;
      const S: T.Mat = [0, 0, tx, 0, 0, ty, tx, ty, sz];
      const s = C.sortS(eigSym(S).values);
      const id = C.svIdeal(sz, tx, ty, nu);
      expect(close(id.tresca, C.tresca(s), 1e-8)).toBe(true);
      expect(close(id.vonMises, C.vonMises(s), 1e-8)).toBe(true);
      const p = C.svPrincipal(sz, tx, ty);
      expect(close(id.grashofT, p.a - nu * p.b, 1e-12)).toBe(true);
      expect(close(id.grashofC, p.b - nu * p.a, 1e-12)).toBe(true);
    }
  });
  it('controprova della dispensa: puro taglio, σ_id^t di Grashof = (1+ν)τ', () => {
    expect(close(C.svIdeal(0, 2, 0, 0.3).grashofT, 1.3 * 2)).toBe(true);
  });
});
