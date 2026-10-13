/**
 * Motore del Cap. 2 (analisi della deformazione). Funzioni pure, SI, nessun disegno.
 * Teoria finita: ε_n (Prop 2.5.2), D (Def 2.5.3), sin γ (Prop 2.5.5), ΔS (Prop 2.5.7), Θ = det F − 1 (Prop 2.5.9).
 * Teoria infinitesima: E = sym H, W = skw H (Def 2.6.4, §2.6.4), parametri linearizzati (Prop 2.6.6),
 * formula di rappresentazione (Teo 2.7.1), direzioni principali (§2.9–2.10).
 */
import * as T from './tensor';
import { classify, eigSym, type Spettro } from './spettro';

/** tensore di deformazione finita D = ½(FᵀF − I) */
export const finiteD = (F: T.Mat): T.Mat => T.scale(T.sub(T.mul(T.transpose(F), F), T.I3), 0.5);

/** teoria finita: tutti i parametri di misura per le fibre n̂ (e m̂ ⊥ n̂) */
export function finiteMeasures(F: T.Mat, n0: T.Vec, m0: T.Vec) {
  const n = T.unit(n0);
  const m = T.unit(m0);
  const C = T.mul(T.transpose(F), F);
  const D = finiteD(F);
  const epsN = Math.sqrt(T.dotv(T.apply(C, n), n)) - 1;
  const epsM = Math.sqrt(T.dotv(T.apply(C, m), m)) - 1;
  const Dmn = T.dotv(T.apply(D, m), n);
  const sinGamma = (2 * Dmn) / ((epsN + 1) * (epsM + 1));
  const gamma = Math.asin(Math.max(-1, Math.min(1, sinGamma)));
  const Dnn = T.dotv(T.apply(D, n), n);
  const Dmm = T.dotv(T.apply(D, m), m);
  const dS = Math.sqrt((2 * Dnn + 1) * (2 * Dmm + 1) - 4 * Dmn * Dmn) - 1;
  const Theta = T.det(F) - 1;
  return { D, epsN, epsM, gamma, sinGamma, dS, Theta, Fn: T.apply(F, n), Fm: T.apply(F, m) };
}

/** teoria infinitesima: E, W e parametri linearizzati (Prop 2.6.6) */
export function linearMeasures(H: T.Mat, n0: T.Vec, m0: T.Vec) {
  const n = T.unit(n0);
  const m = T.unit(m0);
  const E = T.sym(H);
  const W = T.skw(H);
  const epsN = T.dotv(T.apply(E, n), n);
  const epsM = T.dotv(T.apply(E, m), m);
  const gamma = 2 * T.dotv(T.apply(E, m), n);
  return { E, W, w: T.axialOf(W), epsN, epsM, gamma, dS: epsN + epsM, Theta: T.trace(E) };
}

/** formula di rappresentazione (Teo 2.7.1): u(Y) = u(X) + W(Y−X) + E(Y−X) per un campo affine u = u0 + H X */
export function representation(H: T.Mat, uX: T.Vec, d: T.Vec) {
  const E = T.sym(H);
  const W = T.skw(H);
  const rot = T.apply(W, d);
  const dp = T.apply(E, d);
  return { uX, rot, dp, uY: T.addv(T.addv(uX, rot), dp), rotDotD: T.dotv(rot, d) };
}

/** direzioni e dilatazioni principali di E, classificazione dagli invarianti (§2.9–2.10) */
export function principal(E: T.Mat): Spettro & { invarianti: [number, number, number]; nulli: number; stato: string } {
  const s = eigSym(E);
  const c = classify(E, 1e-7);
  return { ...s, invarianti: T.invariants(E), nulli: c.nulli, stato: c.stato };
}

/** gradienti di spostamento d'esempio (ampiezze piccole: teoria infinitesima; il disegno le amplifica) */
export const H_PRESETS: Record<string, { label: string; H: T.Mat; note: string }> = {
  allungamento: { label: 'allungamento lungo x', H: [0.04, 0, 0, 0, 0, 0, 0, 0, 0], note: 'solo E₁₁ = ε₁: la fibra x si allunga, nessuno scorrimento.' },
  taglio: { label: 'taglio semplice', H: [0, 0.05, 0, 0, 0, 0, 0, 0, 0], note: 'H₁₂ ≠ 0: metà è deformazione pura (E₁₂ = γ₁₂/2), metà rotazione rigida (W).' },
  rotazione: { label: 'rotazione rigida infinitesima', H: [0, -0.05, 0, 0.05, 0, 0, 0, 0, 0], note: 'H antisimmetrico: E = O, nessuna deformazione pura (§2.6.4).' },
  omotetia: { label: 'omotetia (radice tripla)', H: [0.03, 0, 0, 0, 0.03, 0, 0, 0, 0.03], note: 'E = λI: ogni direzione è principale, la sfera resta sfera (caso 3).' },
  rivoluzione: { label: 'rivoluzione (radice doppia)', H: [0.01, 0, 0, 0, 0.01, 0, 0, 0, 0.05], note: 'λ₁ = λ₂ ≠ λ₃: ellissoide di rivoluzione, «pallone da rugby» (caso 2).' },
  piana: { label: 'una dilatazione nulla', H: [0, 0, 0, 0, 0.03, 0.02, 0, 0.02, -0.02], note: 'III = 0, II ≠ 0: u^dp sempre parallelo al piano n̂₂n̂₃ (§2.10, NF-02).' },
  generico: { label: 'generico', H: [0.03, 0.02, -0.01, -0.01, -0.02, 0.025, 0.015, 0.005, 0.01], note: 'Tre dilatazioni principali distinte: ellissoide triassiale (caso 1).' },
  isocora: { label: 'isocora', H: [0.03, 0.01, 0, 0.01, -0.03, 0, 0, 0, 0], note: 'tr E = 0: Θ = div u = 0, il volume non cambia (al primo ordine).' },
};

/** semiassi dell'ellissoide in cui si trasforma la sfera unitaria sotto I + k E (sola deformazione pura, amplificata) */
export function ellipsoid(E: T.Mat, k: number) {
  const s = eigSym(E);
  return { axes: s.vectors, semi: s.values.map((l) => 1 + k * l) as [number, number, number], spettro: s };
}

/** esempi del Cap. 2 calcolati una volta (servono alle lezioni) */
export function exampleNumbers() {
  const H = H_PRESETS.taglio.H;
  const n: T.Vec = [1, 0, 0];
  const m: T.Vec = [0, 1, 0];
  const lin = linearMeasures(H, n, m);
  const fin = finiteMeasures(T.add(T.I3, H), n, m);
  return { lin, fin };
}

// ------------------------------------------------------------------ compatibilità nel piano (§2.8, eq. (2.3))

/** campo di deformazione piano E(x, y) = [E11, E22, E12] */
export type PlaneStrain = (x: number, y: number) => [number, number, number];

/** prima equazione di Saint-Venant nel piano: ∂²E11/∂y² + ∂²E22/∂x² − 2 ∂²E12/∂x∂y (differenze finite centrate) */
export function saintVenantResidual(E: PlaneStrain, x: number, y: number, h = 1e-3): number {
  const d2y = (E(x, y + h)[0] - 2 * E(x, y)[0] + E(x, y - h)[0]) / (h * h);
  const d2x = (E(x + h, y)[1] - 2 * E(x, y)[1] + E(x - h, y)[1]) / (h * h);
  const dxy = (E(x + h, y + h)[2] - E(x + h, y - h)[2] - E(x - h, y + h)[2] + E(x - h, y - h)[2]) / (4 * h * h);
  return d2y + d2x - 2 * dxy;
}

/** due esempi: un campo che viene da uno spostamento (flessione: u = (c x y, −c x²/2)) e uno che non può venirne */
export const COMPAT_FIELDS = {
  compatibile: {
    label: 'compatibile',
    c: 0.12,
    u: (x: number, y: number, c: number): [number, number] => [c * x * y, (-c * x * x) / 2],
    E: (c: number): PlaneStrain => (_x, y) => [c * y, 0, 0],
  },
  incompatibile: {
    label: 'non compatibile',
    c: 0.12,
    E: (c: number): PlaneStrain => (_x, y) => [c * y * y, 0, 0],
  },
};
