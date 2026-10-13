/**
 * Motore del Cap. 5, prima parte (§5.1–5.6): geometria delle aree (baricentro, momenti d'inerzia, assi principali
 * centrali, ellisse e nocciolo centrale d'inerzia) e soluzioni di Saint-Venant per sforzo normale e flessione.
 * Convenzioni della dispensa: z lungo l'asse, x e y assi principali centrali con x di inerzia massima; nei disegni
 * della sezione x verso sinistra e y verso il basso (figure di pp. 117 e 121, NF-10). Unità coerenti a scelta del
 * chiamante (nei modelli: cm, kN, kN·cm → kN/cm²).
 */

export type Pt = [number, number];
export type Poly = Pt[];

export interface AreaProps {
  A: number;
  xG: number;
  yG: number;
  /** momenti baricentrici: Jx = ∫y², Jy = ∫x², Jxy = ∫xy */
  Jx: number;
  Jy: number;
  Jxy: number;
}

/** proprietà di un poligono semplice (formule di Green, esatte) */
export function areaProps(p: Poly): AreaProps {
  let A = 0,
    Sx = 0,
    Sy = 0,
    Ixx = 0,
    Iyy = 0,
    Ixy = 0;
  for (let i = 0; i < p.length; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[(i + 1) % p.length];
    const c = x0 * y1 - x1 * y0;
    A += c / 2;
    Sx += ((y0 + y1) * c) / 6;
    Sy += ((x0 + x1) * c) / 6;
    Ixx += ((y0 * y0 + y0 * y1 + y1 * y1) * c) / 12;
    Iyy += ((x0 * x0 + x0 * x1 + x1 * x1) * c) / 12;
    Ixy += ((x0 * y1 + 2 * x0 * y0 + 2 * x1 * y1 + x1 * y0) * c) / 24;
  }
  const s = A < 0 ? -1 : 1;
  A *= s;
  Sx *= s;
  Sy *= s;
  Ixx *= s;
  Iyy *= s;
  Ixy *= s;
  const xG = Sy / A;
  const yG = Sx / A;
  return { A, xG, yG, Jx: Ixx - A * yG * yG, Jy: Iyy - A * xG * xG, Jxy: Ixy - A * xG * yG };
}

/** momento d'inerzia rispetto all'asse baricentrico inclinato di ψ su x (distanza −x sinψ + y cosψ) */
export const inertiaAt = (q: AreaProps, psi: number) =>
  q.Jx * Math.cos(psi) ** 2 + q.Jy * Math.sin(psi) ** 2 - 2 * q.Jxy * Math.sin(psi) * Math.cos(psi);

export interface Principal extends AreaProps {
  /** inclinazione dell'APCdI di inerzia massima rispetto all'asse x di partenza */
  psi: number;
  /** poligono nel riferimento principale centrale (x di inerzia massima) */
  poly: Poly;
  rx2: number;
  ry2: number;
}

/** assi principali centrali d'inerzia (§5.5.1): x di inerzia massima, Jxy = 0 */
export function principal(p: Poly): Principal {
  const q = areaProps(p);
  const psi = 0.5 * Math.atan2(-2 * q.Jxy, q.Jx - q.Jy);
  const c = Math.cos(psi),
    s = Math.sin(psi);
  const poly: Poly = p.map(([x, y]) => {
    const X = x - q.xG,
      Y = y - q.yG;
    return [X * c + Y * s, -X * s + Y * c];
  });
  const r = areaProps(poly);
  return { ...r, xG: 0, yG: 0, Jxy: Math.abs(r.Jxy) < 1e-9 * (r.Jx + r.Jy) ? 0 : r.Jxy, psi, poly, rx2: r.Jx / r.A, ry2: r.Jy / r.A };
}

// ------------------------------------------------------------------ sezioni d'esempio (cm)

const rect = (B: number, H: number): Poly => [
  [-B / 2, -H / 2],
  [B / 2, -H / 2],
  [B / 2, H / 2],
  [-B / 2, H / 2],
];
const circle = (R: number, n = 96): Poly => Array.from({ length: n }, (_, k) => [R * Math.cos((2 * Math.PI * k) / n), R * Math.sin((2 * Math.PI * k) / n)] as Pt);
const doubleT = (H: number, B: number, tf: number, tw: number): Poly => [
  [-B / 2, -H / 2],
  [B / 2, -H / 2],
  [B / 2, -H / 2 + tf],
  [tw / 2, -H / 2 + tf],
  [tw / 2, H / 2 - tf],
  [B / 2, H / 2 - tf],
  [B / 2, H / 2],
  [-B / 2, H / 2],
  [-B / 2, H / 2 - tf],
  [-tw / 2, H / 2 - tf],
  [-tw / 2, -H / 2 + tf],
  [-B / 2, -H / 2 + tf],
];
const tee = (B: number, tf: number, tw: number, hw: number): Poly => [
  [-B / 2, 0],
  [B / 2, 0],
  [B / 2, tf],
  [tw / 2, tf],
  [tw / 2, tf + hw],
  [-tw / 2, tf + hw],
  [-tw / 2, tf],
  [-B / 2, tf],
];
const ell = (a: number, t: number): Poly => [
  [0, 0],
  [a, 0],
  [a, t],
  [t, t],
  [t, a],
  [0, a],
];

export const SEZIONI: Record<string, { label: string; poly: Poly; note: string; rect?: { B: number; H: number } }> = {
  rettangolo: { label: 'rettangolo 20×40', poly: rect(20, 40), note: 'Rettangolo B = 20 cm, H = 40 cm: assi di simmetria = APCdI.', rect: { B: 20, H: 40 } },
  doppioT: { label: 'doppio T', poly: doubleT(40, 20, 3, 1.5), note: 'Doppio T H = 40, B = 20, ali 3, anima 1,5 cm: l’area lontana dall’asse dà un J grande (§5.5.3).' },
  T: { label: 'T', poly: tee(30, 5, 4, 30), note: 'T con ala 30×5 e anima 4×30 cm: asse di simmetria verticale, baricentro spostato verso l’ala.' },
  L: { label: 'L a lati uguali', poly: ell(20, 4), note: 'L 20×20×4 cm: asse di simmetria sulla bisettrice, baricentro fuori dalla figura (§5.5.1).' },
  cerchio: { label: 'cerchio', poly: circle(12), note: 'Cerchio R = 12 cm (poligono di 96 lati): ECdI circolare, ogni coppia ortogonale è principale.' },
};

// ------------------------------------------------------------------ Saint-Venant: tensioni e spostamenti

export interface Loads {
  N: number;
  Mx: number;
  My: number;
}
export interface SecK {
  A: number;
  Jx: number;
  Jy: number;
}

/** σ_z per N, M_x, M_y (Navier, binomia e trinomia: §5.4, §5.5.3–5.5.5, §5.6) */
export const sigmaZ = (L: Loads, s: SecK, x: number, y: number) => L.N / s.A + (L.Mx / s.Jx) * y - (L.My / s.Jy) * x;

/** spostamenti della soluzione (parte di deformazione pura; Teo 5.4.2, §5.5.3, §5.5.4) */
export function displacement(L: Loads, s: SecK, E: number, nu: number, [x, y, z]: [number, number, number]): [number, number, number] {
  const n = L.N / (E * s.A);
  const kx = L.Mx / (E * s.Jx);
  const ky = L.My / (E * s.Jy);
  const u = -nu * n * x - nu * kx * x * y + (ky / 2) * (nu * (x * x - y * y) + z * z);
  const v = -nu * n * y - ((nu * kx) / 2) * (y * y - x * x + (z * z) / nu) + nu * ky * x * y;
  const w = n * z + kx * y * z - ky * x * z;
  return [u, v, w];
}

/** gradiente numerico dello spostamento (differenze centrate) → deformazione infinitesima, in ordine xx, yy, zz, xy, yz, zx */
export function strainOf(f: (p: [number, number, number]) => [number, number, number], p: [number, number, number], h = 1e-4) {
  const d = (i: number) => {
    const a = [...p] as [number, number, number];
    const b = [...p] as [number, number, number];
    a[i] += h;
    b[i] -= h;
    const fa = f(a),
      fb = f(b);
    return fa.map((q, k) => (q - fb[k]) / (2 * h));
  };
  const g = [d(0), d(1), d(2)]; // g[j][i] = ∂u_i/∂x_j
  return { xx: g[0][0], yy: g[1][1], zz: g[2][2], xy: (g[1][0] + g[0][1]) / 2, yz: (g[2][1] + g[1][2]) / 2, zx: (g[0][2] + g[2][0]) / 2 };
}

/** angoli della flessione deviata (§5.5.5): α di M, γ di s, β di n, θ di f, δ di deviazione */
export function bendingAngles(alpha: number, rx2: number, ry2: number) {
  const beta = Math.atan2(Math.sin(alpha) / ry2, Math.cos(alpha) / rx2);
  const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
  return { alpha, gamma: wrap(Math.PI / 2 + alpha), beta, theta: wrap(Math.PI / 2 + beta), delta: wrap(beta - alpha) };
}

/** formula monomia σ_z = M_n f / J_n (§5.5.5) */
export function monomia(M: number, alpha: number, s: SecK, x: number, y: number) {
  const { beta, delta } = bendingAngles(alpha, s.Jx / s.A, s.Jy / s.A);
  const Mn = M * Math.cos(delta);
  const Jn = s.Jx * Math.cos(beta) ** 2 + s.Jy * Math.sin(beta) ** 2;
  const f = -x * Math.sin(beta) + y * Math.cos(beta);
  return { Mn, Jn, f, sigma: (Mn / Jn) * f };
}

/** leggi di variazione delle CdS (Teo 5.2.3): dati sulla base di destra (z = Lz) */
export function cds(z: number, Lz: number, b: { Tx: number; Ty: number; N: number; Mx: number; My: number; Mz: number }) {
  return { Tx: b.Tx, Ty: b.Ty, N: b.N, Mz: b.Mz, Mx: b.Mx - b.Ty * (Lz - z), My: b.My + b.Tx * (Lz - z) };
}

// ------------------------------------------------------------------ sforzo normale eccentrico (§5.6, facoltativo)

/** centro di sollecitazione dalla coppia di trasporto: x_c = −M_y/N, y_c = M_x/N */
export const centro = (L: Loads): Pt => [-L.My / L.N, L.Mx / L.N];

/** σ_z trinomia (§5.6) */
export const trinomia = (N: number, c: Pt, s: SecK, x: number, y: number) => (N / s.A) * (1 + (x * c[0]) / (s.Jy / s.A) + (y * c[1]) / (s.Jx / s.A));

/** inviluppo convesso (catena monotona) */
export function hull(p: Poly): Poly {
  const pts = [...p].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [],
    up: Pt[] = [];
  for (const q of pts) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-12) lo.pop();
    lo.push(q);
  }
  for (const q of [...pts].reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 1e-12) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

/** nocciolo centrale d'inerzia (Def 5.6.2): antipoli delle rette radenti (lati dell'inviluppo convesso); sezione in assi principali */
export function nocciolo(pr: Pick<Principal, 'poly' | 'rx2' | 'ry2'>): Poly {
  const h = hull(pr.poly);
  return h.map((p1, i) => {
    const p2 = h[(i + 1) % h.length];
    const nx = p2[1] - p1[1],
      ny = -(p2[0] - p1[0]);
    const c = nx * p1[0] + ny * p1[1];
    return [-(nx / c) * pr.ry2, -(ny / c) * pr.rx2] as Pt;
  });
}

/** punto interno a un poligono (ray casting) */
export function inside(p: Poly, [x, y]: Pt) {
  let r = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i],
      [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r;
  }
  return r;
}

/**
 * Rettangolo B×H non reagente a trazione, compressione |N| con centro sull'asse y a eccentricità e (§5.6.2):
 * dentro il nocciolo (e ≤ H/6) sezione tutta compressa, fuori parte reagente alta 3u con u = H/2 − e e σ_max = 2N/(3uB).
 */
export function treU(N: number, B: number, H: number, e: number) {
  const A = B * H;
  if (e <= H / 6) return { parzializzata: false, u: H / 2 - e, reag: H, sMax: (N / A) * (1 + (6 * e) / H), sMin: (N / A) * (1 - (6 * e) / H) };
  const u = H / 2 - e;
  if (u <= 0) return { parzializzata: true, u: 0, reag: 0, sMax: Infinity, sMin: 0 };
  return { parzializzata: true, u, reag: 3 * u, sMax: (2 * N) / (3 * u * B), sMin: 0 };
}
