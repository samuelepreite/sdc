/**
 * Algebra tensoriale in componenti (Cap. 1 della dispensa), funzioni pure in SI.
 * Convenzioni della dispensa: riferimento ortonormale destrorso; A_ij = A ê_j · ê_i (riga i = componente,
 * colonna j = immagine di ê_j); (∇u)_ij = ∂u_i/∂x_j; A·B = tr(A Bᵀ).
 * Le matrici sono array di 9 numeri per righe: [A11, A12, A13, A21, …, A33].
 */

export type Vec = [number, number, number];
export type Mat = number[]; // 9 componenti, per righe

export const at = (A: Mat, i: number, j: number) => A[3 * i + j];
export const I3: Mat = [1, 0, 0, 0, 1, 0, 0, 0, 1];
export const O3: Mat = [0, 0, 0, 0, 0, 0, 0, 0, 0];

export const add = (A: Mat, B: Mat): Mat => A.map((a, k) => a + B[k]);
export const sub = (A: Mat, B: Mat): Mat => A.map((a, k) => a - B[k]);
export const scale = (A: Mat, s: number): Mat => A.map((a) => a * s);
export const transpose = (A: Mat): Mat => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];

/** prodotto di composizione: (AB)_ij = Σ_k A_ik B_kj (Def 1.2.7) */
export function mul(A: Mat, B: Mat): Mat {
  const C: Mat = Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) C[3 * i + j] += A[3 * i + k] * B[3 * k + j];
  return C;
}

/** applicazione a un vettore: (Av)_i = Σ_j A_ij v_j */
export const apply = (A: Mat, v: Vec): Vec => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];

export const dotv = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const addv = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const subv = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scalev = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
export const norm = (a: Vec) => Math.sqrt(dotv(a, a));
export const unit = (a: Vec): Vec => scalev(a, 1 / norm(a));
/** prodotto misto u · v ∧ w */
export const triple = (u: Vec, v: Vec, w: Vec) => dotv(u, cross(v, w));

/** diade a ⊗ b: (a⊗b)_ij = a_i b_j (Def 1.2.3) */
export const dyad = (a: Vec, b: Vec): Mat => [a[0] * b[0], a[0] * b[1], a[0] * b[2], a[1] * b[0], a[1] * b[1], a[1] * b[2], a[2] * b[0], a[2] * b[1], a[2] * b[2]];

export const trace = (A: Mat) => A[0] + A[4] + A[8];
/** prodotto scalare tra tensori A·B = tr(A Bᵀ) = Σ A_ij B_ij (Def 1.6.2) */
export const ddot = (A: Mat, B: Mat) => A.reduce((s, a, k) => s + a * B[k], 0);
export const fnorm = (A: Mat) => Math.sqrt(ddot(A, A));

export const sym = (A: Mat): Mat => scale(add(A, transpose(A)), 0.5);
export const skw = (A: Mat): Mat => scale(sub(A, transpose(A)), 0.5);

export function det(A: Mat): number {
  return A[0] * (A[4] * A[8] - A[5] * A[7]) - A[1] * (A[3] * A[8] - A[5] * A[6]) + A[2] * (A[3] * A[7] - A[4] * A[6]);
}

export function inv(A: Mat): Mat {
  const d = det(A);
  if (Math.abs(d) < 1e-300) throw new Error('tensore non invertibile (det = 0)');
  const c = [
    A[4] * A[8] - A[5] * A[7], -(A[1] * A[8] - A[2] * A[7]), A[1] * A[5] - A[2] * A[4],
    -(A[3] * A[8] - A[5] * A[6]), A[0] * A[8] - A[2] * A[6], -(A[0] * A[5] - A[2] * A[3]),
    A[3] * A[7] - A[4] * A[6], -(A[0] * A[7] - A[1] * A[6]), A[0] * A[4] - A[1] * A[3],
  ];
  return c.map((x) => x / d);
}

/** colonna j: immagine A ê_j del versore ê_j */
export const col = (A: Mat, j: number): Vec => [A[j], A[3 + j], A[6 + j]];
export const basis = (j: number): Vec => [j === 0 ? 1 : 0, j === 1 ? 1 : 0, j === 2 ? 1 : 0];

/** tensore antisimmetrico con vettore assiale w: W u = w ∧ u (Teo 1.3.4) */
export const skewOf = (w: Vec): Mat => [0, -w[2], w[1], w[2], 0, -w[0], -w[1], w[0], 0];
/** vettore assiale di W ∈ Skw (letto dalla matrice di Teo 1.3.4) */
export const axialOf = (W: Mat): Vec => [W[7], W[2], W[3]];

/** formula di Eulero (1.1): R = I + (1 − cos φ) W² + sin φ W, con W di vettore assiale ê unitario */
export function eulerR(e: Vec, phi: number): Mat {
  const W = skewOf(unit(e));
  return add(add(I3, scale(mul(W, W), 1 - Math.cos(phi))), scale(W, Math.sin(phi)));
}

/** versore da inclinazione sul piano xy e azimut (gradi) */
export function dirVec(incl: number, az: number): Vec {
  const a = (incl * Math.PI) / 180;
  const b = (az * Math.PI) / 180;
  return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
}

/** invarianti principali I, II, III (Teo 2.9.3; stessi per E e T) */
export function invariants(A: Mat): [number, number, number] {
  const I = trace(A);
  const II = 0.5 * (I * I - trace(mul(A, A)));
  return [I, II, det(A)];
}

// ------------------------------------------------------------------ tensori del IV ordine (§1.7)

/** indice piatto di A_ijhk in un array di 81 numeri */
export const i4 = (i: number, j: number, h: number, k: number) => 27 * i + 9 * j + 3 * h + k;

/** applicazione (𝔸A)_ij = Σ_hk 𝔸_ijhk A_hk */
export function apply4(T: number[], A: Mat): Mat {
  const out: Mat = Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let h = 0; h < 3; h++) for (let k = 0; k < 3; k++) out[3 * i + j] += T[i4(i, j, h, k)] * A[3 * h + k];
  return out;
}

/** trasposto del IV ordine: 𝔸ᵀ_ijhk = 𝔸_hkij (Def 1.7.2) */
export function transpose4(T: number[]): number[] {
  const out = Array(81).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let h = 0; h < 3; h++) for (let k = 0; k < 3; k++) out[i4(i, j, h, k)] = T[i4(h, k, i, j)];
  return out;
}

export type Sym4 = { minor1?: boolean; minor2?: boolean; major?: boolean };

/**
 * Numero di componenti distinte di un tensore del IV ordine con le simmetrie indicate (§1.7.3): si contano le classi di
 * equivalenza delle 81 quaterne (i, j, h, k) sotto gli scambi ammessi. Verifica indipendente del conteggio 81/36/21.
 */
export function distinctComponents(s: Sym4): number {
  return componentClasses(s).count;
}

/** classe di ogni quaterna (per colorare la griglia 9 × 9 del diagramma) */
export function componentClasses(s: Sym4): { cls: number[]; count: number } {
  const parent = Array.from({ length: 81 }, (_, k) => k);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const join = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
  };
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let h = 0; h < 3; h++)
        for (let k = 0; k < 3; k++) {
          const a = i4(i, j, h, k);
          if (s.minor1) join(a, i4(j, i, h, k));
          if (s.minor2) join(a, i4(i, j, k, h));
          if (s.major) join(a, i4(h, k, i, j));
        }
  const roots = new Map<number, number>();
  const cls = Array.from({ length: 81 }, (_, k) => {
    const r = find(k);
    if (!roots.has(r)) roots.set(r, roots.size);
    return roots.get(r)!;
  });
  return { cls, count: roots.size };
}

// ------------------------------------------------------------------ utilità numeriche

/** generatore pseudo-casuale riproducibile (mulberry32) */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** matrice casuale con componenti in [-2, 2] */
export const randMat = (r: () => number): Mat => Array.from({ length: 9 }, () => 4 * r() - 2);
export const randVec = (r: () => number): Vec => [4 * r() - 2, 4 * r() - 2, 4 * r() - 2];

/** formattazione italiana con cifre significative */
export function fmt(x: number, digits = 3): string {
  if (!Number.isFinite(x)) return '—';
  if (Math.abs(x) < 1e-12) return '0';
  const s = Number(x.toPrecision(digits));
  return s.toLocaleString('it-IT', { maximumFractionDigits: 10 });
}
