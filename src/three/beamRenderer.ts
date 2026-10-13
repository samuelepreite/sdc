/**
 * Modello V6 (Cap. 5, §5.2–5.5): il solido di Saint-Venant. Sezione a scelta negli assi principali centrali,
 * deformata calcolata con i campi di spostamento della dispensa (engine/sezioni), colori di σ_z sulla superficie.
 * Modalità: «fibre» (ipotesi di Saint-Venant e vettore tensione sulla sezione, §5.2.2–5.2.3), «normale» (§5.4),
 * «flessione» (retta e deviata, con assi s, n, f sulla base di destra, §5.5.3–5.5.5), «anticlastica» (§5.5.3).
 * Orientamento come nelle figure della dispensa: z verso destra, y verso il basso, x verso chi guarda.
 */
import * as THREE from 'three';
import { BaseRenderer, type V3 } from './base';
import * as S from '../engine/sezioni';
import { COL } from './tensorRenderer';

export interface BeamConfig {
  mode: 'fibre' | 'normale' | 'flessione' | 'anticlastica';
  section: string;
  /** inclinazione di M sull'asse x, in gradi (flessione) */
  alpha: number;
  /** amplificazione degli spostamenti (1 = valore di riferimento) */
  amp: number;
}

const LW = 4; // lunghezza del solido nella scena
const NU = 0.3;

/** colore di σ_z: blu (compressione) – bianco – rosso (trazione) */
function heat(t: number): THREE.Color {
  const c = Math.max(-1, Math.min(1, t));
  const w = new THREE.Color(0xf8fafc);
  return c >= 0 ? w.lerp(new THREE.Color(0xdc2626), c) : w.lerp(new THREE.Color(0x2563eb), -c);
}

export class BeamRenderer extends BaseRenderer<BeamConfig> {
  constructor(host: HTMLElement, cfg: BeamConfig) {
    super(host, cfg);
    this.build();
  }

  setView(v: string) {
    if (v === 'lato') this.setCamera([0, -8.5, 0], [0, 0, 0]);
    else if (v === 'sezione') this.setCamera([LW / 2 + 4.2, 0, 0], [LW / 2, 0, 0]);
    else this.setCamera([3.2, -6.2, 2.6], [0, 0, 0]);
  }

  /** dati della sezione nel riferimento della scena */
  private sec() {
    const pr = S.principal(S.SEZIONI[this.cfg.section]?.poly ?? S.SEZIONI.rettangolo.poly);
    const D = Math.max(...pr.poly.map(([x, y]) => Math.hypot(x, y)));
    const sc = 0.62 / D;
    return { pr, D, sc, L: LW / sc };
  }

  /** carichi di riferimento (E = 1): deformazioni ben visibili, poi amplificate */
  private loads(pr: S.Principal, D: number, L: number): S.Loads {
    const m = this.cfg.mode;
    if (m === 'normale') return { N: 0.06 * pr.A, Mx: 0, My: 0 };
    if (m === 'fibre') return { N: 0, Mx: 0, My: 0 };
    const k = m === 'anticlastica' ? 0.9 / L : 0.45 / L; // curvatura di riferimento
    const a = m === 'anticlastica' ? 0 : (this.cfg.alpha * Math.PI) / 180;
    void D;
    return { N: 0, Mx: k * pr.Jx * Math.cos(a), My: k * pr.Jy * Math.sin(a) };
  }

  protected build() {
    const { pr, D, sc, L } = this.sec();
    const ld = this.loads(pr, D, L);
    const amp = this.cfg.mode === 'anticlastica' ? 6 * this.cfg.amp : this.cfg.amp;
    const disp = (p: [number, number, number]) => S.displacement(ld, pr, 1, NU, p);
    /** punto della scena (coordinate di three) del punto materiale (x, y, z), deformato */
    const W = (x: number, y: number, z: number, def = true) => {
      const d = def ? disp([x, y, z]) : [0, 0, 0];
      const X = x + amp * d[0],
        Y = y + amp * d[1],
        Z = z + amp * d[2];
      return new THREE.Vector3(Z * sc - LW / 2, -Y * sc, X * sc);
    };
    const V = (x: number, y: number, z: number, def = true): V3 => {
      const p = W(x, y, z, def);
      return [p.x, -p.z, p.y];
    };
    // contorno suddiviso
    const ring: S.Pt[] = [];
    pr.poly.forEach((p, i) => {
      const q = pr.poly[(i + 1) % pr.poly.length];
      const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (D / 8)));
      for (let k = 0; k < n; k++) ring.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
    });
    const smax = Math.max(1e-12, ...ring.map(([x, y]) => Math.abs(S.sigmaZ(ld, pr, x, y))));
    const col = (x: number, y: number) => (this.cfg.mode === 'fibre' ? new THREE.Color(0x93c5fd) : heat(S.sigmaZ(ld, pr, x, y) / smax));
    const opacity = this.cfg.mode === 'fibre' ? 0.22 : 0.92;

    // superficie laterale (mantello)
    const NZ = 40;
    const pos: number[] = [],
      cols: number[] = [],
      idx: number[] = [];
    for (let k = 0; k <= NZ; k++)
      for (const [x, y] of ring) {
        const p = W(x, y, (L * k) / NZ);
        pos.push(p.x, p.y, p.z);
        const c = col(x, y);
        cols.push(c.r, c.g, c.b);
      }
    const n = ring.length;
    for (let k = 0; k < NZ; k++)
      for (let i = 0; i < n; i++) {
        const a = k * n + i,
          b = k * n + ((i + 1) % n),
          c = (k + 1) * n + i,
          d = (k + 1) * n + ((i + 1) % n);
        idx.push(a, b, d, a, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 });
    this.dyn.add(new THREE.Mesh(g, this.safe ? new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: opacity < 1, opacity }) : mat));

    // basi (triangolazione del contorno; σ_z lineare: l'interpolazione dei colori è esatta)
    const tris = THREE.ShapeUtils.triangulateShape(
      ring.map(([x, y]) => new THREE.Vector2(x, y)),
      [],
    );
    for (const z of [0, L]) {
      const bp: number[] = [],
        bc: number[] = [];
      for (const [x, y] of ring) {
        const p = W(x, y, z);
        bp.push(p.x, p.y, p.z);
        const c = col(x, y);
        bc.push(c.r, c.g, c.b);
      }
      const bg = new THREE.BufferGeometry();
      bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
      bg.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
      bg.setIndex(tris.flat());
      bg.computeVertexNormals();
      this.dyn.add(new THREE.Mesh(bg, this.safe ? new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide, transparent: opacity < 1, opacity })));
      this.edgeLoop(ring, (x, y) => W(x, y, z), 0x334155);
    }
    // forma indeformata (fantasma)
    if (this.cfg.mode !== 'fibre') {
      for (const z of [0, L]) this.edgeLoop(ring, (x, y) => W(x, y, z, false), COL.ghost, true);
      this.line([V(0, 0, 0, false), V(0, 0, L, false)], COL.ghost, true);
    }
    // asse deformato
    this.line(
      Array.from({ length: 41 }, (_, k) => V(0, 0, (L * k) / 40)),
      0x0f172a,
    );
    this.axesTags(sc);

    const m = this.cfg.mode;
    if (m === 'fibre') this.buildFibre(pr, sc, L, W, V);
    if (m === 'normale') {
      const a = 0.7;
      this.arrow(V(0, 0, L), [a, 0, 0], COL.out, 0.03);
      this.arrow(V(0, 0, 0), [-a, 0, 0], COL.out, 0.03);
      this.tag('N', [V(0, 0, L)[0] + a + 0.12, 0, 0.1], 'out');
      this.tag('N', [V(0, 0, 0)[0] - a - 0.12, 0, 0.1], 'out');
    }
    if (m === 'flessione' || m === 'anticlastica') this.buildBending(pr, sc, L, ld, V);
    if (m === 'anticlastica') this.sectionGrid(pr, (x, y) => W(x, y, L), 0x0f172a);
  }

  private edgeLoop(ring: S.Pt[], f: (x: number, y: number) => THREE.Vector3, color: number, dashed = false) {
    const pts = [...ring, ring[0]].map(([x, y]) => f(x, y));
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const l = new THREE.Line(geo, dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.05, gapSize: 0.04 }) : new THREE.LineBasicMaterial({ color }));
    if (dashed) l.computeLineDistances();
    this.dyn.add(l);
  }

  private axesTags(sc: number) {
    const o: V3 = [-LW / 2 - 0.9, 0, 0];
    const len = 0.55;
    this.arrow(o, [len, 0, 0], 0x64748b, 0.012);
    this.tag('z', [o[0] + len + 0.1, 0, 0], 'g');
    this.arrow(o, [0, 0, -len], 0x64748b, 0.012);
    this.tag('y', [o[0], 0, -len - 0.1], 'g');
    this.arrow(o, [0, -len, 0], 0x64748b, 0.012);
    this.tag('x', [o[0], -len - 0.1, 0], 'g');
    void sc;
  }

  /** griglia deformata della sezione: righe x = cost e y = cost (mostra la sella anticlastica) */
  private sectionGrid(pr: S.Principal, f: (x: number, y: number) => THREE.Vector3, color: number) {
    const xs = pr.poly.map((p) => p[0]),
      ys = pr.poly.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    for (let i = 1; i < 8; i++) {
      for (const dir of [0, 1]) {
        const c = dir === 0 ? y0 + ((y1 - y0) * i) / 8 : x0 + ((x1 - x0) * i) / 8;
        let seg: THREE.Vector3[] = [];
        for (let k = 0; k <= 60; k++) {
          const t = k / 60;
          const x = dir === 0 ? x0 + (x1 - x0) * t : c;
          const y = dir === 0 ? c : y0 + (y1 - y0) * t;
          if (S.inside(pr.poly, [x, y])) seg.push(f(x, y));
          else if (seg.length) {
            if (seg.length > 1) this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color })));
            seg = [];
          }
        }
        if (seg.length > 1) this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(seg), new THREE.LineBasicMaterial({ color })));
      }
    }
  }

  private buildFibre(pr: S.Principal, sc: number, L: number, W: (x: number, y: number, z: number, d?: boolean) => THREE.Vector3, V: (x: number, y: number, z: number, d?: boolean) => V3) {
    const xs = pr.poly.map((p) => p[0]),
      ys = pr.poly.map((p) => p[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    for (let i = 0; i <= 6; i++)
      for (let j = 0; j <= 6; j++) {
        const x = x0 + ((x1 - x0) * (i + 0.5)) / 7.2,
          y = y0 + ((y1 - y0) * (j + 0.5)) / 7.2;
        if (!S.inside(pr.poly, [x, y])) continue;
        this.line([V(x, y, 0, false), V(x, y, L, false)], 0x64748b);
      }
    // sezione A_z a metà
    const zm = L / 2;
    const shape = new THREE.Shape(pr.poly.map(([x, y]) => new THREE.Vector2(x, y)));
    const sg = new THREE.ShapeGeometry(shape);
    const pa = sg.getAttribute('position');
    for (let k = 0; k < pa.count; k++) {
      const p = W(pa.getX(k), pa.getY(k), zm, false);
      pa.setXYZ(k, p.x, p.y, p.z);
    }
    sg.computeVertexNormals();
    this.dyn.add(new THREE.Mesh(sg, this.mat(COL.plane, { opacity: 0.55, side: THREE.DoubleSide })));
    this.tag('A<sub>z</sub>', V(x1, y1 * 1.15, zm, false), 'plane');
    // vettore tensione in un punto interno e in un punto del bordo (τ tangente al contorno)
    const k = 0.9;
    const pin: [number, number] = [0.25 * x0, 0.35 * y1];
    const o1 = V(pin[0], pin[1], zm, false);
    this.arrow(o1, [k, 0, 0], COL.e1, 0.02);
    this.tag('σ<sub>z</sub>', [o1[0] + k + 0.1, o1[1], o1[2]], 'c1');
    this.arrow(o1, [0, -0.25, -0.35], COL.e2, 0.016);
    this.tag('τ<sub>z</sub>', [o1[0], o1[1] - 0.3, o1[2] - 0.42], 'c2');
    // bordo: un punto su un lato, τ lungo il lato
    const p1 = pr.poly[0],
      p2 = pr.poly[1];
    const mid: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    const t = [p2[0] - p1[0], p2[1] - p1[1]];
    const tl = Math.hypot(t[0], t[1]);
    const ob = V(mid[0], mid[1], zm, false);
    const dt = 0.45 / tl;
    this.arrow(ob, [0, -t[0] * dt, -t[1] * dt], COL.tan, 0.016);
    this.tag('sul bordo τ<sub>z</sub> è tangente', [ob[0] + 0.5, ob[1] - t[0] * dt, ob[2] + 0.28], 'tan');
    void sc;
  }

  private buildBending(pr: S.Principal, sc: number, L: number, ld: S.Loads, V: (x: number, y: number, z: number, d?: boolean) => V3) {
    const a = this.cfg.mode === 'anticlastica' ? 0 : (this.cfg.alpha * Math.PI) / 180;
    const ang = S.bendingAngles(a, pr.rx2, pr.ry2);
    const R = Math.max(...pr.poly.map(([x, y]) => Math.hypot(x, y))) * 1.25;
    const lineAt = (th: number, color: number, lab: string, cls: string) => {
      const c = Math.cos(th),
        s = Math.sin(th);
      this.line([V(-R * c, -R * s, L), V(R * c, R * s, L)], color, true);
      this.tag(lab, V(R * 1.08 * c, R * 1.08 * s, L), cls);
    };
    lineAt(ang.beta, COL.e3, 'n', 'c3');
    if (this.cfg.mode === 'flessione') {
      lineAt(ang.gamma, 0xc026d3, 's', 'u');
      lineAt(ang.theta, COL.e2, 'f', 'c2');
      // vettore momento sulla base di destra (doppia freccia)
      const m = 0.75;
      const o = V(0, 0, L);
      const d = V(Math.cos(a) * 1, Math.sin(a) * 1, L, false);
      const o0 = V(0, 0, L, false);
      const dir: V3 = [d[0] - o0[0], d[1] - o0[1], d[2] - o0[2]];
      const nn = Math.hypot(...dir) || 1;
      const u: V3 = [(dir[0] / nn) * m, (dir[1] / nn) * m, (dir[2] / nn) * m];
      this.arrow(o, u, COL.out, 0.024);
      this.arrow(o, [u[0] * 0.8, u[1] * 0.8, u[2] * 0.8], COL.out, 0.024);
      this.tag('M', [o[0] + u[0] * 1.15 + 0.25, o[1] + u[1] * 1.15, o[2] + u[2] * 1.15 + 0.2], 'out');
    }
    void sc;
    void ld;
  }
}
