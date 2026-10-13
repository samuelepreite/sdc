/**
 * Motore del Cap. 5, §5.7: flessione composta (taglio) con la teoria approssimata di Jourawski.
 * Sezioni simmetriche rispetto a y, assi principali centrali, y verso il basso; taglio T_y. Per una corda
 * orizzontale a quota ȳ l'area sottesa A_r è la parte con y ≥ ȳ (verso il lembo inferiore).
 */
import { areaProps, principal, SEZIONI, type Poly, type Pt } from './sezioni';

/** sezioni per il taglio: quelle simmetriche rispetto a y più un triangolo isoscele (§5.7.2, oss. 5) */
export const SEZ_TAGLIO: Record<string, { label: string; poly: Poly; note: string }> = {
  rettangolo: SEZIONI.rettangolo,
  doppioT: SEZIONI.doppioT,
  T: SEZIONI.T,
  cerchio: SEZIONI.cerchio,
  triangolo: {
    label: 'triangolo',
    poly: [
      [0, -20],
      [15, 20],
      [-15, 20],
    ],
    note: 'Triangolo isoscele base 30 cm, altezza 40 cm: la corda baricentrica non è stazionaria e il massimo non sta lì (§5.7.2, oss. 5).',
  },
};

/** taglia il poligono con il semipiano y ≥ ȳ (Sutherland–Hodgman) */
export function clipBelow(p: Poly, yb: number): Poly {
  const out: Poly = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length];
    const ina = a[1] >= yb,
      inb = b[1] >= yb;
    if (ina) out.push(a);
    if (ina !== inb) {
      const t = (yb - a[1]) / (b[1] - a[1]);
      out.push([a[0] + t * (b[0] - a[0]), yb]);
    }
  }
  return out;
}

/** intersezioni della retta y = ȳ con il contorno: segmenti interni [x0, x1] */
export function chordSegments(p: Poly, yb: number): [number, number][] {
  const xs: number[] = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length];
    if (a[1] === b[1]) continue;
    if ((a[1] <= yb && b[1] > yb) || (b[1] <= yb && a[1] > yb)) xs.push(a[0] + ((yb - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  }
  xs.sort((u, v) => u - v);
  const seg: [number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i += 2) seg.push([xs[i], xs[i + 1]]);
  return seg;
}

export interface Chord {
  y: number;
  b: number;
  Ar: number;
  /** momento statico dell'area sottesa rispetto all'asse x (= A_r · y_Gr, Varignon) */
  Sx: number;
  tau: number;
}

/** Jourawski (Teo 5.7.2): τ̄_zy = T_y S_x / (J_x b_r) sulla corda a quota ȳ */
export function jourawski(p: Poly, Ty: number, yb: number, Jx: number): Chord {
  const seg = chordSegments(p, yb);
  const b = seg.reduce((s, [a, c]) => s + (c - a), 0);
  const cl = clipBelow(p, yb);
  const q = cl.length >= 3 ? areaProps(cl) : { A: 0, yG: 0 };
  const Sx = q.A * q.yG;
  return { y: yb, b, Ar: q.A, Sx, tau: b > 1e-12 ? (Ty * Sx) / (Jx * b) : 0 };
}

/** diagramma di τ̄_zy lungo l'altezza (n punti interni) per la sezione in assi principali */
export function shearDiagram(key: string, Ty: number, n = 120) {
  const pr = principal(SEZ_TAGLIO[key].poly);
  const ys = pr.poly.map((q) => q[1]);
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const pts = Array.from({ length: n }, (_, k) => jourawski(pr.poly, Ty, y0 + ((y1 - y0) * (k + 0.5)) / n, pr.Jx));
  return { pr, y0, y1, pts };
}

/**
 * Regola delle tangenti (§5.7.4): agli estremi della corda τ_zx si ricava da τ_z · n̂ = 0 con τ_zy = τ̄;
 * sulla corda τ_zx è lineare e antisimmetrico, nullo sull'asse y. Restituisce τ_zx all'estremo destro (x > 0).
 */
export function tangentRule(p: Poly, yb: number, tauBar: number): { xB: number; tauB: number; at: (x: number) => number } | null {
  const seg = chordSegments(p, yb);
  if (seg.length !== 1) return null;
  const xB = seg[0][1];
  // lato del contorno attraversato in B
  for (let i = 0; i < p.length; i++) {
    const a = p[i],
      b = p[(i + 1) % p.length];
    if (!((a[1] <= yb && b[1] > yb) || (b[1] <= yb && a[1] > yb))) continue;
    const x = a[0] + ((yb - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
    if (Math.abs(x - xB) > 1e-9) continue;
    const n: Pt = [b[1] - a[1], -(b[0] - a[0])];
    if (Math.abs(n[0]) < 1e-12) return { xB, tauB: 0, at: () => 0 };
    const tauB = (-tauBar * n[1]) / n[0];
    return { xB, tauB, at: (xx: number) => (tauB * xx) / xB };
  }
  return null;
}
