/**
 * Motore del Cap. 6: criteri di resistenza. Tensioni principali s1 ≥ s2 ≥ s3 (trazione positiva); tensioni ideali di
 * Galileo, Tresca, Grashof, Beltrami, von Mises; Mohr–Coulomb; confutazione di Huber; secondo teorema di
 * decomposizione (parti sferica e deviatorica) ed energia distorcente; tensioni ideali per stati alla Saint-Venant.
 */
import * as T from './tensor';

export type S3 = [number, number, number];

/** ordina in s1 ≥ s2 ≥ s3 */
export const sortS = (s: number[]): S3 => [...s].sort((a, b) => b - a) as S3;

export const galileo = (s: S3) => ({ t: s[0], c: s[2] });
export const tresca = (s: S3) => s[0] - s[2];
export const grashof = (s: S3, nu: number) => ({ t: s[0] - nu * (s[1] + s[2]), c: s[2] - nu * (s[0] + s[1]) });
export const beltrami = (s: S3, nu: number) => Math.sqrt(Math.max(0, s[0] ** 2 + s[1] ** 2 + s[2] ** 2 - 2 * nu * (s[0] * s[1] + s[1] * s[2] + s[2] * s[0])));
export const vonMises = (s: S3) => Math.sqrt(0.5 * ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2));

/** Mohr–Coulomb (§6.6): F = max{|s_i − s_j| + (s_i + s_j) sin φ} ≤ 2c cos φ */
export function mohrCoulomb(s: S3, c: number, phi: number) {
  const pairs: [number, number][] = [
    [0, 1],
    [1, 2],
    [0, 2],
  ];
  const F = Math.max(...pairs.map(([i, j]) => Math.abs(s[i] - s[j]) + (s[i] + s[j]) * Math.sin(phi)));
  return { F, lim: 2 * c * Math.cos(phi), ok: F <= 2 * c * Math.cos(phi) + 1e-12 };
}

/** distanza (con segno, positiva verso l'interno) del centro del cerchio massimo dalla retta τ = c − σ tan φ, meno il raggio */
export function mcMargin(s: S3, c: number, phi: number) {
  const C = (s[0] + s[2]) / 2,
    R = (s[0] - s[2]) / 2;
  // retta: σ tan φ + τ − c = 0; distanza del punto (C, 0)
  const d = (c - C * Math.tan(phi)) * Math.cos(phi);
  return d - R;
}

/** Huber (§6.4.5): crisi prevista da Beltrami alla profondità h_L = σ_L/(ρg√(3 − 6ν)) */
export const huberDepth = (sigmaL: number, rhoG: number, nu: number) => sigmaL / (rhoG * Math.sqrt(3 - 6 * nu));

// ------------------------------------------------------------------ secondo teorema di decomposizione (§6.5.1)

export const sph = (A: T.Mat): T.Mat => T.scale(T.I3, T.trace(A) / 3);
export const dev = (A: T.Mat): T.Mat => T.sub(A, sph(A));

/** energia distorcente con il legame di Lamé: φ_d = ¼μ T_d·T_d (Def 6.5.2, §6.5.2) */
export const phiD = (S: T.Mat, mu: number) => T.ddot(dev(S), dev(S)) / (4 * mu);
/** forma in tensioni principali: φ_d = [(s1−s2)² + (s2−s3)² + (s3−s1)²]/(12μ) */
export const phiDprincipal = (s: S3, mu: number) => ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2) / (12 * mu);

// ------------------------------------------------------------------ stati alla Saint-Venant (§6.7)

/** tensioni principali di [[0,0,τx],[0,0,τy],[τx,τy,σ]] (al più biassiale) */
export function svPrincipal(sz: number, tzx: number, tzy: number) {
  const t2 = tzx * tzx + tzy * tzy;
  const r = 0.5 * Math.sqrt(sz * sz + 4 * t2);
  return { a: sz / 2 + r, b: sz / 2 - r };
}
export function svIdeal(sz: number, tzx: number, tzy: number, nu: number) {
  const t2 = tzx * tzx + tzy * tzy;
  const q = Math.sqrt(sz * sz + 4 * t2);
  return {
    tresca: q,
    vonMises: Math.sqrt(sz * sz + 3 * t2),
    grashofT: ((1 - nu) / 2) * sz + ((1 + nu) / 2) * q,
    grashofC: ((1 - nu) / 2) * sz - ((1 + nu) / 2) * q,
  };
}

/** procedura della dispensa (§6.5.3): σ_m ≤ 0 → von Mises, σ_m > 0 → Beltrami */
export const sceltaCriterio = (s: S3) => ((s[0] + s[1] + s[2]) / 3 <= 0 ? 'von Mises' : 'Beltrami');

/** coefficienti di sicurezza indicativi della dispensa (Def 6.2.1) */
export const NU_SICUREZZA: { materiale: string; nu: string }[] = [
  { materiale: 'acciaio', nu: '1,7–1,8' },
  { materiale: 'legno', nu: '2,5' },
  { materiale: 'calcestruzzo', nu: '3' },
  { materiale: 'muratura', nu: '4–10' },
];
