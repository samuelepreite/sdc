/**
 * Modello V7 (Cap. 5, §5.8) in React: congettura di Clebsch (rotazione e ingobbamento) e funzione di Prandtl, per una
 * sezione a scelta; numeri dal motore (fattore di torsione q, ∫(−2F), J₀).
 */
import { useEffect, useMemo, useState } from 'react';
import type { TorsionScene } from '../content/types';
import { fmt } from '../engine/tensor';
import * as Tor from '../engine/torsione';
import { Tex } from '../ui/components/Tex';
import { TorsionRenderer, type TorsionConfig } from './torsionRenderer';
import { Chips, Range, Stage } from './Stage';

const MODE_LABEL = { clebsch: 'Congettura di Clebsch: rotazione e ingobbamento (§5.8.1)', prandtl: 'Funzione di Prandtl F sulla sezione (§5.8.3)' };

function configOf(s: TorsionScene): TorsionConfig {
  return { mode: s.mode, section: s.section ?? s.sections?.[0] ?? 'quadrato', twist: s.twist ?? 60, warp: s.warp ?? 1 };
}

export function Torsione3D({ scene, height = 440 }: { scene: TorsionScene; height?: number }) {
  const base = useMemo(() => configOf(scene), [scene]);
  const [cfg, setCfg] = useState<TorsionConfig>(base);
  const [view, setView] = useState<string>(scene.view ?? 'prospettiva');
  useEffect(() => setCfg(base), [base]);
  const set = <K extends keyof TorsionConfig>(k: K, v: TorsionConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const show = new Set(scene.controls ?? []);
  const keys = scene.sections ?? Object.keys(Tor.SEZ_TORSIONE);
  const g = useMemo(() => Tor.prandtl(Tor.SEZ_TORSIONE[cfg.section].poly, 44), [cfg.section]);
  return (
    <div className="p3 lab3d" data-mode={cfg.mode}>
      <Stage
        make={(h, c: TorsionConfig) => new TorsionRenderer(h, c)}
        cfg={cfg}
        chip={MODE_LABEL[cfg.mode]}
        views={
          cfg.mode === 'prandtl'
            ? [
                { id: 'prospettiva', label: 'prospettiva' },
                { id: 'sezione', label: 'dall’alto' },
              ]
            : [
                { id: 'prospettiva', label: 'prospettiva' },
                { id: 'lato', label: 'di lato' },
                { id: 'sezione', label: 'dalla base di destra' },
              ]
        }
        view={view}
        onView={setView}
        height={height}
      />
      <div className="p3-controls">
        {show.has('section') && <Chips label="Sezione" items={keys.map((k) => ({ id: k, label: Tor.SEZ_TORSIONE[k].label }))} value={cfg.section} onChange={(k) => set('section', k)} />}
        {cfg.mode === 'clebsch' && (
          <div className="p3-sliders">
            {show.has('twist') && <Range id="tor-tw" label="rotazione della base di destra (amplificata)" unit="°" min={0} max={120} step={1} value={cfg.twist} onChange={(v) => set('twist', v)} />}
            {show.has('warp') && <Range id="tor-wp" label="amplificazione dell’ingobbamento" unit="×" min={0} max={3} step={0.1} value={cfg.warp} onChange={(v) => set('warp', v)} />}
          </div>
        )}
        <p className="small muted">
          {Tor.SEZ_TORSIONE[cfg.section].note}{' '}
          {cfg.mode === 'clebsch'
            ? 'Colore del mantello: |τ_z| sul contorno (rosso = massimo). Ingobbamento φ calcolato dal motore dalla funzione di Prandtl; il disegno usa una rotazione finita, la dispensa la linearizza.'
            : 'Grafico di −F: è solo una rappresentazione; la dispensa usa l’analogia idrodinamica. Le curve di livello sono le linee di tensione; colore = |∇F|, proporzionale a |τ_z|.'}
        </p>
        <table className="readout">
          <tbody>
            <tr>
              <td>
                <Tex tex="\int_A(-2F)\,dA,\ J_0" />
              </td>
              <td>
                {fmt(g.I, 5)} ; {fmt(g.J0, 5)} cm⁴
              </td>
            </tr>
            <tr>
              <td>
                <Tex tex="q=J_0/\!\int(-2F)" />
              </td>
              <td>{fmt(g.q, 4)} (= 1 solo per il cerchio)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
