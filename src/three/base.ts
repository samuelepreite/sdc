/**
 * Base comune dei modelli 3D (impianto collaudato in SEIMAFI, «lezione imparata a caro prezzo»):
 *  - luci sempre presenti (emisferica + ambiente + 3 direzionali), metallicità ≤ 0,5 e un leggero emissivo;
 *    la mappa d'ambiente (PMREM) è solo un tocco in più, dentro try/catch;
 *  - se uno shader PBR non compila, `renderer.debug.onShaderError` passa a materiali semplici (MeshLambert);
 *    lo studente può forzarlo con «non vedi il modello?» (scelta ricordata);
 *  - renderer creato una volta, configurazione passata con `setConfig`, `dispose` alla chiusura;
 *  - nessuna animazione automatica: si rispetta «riduci movimento» (la scena si ridisegna solo quando serve).
 * Convenzione: le coordinate della dispensa (x, y, z), con z verso l'alto, diventano quelle di three.js
 * (X, Y, Z) = (x, z, −y), che è una rotazione propria (det = +1): la terna resta destrorsa.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type V3 = [number, number, number];
export const toThree = (v: V3) => new THREE.Vector3(v[0], v[2], -v[1]);

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch {
    return false;
  }
}

export function toLambert(m: THREE.MeshStandardMaterial): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color: m.color.clone().multiplyScalar(1.1),
    emissive: m.emissive.clone().addScalar(0.06),
    transparent: m.transparent,
    opacity: m.opacity,
    side: m.side,
    depthWrite: m.depthWrite,
  });
}

export function label(html: string, cls = '') {
  const el = document.createElement('div');
  el.className = `p3-label ${cls}`;
  el.innerHTML = html;
  return new CSS2DObject(el);
}

export abstract class BaseRenderer<C> {
  protected renderer: THREE.WebGLRenderer;
  protected labels: CSS2DRenderer;
  protected scene = new THREE.Scene();
  protected camera: THREE.PerspectiveCamera;
  protected controls: OrbitControls;
  protected safe = false;
  protected cfg: C;
  private raf = 0;
  private disposed = false;
  private dirty = true;
  /** gruppo ricostruito a ogni cambio di configurazione */
  protected dyn = new THREE.Group();

  constructor(
    protected host: HTMLElement,
    cfg: C,
  ) {
    this.cfg = cfg;
    const w = host.clientWidth || 640;
    const h = host.clientHeight || 480;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    host.appendChild(this.renderer.domElement);
    this.labels = new CSS2DRenderer();
    this.labels.setSize(w, h);
    this.labels.domElement.className = 'p3-labels';
    host.appendChild(this.labels.domElement);

    this.camera = new THREE.PerspectiveCamera(36, w / h, 0.05, 80);
    this.controls = new OrbitControls(this.camera, this.labels.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 20;
    this.controls.addEventListener('change', () => (this.dirty = true));

    this.scene.add(new THREE.HemisphereLight(0xe6eeff, 0x40382c, 0.9));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4);
    const fill = new THREE.DirectionalLight(0xc9dcff, 0.7);
    fill.position.set(-4, 2, -2);
    const back = new THREE.DirectionalLight(0xffffff, 0.5);
    back.position.set(0, -3, -3);
    this.scene.add(key, fill, back);
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      this.scene.environmentIntensity = 0.4;
      pmrem.dispose();
    } catch {
      this.scene.environment = null;
    }
    this.renderer.debug.onShaderError = () => {
      if (!this.safe) this.forceSafe();
    };
    this.scene.add(this.dyn);
    this.loop();
  }

  /** materiale standard a bassa metallicità, oppure il suo equivalente semplice */
  protected mat(color: number, opts: { opacity?: number; emissive?: number; side?: THREE.Side } = {}): THREE.Material {
    const m = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.1,
      roughness: 0.55,
      emissive: opts.emissive ?? new THREE.Color(color).multiplyScalar(0.12).getHex(),
      transparent: opts.opacity !== undefined && opts.opacity < 1,
      opacity: opts.opacity ?? 1,
      side: opts.side ?? THREE.FrontSide,
      depthWrite: opts.opacity === undefined || opts.opacity >= 1,
    });
    return this.safe ? toLambert(m) : m;
  }

  forceSafe() {
    this.safe = true;
    this.scene.environment = null;
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
        const old = mesh.material as THREE.MeshStandardMaterial;
        mesh.material = toLambert(old);
        old.dispose();
      }
    });
    this.dirty = true;
  }

  get isSafe() {
    return this.safe;
  }

  /** freccia solida da `from` a `from + v` (coordinate della dispensa) */
  protected arrow(from: V3, v: V3, color: number, radius = 0.025, parent: THREE.Object3D = this.dyn) {
    const a = toThree(from);
    const d = toThree(v);
    const len = d.length();
    const g = new THREE.Group();
    if (len < 1e-6) return g;
    const head = Math.min(0.18, len * 0.35);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len - head, 16), this.mat(color));
    shaft.position.y = (len - head) / 2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(radius * 3, head, 20), this.mat(color));
    cone.position.y = len - head / 2;
    g.add(shaft, cone);
    g.position.copy(a);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    parent.add(g);
    return g;
  }

  /** linea (eventualmente tratteggiata) per una sequenza di punti */
  protected line(points: V3[], color: number, dashed = false, parent: THREE.Object3D = this.dyn) {
    const geo = new THREE.BufferGeometry().setFromPoints(points.map(toThree));
    const m = dashed ? new THREE.LineDashedMaterial({ color, dashSize: 0.06, gapSize: 0.05 }) : new THREE.LineBasicMaterial({ color });
    const l = new THREE.Line(geo, m);
    if (dashed) l.computeLineDistances();
    parent.add(l);
    return l;
  }

  protected tag(html: string, at: V3, cls = '', parent: THREE.Object3D = this.dyn) {
    const l = label(html, cls);
    l.position.copy(toThree(at));
    parent.add(l);
    return l;
  }

  /** svuota il gruppo dinamico liberando geometrie, materiali ed etichette */
  protected clearDyn() {
    this.dyn.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
      if (o instanceof CSS2DObject) o.element.remove();
    });
    this.dyn.clear();
  }

  setConfig(c: Partial<C>) {
    this.cfg = { ...this.cfg, ...c };
    this.clearDyn();
    this.build();
    this.dirty = true;
  }

  protected abstract build(): void;

  setCamera(pos: V3, target: V3 = [0, 0, 0]) {
    this.camera.position.copy(toThree(pos));
    this.controls.target.copy(toThree(target));
    this.controls.update();
    this.dirty = true;
  }

  resize() {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.labels.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);
    this.controls.update();
    if (!this.dirty) return;
    this.dirty = false;
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  };

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.controls.dispose();
    this.clearDyn();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.labels.domElement.remove();
  }
}
