/**
 * Modello V8 (Cap. 6) in React: superfici limite dei criteri nello spazio delle tensioni principali, punto di lavoro
 * scelto tra stati tipici (Huber con pressione regolabile) e tensioni ideali dal motore.
 */
import { useEffect, useMemo, useState } from 'react';
import type { CriteriScene } from '../content/types';
import { fmt } from '../engine/tensor';
import * as C from '../engine/criteri';
import { CriteriRenderer, type CriteriConfig } from './criteriRenderer';
import { Chips, Range, Stage } from './Stage';

const STATI: Record<string, { label: string; s: (p: number) => [number, number, number]; note: string }> = {
  trazione: { label: 'trazione semplice', s: (p) => [p, 0, 0], note: 'Stato monoassiale: tutti i criteri danno σ_id = σ.' },
  taglio: { label: 'puro taglio', s: (p) => [p, 0, -p], note: 'Puro taglio τ = p: Tresca 2τ, von Mises √3 τ.' },
  huber: { label: 'Huber (pressione idrostatica)', s: (p) => [-p, -p, -p], note: 'Punto immerso: lo stato è sull’asse idrostatico. Von Mises e Tresca non prevedono mai la crisi; Beltrami sì, oltre una certa profondità (§6.4.5).' },
  generico: { label: 'stato generico', s: (p) => [0.7 * p, 0.1 * p, -0.5 * p], note: 'Uno stato triassiale qualsiasi.' },
};
const SURF: { id: CriteriConfig['show'][number]; label: string }[] = [
  { id: 'vonMises', label: 'von Mises' },
  { id: 'tresca', label: 'Tresca' },
  { id: 'beltrami', label: 'Beltrami' },
  { id: 'galileo', label: 'Galileo' },
];

export function Criteri3D({ scene, height = 440 }: { scene: CriteriScene; height?: number }) {
  const [stato, setStato] = useState<string>(scene.stato ?? 'generico');
  const [p, setP] = useState<number>(scene.p ?? 1);
  const [show, setShow] = useState<CriteriConfig['show']>(scene.show ?? ['vonMises', 'tresca']);
  const [view, setView] = useState<string>(scene.view ?? 'prospettiva');
  const nu = 0.3;
  const cfg = useMemo<CriteriConfig>(() => ({ show, s: STATI[stato].s(p), nu }), [show, stato, p]);
  useEffect(() => {
    setStato(scene.stato ?? 'generico');
    setShow(scene.show ?? ['vonMises', 'tresca']);
  }, [scene]);
  const s = C.sortS(cfg.s);
  const g = C.grashof(s, nu);
  const rows: [string, number][] = [
    ['Galileo (s₁ ; s₃)', NaN],
    ['Tresca s₁ − s₃', C.tresca(s)],
    ['Grashof (trazione)', g.t],
    ['Beltrami', C.beltrami(s, nu)],
    ['von Mises', C.vonMises(s)],
  ];
  return (
    <div className="p3 lab3d">
      <Stage
        make={(h, c: CriteriConfig) => new CriteriRenderer(h, c)}
        cfg={cfg}
        chip="Criteri nello spazio delle tensioni principali (§6.4–6.5)"
        views={[
          { id: 'prospettiva', label: 'prospettiva' },
          { id: 'asse', label: 'lungo l’asse idrostatico' },
        ]}
        view={view}
        onView={setView}
        height={height}
      />
      <div className="p3-controls">
        <Chips label="Stato" items={Object.keys(STATI).map((k) => ({ id: k, label: STATI[k].label }))} value={stato} onChange={setStato} />
        <div className="chips" role="group" aria-label="Superfici">
          {SURF.map((x) => (
            <button key={x.id} className={`chip ${show.includes(x.id) ? 'on' : ''}`} onClick={() => setShow((v) => (v.includes(x.id) ? v.filter((y) => y !== x.id) : [...v, x.id]))}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="p3-sliders">
          <Range id="cr3-p" label={stato === 'huber' ? 'pressione p / σ_L' : 'intensità / σ_L'} unit="" min={0} max={2} step={0.01} value={p} onChange={setP} />
        </div>
        <p className="small muted">{STATI[stato].note} Tensioni adimensionali con σ_L, uguale in trazione e compressione; ν = 0,3. Lungo l’asse idrostatico von Mises e Tresca sono illimitati (pressure insensitive), Beltrami è chiuso.</p>
        <table className="readout">
          <tbody>
            <tr>
              <td>s₁ ; s₂ ; s₃</td>
              <td>{s.map((x) => fmt(x, 3)).join(' ; ')}</td>
            </tr>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td>σ_id {k}</td>
                <td>{Number.isNaN(v) ? `${fmt(s[0], 3)} ; ${fmt(s[2], 3)}` : `${fmt(v, 4)} ${Math.abs(v) <= 1 ? '✓' : '✗ crisi'}`}</td>
              </tr>
            ))}
            <tr>
              <td>procedura della dispensa</td>
              <td>σ_m = {fmt((s[0] + s[1] + s[2]) / 3, 3)} → {C.sceltaCriterio(s)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
