/**
 * Motore del Cap. 4 (legami costitutivi, elasticità lineare). Funzioni pure.
 * - Lemma fondamentale e TLV (Teo 4.2.1, Teo 4.3.4) verificati con campi polinomiali sul cubo unitario (quadratura di Gauss).
 * - Tensore elastico 𝔸 (81 componenti), simmetrie minori/maggiore (§4.8–4.9), lavoro lungo un cammino (§4.9.1).
 * - Simmetrie materiali (Def 4.10.1) e notazione di Voigt (§4.11).
 * - Elasticità isotropa: Lamé, legame inverso, moduli tecnici, energia, plausibilità (§4.12–4.15).
 */
import * as T from './tensor';

// ------------------------------------------------------------------ quadratura di Gauss a 3 punti su [0, 1]
const GX = [0.5 - Math.sqrt(15) / 10, 0.5, 0.5 + Math.sqrt(15) / 10];
const GW = [5 / 18, 8 / 18, 5 / 18];
export const int1 = (f: (x: number) => number) => GX.reduce((s, x, i) => s + GW[i] * f(x), 0);
export const int2 = (f: (x: number, y: number) => number) => int1((x) => int1((y) => f(x, y)));
export const int3 = (f: (x: number, y: number, z: number) => number) => int1((x) => int1((y) => int1((z) => f(x, y, z))));

/** campo vettoriale quadratico u_i = a_i + Σ b_ik x_k + Σ c_ik x_k² e sua matrice gradiente */
export interface QuadVec {
  a: T.Vec;
  b: T.Mat;
  c: T.Mat;
}
export const evalQV = (f: QuadVec, x: T.Vec): T.Vec => [0, 1, 2].map((i) => f.a[i] + [0, 1, 2].reduce((s, k) => s + f.b[3 * i + k] * x[k] + f.c[3 * i + k] * x[k] * x[k], 0)) as T.Vec;
export const gradQV = (f: QuadVec, x: T.Vec): T.Mat => Array.from({ length: 9 }, (_, n) => f.b[n] + 2 * f.c[n] * x[n % 3]);

/** campo tensoriale lineare T_ij = p_ij + Σ_k q_ijk x_k ; divergenza per righe (Def 1.8.3) */
export interface LinTen {
  p: T.Mat;
  q: number[]; // 27: q[9k + n]
}
export const evalLT = (f: LinTen, x: T.Vec): T.Mat => f.p.map((pv, n) => pv + [0, 1, 2].reduce((s, k) => s + f.q[9 * k + n] * x[k], 0));
export const divLT = (f: LinTen): T.Vec => [0, 1, 2].map((i) => [0, 1, 2].reduce((s, j) => s + f.q[9 * j + (3 * i + j)], 0)) as T.Vec;

/** i tre termini del lemma fondamentale sul cubo unitario: [∫∂B Tn·u, ∫B divT·u, ∫B T·H] */
export function lemmaTerms(Tf: LinTen, u: QuadVec): [number, number, number] {
  let surf = 0;
  for (let ax = 0; ax < 3; ax++)
    for (const side of [0, 1]) {
      const n: T.Vec = [0, 0, 0];
      n[ax] = side ? 1 : -1;
      surf += int2((s, t) => {
        const x: T.Vec = [0, 0, 0];
        x[ax] = side;
        x[(ax + 1) % 3] = s;
        x[(ax + 2) % 3] = t;
        return T.dotv(T.apply(evalLT(Tf, x), n), evalQV(u, x));
      });
    }
  const dv = divLT(Tf);
  const vol1 = int3((x, y, z) => T.dotv(dv, evalQV(u, [x, y, z])));
  const vol2 = int3((x, y, z) => T.ddot(evalLT(Tf, [x, y, z]), gradQV(u, [x, y, z])));
  return [surf, vol1, vol2];
}

// ------------------------------------------------------------------ tensori del IV ordine
const d = (i: number, j: number) => (i === j ? 1 : 0);

/** tensore elastico isotropo: 𝔸E = 2μE + λ(tr E)I (Teo 4.12.1) */
export function lameTensor(mu: number, lambda: number): number[] {
  const A = Array(81).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let h = 0; h < 3; h++) for (let k = 0; k < 3; k++) A[T.i4(i, j, h, k)] = lambda * d(i, j) * d(h, k) + mu * (d(i, h) * d(j, k) + d(i, k) * d(j, h));
  return A;
}

/** simmetrizza un tensore del IV ordine: simmetrie minori (e maggiore, se richiesta) */
export function symmetrize4(A0: number[], major: boolean): number[] {
  const A = Array(81).fill(0);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let h = 0; h < 3; h++)
        for (let k = 0; k < 3; k++) {
          const m = (a: number, b: number, c: number, e: number) => (A0[T.i4(a, b, c, e)] + A0[T.i4(b, a, c, e)] + A0[T.i4(a, b, e, c)] + A0[T.i4(b, a, e, c)]) / 4;
          A[T.i4(i, j, h, k)] = major ? (m(i, j, h, k) + m(h, k, i, j)) / 2 : m(i, j, h, k);
        }
  return A;
}

/** coppie di Voigt nell'ordine della dispensa: 11, 22, 33, 23, 31, 12 */
export const VOIGT: [number, number][] = [
  [0, 0],
  [1, 1],
  [2, 2],
  [1, 2],
  [2, 0],
  [0, 1],
];
/** matrice 6×6 [C] tale che {σ} = [C]{ε} con {ε} = (ε1, ε2, ε3, γ23, γ31, γ12), γ = 2E (§4.11) */
export function voigtOf(A: number[]): number[][] {
  return VOIGT.map(([i, j]) => VOIGT.map(([h, k]) => A[T.i4(i, j, h, k)]));
}
/** {ε} di Voigt da E simmetrico; e il viceversa */
export const toVoigtStrain = (E: T.Mat) => VOIGT.map(([i, j], n) => (n < 3 ? 1 : 2) * E[3 * i + j]);
export const toVoigtStress = (S: T.Mat) => VOIGT.map(([i, j]) => S[3 * i + j]);

/** Q è trasformazione di simmetria materiale? 𝔸[Q E Qᵀ] = Q(𝔸E)Qᵀ per alcuni E di prova (Def 4.10.1) */
export function isSymmetryOf(A: number[], Q: T.Mat, samples: T.Mat[]): boolean {
  return samples.every((E) => {
    const lhs = T.apply4(A, T.mul(T.mul(Q, E), T.transpose(Q)));
    const rhs = T.mul(T.mul(Q, T.apply4(A, E)), T.transpose(Q));
    return lhs.every((x, n) => Math.abs(x - rhs[n]) <= 1e-9 * (1 + Math.abs(x)));
  });
}

/** tensore ortotropo nel riferimento principale di ortotropia: 9 costanti (iperelastico) */
export function orthotropic(c: { c11: number; c22: number; c33: number; c12: number; c13: number; c23: number; c44: number; c55: number; c66: number }): number[] {
  const A = Array(81).fill(0);
  const set = (i: number, j: number, h: number, k: number, v: number) => {
    for (const [a, b] of [
      [i, j],
      [j, i],
    ])
      for (const [e, f] of [
        [h, k],
        [k, h],
      ]) {
        A[T.i4(a, b, e, f)] = v;
        A[T.i4(e, f, a, b)] = v;
      }
  };
  set(0, 0, 0, 0, c.c11);
  set(1, 1, 1, 1, c.c22);
  set(2, 2, 2, 2, c.c33);
  set(0, 0, 1, 1, c.c12);
  set(0, 0, 2, 2, c.c13);
  set(1, 1, 2, 2, c.c23);
  set(1, 2, 1, 2, c.c44);
  set(2, 0, 2, 0, c.c55);
  set(0, 1, 0, 1, c.c66);
  return A;
}

/** lavoro specifico w = ∫ T·dE lungo un cammino E(α), α ∈ [0, 1] (regola di Simpson, §4.9.1) */
export function pathWork(A: number[], path: (a: number) => T.Mat, n = 400): number {
  let w = 0;
  const h = 1 / n;
  for (let k = 0; k < n; k++) {
    const a = k * h;
    const f = (s: number) => {
      const E = path(s);
      const dE = T.scale(T.sub(path(s + 1e-6), path(s - 1e-6)), 1 / 2e-6);
      return T.ddot(T.apply4(A, E), dE);
    };
    w += (h / 6) * (f(a) + 4 * f(a + h / 2) + f(a + h));
  }
  return w;
}

/** energia specifica φ = ½ 𝔸E·E (Teo 4.9.2, c) */
export const energy = (A: number[], E: T.Mat) => 0.5 * T.ddot(T.apply4(A, E), E);

// ------------------------------------------------------------------ isotropia (§4.12–4.15)

export const lameFromTech = (E: number, nu: number) => ({ mu: E / (2 * (1 + nu)), lambda: (E * nu) / ((1 + nu) * (1 - 2 * nu)) });
export const techFromLame = (mu: number, lambda: number) => ({ E: (mu * (2 * mu + 3 * lambda)) / (mu + lambda), nu: lambda / (2 * (mu + lambda)), G: mu, K: (2 * mu + 3 * lambda) / 3 });

/** legame diretto isotropo T = 2μE + λ(tr E)I */
export const stressIso = (mu: number, lambda: number, E: T.Mat) => T.add(T.scale(E, 2 * mu), T.scale(T.I3, lambda * T.trace(E)));
/** legame inverso con i moduli tecnici: E = [(1+ν)T − ν(tr T)I]/E (§4.13.4) */
export const strainIso = (Ey: number, nu: number, S: T.Mat) => T.scale(T.sub(T.scale(S, 1 + nu), T.scale(T.I3, nu * T.trace(S))), 1 / Ey);

/** φ(T) con i moduli tecnici in funzione delle tensioni principali (Prop 4.14.1) */
export const energyPrincipal = (Ey: number, nu: number, s: [number, number, number]) => (s[0] ** 2 + s[1] ** 2 + s[2] ** 2) / (2 * Ey) - (nu / Ey) * (s[0] * s[1] + s[1] * s[2] + s[2] * s[0]);

/** restrizioni di plausibilità: 𝔸 ∈ Pos+ ⟺ μ > 0 e 2μ + 3λ > 0 (Sylvester sulla forma quadratica di φ, §4.15.2) */
export function sylvester(mu: number, lambda: number) {
  const a = mu + lambda / 2;
  const b = lambda / 2;
  const m1 = a;
  const m2 = a * a - b * b;
  const m3 = a * (a * a - b * b) - b * (a * b - b * b) + b * (b * b - a * b);
  return { m1, m2, m3, pos: m1 > 0 && m2 > 0 && m3 > 0, lame: mu > 0 && 2 * mu + 3 * lambda > 0 };
}

// ------------------------------------------------------------------ prove di laboratorio (curve qualitative, §4.5–4.6)

/** curva F–ΔL dell'acciaio da carpenteria: tratti elastico lineare, snervamento, incrudimento, strizione (forma qualitativa) */
export function steelCurve(x: number): number {
  const ep = 1; // fine del tratto lineare
  const ey = 1.15;
  const es = 4; // fine dello snervamento
  const et = 14; // picco
  const er = 18; // rottura
  if (x <= ep) return x; // Fp = 1
  if (x <= ey) return 1 + (x - ep) * 0.6; // elastico non lineare fino a Fy ≈ 1,09
  if (x <= es) return 1.09 + 0.012 * Math.sin((x - ey) * 9); // snervamento con oscillazioni
  if (x <= et) return 1.09 + 0.45 * Math.sin(((x - es) / (et - es)) * (Math.PI / 2)); // incrudimento fino a Ft ≈ 1,54
  if (x <= er) return 1.54 - 0.5 * ((x - et) / (er - et)) ** 2; // strizione
  return NaN;
}

/** calcestruzzo in compressione (valori assoluti): ramo crescente non lineare; a deformazione controllata, ramo di softening */
export function concreteCurve(x: number, controlloDeformazione: boolean): number {
  const xp = 2; // picco
  if (x <= xp) return 2 * (x / xp) - (x / xp) ** 2;
  if (!controlloDeformazione) return NaN; // a controllo di carico: rottura precipitosa al picco
  if (x <= 3.6) return 1 - 0.55 * ((x - xp) / 1.6) ** 1.4;
  return NaN;
}
