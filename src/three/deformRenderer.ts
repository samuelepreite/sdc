/**
 * Modello V2 (Cap. 2): l'intorno di un punto che si deforma.
 * Modalità: «intorno» (cubetto e fibre n̂, m̂ sotto F = I + kP, con P = H, E o W; §2.4–2.6),
 * «ellissoide» (sfera → ellissoide sotto la sola deformazione pura, direzioni principali; §2.9–2.10),
 * «rappresentazione» (costruzione vettoriale di Teo 2.7.1, figura p. 27).
 * Le ampiezze sono amplificate di k per renderle visibili (dichiarato a schermo); i numeri vengono da engine/deformazione.
 */
import * as THREE from 'three';
import { BaseRenderer, toThree, type V3 } from './base';
import * as T from '../engine/tensor';
import { ellipsoid, representation } from '../engine/deformazione';
import { COL } from './tensorRenderer';

export type DeformPart = 'H' | 'E' | 'W';
export interface DeformConfig {
  mode: 'intorno' | 'ellissoide' | 'rappresentazione';
  H: number[];
  part: DeformPart;
  amp: number;
  /** angolo della fibra n̂ nel piano xy (gradi); m̂ è n̂ ruotata di 90° */
  alpha: number;
  /** direzione della fibra di prova m̂ nella modalità ellissoide: [inclinazione, azimut] */
  probe: [number, number];
}

const S = (k: number) => `<sub>${k}</sub>`;
const toDisp = (p: THREE.Vector3): T.Vec => [p.x, -p.z, p.y];

/** tensore che produce il disegno: H o E amplificati; W come rotazione esatta di asse w e ampiezza k|w| (rigida) */
export function drawMap(H: T.Mat, part: DeformPart, k: number): T.Mat {
  if (part === 'E') return T.add(T.I3, T.scale(T.sym(H), k));
  if (part === 'W') {
    const w = T.axialOf(T.skw(H));
    const a = T.norm(w);
    return a < 1e-12 ? T.I3 : T.eulerR(T.unit(w), k * a);
  }
  return T.add(T.I3, T.scale(H, k));
}

export class DeformRenderer extends BaseRenderer<DeformConfig> {
  constructor(host: HTMLElement, cfg: DeformConfig) {
    super(host, cfg);
    this.build();
  }

  setView(v: string) {
    if (this.cfg.mode === 'rappresentazione') {
      const c: V3 = [-0.1, 0.35, 0];
      if (v === 'alto') this.setCamera([c[0], c[1] - 0.01, 3.9], c);
      else if (v === 'fronte') this.setCamera([c[0], -3.8, 0.6], c);
      else this.setCamera([1.2, -2.6, 2.8], c);
      return;
    }
    if (v === 'alto') this.setCamera([0.001, 0.001, 4.6]);
    else if (v === 'fronte') this.setCamera([0.001, -4.6, 0.4]);
    else this.setCamera([3.2, -2.7, 2.2]);
  }

  private frame() {
    const grid = new THREE.GridHelper(4, 8, 0x94a3b8, 0x94a3b8);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.12;
    this.dyn.add(grid);
    const axes: [V3, string][] = [
      [[1.5, 0, 0], 'x'],
      [[0, 1.5, 0], 'y'],
      [[0, 0, 1.5], 'z'],
    ];
    for (const [v, n] of axes) {
      this.line([[0, 0, 0], v], 0x94a3b8);
      this.tag(n, T.scalev(v as T.Vec, 1.08) as V3, 'g');
    }
  }

  /** solido traslucido: geometria three trasformata dal tensore A (coordinate della dispensa) */
  private solid(geo: THREE.BufferGeometry, A: T.Mat, color: number, opacity: number, offset: T.Vec = [0, 0, 0]) {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      const q = T.addv(T.apply(A, toDisp(p)), offset);
      const t = toThree(q as V3);
      pos.setXYZ(i, t.x, t.y, t.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, this.mat(color, { opacity, side: THREE.DoubleSide }));
    this.dyn.add(mesh);
    return mesh;
  }

  private wire(geo: THREE.BufferGeometry, A: T.Mat, color: number, offset: T.Vec = [0, 0, 0]) {
    const edges = new THREE.EdgesGeometry(geo, 1);
    const pos = edges.getAttribute('position') as THREE.BufferAttribute;
    const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      const t = toThree(T.addv(T.apply(A, toDisp(p)), offset) as V3);
      pos.setXYZ(i, t.x, t.y, t.z);
    }
    const l = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 }));
    this.dyn.add(l);
  }

  protected build() {
    if (this.cfg.mode !== 'rappresentazione') this.frame();
    if (this.cfg.mode === 'intorno') this.buildNeighbourhood();
    else if (this.cfg.mode === 'ellissoide') this.buildEllipsoid();
    else this.buildRepresentation();
  }

  private buildNeighbourhood() {
    const c = this.cfg;
    const A = drawMap(c.H, c.part, c.amp);
    const L = 1.2;
    // cubetto di riferimento (spigoli tratteggiati) e trasformato
    const box = () => new THREE.BoxGeometry(L, L, L).translate(L / 2, L / 2, -L / 2);
    this.wire(box(), T.I3, COL.ghost);
    this.solid(box(), A, 0x93c5fd, 0.28);
    this.wire(box(), A, 0x475569);
    // fibre n̂ e m̂ (nel piano xy) e loro trasformate
    const a = (c.alpha * Math.PI) / 180;
    const n: T.Vec = [Math.cos(a), Math.sin(a), 0];
    const m: T.Vec = [-Math.sin(a), Math.cos(a), 0];
    this.arrow([0, 0, 0], T.scalev(n, 1.3) as V3, COL.ghost, 0.014);
    this.arrow([0, 0, 0], T.scalev(m, 1.3) as V3, COL.ghost, 0.014);
    const An = T.apply(A, T.scalev(n, 1.3));
    const Am = T.apply(A, T.scalev(m, 1.3));
    this.arrow([0, 0, 0], An as V3, COL.e1, 0.026);
    this.arrow([0, 0, 0], Am as V3, COL.e2, 0.026);
    this.tag('n̂', T.scalev(n, 1.42) as V3, 'g');
    this.tag('m̂', T.scalev(m, 1.42) as V3, 'g');
    this.tag(`dx<sub>n</sub>`, T.scalev(An, 1.1) as V3, 'c1');
    this.tag(`dx<sub>m</sub>`, T.scalev(Am, 1.1) as V3, 'u');
  }

  private buildEllipsoid() {
    const c = this.cfg;
    const E = T.sym(c.H);
    const el = ellipsoid(E, c.amp);
    const sph = () => new THREE.SphereGeometry(1, 40, 24);
    this.wire(new THREE.SphereGeometry(1, 16, 10), T.I3, COL.ghost);
    this.solid(sph(), T.add(T.I3, T.scale(E, c.amp)), 0x93c5fd, 0.35);
    const cols = [COL.e1, COL.e2, COL.e3];
    el.axes.forEach((ax, i) => {
      const tip = T.scalev(ax, el.semi[i]);
      this.line([T.scalev(ax, -el.semi[i]) as V3, tip as V3], cols[i]);
      this.arrow([0, 0, 0], tip as V3, cols[i], 0.022);
      this.tag(`n̂${S(i + 1)} · e${S(i + 1)}`, T.scalev(ax, el.semi[i] + 0.18) as V3, `c${i + 1}`);
    });
    // fibra di prova m̂ e spostamento di deformazione pura u^dp = E m̂ (amplificato)
    const mh = T.dirVec(c.probe[0], c.probe[1]);
    const udp = T.scalev(T.apply(E, mh), c.amp);
    this.arrow([0, 0, 0], mh as V3, COL.u, 0.016);
    this.tag('m̂', T.scalev(mh, 0.6) as V3, 'u');
    this.arrow(mh as V3, udp as V3, COL.out, 0.022);
    this.tag('u<sup>dp</sup> ∥ E m̂', T.addv(mh, T.scalev(udp, 1.2)) as V3, 'out');
  }

  private buildRepresentation() {
    const c = this.cfg;
    const k = c.amp;
    const X: T.Vec = [-1.2, -0.8, 0];
    const d: T.Vec = [0.4, 1.4, 0];
    const Y = T.addv(X, d);
    const uX: T.Vec = [0.9, 0.35, 0];
    const rep = representation(T.scale(c.H, k), uX, d);
    this.tag('X', X as V3, 'g');
    this.tag('Y', Y as V3, 'g');
    this.line([X as V3, Y as V3], COL.ghost, true);
    this.tag('Y − X', T.addv(X, T.scalev(d, 0.5)) as V3, 'g');
    this.arrow(X as V3, uX as V3, COL.out, 0.022);
    this.tag('u(X)', T.addv(X, T.scalev(uX, 0.5)) as V3, 'out');
    // da Y: u(X) (traslazione), poi W(Y−X), poi E(Y−X)
    this.arrow(Y as V3, uX as V3, COL.out, 0.018);
    const p1 = T.addv(Y, uX);
    this.line([T.addv(X, uX) as V3, p1 as V3], COL.ghost, true);
    this.arrow(p1 as V3, rep.rot as V3, COL.e1, 0.022);
    this.tag('W(Y − X)', T.addv(p1, T.scalev(rep.rot, 0.6)) as V3, 'c1');
    const p2 = T.addv(p1, rep.rot);
    this.arrow(p2 as V3, rep.dp as V3, 0xa21caf, 0.022);
    this.tag('E(Y − X) = u<sup>dp</sup>', T.addv(p2, T.scalev(rep.dp, 1.1)) as V3, 'c');
    this.arrow(Y as V3, rep.uY as V3, COL.e3, 0.02);
    this.tag('u(Y)', T.addv(Y, T.scalev(rep.uY, 0.45)) as V3, 'c3');
    this.tag('y', T.addv(Y, rep.uY) as V3, 'g');
  }
}
