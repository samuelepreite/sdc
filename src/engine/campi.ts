/**
 * Campi vettoriali piani e teorema della divergenza (Teo 1.8.4) su un quadrato [0, L]².
 * Un campo che non dipende da z e ha u₃ = 0, sul cubo [0, L]³ ha flusso nullo attraverso le facce z = cost.:
 * il teorema sul cubo si riduce quindi a quello sul quadrato (moltiplicato per la profondità L).
 * Il flusso è calcolato integrando sul contorno (Simpson), l'integrale della divergenza con Simpson 2D:
 * sono due strade indipendenti che devono dare lo stesso numero.
 */

/** u₁ = a1 + b1 x + c1 y + d1 x y + e1 x², u₂ = a2 + b2 x + c2 y + d2 x y + e2 y² */
export interface PlaneField {
  a1: number; b1: number; c1: number; d1: number; e1: number;
  a2: number; b2: number; c2: number; d2: number; e2: number;
}

export const fieldAt = (f: PlaneField, x: number, y: number): [number, number] => [
  f.a1 + f.b1 * x + f.c1 * y + f.d1 * x * y + f.e1 * x * x,
  f.a2 + f.b2 * x + f.c2 * y + f.d2 * x * y + f.e2 * y * y,
];

/** div u = ∂u₁/∂x + ∂u₂/∂y = tr ∇u (Def 1.8.2) */
export const divAt = (f: PlaneField, x: number, y: number) => f.b1 + f.d1 * y + 2 * f.e1 * x + (f.c2 + f.d2 * x + 2 * f.e2 * y);

/** gradiente (∇u)_ij = ∂u_i/∂x_j nel piano */
export const gradAt = (f: PlaneField, x: number, y: number): [[number, number], [number, number]] => [
  [f.b1 + f.d1 * y + 2 * f.e1 * x, f.c1 + f.d1 * x],
  [f.b2 + f.d2 * y, f.c2 + f.d2 * x + 2 * f.e2 * y],
];

function simpson(g: (t: number) => number, a: number, b: number, n = 40): number {
  const h = (b - a) / n;
  let s = g(a) + g(b);
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * g(a + k * h);
  return (s * h) / 3;
}

/** flusso uscente per lato del quadrato (normale uscente n̂): destra, alto, sinistra, basso */
export function fluxBySide(f: PlaneField, L: number) {
  return {
    destra: simpson((y) => fieldAt(f, L, y)[0], 0, L),
    alto: simpson((x) => fieldAt(f, x, L)[1], 0, L),
    sinistra: simpson((y) => -fieldAt(f, 0, y)[0], 0, L),
    basso: simpson((x) => -fieldAt(f, x, 0)[1], 0, L),
  };
}

export function totalFlux(f: PlaneField, L: number) {
  const s = fluxBySide(f, L);
  return s.destra + s.alto + s.sinistra + s.basso;
}

/** ∫_D div u dA con Simpson 2D */
export const divIntegral = (f: PlaneField, L: number) => simpson((x) => simpson((y) => divAt(f, x, y), 0, L), 0, L);

export const FIELD_PRESETS: Record<string, { label: string; f: PlaneField }> = {
  sorgente: { label: 'sorgente: u = (x, y)', f: { a1: 0, b1: 1, c1: 0, d1: 0, e1: 0, a2: 0, b2: 0, c2: 1, d2: 0, e2: 0 } },
  rotazione: { label: 'rotazione rigida: u = (−y, x)', f: { a1: 0, b1: 0, c1: -1, d1: 0, e1: 0, a2: 0, b2: 1, c2: 0, d2: 0, e2: 0 } },
  uniforme: { label: 'traslazione: u = (1, 0,5)', f: { a1: 1, b1: 0, c1: 0, d1: 0, e1: 0, a2: 0.5, b2: 0, c2: 0, d2: 0, e2: 0 } },
  misto: { label: 'campo misto: u = (x², x y)', f: { a1: 0, b1: 0, c1: 0, d1: 0, e1: 1, a2: 0, b2: 0, c2: 0, d2: 1, e2: 0 } },
};
