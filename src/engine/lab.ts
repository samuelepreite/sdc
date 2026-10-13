/**
 * Numeri del laboratorio dei tensori (modello V1, Cap. 1). Il renderer 3D disegna soltanto ciò che esce da qui.
 * Tutte le formule sono quelle della dispensa, citate accanto.
 */
import * as T from './tensor';
import type { Mat, Vec } from './tensor';

export const PRESETS: Record<string, { label: string; A: Mat; note: string }> = {
  identita: { label: 'identità', A: T.I3, note: 'I v = v: ogni vettore resta sé stesso (§1.2.3).' },
  stiramento: { label: 'stiramento lungo x', A: [1.6, 0, 0, 0, 1, 0, 0, 0, 1], note: 'Allunga la direzione ê₁, lascia ê₂ ed ê₃.' },
  taglio: { label: 'taglio (scorrimento)', A: [1, 0.8, 0, 0, 1, 0, 0, 0, 1], note: 'A ê₂ = (0,8; 1; 0): la colonna 2 si inclina verso x. Volume invariato: det = 1.' },
  rotazione: { label: 'rotazione di 30° attorno a z', A: T.eulerR([0, 0, 1], Math.PI / 6), note: 'Tensore ortogonale con det = 1 (§1.5).' },
  riflessione: { label: 'riflessione z → −z', A: [1, 0, 0, 0, 1, 0, 0, 0, -1], note: 'Ortogonale con det = −1: la terna diventa sinistrorsa (§1.5.1).' },
  sferico: { label: 'sferico 1,3 I', A: T.scale(T.I3, 1.3), note: 'λ I: dilata ugualmente in ogni direzione; commuta con ogni tensore (Oss. §1.2.6).' },
  singolare: { label: 'singolare (det = 0)', A: [1, 0, 0.6, 0, 1, 0.6, 0, 0, 0], note: 'Schiaccia lo spazio su un piano: det = 0, non invertibile (Def 1.4.2).' },
  generico: { label: 'generico', A: [1.2, 0.5, 0.1, -0.3, 0.9, 0.4, 0.2, -0.2, 1.1], note: 'Né simmetrico né antisimmetrico: A = sym A + skw A (Teo 1.3.3).' },
};

export interface TransformNumbers {
  A: Mat;
  /** immagini dei versori: colonne di [A] (A_ij = A ê_j · ê_i) */
  images: [Vec, Vec, Vec];
  det: number;
  trace: number;
  /** volume del cubo unitario trasformato (prodotto misto) = det A (Def 1.4.1) */
  volume: number;
  symmetric: boolean;
  orthogonal: boolean;
  /** vertici del cubo unitario trasformato (8 punti) */
  cube: Vec[];
}

export function transformNumbers(A: Mat): TransformNumbers {
  const images: [Vec, Vec, Vec] = [T.col(A, 0), T.col(A, 1), T.col(A, 2)];
  const cube: Vec[] = [];
  for (let k = 0; k < 8; k++) cube.push(T.apply(A, [k & 1, (k >> 1) & 1, (k >> 2) & 1]));
  const AtA = T.mul(T.transpose(A), A);
  return {
    A,
    images,
    det: T.det(A),
    trace: T.trace(A),
    volume: T.triple(images[0], images[1], images[2]),
    symmetric: A.every((a, k) => Math.abs(a - T.transpose(A)[k]) < 1e-12),
    orthogonal: AtA.every((a, k) => Math.abs(a - T.I3[k]) < 1e-9),
    cube,
  };
}

export interface ProjectorNumbers {
  e: Vec;
  u: Vec;
  /** (ê ⊗ ê) u = (ê · u) ê */
  along: Vec;
  /** (I − ê ⊗ ê) u */
  ortho: Vec;
  /** componente (con segno) di u lungo ê */
  comp: number;
}

export function projectorNumbers(e0: Vec, u: Vec): ProjectorNumbers {
  const e = T.unit(e0);
  const P = T.dyad(e, e);
  const along = T.apply(P, u);
  return { e, u, along, ortho: T.apply(T.sub(T.I3, P), u), comp: T.dotv(e, u) };
}

export interface AxialNumbers {
  w: Vec;
  u: Vec;
  W: Mat;
  /** W u = w ∧ u */
  Wu: Vec;
  /** W w = 0 */
  Ww: Vec;
}

export function axialNumbers(w: Vec, u: Vec): AxialNumbers {
  const W = T.skewOf(w);
  return { w, u, W, Wu: T.apply(W, u), Ww: T.apply(W, w) };
}

export interface EulerNumbers {
  e: Vec;
  v: Vec;
  phi: number;
  R: Mat;
  /** R v esatto (1.1) */
  Rv: Vec;
  /** approssimazione delle rotazioni infinitesime v + φ ê ∧ v */
  tangent: Vec;
  /** errore |R v − (v + φ ê∧v)| */
  error: number;
  lenV: number;
  lenRv: number;
  lenTangent: number;
  det: number;
  /** R ê − ê (deve essere nullo: ê è l'asse) */
  axisResidual: number;
  /** punti dell'arco descritto da v ruotando da 0 a φ */
  arc: Vec[];
}

export function eulerNumbers(e0: Vec, v: Vec, phi: number): EulerNumbers {
  const e = T.unit(e0);
  const R = T.eulerR(e, phi);
  const Rv = T.apply(R, v);
  const tangent = T.addv(v, T.scalev(T.cross(e, v), phi));
  const arc: Vec[] = [];
  const n = 48;
  for (let k = 0; k <= n; k++) arc.push(T.apply(T.eulerR(e, (phi * k) / n), v));
  return {
    e,
    v,
    phi,
    R,
    Rv,
    tangent,
    error: T.norm(T.subv(Rv, tangent)),
    lenV: T.norm(v),
    lenRv: T.norm(Rv),
    lenTangent: T.norm(tangent),
    det: T.det(R),
    axisResidual: T.norm(T.subv(T.apply(R, e), e)),
    arc,
  };
}
