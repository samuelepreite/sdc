/**
 * Modello V3 (Cap. 3): la tensione in un punto.
 * Modalità: «taglio» (piano di giacitura n̂, vettore tensione e componenti speciali; §3.2–3.3, §3.10),
 * «tetraedro» (tetraedro di Cauchy, §3.7.1), «parallelepipedo» (reciprocità delle tangenziali, §3.7.3),
 * «principali» (direzioni principali e giacitura di τ_max, §3.11–3.13). Numeri da engine/tensione.
 */
import * as THREE from 'three';
import { BaseRenderer, toThree, type V3 } from './base';
import * as T from '../engine/tensor';
import { principalStress, tauMax, traction } from '../engine/tensione';
import { COL } from './tensorRenderer';

export interface StressConfig {
  mode: 'taglio' | 'tetraedro' | 'parallelepipedo' | 'principali';
  T: number[];
  /** giacitura n̂: [inclinazione, azimut] in gradi */
  dir: [number, number];
}

const S = (k: number) => `<sub>${k}</sub>`;
/** scala delle frecce di tensione: la più grande tensione principale in modulo → lunghezza 1,1 */
const scaleOf = (Tm: T.Mat) => {
  const s = principalStress(Tm).s;
  return 1.1 / Math.max(1e-9, ...s.map(Math.abs));
};

export class StressRenderer extends BaseRenderer<StressConfig> {
  constructor(host: HTMLElement, cfg: StressConfig) {
    super(host, cfg);
    this.build();
  }

  setView(v: string) {
    if (v === 'alto') this.setCamera([0.001, 0.001, 5]);
    else if (v === 'normale') {
      const n = this.normal();
      this.setCamera(T.scalev(n, 5) as V3);
    } else this.setCamera([3.4, -2.9, 2.3]);
  }

  private normal(): T.Vec {
    const n = T.dirVec(this.cfg.dir[0], this.cfg.dir[1]);
    if (this.cfg.mode !== 'tetraedro') return n;
    // tetraedro: la faccia inclinata ha normale nel primo ottante
    const a = n.map((x) => Math.max(0.12, Math.abs(x))) as T.Vec;
    return T.unit(a);
  }

  private axes(len = 1.5) {
    const ax: [V3, string][] = [
      [[len, 0, 0], 'x₁'],
      [[0, len, 0], 'x₂'],
      [[0, 0, len], 'x₃'],
    ];
    for (const [v, n] of ax) {
      this.line([[0, 0, 0], v], 0x94a3b8);
      this.tag(n, T.scalev(v as T.Vec, 1.08) as V3, 'g');
    }
  }

  protected build() {
    const m = this.cfg.mode;
    if (m === 'taglio') this.buildCut();
    else if (m === 'tetraedro') this.buildTetra();
    else if (m === 'parallelepipedo') this.buildCube();
    else this.buildPrincipal();
  }

  private disk(n: T.Vec, r: number, color: number, opacity: number, at: T.Vec = [0, 0, 0]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(r, 64), this.mat(color, { opacity, side: THREE.DoubleSide }));
    d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), toThree(n as V3).normalize());
    d.position.copy(toThree(at as V3));
    this.dyn.add(d);
  }

  private buildCut() {
    this.axes();
    const n = this.normal();
    const k = scaleOf(this.cfg.T);
    const tr = traction(this.cfg.T, n);
    this.disk(n, 1.25, COL.plane, 0.16);
    this.tag('π (giacitura n̂)', T.scalev(T.unit(T.cross(n, [0.2, 0.3, 1])), 1.3) as V3, 'plane');
    this.arrow([0, 0, 0], T.scalev(n, 0.8) as V3, COL.axis, 0.02);
    this.tag('n̂', T.scalev(n, 0.88) as V3, 'axis-e');
    this.arrow([0, 0, 0], T.scalev(tr.t, k) as V3, COL.out, 0.032);
    this.tag('t<sub>n</sub>', T.scalev(tr.t, k * 1.08) as V3, 'out');
    this.arrow([0, 0, 0], T.scalev(n, tr.sigma * k) as V3, COL.e1, 0.024);
    this.tag('σ<sub>n</sub>', T.scalev(n, tr.sigma * k * 1.12 + (tr.sigma >= 0 ? 0.05 : -0.05)) as V3, 'c1');
    this.arrow([0, 0, 0], T.scalev(tr.tauV, k) as V3, COL.e2, 0.024);
    this.tag('τ<sub>n</sub>', T.scalev(tr.tauV, k * 1.12) as V3, 'c2');
    // completamento della scomposizione
    this.line([T.scalev(n, tr.sigma * k) as V3, T.scalev(tr.t, k) as V3], COL.ghost, true);
    this.line([T.scalev(tr.tauV, k) as V3, T.scalev(tr.t, k) as V3], COL.ghost, true);
  }

  private buildTetra() {
    this.axes(1.7);
    const n = this.normal();
    const k = 0.75 * scaleOf(this.cfg.T);
    // faccia inclinata: piano n·x = h, intercette h/n_i
    const h = 0.9 * Math.min(n[0], n[1], n[2]) * 1.6;
    const P: T.Vec[] = [0, 1, 2].map((i) => T.scalev(T.basis(i), h / n[i]));
    const O: T.Vec = [0, 0, 0];
    const tri = (a: T.Vec, b: T.Vec, c: T.Vec, color: number, op: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([a, b, c].flatMap((p) => toThree(p as V3).toArray()), 3));
      g.computeVertexNormals();
      this.dyn.add(new THREE.Mesh(g, this.mat(color, { opacity: op, side: THREE.DoubleSide })));
      this.line([a, b, c, a] as V3[], 0x475569);
    };
    tri(P[0], P[1], P[2], COL.plane, 0.28);
    tri(O, P[1], P[2], 0xfca5a5, 0.18);
    tri(O, P[0], P[2], 0x86efac, 0.18);
    tri(O, P[0], P[1], 0x93c5fd, 0.18);
    // vettori tensione sulle facce (baricentri)
    const gInc = T.scalev(T.addv(T.addv(P[0], P[1]), P[2]), 1 / 3);
    const tn = T.apply(this.cfg.T, n);
    this.arrow(gInc as V3, T.scalev(n, 0.45) as V3, COL.axis, 0.014);
    this.tag('n̂', T.addv(gInc, T.scalev(n, 0.5)) as V3, 'axis-e');
    this.arrow(gInc as V3, T.scalev(tn, k) as V3, COL.out, 0.026);
    this.tag('t<sub>n</sub>', T.addv(gInc, T.scalev(tn, k * 1.1)) as V3, 'out');
    const cols = [COL.e1, COL.e2, COL.e3];
    for (let i = 0; i < 3; i++) {
      const others = [0, 1, 2].filter((j) => j !== i);
      const gi = T.scalev(T.addv(P[others[0]], P[others[1]]), 1 / 3);
      const tm = T.scalev(T.apply(this.cfg.T, T.basis(i)), -1); // t_{−e_i} = −t_{e_i} (lemma di Cauchy)
      this.arrow(gi as V3, T.scalev(T.basis(i), -0.3) as V3, COL.ghost, 0.01);
      this.arrow(gi as V3, T.scalev(tm, k) as V3, cols[i], 0.02);
      this.tag(`t<sub>−e${i + 1}</sub>`, T.addv(gi, T.scalev(tm, k * 1.15)) as V3, `c${i + 1}`);
    }
  }

  private buildCube() {
    this.axes(1.7);
    const L = 1;
    const k = 0.55 * scaleOf(this.cfg.T);
    const Tm = this.cfg.T;
    const box = new THREE.BoxGeometry(L, L, L);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0x475569 }));
    this.dyn.add(edges);
    const m = new THREE.Mesh(box, this.mat(0x93c5fd, { opacity: 0.14, side: THREE.DoubleSide }));
    this.dyn.add(m);
    const cols = [COL.e1, COL.e2, COL.e3];
    // su ogni faccia ±ê_i: componenti di t_{±e_i} = ±T ê_i (normale e tangenziali)
    for (let i = 0; i < 3; i++)
      for (const sg of [1, -1]) {
        const c = T.scalev(T.basis(i), (sg * L) / 2);
        const t = T.scalev(T.apply(Tm, T.basis(i)), sg);
        for (let j = 0; j < 3; j++) {
          const comp = t[j];
          if (Math.abs(comp) < 1e-9) continue;
          const v = T.scalev(T.basis(j), comp * k);
          const from = j === i ? c : T.subv(c, T.scalev(v, 0.5));
          this.arrow(from as V3, v as V3, j === i ? 0x64748b : cols[(3 - i - j) % 3], j === i ? 0.012 : 0.02);
          if (sg === 1 && j !== i) this.tag(`τ<sub>${i + 1}${j + 1}</sub>`, T.addv(c, T.scalev(v, 0.62)) as V3, `c${((3 - i - j) % 3) + 1}`);
        }
      }
  }

  private buildPrincipal() {
    this.axes(1.6);
    const p = principalStress(this.cfg.T);
    const tm = tauMax(this.cfg.T);
    const cols = [COL.e1, COL.e2, COL.e3];
    p.n.forEach((d, i) => {
      this.line([T.scalev(d, -1.2) as V3, T.scalev(d, 1.2) as V3], cols[i]);
      this.arrow([0, 0, 0], T.scalev(d, 1.1) as V3, cols[i], 0.024);
      this.tag(`n̂${S(i + 1)} · s${S(i + 1)}`, T.scalev(d, 1.25) as V3, `c${i + 1}`);
    });
    this.disk(tm.m, 1.0, COL.tan, 0.18);
    this.arrow([0, 0, 0], T.scalev(tm.m, 0.8) as V3, COL.tan, 0.018);
    this.tag('m̂ (τ<sub>max</sub>)', T.scalev(tm.m, 0.95) as V3, 'tan');
    this.arrow([0, 0, 0], T.scalev(tm.nu, 0.8) as V3, COL.out, 0.018);
    this.tag('ν̂', T.scalev(tm.nu, 0.92) as V3, 'out');
  }
}
