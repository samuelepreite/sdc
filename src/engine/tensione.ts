/**
 * Motore del Cap. 3 (analisi della tensione). Funzioni pure; unità: quelle dei dati (negli esempi MPa).
 * Vettore tensione e componenti speciali (Teo 3.3.1, §3.10), tensioni principali (§3.11–3.12), estremi (§3.13),
 * cerchio di Mohr (§3.15) e arbelo (§3.17).
 */
import * as T from './tensor';
import { classify, eigSym } from './spettro';

/** vettore tensione e componenti speciali sulla giacitura n̂ (con eventuale direzione ν̂ del piano) */
export function traction(Tm: T.Mat, n0: T.Vec, nu?: T.Vec) {
  const n = T.unit(n0);
  const t = T.apply(Tm, n);
  const sigma = T.dotv(t, n);
  const tauV = T.subv(t, T.scalev(n, sigma));
  const tau = T.norm(tauV);
  const mu = tau > 1e-14 ? T.scalev(tauV, 1 / tau) : ([0, 0, 0] as T.Vec);
  return { n, t, sigma, tauV, tau, mu, tauNu: nu ? T.dotv(t, T.unit(nu)) : NaN };
}

/** tensioni principali s1 ≥ s2 ≥ s3, direzioni, classificazione dagli invarianti (§3.11–3.12) */
export function principalStress(Tm: T.Mat) {
  const s = eigSym(Tm);
  const c = classify(Tm, 1e-9);
  return { s: s.values, n: s.vectors, caso: s.caso, invarianti: T.invariants(Tm), stato: c.stato, nulli: c.nulli };
}

/** tensione tangenziale massima (Prop 3.13.2): (s1 − s3)/2 sulla giacitura (n̂1 − n̂3)/√2, direzione (n̂1 + n̂3)/√2 */
export function tauMax(Tm: T.Mat) {
  const p = principalStress(Tm);
  const r = 1 / Math.SQRT2;
  const m = T.scalev(T.subv(p.n[0], p.n[2]), r);
  const nu = T.scalev(T.addv(p.n[0], p.n[2]), r);
  return { value: (p.s[0] - p.s[2]) / 2, m, nu, sigmaOn: (p.s[0] + p.s[2]) / 2 };
}

// ------------------------------------------------------------------ Mohr (§3.15): fascio di asse ê3 principale

export interface MohrInput {
  s1: number; // σ1 (componente T11)
  s2: number; // σ2 (componente T22)
  t12: number; // τ12
}

export function mohr({ s1, s2, t12 }: MohrInput) {
  const C = (s1 + s2) / 2;
  const R = Math.sqrt(((s1 - s2) / 2) ** 2 + t12 ** 2);
  /** stato di tensione sulla giacitura m̂ = (cos α, sin α, 0), componente lungo ν̂ = (−sin α, cos α, 0) (§3.15.2) */
  const at = (alpha: number) => {
    const c2 = Math.cos(2 * alpha);
    const s2a = Math.sin(2 * alpha);
    return { sigma: C + ((s1 - s2) / 2) * c2 + t12 * s2a, tau: -((s1 - s2) / 2) * s2a + t12 * c2 };
  };
  // tan 2γ = 2τ12/(σ1 − σ2): tra γ e γ + 90° si sceglie quello con σ_m maggiore (Oss. di §3.17.2)
  let gamma = 0.5 * Math.atan(s1 === s2 ? Math.sign(t12) * 1e300 : (2 * t12) / (s1 - s2));
  if (at(gamma + Math.PI / 2).sigma > at(gamma).sigma) gamma += Math.PI / 2;
  if (gamma > Math.PI / 2) gamma -= Math.PI;
  return { C, R, sMax: C + R, sMin: C - R, gamma, pole: [s1, -t12] as [number, number], at };
}

/** i tre cerchi dell'arbelo (Teo 3.17.1): centri e raggi dalle tensioni principali ordinate */
export function arbelo(s: [number, number, number]) {
  const [a, b, c] = s;
  return [
    { C: (a + b) / 2, R: (a - b) / 2, nome: 's1–s2' },
    { C: (a + c) / 2, R: (a - c) / 2, nome: 's1–s3 (massimo)' },
    { C: (b + c) / 2, R: (b - c) / 2, nome: 's2–s3' },
  ];
}

/** il punto (σ, τ) sta nell'arbelo (bordi compresi)? */
export function inArbelo(s: [number, number, number], sigma: number, tau: number, tol = 1e-9) {
  const [big, c12, c23] = [arbelo(s)[1], arbelo(s)[0], arbelo(s)[2]];
  const d = (k: { C: number; R: number }) => Math.hypot(sigma - k.C, tau) - k.R;
  return d(big) <= tol * (1 + big.R) && d(c12) >= -tol * (1 + big.R) && d(c23) >= -tol * (1 + big.R);
}

// ------------------------------------------------------------------ esempi della dispensa

/** esercizio svolto §3.14 */
export const ES_314: T.Mat = [0, -3, 0, -3, 0, 6, 0, 6, 0];
export const ES_314_N: T.Vec = T.scalev([1, -1, -2], 1 / Math.sqrt(6));
/** esempio numerico §3.17.2 (MPa) */
export const ES_3172: MohrInput = { s1: 98, s2: 14, t12: 21 };

/** stati di tensione d'esempio per i modelli */
export const T_PRESETS: Record<string, { label: string; T: T.Mat; note: string }> = {
  esercizio: { label: 'esercizio §3.14', T: ES_314, note: 'Biassiale: III = 0, II = −45; s = 3√5, 0, −3√5.' },
  trazione: { label: 'trazione semplice', T: [10, 0, 0, 0, 0, 0, 0, 0, 0], note: 'Monoassiale: il vettore tensione è sempre parallelo all’asse (§3.12).' },
  scorrimento: { label: 'scorrimento semplice', T: [0, 5, 0, 5, 0, 0, 0, 0, 0], note: 'Biassiale con piano scarico ê3; principali ±τ a 45° (§3.16.1).' },
  idrostatico: { label: 'idrostatico', T: [-6, 0, 0, 0, -6, 0, 0, 0, -6], note: 'T = λI: ogni giacitura è principale, solo tensione normale (§3.11.2).' },
  mohr: { label: 'esempio §3.17.2', T: [98, 21, 0, 21, 14, 0, 0, 0, 0], note: 'MPa; ê3 principale e piano scarico.' },
  generico: { label: 'triassiale', T: [8, 3, -2, 3, 2, 1, -2, 1, -4], note: 'Tre tensioni principali non nulle: il vettore tensione ha direzione generica.' },
};
