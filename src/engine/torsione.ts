/**
 * Motore del Cap. 5, §5.8: torsione. Funzione di Prandtl F (∇²F = 2 nell'interno, F = 0 sul contorno, Teo 5.8.5)
 * risolta alle differenze finite su una griglia (SOR) per una sezione poligonale qualsiasi; soluzioni esatte della
 * dispensa (cerchio, ellisse); fattore di torsione q = J₀/∫(−2F) (Def 5.8.6); ingobbamento φ dal gradiente di F;
 * sezioni sottili aperte (rettangoli allungati) e chiuse (Bredt, Teo 5.8.7).
 */
import { inside, principal, type Poly } from './sezioni';

export interface PrandtlGrid {
  nx: number;
  ny: number;
  h: number;
  x0: number;
  y0: number;
  /** F sui nodi (riga per riga, j·nx + i); 0 fuori e sul contorno */
  F: Float64Array;
  mask: Uint8Array;
  /** ∫(−2F) dA */
  I: number;
  J0: number;
  q: number;
  /** max |∇F| e posizione */
  gmax: number;
  at: [number, number];
}

/** distanza minima di un punto dal contorno */
function distToPoly(p: Poly, x: number, y: number) {
  let d = Infinity;
  for (let i = 0; i < p.length; i++) {
    const [ax, ay] = p[i],
      [bx, by] = p[(i + 1) % p.length];
    const vx = bx - ax,
      vy = by - ay;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)));
    d = Math.min(d, Math.hypot(x - ax - t * vx, y - ay - t * vy));
  }
  return d;
}

/** risolve il problema di Dirichlet per Poisson (Teo 5.8.5) sulla sezione in assi principali; n = celle sul lato maggiore */
export function prandtl(poly: Poly, n = 60, tol = 1e-10): PrandtlGrid {
  const pr = principal(poly);
  const p = pr.poly;
  const xs = p.map((q) => q[0]),
    ys = p.map((q) => q[1]);
  const [xa, xb, ya, yb] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const h = Math.max(xb - xa, yb - ya) / n;
  const nx = Math.round((xb - xa) / h) + 1,
    ny = Math.round((yb - ya) / h) + 1;
  const mask = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const x = xa + i * h,
        y = ya + j * h;
      if (inside(p, [x, y]) && distToPoly(p, x, y) > 1e-9 * h) mask[j * nx + i] = 1;
    }
  const F = new Float64Array(nx * ny);
  const w = 2 / (1 + Math.sin(Math.PI / Math.max(nx, ny)));
  for (let it = 0; it < 20000; it++) {
    let dmax = 0;
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const k = j * nx + i;
        if (!mask[k]) continue;
        const g = 0.25 * (F[k - 1] + F[k + 1] + F[k - nx] + F[k + nx] - 2 * h * h);
        const d = g - F[k];
        F[k] += w * d;
        if (Math.abs(d) > dmax) dmax = Math.abs(d);
      }
    if (dmax < tol * h * h) break;
  }
  let I = 0;
  for (let k = 0; k < F.length; k++) I += -2 * F[k] * h * h;
  let gmax = 0;
  let at: [number, number] = [0, 0];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      if (!mask[k]) continue;
      // differenze unilaterali verso il contorno (dove il gradiente è massimo)
      const gx = Math.max(Math.abs(F[k] - (i > 0 ? F[k - 1] : 0)), Math.abs((i < nx - 1 ? F[k + 1] : 0) - F[k])) / h;
      const gy = Math.max(Math.abs(F[k] - (j > 0 ? F[k - nx] : 0)), Math.abs((j < ny - 1 ? F[k + nx] : 0) - F[k])) / h;
      const g = Math.hypot(gx, gy);
      if (g > gmax) {
        gmax = g;
        at = [xa + i * h, ya + j * h];
      }
    }
  const J0 = pr.Jx + pr.Jy;
  return { nx, ny, h, x0: xa, y0: ya, F, mask, I, J0, q: J0 / I, gmax, at };
}

/** valore di F interpolato (bilineare) */
export function Fat(g: PrandtlGrid, x: number, y: number) {
  const u = (x - g.x0) / g.h,
    v = (y - g.y0) / g.h;
  const i = Math.max(0, Math.min(g.nx - 2, Math.floor(u))),
    j = Math.max(0, Math.min(g.ny - 2, Math.floor(v)));
  const a = u - i,
    b = v - j;
  const f = (ii: number, jj: number) => g.F[jj * g.nx + ii];
  return (1 - a) * (1 - b) * f(i, j) + a * (1 - b) * f(i + 1, j) + (1 - a) * b * f(i, j + 1) + a * b * f(i + 1, j + 1);
}

/** tensioni tangenziali (Def 5.8.4): τ_zx = −Gγ ∂F/∂y, τ_zy = Gγ ∂F/∂x, con Gγ = M_z / ∫(−2F) */
export function tauAt(g: PrandtlGrid, Mz: number, x: number, y: number): [number, number] {
  const e = g.h * 0.5;
  const Gg = Mz / g.I;
  const dFx = (Fat(g, x + e, y) - Fat(g, x - e, y)) / (2 * e);
  const dFy = (Fat(g, x, y + e) - Fat(g, x, y - e)) / (2 * e);
  return [-Gg * dFy, Gg * dFx];
}

/**
 * Ingobbamento φ (per γ = 1) dal gradiente: ∂φ/∂x = y − ∂F/∂y, ∂φ/∂y = ∂F/∂x − x (Def 5.8.4), integrato lungo
 * la riga baricentrica e poi lungo le colonne; φ(G) = 0. Solo per i disegni.
 */
export function warping(g: PrandtlGrid): Float64Array {
  const { nx, ny, h, x0, y0, F, mask } = g;
  const phi = new Float64Array(nx * ny);
  const Fv = (i: number, j: number) => (i < 0 || j < 0 || i >= nx || j >= ny ? 0 : F[j * nx + i]);
  const jc = Math.max(0, Math.min(ny - 1, Math.round(-y0 / h)));
  const ic = Math.max(0, Math.min(nx - 1, Math.round(-x0 / h)));
  const dphx = (i: number, j: number) => y0 + j * h - (Fv(i, j + 1) - Fv(i, j - 1)) / (2 * h);
  const dphy = (i: number, j: number) => (Fv(i + 1, j) - Fv(i - 1, j)) / (2 * h) - (x0 + i * h);
  for (let i = ic + 1; i < nx; i++) phi[jc * nx + i] = phi[jc * nx + i - 1] + 0.5 * h * (dphx(i - 1, jc) + dphx(i, jc));
  for (let i = ic - 1; i >= 0; i--) phi[jc * nx + i] = phi[jc * nx + i + 1] - 0.5 * h * (dphx(i + 1, jc) + dphx(i, jc));
  for (let i = 0; i < nx; i++) {
    for (let j = jc + 1; j < ny; j++) phi[j * nx + i] = phi[(j - 1) * nx + i] + 0.5 * h * (dphy(i, j - 1) + dphy(i, j));
    for (let j = jc - 1; j >= 0; j--) phi[j * nx + i] = phi[(j + 1) * nx + i] - 0.5 * h * (dphy(i, j + 1) + dphy(i, j));
  }
  for (let k = 0; k < phi.length; k++) if (!mask[k]) phi[k] = phi[k];
  return phi;
}

// ------------------------------------------------------------------ soluzioni esatte e formule della dispensa

/** cerchio (§5.8.5): F = (x² + y² − R²)/2, q = 1, |τ| = 2M_z r/(πR⁴) */
export const circle = (R: number, Mz: number) => ({ J0: (Math.PI * R ** 4) / 2, q: 1, tauMax: (2 * Mz) / (Math.PI * R ** 3), F: (x: number, y: number) => (x * x + y * y - R * R) / 2 });
/** ellisse a > b (§5.8.6): τ_max = 2M_z/(πab²) ai piedi dell'asse minore */
export const ellipse = (a: number, b: number, Mz: number) => ({ tauMax: (2 * Mz) / (Math.PI * a * b * b), F: (x: number, y: number) => ((a * a * b * b) / (a * a + b * b)) * ((x * x) / (a * a) + (y * y) / (b * b) - 1) });
/** triangolo equilatero di lato a (§5.8.6): τ_max = 20 M_z / a³ ai punti medi dei lati */
export const triangle = (a: number, Mz: number) => ({ J0: (Math.sqrt(3) / 48) * a ** 4, tauMax: (20 * Mz) / a ** 3 });

/** tabella di §5.8.6 per il rettangolo h ≥ b: θ⁽¹⁾ = M_z/(β G b³ h), τ_max = M_z/(α b² h) */
export const RECT_TABLE: { r: number; alpha: number; beta: number }[] = [
  { r: 1, alpha: 0.208, beta: 0.141 },
  { r: 1.2, alpha: 0.219, beta: 0.166 },
  { r: 1.5, alpha: 0.231, beta: 0.196 },
  { r: 2, alpha: 0.246, beta: 0.229 },
  { r: 2.5, alpha: 0.258, beta: 0.249 },
  { r: 3, alpha: 0.267, beta: 0.263 },
  { r: 4, alpha: 0.282, beta: 0.281 },
  { r: 5, alpha: 0.291, beta: 0.291 },
  { r: 10, alpha: 0.312, beta: 0.312 },
  { r: Infinity, alpha: 1 / 3, beta: 1 / 3 },
];
export function rectCoeff(r: number) {
  const t = RECT_TABLE;
  if (r >= 10) return { alpha: 1 / 3 - (1 / 3 - 0.312) * (10 / r), beta: 1 / 3 - (1 / 3 - 0.312) * (10 / r) };
  for (let k = 0; k + 1 < t.length; k++)
    if (r <= t[k + 1].r) {
      const s = (r - t[k].r) / (t[k + 1].r - t[k].r);
      return { alpha: t[k].alpha + s * (t[k + 1].alpha - t[k].alpha), beta: t[k].beta + s * (t[k + 1].beta - t[k].beta) };
    }
  return { alpha: 1 / 3, beta: 1 / 3 };
}

/** sottili aperte (§5.8.9): τ_max^i = 3 M_z b_i / Σ b_j³ h_j */
export function thinOpen(Mz: number, rects: { b: number; h: number }[]) {
  const S = rects.reduce((s, r) => s + r.b ** 3 * r.h, 0);
  return { S, tau: rects.map((r) => (3 * Mz * r.b) / S), tauMax: (3 * Mz * Math.max(...rects.map((r) => r.b))) / S };
}

/** Bredt (Teo 5.8.7): τ̄_z = M_z / (2 Ω h) */
export const bredt = (Mz: number, Omega: number, h: number) => Mz / (2 * Omega * h);

/**
 * Tubolare quadrato di lato B e spessore t, chiuso e tagliato (aperto), stesso M_z (§5.8.7). Con le formule della
 * dispensa stessa — Bredt con Ω = (B − t)² e rettangolo allungato di lunghezza 4(B − t) — il rapporto è 3(B − t)/(2t);
 * la dispensa riporta 3(B − t)/t (NF-14).
 */
export function tubeCompare(B: number, t: number, Mz: number) {
  const a = B - t;
  const closed = bredt(Mz, a * a, t);
  const open = thinOpen(Mz, [{ b: t, h: 4 * a }]).tauMax;
  return { closed, open, ratio: open / closed, dispensa: (3 * a) / t };
}

/** sezioni per la torsione: piene esatte e non, con spigoli concavi (L) per l'analogia idrodinamica */
export const SEZ_TORSIONE: Record<string, { label: string; poly: Poly; note: string }> = {
  cerchio: { label: 'cerchio', poly: Array.from({ length: 96 }, (_, k) => [12 * Math.cos((2 * Math.PI * k) / 96), 12 * Math.sin((2 * Math.PI * k) / 96)] as [number, number]), note: 'Cerchio R = 12 cm: q = 1, τ lineare con il raggio e ortogonale a esso, nessun ingobbamento (§5.8.5).' },
  quadrato: {
    label: 'quadrato',
    poly: [
      [-12, -12],
      [12, -12],
      [12, 12],
      [-12, 12],
    ],
    note: 'Quadrato di lato 24 cm: τ_max = 4,8 M_z/a³ ai punti medi dei lati; negli spigoli (convessi) τ → 0 (§5.8.6–5.8.7).',
  },
  rettangolo: {
    label: 'rettangolo 1:3',
    poly: [
      [-18, -6],
      [18, -6],
      [18, 6],
      [-18, 6],
    ],
    note: 'Rettangolo 36×12 cm (h/b = 3): τ_max = M_z/(α b² h) ai punti medi dei lati lunghi (§5.8.6).',
  },
  triangolo: {
    label: 'triangolo equilatero',
    poly: [
      [0, -24 / Math.sqrt(3)],
      [12, 12 / Math.sqrt(3)],
      [-12, 12 / Math.sqrt(3)],
    ],
    note: 'Triangolo equilatero di lato 24 cm: τ_max = 20 M_z/a³ ai punti medi dei lati (§5.8.6).',
  },
  L: { label: 'L (spigolo concavo)', poly: [[0, 0], [24, 0], [24, 6], [6, 6], [6, 24], [0, 24]], note: 'L 24×24×6 cm: nello spigolo concavo le linee di tensione si addensano (τ massima, serve un raccordo); in quelli convessi τ → 0 (§5.8.7).' },
};

/** segmenti delle curve di livello F = c (marching squares sulla griglia) */
export function contours(g: PrandtlGrid, c: number): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  const { nx, ny, h, x0, y0, F } = g;
  const P = (i: number, j: number) => F[j * nx + i];
  for (let j = 0; j < ny - 1; j++)
    for (let i = 0; i < nx - 1; i++) {
      const v = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      const xy = [
        [i, j],
        [i + 1, j],
        [i + 1, j + 1],
        [i, j + 1],
      ];
      const pts: [number, number][] = [];
      for (let e = 0; e < 4; e++) {
        const a = v[e],
          b = v[(e + 1) % 4];
        if ((a < c) !== (b < c)) {
          const t = (c - a) / (b - a);
          const [ia, ja] = xy[e],
            [ib, jb] = xy[(e + 1) % 4];
          pts.push([x0 + (ia + t * (ib - ia)) * h, y0 + (ja + t * (jb - ja)) * h]);
        }
      }
      if (pts.length === 2) out.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
      if (pts.length === 4) {
        out.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
        out.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]]);
      }
    }
  return out;
}
