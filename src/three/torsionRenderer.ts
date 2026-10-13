/**
 * Modello V7 (Cap. 5, §5.8): la torsione. «clebsch»: le sezioni ruotano di θ(z) = γz (le fibre diventano eliche) e si
 * ingobbano tutte allo stesso modo, w = γφ(x, y) (Def 5.8.2), con φ calcolato dal motore; «prandtl»: il grafico della
 * funzione di Prandtl F (Teo 5.8.5) sopra la sezione, con le curve di livello (linee di tensione). Orientamento come
 * nel modello V6: z verso destra, y verso il basso, x verso chi guarda.
 */
import * as THREE from 'three';
import { BaseRenderer, type V3 } from './base';
import * as Tor from '../engine/torsione';
import { principal } from '../engine/sezioni';
import { COL } from './tensorRenderer';

export interface TorsionConfig {
  mode: 'clebsch' | 'prandtl';
  section: string;
  /** rotazione totale della base di destra, in gradi (amplificata) */
  twist: number;
  /** amplificazione dell'ingobbamento */
  warp: number;
}

const LW = 4;

function heat(t: number) {
  const c = Math.max(0, Math.min(1, t));
  return new THREE.Color(0xf8fafc).lerp(new THREE.Color(0xdc2626), c);
}

export class TorsionRenderer extends BaseRenderer<TorsionConfig> {
  private cache = new Map<string, { g: Tor.PrandtlGrid; phi: Float64Array }>();
  constructor(host: HTMLElement, cfg: TorsionConfig) {
    super(host, cfg);
    this.build();
  }

  setView(v: string) {
    if (this.cfg.mode === 'prandtl') {
      if (v === 'sezione') this.setCamera([0, 0.001, 5.5]);
      else this.setCamera([3.4, -3.6, 3.2]);
      return;
    }
    if (v === 'lato') this.setCamera([0, -8.5, 0]);
    else if (v === 'sezione') this.setCamera([LW / 2 + 4.2, 0, 0], [LW / 2, 0, 0]);
    else this.setCamera([3.2, -6.2, 2.6]);
  }

  private grid() {
    const key = this.cfg.section;
    let c = this.cache.get(key);
    if (!c) {
      const g = Tor.prandtl((Tor.SEZ_TORSIONE[key] ?? Tor.SEZ_TORSIONE.quadrato).poly, 44);
      c = { g, phi: Tor.warping(g) };
      this.cache.set(key, c);
    }
    return c;
  }

  protected build() {
    if (this.cfg.mode === 'prandtl') this.buildPrandtl();
    else this.buildClebsch();
  }

  private bil(g: Tor.PrandtlGrid, f: Float64Array, x: number, y: number) {
    const u = (x - g.x0) / g.h,
      v = (y - g.y0) / g.h;
    const i = Math.max(0, Math.min(g.nx - 2, Math.floor(u))),
      j = Math.max(0, Math.min(g.ny - 2, Math.floor(v)));
    const a = u - i,
      b = v - j;
    const q = (ii: number, jj: number) => f[jj * g.nx + ii];
    return (1 - a) * (1 - b) * q(i, j) + a * (1 - b) * q(i + 1, j) + (1 - a) * b * q(i, j + 1) + a * b * q(i + 1, j + 1);
  }

  private buildClebsch() {
    const { g, phi } = this.grid();
    const pr = principal((Tor.SEZ_TORSIONE[this.cfg.section] ?? Tor.SEZ_TORSIONE.quadrato).poly);
    const D = Math.max(...pr.poly.map(([x, y]) => Math.hypot(x, y)));
    const sc = 0.7 / D;
    const L = LW / sc;
    const th = (this.cfg.twist * Math.PI) / 180;
    const gam = th / L;
    const phMax = Math.max(1e-12, ...Array.from(phi).map(Math.abs));
    const wAmp = (this.cfg.warp * 0.25 * D) / phMax; // ingobbamento massimo disegnato = 25% del raggio × amplificazione
    /** punto deformato (rotazione finita per il disegno; la dispensa linearizza: u = −γyz, v = γxz) */
    const W = (x: number, y: number, z: number) => {
      const a = gam * z;
      const X = x * Math.cos(a) - y * Math.sin(a),
        Y = x * Math.sin(a) + y * Math.cos(a);
      const Z = z + wAmp * this.bil(g, phi, x, y);
      return new THREE.Vector3(Z * sc - LW / 2, -Y * sc, X * sc);
    };
    const V = (p: THREE.Vector3): V3 => [p.x, -p.z, p.y];
    const ring: [number, number][] = [];
    pr.poly.forEach((p, i) => {
      const q = pr.poly[(i + 1) % pr.poly.length];
      const n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / (D / 10)));
      for (let k = 0; k < n; k++) ring.push([p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]);
    });
    // |τ| sul contorno (dal motore), per i colori del mantello
    const tb = ring.map(([x, y]) => {
      const s = 0.985;
      return Math.hypot(...Tor.tauAt(g, 1, x * s, y * s));
    });
    const tmax = Math.max(1e-12, ...tb);
    const NZ = 48;
    const pos: number[] = [],
      cols: number[] = [],
      idx: number[] = [];
    for (let k = 0; k <= NZ; k++)
      ring.forEach(([x, y], i) => {
        const p = W(x, y, (L * k) / NZ);
        pos.push(p.x, p.y, p.z);
        const c = heat(tb[i] / tmax);
        cols.push(c.r, c.g, c.b);
      });
    const n = ring.length;
    for (let k = 0; k < NZ; k++)
      for (let i = 0; i < n; i++) {
        const a = k * n + i,
          b = k * n + ((i + 1) % n),
          c = (k + 1) * n + i,
          d = (k + 1) * n + ((i + 1) % n);
        idx.push(a, b, d, a, d, c);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.dyn.add(new THREE.Mesh(geo, this.safe ? new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false })));
    // fibre del mantello → eliche
    for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 16))) {
      const [x, y] = ring[i];
      this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 61 }, (_, k) => W(x, y, (L * k) / 60))), new THREE.LineBasicMaterial({ color: 0x1e3a8a })));
    }
    // basi: contorno e griglia ingobbata
    for (const z of [0, L]) {
      this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([...ring, ring[0]].map(([x, y]) => W(x, y, z))), new THREE.LineBasicMaterial({ color: 0x334155 })));
      const xs = pr.poly.map((p) => p[0]),
        ys = pr.poly.map((p) => p[1]);
      const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
      for (let t = 1; t < 8; t++)
        for (const dir of [0, 1]) {
          const pts: THREE.Vector3[] = [];
          const flush = () => {
            if (pts.length > 1) this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([...pts]), new THREE.LineBasicMaterial({ color: COL.e3 })));
            pts.length = 0;
          };
          for (let s = 0; s <= 40; s++) {
            const x = dir === 0 ? x0 + ((x1 - x0) * s) / 40 : x0 + ((x1 - x0) * t) / 8;
            const y = dir === 0 ? y0 + ((y1 - y0) * t) / 8 : y0 + ((y1 - y0) * s) / 40;
            const k = Math.round((y - g.y0) / g.h) * g.nx + Math.round((x - g.x0) / g.h);
            if (g.mask[k]) pts.push(W(x, y, z));
            else flush();
          }
          flush();
        }
    }
    // asse e coppie
    this.line([V(W(0, 0, 0)), V(W(0, 0, L))], 0x0f172a, true);
    const e = 0.8;
    this.arrow(V(W(0, 0, L)), [e, 0, 0], COL.out, 0.024);
    this.arrow(V(W(0, 0, L)), [e * 0.8, 0, 0], COL.out, 0.024);
    this.tag('M<sub>z</sub>', [V(W(0, 0, L))[0] + e + 0.15, 0, 0.12], 'out');
    this.arrow(V(W(0, 0, 0)), [-e, 0, 0], COL.out, 0.024);
    this.arrow(V(W(0, 0, 0)), [-e * 0.8, 0, 0], COL.out, 0.024);
    this.tag('θ(z) = γz', V(W(0, -D * 1.25, L * 0.75)), 'c3');
  }

  private buildPrandtl() {
    const { g } = this.grid();
    const W = (g.nx - 1) * g.h,
      H = (g.ny - 1) * g.h;
    const sc = 3 / Math.max(W, H);
    const fmin = Math.min(...Array.from(g.F));
    const hs = 1.2 / Math.abs(fmin);
    const xm = g.x0 + W / 2,
      ym = g.y0 + H / 2;
    /** punto della superficie: sezione nel piano orizzontale (x verso chi guarda, y verso il basso dello schermo → in profondità), quota −F */
    const P = (i: number, j: number) => {
      const x = g.x0 + i * g.h,
        y = g.y0 + j * g.h;
      const f = g.F[j * g.nx + i];
      return new THREE.Vector3(-(x - xm) * sc, -f * hs, (y - ym) * sc);
    };
    const pos: number[] = [],
      cols: number[] = [],
      idx: number[] = [];
    let gm = 1e-12;
    const grad = (i: number, j: number) => {
      const f = (ii: number, jj: number) => (ii < 0 || jj < 0 || ii >= g.nx || jj >= g.ny ? 0 : g.F[jj * g.nx + ii]);
      return Math.hypot(f(i + 1, j) - f(i - 1, j), f(i, j + 1) - f(i, j - 1)) / (2 * g.h);
    };
    for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) gm = Math.max(gm, g.mask[j * g.nx + i] ? grad(i, j) : 0);
    for (let j = 0; j < g.ny; j++)
      for (let i = 0; i < g.nx; i++) {
        const p = P(i, j);
        pos.push(p.x, p.y, p.z);
        const c = heat(grad(i, j) / gm);
        cols.push(c.r, c.g, c.b);
      }
    for (let j = 0; j < g.ny - 1; j++)
      for (let i = 0; i < g.nx - 1; i++) {
        const a = j * g.nx + i,
          b = a + 1,
          c = a + g.nx,
          d = c + 1;
        if (!(g.mask[a] || g.mask[b] || g.mask[c] || g.mask[d])) continue;
        idx.push(a, b, d, a, d, c);
      }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    this.dyn.add(new THREE.Mesh(geo, this.safe ? new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide })));
    // curve di livello sulla superficie
    for (const f of [0.2, 0.4, 0.6, 0.8]) {
      const c = f * fmin;
      for (const [a, b, cc, d] of Tor.contours(g, c)) {
        const p1 = new THREE.Vector3(-(a - xm) * sc, -c * hs + 0.005, (b - ym) * sc);
        const p2 = new THREE.Vector3(-(cc - xm) * sc, -c * hs + 0.005, (d - ym) * sc);
        this.dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p1, p2]), new THREE.LineBasicMaterial({ color: COL.e3 })));
      }
    }
    this.tag('−F (F = 0 sul contorno)', [0, 0, 1.4], 'c3');
    this.arrow([0, 0, 0.02], [-1.7, 0, 0], 0x64748b, 0.01);
    this.tag('x', [-1.85, 0, 0.05], 'g');
    this.arrow([0, 0, 0.02], [0, -1.7, 0], 0x64748b, 0.01);
    this.tag('y', [0, -1.85, 0.05], 'g');
  }
}
