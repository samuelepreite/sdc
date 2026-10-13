/**
 * Problema degli autovalori per tensori simmetrici 3×3 (teorema spettrale, Teo 2.9.2; usato anche per T nel Cap. 3).
 * Metodo di Jacobi (rotazioni piane successive): robusto anche con autovalori coincidenti.
 * Convenzione della dispensa: autovalori ordinati λ1 ≥ λ2 ≥ λ3, versori n̂_i con terna destrorsa (n̂3 = n̂1 ∧ n̂2).
 */
import * as T from './tensor';

export interface Spettro {
  /** autovalori in ordine decrescente */
  values: [number, number, number];
  /** autovettori (versori) corrispondenti, terna destrorsa */
  vectors: [T.Vec, T.Vec, T.Vec];
  /** molteplicità: 'distinti' | 'doppia' | 'tripla' (tolleranza relativa) */
  caso: 'distinti' | 'doppia' | 'tripla';
}

export function eigSym(A0: T.Mat, tolRel = 1e-9): Spettro {
  const a = [
    [A0[0], 0.5 * (A0[1] + A0[3]), 0.5 * (A0[2] + A0[6])],
    [0.5 * (A0[1] + A0[3]), A0[4], 0.5 * (A0[5] + A0[7])],
    [0.5 * (A0[2] + A0[6]), 0.5 * (A0[5] + A0[7]), A0[8]],
  ];
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (let sweep = 0; sweep < 60; sweep++) {
    const off = Math.abs(a[0][1]) + Math.abs(a[0][2]) + Math.abs(a[1][2]);
    if (off < 1e-15 * (1 + Math.abs(a[0][0]) + Math.abs(a[1][1]) + Math.abs(a[2][2]))) break;
    for (const [p, q] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(t * t + 1);
      const s = t * c;
      for (let k = 0; k < 3; k++) {
        const akp = a[k][p];
        const akq = a[k][q];
        a[k][p] = c * akp - s * akq;
        a[k][q] = s * akp + c * akq;
      }
      for (let k = 0; k < 3; k++) {
        const apk = a[p][k];
        const aqk = a[q][k];
        a[p][k] = c * apk - s * aqk;
        a[q][k] = s * apk + c * aqk;
      }
      for (let k = 0; k < 3; k++) {
        const vkp = v[k][p];
        const vkq = v[k][q];
        v[k][p] = c * vkp - s * vkq;
        v[k][q] = s * vkp + c * vkq;
      }
    }
  }
  const pairs = [0, 1, 2].map((k) => ({ l: a[k][k], n: [v[0][k], v[1][k], v[2][k]] as T.Vec })).sort((x, y) => y.l - x.l);
  const n1 = T.unit(pairs[0].n);
  const n2 = T.unit(pairs[1].n);
  const n3 = T.cross(n1, n2);
  const values: [number, number, number] = [pairs[0].l, pairs[1].l, pairs[2].l];
  const scale = Math.max(1e-12, ...values.map(Math.abs));
  const eq = (x: number, y: number) => Math.abs(x - y) <= tolRel * scale * 1e3;
  const caso = eq(values[0], values[2]) ? 'tripla' : eq(values[0], values[1]) || eq(values[1], values[2]) ? 'doppia' : 'distinti';
  return { values, vectors: [n1, n2, n3], caso };
}

/** rappresentazione spettrale Σ λ_i n̂_i ⊗ n̂_i (ricostruisce il tensore) */
export const spectralSum = (s: Spettro): T.Mat => s.vectors.reduce((S, n, k) => T.add(S, T.scale(T.dyad(n, n), s.values[k])), T.O3);

/** classificazione dagli invarianti (§2.10 per E, §3.12 per T): numero di autovalori nulli */
export function classify(A: T.Mat, tol = 1e-9): { nulli: 0 | 1 | 2 | 3; stato: 'triassiale' | 'biassiale' | 'monoassiale' | 'nullo' } {
  const [I, II, III] = T.invariants(A);
  const s = Math.max(1e-12, T.fnorm(A));
  if (Math.abs(III) > tol * s ** 3) return { nulli: 0, stato: 'triassiale' };
  if (Math.abs(II) > tol * s ** 2) return { nulli: 1, stato: 'biassiale' };
  if (Math.abs(I) > tol * s) return { nulli: 2, stato: 'monoassiale' };
  return { nulli: 3, stato: 'nullo' };
}
