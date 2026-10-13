/**
 * Modello V2 (Cap. 2) in React: comandi, numeri (teoria finita e infinitesima a confronto) e direzioni principali.
 * Tutti i numeri vengono da src/engine/deformazione.ts con i riferimenti della dispensa.
 */
import { useEffect, useMemo, useState } from 'react';
import type { DeformScene } from '../content/types';
import * as T from '../engine/tensor';
import { fmt } from '../engine/tensor';
import { H_PRESETS, finiteMeasures, linearMeasures, principal, representation } from '../engine/deformazione';
import { Tex } from '../ui/components/Tex';
import { DeformRenderer, type DeformConfig, type DeformPart } from './deformRenderer';
import { Chips, Range, Stage, matTex, vecTex } from './Stage';

const MODE_LABEL = { intorno: 'Intorno che si deforma (§2.4–2.6)', ellissoide: 'Sfera → ellissoide (§2.9–2.10)', rappresentazione: 'Formula di rappresentazione (Teo 2.7.1)' };

function configOf(s: DeformScene): DeformConfig {
  const key = s.preset ?? s.presets?.[0] ?? 'taglio';
  return { mode: s.mode, H: H_PRESETS[key].H, part: s.part ?? 'H', amp: s.amp ?? (s.mode === 'rappresentazione' ? 25 : 10), alpha: s.alpha ?? 0, probe: s.probe ?? [20, 40] };
}

export function Deforma3D({ scene, height = 440 }: { scene: DeformScene; height?: number }) {
  const base = useMemo(() => configOf(scene), [scene]);
  const [cfg, setCfg] = useState<DeformConfig>(base);
  const [view, setView] = useState<string>(scene.view ?? (scene.mode === 'rappresentazione' ? 'alto' : 'prospettiva'));
  useEffect(() => setCfg(base), [base]);
  const set = <K extends keyof DeformConfig>(k: K, v: DeformConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const show = new Set(scene.controls ?? []);
  const presetKeys = scene.presets ?? Object.keys(H_PRESETS);
  const currentPreset = Object.keys(H_PRESETS).find((k) => H_PRESETS[k].H === cfg.H) ?? presetKeys[0];

  return (
    <div className="p3 lab3d" data-mode={cfg.mode}>
      <Stage
        make={(h, c: DeformConfig) => new DeformRenderer(h, c)}
        cfg={cfg}
        chip={MODE_LABEL[cfg.mode]}
        views={[
          { id: 'prospettiva', label: 'prospettiva' },
          { id: 'alto', label: 'dall’alto' },
          { id: 'fronte', label: 'fronte' },
        ]}
        view={view}
        onView={setView}
        height={height}
      />
      <div className="p3-controls">
        {show.has('preset') && <Chips label="Gradiente di spostamento" items={presetKeys.map((k) => ({ id: k, label: H_PRESETS[k].label }))} value={currentPreset} onChange={(k) => set('H', H_PRESETS[k].H)} />}
        {show.has('part') && (
          <Chips<DeformPart>
            label="Parte disegnata"
            items={[
              { id: 'H', label: 'tutto: H = E + W' },
              { id: 'E', label: 'solo deformazione pura E' },
              { id: 'W', label: 'solo rotazione rigida W' },
            ]}
            value={cfg.part}
            onChange={(k) => set('part', k)}
          />
        )}
        <div className="p3-sliders">
          {show.has('amp') && <Range id="def-amp" label="amplificazione del disegno k" min={1} max={30} step={1} value={cfg.amp} onChange={(v) => set('amp', v)} />}
          {show.has('alpha') && <Range id="def-alpha" label="fibra n̂: angolo nel piano xy" unit="°" min={0} max={180} step={1} value={cfg.alpha} onChange={(v) => set('alpha', v)} />}
          {show.has('probe') && (
            <>
              <Range id="def-pi" label="fibra m̂: inclinazione" unit="°" min={-90} max={90} step={1} value={cfg.probe[0]} onChange={(v) => set('probe', [v, cfg.probe[1]])} />
              <Range id="def-pa" label="azimut" unit="°" min={-180} max={180} step={1} value={cfg.probe[1]} onChange={(v) => set('probe', [cfg.probe[0], v])} />
            </>
          )}
        </div>
        <p className="small muted">{H_PRESETS[currentPreset].note} Il disegno amplifica gli spostamenti di k = {cfg.amp}; i numeri sotto usano il gradiente vero.</p>
        <DeformNumbers cfg={cfg} />
        <p className="small muted p3-legend">
          <span className="sw e1" /> n̂ / n̂₁ · <span className="sw e2" /> m̂ / n̂₂ · <span className="sw e3" /> n̂₃ · tratteggio = configurazione di riferimento · trascina per ruotare
        </p>
      </div>
    </div>
  );
}

function DeformNumbers({ cfg }: { cfg: DeformConfig }) {
  const H = cfg.H;
  if (cfg.mode === 'ellissoide') {
    const E = T.sym(H);
    const p = principal(E);
    const mh = T.dirVec(cfg.probe[0], cfg.probe[1]);
    const Em = T.apply(E, mh);
    return (
      <div className="lab-numbers">
        <div className="lab-row">
          <Tex tex={`[\\tens E]=${matTex(E)}`} />
          <table className="readout">
            <tbody>
              <tr>
                <td>
                  <Tex tex="e_1\ge e_2\ge e_3" />
                </td>
                <td>
                  {p.values.map((x) => fmt(x, 3)).join(' ; ')} <span className="small muted">({p.caso === 'distinti' ? 'tre distinte' : p.caso === 'doppia' ? 'radice doppia' : 'radice tripla'})</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="I,\ II,\ III" /> <span className="small muted">(Teo 2.9.3)</span>
                </td>
                <td>
                  {p.invarianti.map((x) => fmt(x, 3)).join(' ; ')} → {p.stato}
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\varepsilon_m=\tens E\hat m\cdot\hat m" />
                </td>
                <td>
                  {fmt(T.dotv(Em, mh), 3)} <span className="small muted">tra e₃ e e₁ (Prop 2.9.4)</span>
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens E\hat m" />
                </td>
                <td>
                  <Tex tex={vecTex(Em)} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  if (cfg.mode === 'rappresentazione') {
    const d: T.Vec = [0.4, 1.4, 0];
    const rep = representation(H, [0, 0, 0], d);
    return (
      <div className="lab-numbers">
        <div className="lab-row">
          <Tex tex={`[\\tens H]=${matTex(H)}`} />
          <table className="readout">
            <tbody>
              <tr>
                <td>
                  <Tex tex="Y-X" />
                </td>
                <td>
                  <Tex tex={vecTex(d)} />
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens W(Y-X)" />
                </td>
                <td>
                  <Tex tex={vecTex(rep.rot, 3)} />
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens E(Y-X)=\vet u^{dp}" />
                </td>
                <td>
                  <Tex tex={vecTex(rep.dp, 3)} />
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens W(Y-X)\cdot(Y-X)" />
                </td>
                <td>{fmt(Math.abs(rep.rotDotD) < 1e-14 ? 0 : rep.rotDotD, 3)} (ortogonali, Teo 2.7.1)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  const a = (cfg.alpha * Math.PI) / 180;
  const n: T.Vec = [Math.cos(a), Math.sin(a), 0];
  const m: T.Vec = [-Math.sin(a), Math.cos(a), 0];
  const lin = linearMeasures(H, n, m);
  const fin = finiteMeasures(T.add(T.I3, H), n, m);
  return (
    <div className="lab-numbers">
      <div className="lab-row">
        <Tex tex={`[\\tens H]=${matTex(H)}`} />
        <Tex tex={`[\\tens E]=${matTex(lin.E)}`} />
        <Tex tex={`[\\tens W]=${matTex(lin.W)}`} />
      </div>
      <table className="readout">
        <thead>
          <tr>
            <th>parametro</th>
            <th>teoria finita (§2.5)</th>
            <th>linearizzato (Prop 2.6.6)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Tex tex="\varepsilon_n" />
            </td>
            <td>{fmt(fin.epsN, 4)}</td>
            <td>{fmt(lin.epsN, 4)}</td>
          </tr>
          <tr>
            <td>
              <Tex tex="\gamma_{n,m}" /> (rad)
            </td>
            <td>{fmt(fin.gamma, 4)}</td>
            <td>{fmt(lin.gamma, 4)}</td>
          </tr>
          <tr>
            <td>
              <Tex tex="\Delta S_{n,m}" />
            </td>
            <td>{fmt(fin.dS, 4)}</td>
            <td>{fmt(lin.dS, 4)}</td>
          </tr>
          <tr>
            <td>
              <Tex tex="\Theta" />
            </td>
            <td>{fmt(fin.Theta, 4)}</td>
            <td>{fmt(lin.Theta, 4)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
