/**
 * Laboratorio dei tensori (modello V1, Cap. 1): un tensore del II ordine come trasformazione lineare dello spazio.
 * Modalità: «trasforma» (immagini dei versori = colonne di [A], cubo unitario → parallelepipedo di volume det A),
 * «proiettori» (ê⊗ê e I − ê⊗ê, Def 1.2.5), «assiale» (W u = w ∧ u, Teo 1.3.4), «eulero» (formula (1.1) e
 * rotazioni infinitesime). Nessun numero è calcolato qui: arrivano da src/engine/lab.ts.
 */
import * as THREE from 'three';
import { BaseRenderer, toThree, type V3 } from './base';
import { PRESETS, axialNumbers, eulerNumbers, projectorNumbers, transformNumbers } from '../engine/lab';
import * as T from '../engine/tensor';
import type { TensorScene } from '../content/types';

export const COL = { e1: 0xdc2626, e2: 0x16a34a, e3: 0x2563eb, u: 0x7c3aed, out: 0xea580c, ghost: 0x94a3b8, plane: 0x60a5fa, axis: 0x0f766e, tan: 0xca8a04 };

export type TensorConfig = Required<Pick<TensorScene, 'mode' | 'dir' | 'u' | 'angle' | 'tangent' | 'cube' | 'view' | 'wLen'>> & { A: number[] };

export const DEFAULT_TENSOR: TensorConfig = {
  mode: 'trasforma',
  A: PRESETS.taglio.A,
  dir: [35, 30],
  u: [1.1, -0.6, 0.5],
  angle: 60,
  tangent: false,
  cube: true,
  view: 'prospettiva',
  wLen: 1,
};

const S = (k: number) => `<sub>${k}</sub>`;

export class TensorRenderer extends BaseRenderer<TensorConfig> {
  constructor(host: HTMLElement, cfg: TensorConfig) {
    super(host, cfg);
    this.build();
    this.applyView();
  }

  setConfig(c: Partial<TensorConfig>) {
    const prevView = this.cfg.view;
    const prevMode = this.cfg.mode;
    super.setConfig(c);
    if ((c.view !== undefined && c.view !== prevView) || (c.mode !== undefined && c.mode !== prevMode)) this.applyView();
  }

  applyView() {
    const v = this.cfg.view;
    if (v === 'alto') this.setCamera([0.001, 0.001, 5.2]);
    else if (v === 'fronte') this.setCamera([0.001, -5.2, 0.6]);
    else if (v === 'asse') {
      const e = T.dirVec(this.cfg.dir[0], this.cfg.dir[1]);
      this.setCamera(T.scalev(e, 5) as V3);
    } else this.setCamera([3.6, -3.0, 2.6], [0.3, 0.3, 0.3]);
  }

  /** assi coordinati e griglia del piano xy (sempre presenti) */
  private frame(len = 1.6, faint = false) {
    const g = new THREE.Group();
    const grid = new THREE.GridHelper(4, 8, 0x94a3b8, 0x94a3b8);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = faint ? 0.12 : 0.22;
    g.add(grid);
    this.dyn.add(g);
    const axes: [V3, string][] = [
      [[len, 0, 0], 'x'],
      [[0, len, 0], 'y'],
      [[0, 0, len], 'z'],
    ];
    for (const [v, n] of axes) {
      this.line([[0, 0, 0], v], 0x94a3b8);
      this.tag(n, T.scalev(v as T.Vec, 1.08) as V3, 'axis');
    }
  }

  protected build() {
    const c = this.cfg;
    if (c.mode === 'trasforma') this.buildTransform();
    else if (c.mode === 'proiettori') this.buildProjector();
    else if (c.mode === 'assiale') this.buildAxial();
    else this.buildEuler();
  }

  private buildTransform() {
    this.frame(1.8, true);
    const n = transformNumbers(this.cfg.A);
    const basisCol = [COL.e1, COL.e2, COL.e3];
    // versori originali (fantasma) e loro immagini A ê_j = colonna j
    for (let j = 0; j < 3; j++) {
      this.arrow([0, 0, 0], T.basis(j) as V3, COL.ghost, 0.012);
      this.arrow([0, 0, 0], n.images[j] as V3, basisCol[j], 0.028);
      this.tag(`A ê${S(j + 1)}`, T.scalev(n.images[j], 1.12) as V3, `c${j + 1}`);
    }
    if (this.cfg.cube) {
      // cubo unitario (spigoli tratteggiati) e il suo trasformato (solido traslucido)
      const edges: [number, number][] = [
        [0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      const unitV: V3[] = Array.from({ length: 8 }, (_, k) => [k & 1, (k >> 1) & 1, (k >> 2) & 1]);
      for (const [a, b] of edges) this.line([unitV[a], unitV[b]], COL.ghost, true);
      for (const [a, b] of edges) this.line([n.cube[a] as V3, n.cube[b] as V3], 0x475569);
      const faces = [
        [0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3],
      ];
      const pos: number[] = [];
      for (const f of faces) for (const k of [f[0], f[1], f[2], f[0], f[2], f[3]]) pos.push(...toThree(n.cube[k] as V3).toArray());
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.computeVertexNormals();
      const color = n.det < 0 ? 0xf97316 : 0x93c5fd;
      this.dyn.add(new THREE.Mesh(geo, this.mat(color, { opacity: 0.32, side: THREE.DoubleSide })));
    }
  }

  private buildProjector() {
    this.frame();
    const e = T.dirVec(this.cfg.dir[0], this.cfg.dir[1]);
    const p = projectorNumbers(e, this.cfg.u as T.Vec);
    // piano π ⊥ ê (disco traslucido)
    const disk = new THREE.Mesh(new THREE.CircleGeometry(1.5, 64), this.mat(COL.plane, { opacity: 0.16, side: THREE.DoubleSide }));
    disk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toThree(p.e as V3).normalize());
    this.dyn.add(disk);
    this.tag('π ⊥ ê', T.scalev(T.unit(T.cross(p.e, [0.3, 0.2, 1])), 1.45) as V3, 'plane');
    this.line([T.scalev(p.e, -1.6) as V3, T.scalev(p.e, 1.6) as V3], COL.axis, true);
    this.arrow([0, 0, 0], p.e as V3, COL.axis, 0.03);
    this.tag('ê', T.scalev(p.e, 1.12) as V3, 'axis-e');
    this.arrow([0, 0, 0], p.u as V3, COL.u, 0.03);
    this.tag('u', T.scalev(p.u, 1.08) as V3, 'u');
    this.arrow([0, 0, 0], p.along as V3, COL.out, 0.026);
    this.tag('(ê⊗ê)u', T.addv(T.scalev(p.along, 1.05), [0.05, 0.05, 0.05]) as V3, 'out');
    this.arrow([0, 0, 0], p.ortho as V3, COL.e2, 0.026);
    this.tag('(I − ê⊗ê)u', T.scalev(p.ortho, 1.1) as V3, 'c2');
    // completamento del parallelogramma
    this.line([p.along as V3, p.u as V3], COL.ghost, true);
    this.line([p.ortho as V3, p.u as V3], COL.ghost, true);
  }

  private buildAxial() {
    this.frame();
    const w = T.scalev(T.dirVec(this.cfg.dir[0], this.cfg.dir[1]), this.cfg.wLen);
    const a = axialNumbers(w, this.cfg.u as T.Vec);
    this.arrow([0, 0, 0], a.w as V3, COL.axis, 0.032);
    this.tag('w', T.scalev(a.w, 1.1) as V3, 'axis-e');
    this.arrow([0, 0, 0], a.u as V3, COL.u, 0.03);
    this.tag('u', T.scalev(a.u, 1.08) as V3, 'u');
    this.arrow([0, 0, 0], a.Wu as V3, COL.out, 0.03);
    this.tag('W u = w ∧ u', T.scalev(a.Wu, 1.1) as V3, 'out');
    // piano di u e w (per far vedere che W u è ortogonale a entrambi)
    const nrm = T.cross(a.w, a.u);
    if (T.norm(nrm) > 1e-6) {
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), this.mat(COL.plane, { opacity: 0.12, side: THREE.DoubleSide }));
      quad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toThree(nrm as V3).normalize());
      this.dyn.add(quad);
    }
  }

  private buildEuler() {
    this.frame(1.6, true);
    const e = T.dirVec(this.cfg.dir[0], this.cfg.dir[1]);
    const n = eulerNumbers(e, this.cfg.u as T.Vec, (this.cfg.angle * Math.PI) / 180);
    // asse e circonferenza descritta dalla punta di v (piano π ⊥ ê)
    this.line([T.scalev(n.e, -1.7) as V3, T.scalev(n.e, 1.7) as V3], COL.axis);
    this.arrow([0, 0, 0], n.e as V3, COL.axis, 0.03);
    this.tag('ê (asse)', T.scalev(n.e, 1.15) as V3, 'axis-e');
    const center = T.scalev(n.e, T.dotv(n.e, n.v));
    const rad = T.subv(n.v, center);
    const r = T.norm(rad);
    if (r > 1e-6) {
      const circle: V3[] = [];
      for (let k = 0; k <= 96; k++) circle.push(T.addv(center, T.apply(T.eulerR(n.e, (2 * Math.PI * k) / 96), rad)) as V3);
      this.line(circle, COL.ghost, true);
      const disk = new THREE.Mesh(new THREE.CircleGeometry(r, 64), this.mat(COL.plane, { opacity: 0.12, side: THREE.DoubleSide }));
      disk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toThree(n.e as V3).normalize());
      disk.position.copy(toThree(center as V3));
      this.dyn.add(disk);
      this.tag('π ⊥ ê', T.addv(center, T.scalev(T.unit(T.cross(n.e, rad)), -r * 1.05)) as V3, 'plane');
    }
    this.arrow([0, 0, 0], n.v as V3, COL.u, 0.03);
    this.tag('v', T.scalev(n.v, 1.08) as V3, 'u');
    this.arrow([0, 0, 0], n.Rv as V3, COL.out, 0.03);
    this.tag('R v (esatto)', T.scalev(n.Rv, 1.1) as V3, 'out');
    this.line(n.arc.map((p) => T.addv(p, [0, 0, 0]) as V3), COL.out);
    if (this.cfg.tangent) {
      this.arrow(n.v as V3, T.subv(n.tangent, n.v) as V3, COL.tan, 0.022);
      this.tag('φ ê ∧ v', T.addv(n.v, T.scalev(T.subv(n.tangent, n.v), 0.6)) as V3, 'tan');
      this.line([[0, 0, 0], n.tangent as V3], COL.tan, true);
      this.tag('v + φ ê∧v', T.scalev(n.tangent, 1.06) as V3, 'tan');
    }
  }
}
