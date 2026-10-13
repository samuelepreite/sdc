/**
 * Motore del Cap. 1: proprietà della dispensa verificate su campioni casuali riproducibili e con strade indipendenti
 * (conteggio delle componenti per classi di equivalenza, teorema della divergenza con due integrazioni numeriche).
 */
import { describe, it, expect } from 'vitest';
import * as T from '../src/engine/tensor';
import { FIELD_PRESETS, divIntegral, fluxBySide, totalFlux, type PlaneField } from '../src/engine/campi';

const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
const closeM = (A: T.Mat, B: T.Mat, tol = 1e-9) => A.every((a, k) => close(a, B[k], tol));
const r = T.mulberry32(2026);
const N = 50;

describe('tensori del II ordine (§1.2–1.6)', () => {
  it('componenti: A_ij = A ê_j · ê_i e (Av)_i = Σ A_ij v_j', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(close(T.dotv(T.apply(A, T.basis(j)), T.basis(i)), T.at(A, i, j))).toBe(true);
    }
  });
  it('diade e base di Lin: (a⊗b)u = (b·u)a; A = Σ A_ij ê_i⊗ê_j', () => {
    for (let n = 0; n < N; n++) {
      const a = T.randVec(r), b = T.randVec(r), u = T.randVec(r), A = T.randMat(r);
      expect(T.apply(T.dyad(a, b), u).every((x, k) => close(x, T.dotv(b, u) * a[k]))).toBe(true);
      let S = T.O3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) S = T.add(S, T.scale(T.dyad(T.basis(i), T.basis(j)), T.at(A, i, j)));
      expect(closeM(S, A)).toBe(true);
    }
  });
  it('proiettori: u = (ê⊗ê)u + (I − ê⊗ê)u, la seconda parte è ortogonale a ê', () => {
    for (let n = 0; n < N; n++) {
      const e = T.unit(T.randVec(r)), u = T.randVec(r);
      const P = T.dyad(e, e), Q = T.sub(T.I3, P);
      const s = T.addv(T.apply(P, u), T.apply(Q, u));
      expect(s.every((x, k) => close(x, u[k]))).toBe(true);
      expect(close(T.dotv(T.apply(Q, u), e), 0)).toBe(true);
      expect(closeM(T.mul(P, P), P)).toBe(true); // idempotente
    }
  });
  it('trasposto: (AB)ᵀ = BᵀAᵀ, (Au)·v = (Aᵀv)·u', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r), B = T.randMat(r), u = T.randVec(r), v = T.randVec(r);
      expect(closeM(T.transpose(T.mul(A, B)), T.mul(T.transpose(B), T.transpose(A)))).toBe(true);
      expect(close(T.dotv(T.apply(A, u), v), T.dotv(T.apply(T.transpose(A), v), u))).toBe(true);
    }
  });
  it('I teorema di decomposizione (Teo 1.3.3): esistenza e unicità', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r);
      const E = T.sym(A), W = T.skw(A);
      expect(closeM(E, T.transpose(E))).toBe(true);
      expect(closeM(W, T.scale(T.transpose(W), -1))).toBe(true);
      expect(closeM(T.add(E, W), A)).toBe(true);
      expect([0, 4, 8].every((k) => W[k] === 0)).toBe(true);
    }
  });
  it('vettore assiale (Teo 1.3.4): W u = w ∧ u, W w = 0, Wu ⊥ u e ⊥ w', () => {
    for (let n = 0; n < N; n++) {
      const w = T.randVec(r), u = T.randVec(r);
      const W = T.skewOf(w);
      expect(T.apply(W, u).every((x, k) => close(x, T.cross(w, u)[k]))).toBe(true);
      expect(T.apply(W, w).every((x) => close(x, 0))).toBe(true);
      expect(close(T.dotv(T.apply(W, u), u), 0) && close(T.dotv(T.apply(W, u), w), 0)).toBe(true);
      expect(T.axialOf(W).every((x, k) => close(x, w[k]))).toBe(true);
    }
  });
  it('determinante (Def 1.4.1): rapporto dei prodotti misti, indipendente dalla terna; proprietà', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r), B = T.randMat(r), u = T.randVec(r), v = T.randVec(r), w = T.randVec(r);
      const ratio = T.triple(T.apply(A, u), T.apply(A, v), T.apply(A, w)) / T.triple(u, v, w);
      expect(close(ratio, T.det(A), 1e-7)).toBe(true);
      expect(close(T.det(T.mul(A, B)), T.det(A) * T.det(B))).toBe(true);
      expect(close(T.det(T.transpose(A)), T.det(A))).toBe(true);
      expect(close(T.det(T.scale(A, 2.5)), 2.5 ** 3 * T.det(A))).toBe(true);
      expect(close(T.det(T.inv(A)), 1 / T.det(A), 1e-7)).toBe(true);
      expect(closeM(T.mul(A, T.inv(A)), T.I3, 1e-7)).toBe(true);
      expect(closeM(T.transpose(T.inv(A)), T.inv(T.transpose(A)), 1e-7)).toBe(true);
    }
  });
  it('Eulero (1.1): R è una rotazione (RᵀR = I, det R = 1), R ê = ê, e R v − v − sinφ ê∧v = (1 − cosφ) ê∧(ê∧v)', () => {
    for (let n = 0; n < N; n++) {
      const e = T.unit(T.randVec(r)), v = T.randVec(r), phi = 2 * Math.PI * r();
      const R = T.eulerR(e, phi);
      expect(closeM(T.mul(T.transpose(R), R), T.I3)).toBe(true);
      expect(close(T.det(R), 1)).toBe(true);
      expect(T.apply(R, e).every((x, k) => close(x, e[k]))).toBe(true);
      const lhs = T.subv(T.subv(T.apply(R, v), v), T.scalev(T.cross(e, v), Math.sin(phi)));
      const rhs = T.scalev(T.cross(e, T.cross(e, v)), 1 - Math.cos(phi));
      expect(lhs.every((x, k) => close(x, rhs[k]))).toBe(true);
      expect(close(T.norm(T.apply(R, v)), T.norm(v))).toBe(true);
    }
  });
  it('rotazioni infinitesime: l\'errore di v + φ ê∧v rispetto a R v è O(φ²); la lunghezza si conserva solo al primo ordine', () => {
    const e = T.unit([0.3, -0.5, 0.8]), v: T.Vec = [1, 0.4, -0.2];
    const err = (phi: number) => T.norm(T.subv(T.apply(T.eulerR(e, phi), v), T.addv(v, T.scalev(T.cross(e, v), phi))));
    // dimezzando φ l'errore si riduce di circa 4 volte
    expect(err(0.02) / err(0.01)).toBeGreaterThan(3.9);
    expect(err(0.02) / err(0.01)).toBeLessThan(4.1);
    const len = (phi: number) => T.norm(T.addv(v, T.scalev(T.cross(e, v), phi))) - T.norm(v);
    expect(len(0.02) / len(0.01)).toBeGreaterThan(3.9);
  });
  it('ortogonali: una riflessione ha det = −1 e conserva i prodotti scalari', () => {
    const P: T.Mat = [1, 0, 0, 0, 1, 0, 0, 0, -1];
    expect(T.det(P)).toBe(-1);
    for (let n = 0; n < 10; n++) {
      const u = T.randVec(r), v = T.randVec(r);
      expect(close(T.dotv(T.apply(P, u), T.apply(P, v)), T.dotv(u, v))).toBe(true);
    }
  });
  it('traccia e prodotto scalare (§1.6): tr(a⊗b) = a·b, tr(AB) = tr(BA), tr W = 0, A·I = tr A, A·(a⊗b) = Ab·a, E·W = 0', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r), B = T.randMat(r), a = T.randVec(r), b = T.randVec(r);
      expect(close(T.trace(T.dyad(a, b)), T.dotv(a, b))).toBe(true);
      expect(close(T.trace(T.mul(A, B)), T.trace(T.mul(B, A)))).toBe(true);
      expect(close(T.trace(T.skw(A)), 0)).toBe(true);
      expect(close(T.ddot(A, B), T.trace(T.mul(A, T.transpose(B))))).toBe(true);
      expect(close(T.ddot(A, T.I3), T.trace(A))).toBe(true);
      expect(close(T.ddot(A, T.dyad(a, b)), T.dotv(T.apply(A, b), a))).toBe(true);
      expect(close(T.ddot(T.sym(A), T.skw(B)), 0)).toBe(true);
      // Pitagora in Lin = Sym ⊕ Skw
      expect(close(T.ddot(A, A), T.ddot(T.sym(A), T.sym(A)) + T.ddot(T.skw(A), T.skw(A)))).toBe(true);
    }
  });
  it('solo i tensori sferici commutano con tutti: λI sì, un tensore generico no', () => {
    const A = T.randMat(r);
    expect(closeM(T.mul(T.scale(T.I3, 2.3), A), T.mul(A, T.scale(T.I3, 2.3)))).toBe(true);
    const B = T.randMat(r);
    expect(closeM(T.mul(A, B), T.mul(B, A))).toBe(false);
  });
  it('invarianti: I, II, III non cambiano ruotando il riferimento (QAQᵀ)', () => {
    for (let n = 0; n < N; n++) {
      const A = T.randMat(r), Q = T.eulerR(T.unit(T.randVec(r)), 6 * r());
      const B = T.mul(T.mul(Q, A), T.transpose(Q));
      const [a1, a2, a3] = T.invariants(A), [b1, b2, b3] = T.invariants(B);
      expect(close(a1, b1) && close(a2, b2) && close(a3, b3)).toBe(true);
    }
  });
});

describe('tensori del IV ordine (§1.7)', () => {
  it('conteggio delle componenti distinte: 81, 36 (due minori), 21 (minori + maggiore); una sola minore: 54', () => {
    expect(T.distinctComponents({})).toBe(81);
    expect(T.distinctComponents({ minor1: true, minor2: true })).toBe(36);
    expect(T.distinctComponents({ minor1: true, minor2: true, major: true })).toBe(21);
    expect(T.distinctComponents({ minor1: true })).toBe(54);
    expect(T.distinctComponents({ major: true })).toBe(45);
  });
  it('trasposto: 𝔸A·B = 𝔸ᵀB·A; seconda simmetria minore ⇔ 𝔸W = O', () => {
    const Tn = Array.from({ length: 81 }, () => 2 * r() - 1);
    for (let n = 0; n < 10; n++) {
      const A = T.randMat(r), B = T.randMat(r);
      expect(close(T.ddot(T.apply4(Tn, A), B), T.ddot(T.apply4(T.transpose4(Tn), B), A))).toBe(true);
    }
    // simmetrizzo rispetto a h, k: allora 𝔸W = O per ogni W antisimmetrico
    const S = Tn.map((_, k) => {
      const i = Math.floor(k / 27), j = Math.floor(k / 9) % 3, h = Math.floor(k / 3) % 3, kk = k % 3;
      return 0.5 * (Tn[T.i4(i, j, h, kk)] + Tn[T.i4(i, j, kk, h)]);
    });
    expect(T.apply4(S, T.skewOf(T.randVec(r))).every((x) => close(x, 0))).toBe(true);
  });
  it('identità 𝕀 e −𝕀: −𝕀 è invertibile ma non definito positivo (Attenzione, p. 11)', () => {
    const Id = Array.from({ length: 81 }, (_, k) => {
      const i = Math.floor(k / 27), j = Math.floor(k / 9) % 3, h = Math.floor(k / 3) % 3, kk = k % 3;
      return i === h && j === kk ? 1 : 0;
    });
    const A = T.randMat(r);
    expect(closeM(T.apply4(Id, A), A)).toBe(true);
    const minus = Id.map((x) => -x);
    expect(T.ddot(T.apply4(minus, A), A)).toBeLessThan(0);
  });
});

describe('teorema della divergenza (Teo 1.8.4), due integrazioni indipendenti', () => {
  it('flusso uscente = ∫ div u dA per i campi d\'esempio e per campi casuali', () => {
    const fields: PlaneField[] = Object.values(FIELD_PRESETS).map((p) => p.f);
    for (let n = 0; n < 20; n++) fields.push({ a1: 2 * r() - 1, b1: 2 * r() - 1, c1: 2 * r() - 1, d1: 2 * r() - 1, e1: 2 * r() - 1, a2: 2 * r() - 1, b2: 2 * r() - 1, c2: 2 * r() - 1, d2: 2 * r() - 1, e2: 2 * r() - 1 });
    for (const f of fields) for (const L of [1, 1.7]) expect(close(totalFlux(f, L), divIntegral(f, L), 1e-9)).toBe(true);
  });
  it('rotazione rigida: divergenza nulla, flusso nullo; sorgente: flusso = 2 L²', () => {
    expect(close(totalFlux(FIELD_PRESETS.rotazione.f, 1), 0)).toBe(true);
    expect(close(totalFlux(FIELD_PRESETS.sorgente.f, 1.5), 2 * 1.5 ** 2)).toBe(true);
    const s = fluxBySide(FIELD_PRESETS.uniforme.f, 1);
    expect(close(s.destra + s.sinistra, 0) && close(s.alto + s.basso, 0)).toBe(true);
  });
});
