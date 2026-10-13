/**
 * Modello V6 (Cap. 5) in React: solido di Saint-Venant con sezione a scelta, inclinazione del momento e
 * amplificazione; numeri dal motore (proprietà della sezione, tensioni estreme, angoli della flessione deviata,
 * rigidezze) su un esempio in acciaio con valori dichiarati.
 */
import { useEffect, useMemo, useState } from 'react';
import type { BeamScene } from '../content/types';
import { fmt } from '../engine/tensor';
import * as S from '../engine/sezioni';
import { Tex } from '../ui/components/Tex';
import { BeamRenderer, type BeamConfig } from './beamRenderer';
import { Chips, Range, Stage } from './Stage';

const MODE_LABEL = {
  fibre: 'Ipotesi di Saint-Venant: comportamento a fibre (§5.2.2)',
  normale: 'Sforzo normale (§5.4)',
  flessione: 'Flessione semplice, retta e deviata (§5.5)',
  anticlastica: 'Deformazione anticlastica della sezione (§5.5.3)',
};

function configOf(s: BeamScene): BeamConfig {
  return { mode: s.mode, section: s.section ?? s.sections?.[0] ?? 'rettangolo', alpha: s.alpha ?? 0, amp: s.amp ?? 1 };
}

export function Trave3D({ scene, height = 440 }: { scene: BeamScene; height?: number }) {
  const base = useMemo(() => configOf(scene), [scene]);
  const [cfg, setCfg] = useState<BeamConfig>(base);
  const [view, setView] = useState<string>(scene.view ?? (scene.mode === 'anticlastica' ? 'sezione' : 'prospettiva'));
  useEffect(() => setCfg(base), [base]);
  const set = <K extends keyof BeamConfig>(k: K, v: BeamConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const show = new Set(scene.controls ?? []);
  const keys = scene.sections ?? Object.keys(S.SEZIONI);
  return (
    <div className="p3 lab3d" data-mode={cfg.mode}>
      <Stage
        make={(h, c: BeamConfig) => new BeamRenderer(h, c)}
        cfg={cfg}
        chip={MODE_LABEL[cfg.mode]}
        views={[
          { id: 'prospettiva', label: 'prospettiva' },
          { id: 'lato', label: 'di lato' },
          { id: 'sezione', label: 'dalla base di destra' },
        ]}
        view={view}
        onView={setView}
        height={height}
      />
      <div className="p3-controls">
        {show.has('section') && <Chips label="Sezione" items={keys.map((k) => ({ id: k, label: S.SEZIONI[k].label }))} value={cfg.section} onChange={(k) => set('section', k)} />}
        <div className="p3-sliders">
          {show.has('alpha') && <Range id="bm-alpha" label="α (inclinazione di M su x)" unit="°" min={-180} max={180} step={1} value={cfg.alpha} onChange={(v) => set('alpha', v)} />}
          {show.has('amp') && <Range id="bm-amp" label="amplificazione" unit="×" min={0} max={3} step={0.1} value={cfg.amp} onChange={(v) => set('amp', v)} />}
        </div>
        <p className="small muted">
          {S.SEZIONI[cfg.section].note} Colori: rosso trazione, blu compressione (σ<sub>z</sub>). Spostamenti amplificati; tratteggio grigio = forma iniziale. Nei disegni della sezione x va verso sinistra e y verso il basso, come nelle figure della dispensa.
        </p>
        <BeamNumbers cfg={cfg} />
      </div>
    </div>
  );
}

/** esempio numerico: acciaio E = 21 000 kN/cm², ν = 0,3, L = 400 cm; N = 500 kN, M = 100 kN·m (valori di esempio) */
function BeamNumbers({ cfg }: { cfg: BeamConfig }) {
  const pr = S.principal(S.SEZIONI[cfg.section].poly);
  const E = 21000,
    L = 400,
    nu = 0.3;
  const rows: [string, string][] = [
    ['A', `${fmt(pr.A, 4)} cm²`],
    ['J_x\\ (\\max),\\ J_y', `${fmt(pr.Jx, 5)} ; ${fmt(pr.Jy, 5)} cm⁴`],
    ['\\rho_x,\\ \\rho_y', `${fmt(Math.sqrt(pr.rx2), 4)} ; ${fmt(Math.sqrt(pr.ry2), 4)} cm`],
  ];
  if (cfg.mode === 'normale') {
    const N = 500;
    const dL = (N * L) / (E * pr.A);
    rows.push(['\\sigma_z=N/A', `${fmt((N / pr.A) * 10, 4)} MPa`]);
    rows.push(['\\Delta L=NL/(EA)', `${fmt(dL * 10, 4)} mm`]);
    rows.push(['\\Phi=\\tfrac12N\\Delta L', `${fmt(0.5 * N * dL, 4)} kN·cm`]);
  }
  if (cfg.mode === 'flessione' || cfg.mode === 'anticlastica') {
    const M = 10000; // kN·cm
    const a = cfg.mode === 'anticlastica' ? 0 : (cfg.alpha * Math.PI) / 180;
    const ld = { N: 0, Mx: M * Math.cos(a), My: M * Math.sin(a) };
    const sv = pr.poly.map(([x, y]) => S.sigmaZ(ld, pr, x, y) * 10);
    const g = S.bendingAngles(a, pr.rx2, pr.ry2);
    const deg = (x: number) => `${fmt((x * 180) / Math.PI, 4)}°`;
    rows.push(['M_x,\\ M_y', `${fmt(ld.Mx / 100, 4)} ; ${fmt(ld.My / 100, 4)} kN·m`]);
    rows.push(['\\sigma_{z,\\max},\\ \\sigma_{z,\\min}', `${fmt(Math.max(...sv), 4)} ; ${fmt(Math.min(...sv), 4)} MPa`]);
    if (cfg.mode === 'flessione') {
      rows.push(['\\beta\\ (n),\\ \\gamma\\ (s)', `${deg(g.beta)} ; ${deg(g.gamma)}`]);
      rows.push(['\\theta\\ (f),\\ \\delta', `${deg(g.theta)} ; ${deg(g.delta)}`]);
      rows.push(['\\tan\\beta\\tan\\gamma\\ \\text{vs}\\ -\\rho_x^2/\\rho_y^2', Math.abs(Math.cos(a)) < 1e-9 || Math.abs(Math.sin(a)) < 1e-9 ? 'retta: n e s sugli APCdI' : `${fmt(Math.tan(g.beta) * Math.tan(g.gamma), 5)} ; ${fmt(-pr.rx2 / pr.ry2, 5)}`]);
    } else {
      const r = (E * pr.Jx) / M;
      rows.push(['r=EJ_x/M_x,\\ |\\rho\'|=r/\\nu', `${fmt(r / 100, 4)} m ; ${fmt(r / nu / 100, 4)} m`]);
      rows.push(['\\Delta\\varphi=M_xL/(EJ_x)', `${fmt(((M * L) / (E * pr.Jx)) * 1000, 4)} mrad`]);
    }
  }
  return (
    <div className="lab-numbers">
      <table className="readout">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>
                <Tex tex={k} />
              </td>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {cfg.mode !== 'fibre' && <p className="small muted">Esempio numerico (valori non della dispensa): acciaio E = 210 000 MPa, ν = 0,3, L = 4 m{cfg.mode === 'normale' ? ', N = 500 kN' : ', |M| = 100 kN·m'}.</p>}
    </div>
  );
}
