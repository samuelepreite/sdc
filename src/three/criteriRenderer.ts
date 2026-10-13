/**
 * Modello V8 (Cap. 6): i criteri nello spazio delle tensioni principali (s1, s2, s3), adimensionali con σ_L.
 * Superfici limite: von Mises (cilindro di raggio √(2/3) σ_L attorno all'asse idrostatico), Tresca (prisma esagonale
 * inscritto), Beltrami (ellissoide), Galileo (cubo); asse idrostatico e punto di lavoro (Huber: punto sull'asse).
 * La dispensa presenta questa rappresentazione come aiuto alla comprensione, utile ma non indispensabile (§6.4.4).
 */
import * as THREE from 'three';
import { BaseRenderer, toThree, type V3 } from './base';
import * as C from '../engine/criteri';
import { COL } from './tensorRenderer';

export interface CriteriConfig {
  show: ('vonMises' | 'tresca' | 'beltrami' | 'galileo')[];
  /** punto di lavoro (tensioni principali / σ_L) */
  s: [number, number, number];
  nu: number;
}

const SC = 1.1; // σ_L nella scena

export class CriteriRenderer extends BaseRenderer<CriteriConfig> {
  constructor(host: HTMLElement, cfg: CriteriConfig) {
    super(host, cfg);
    this.build();
  }

  setView(v: string) {
    if (v === 'asse') this.setCamera([4, 4, 4]);
    else this.setCamera([4.6, -3.2, 2.4]);
  }

  /** orienta un oggetto con l'asse y lungo l'asse idrostatico (coordinate di three) */
  private alongAxis(o: THREE.Object3D) {
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), toThree([1, 1, 1]).normalize());
  }

  protected build() {
    const sh = new Set(this.cfg.show);
    // assi
    const L = 2.2;
    const names = ['s₁', 's₂', 's₃'];
    for (let i = 0; i < 3; i++) {
      const e: V3 = [0, 0, 0];
      e[i] = L;
      const m: V3 = [0, 0, 0];
      m[i] = -L;
      this.line([m, e], 0x94a3b8);
      this.tag(names[i], [e[0] * 1.06, e[1] * 1.06, e[2] * 1.06], 'g');
    }
    // asse idrostatico
    this.line([[-2, -2, -2], [2, 2, 2]], COL.axis, true);
    this.tag('asse idrostatico s₁ = s₂ = s₃', [1.9, 1.9, 2.05], 'axis-e');
    const len = 7;
    if (sh.has('vonMises')) {
      const r = Math.sqrt(2 / 3) * SC;
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 64, 1, true), this.mat(COL.e3, { opacity: 0.22, side: THREE.DoubleSide }));
      this.alongAxis(cyl);
      this.dyn.add(cyl);
      this.tag('von Mises', [-0.2, 1.2, -0.9], 'c3');
    }
    if (sh.has('tresca')) {
      // esagono: vertici nelle proiezioni deviatoriche delle direzioni (1,0,−1)/… a distanza √(2/3) σ_L
      const r = Math.sqrt(2 / 3) * SC;
      const geo = new THREE.CylinderGeometry(r, r, len, 6, 1, true);
      const m = new THREE.Mesh(geo, this.mat(COL.e1, { opacity: 0.2, side: THREE.DoubleSide }));
      // orienta un vertice lungo la proiezione di ê1 sul piano deviatorico
      this.alongAxis(m);
      const dev1 = toThree([2 / 3, -1 / 3, -1 / 3]).normalize();
      const local = new THREE.Vector3(0, 0, 1).applyQuaternion(m.quaternion);
      const ang = Math.atan2(new THREE.Vector3().crossVectors(local, dev1).dot(toThree([1, 1, 1]).normalize()), local.dot(dev1));
      m.rotateY(ang);
      this.dyn.add(m);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: COL.e1 }));
      edges.quaternion.copy(m.quaternion);
      this.dyn.add(edges);
      this.tag('Tresca', [1.0, -0.8, 0.6], 'c1');
    }
    if (sh.has('beltrami')) {
      const nu = this.cfg.nu;
      const aAx = SC / Math.sqrt(1 - 2 * nu);
      const aPerp = SC / Math.sqrt(1 + nu);
      const g = new THREE.SphereGeometry(1, 48, 32);
      const m = new THREE.Mesh(g, this.mat(COL.e2, { opacity: 0.22, side: THREE.DoubleSide }));
      m.scale.set(aPerp, aAx, aPerp);
      this.alongAxis(m);
      this.dyn.add(m);
      this.tag('Beltrami', [0.9, 0.9, 1.6], 'c2');
    }
    if (sh.has('galileo')) {
      const b = new THREE.BoxGeometry(2 * SC, 2 * SC, 2 * SC);
      this.dyn.add(new THREE.LineSegments(new THREE.EdgesGeometry(b), new THREE.LineBasicMaterial({ color: 0x64748b })));
      this.tag('Galileo', [SC, -SC, SC + 0.1], 'g');
    }
    // punto di lavoro e sua proiezione sull'asse
    const s = this.cfg.s.map((x) => x * SC) as V3;
    const m = (s[0] + s[1] + s[2]) / 3;
    const pt = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), this.mat(COL.out));
    pt.position.copy(toThree(s));
    this.dyn.add(pt);
    this.line([[m, m, m], s], COL.out, true);
    const sv = C.sortS(this.cfg.s);
    this.tag(`P · σ<sub>m</sub> = ${((sv[0] + sv[1] + sv[2]) / 3).toFixed(2).replace('.', ',')} σ<sub>L</sub>`, [s[0] + 0.35, s[1] - 0.2, s[2] + 0.25], 'out');
  }
}
