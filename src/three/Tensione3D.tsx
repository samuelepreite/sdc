/**
 * Modello V3 (Cap. 3) in React: stato di tensione d'esempio, giacitura orientabile e numeri dal motore
 * (vettore tensione, componenti speciali, tensioni principali, τ_max) con i riferimenti della dispensa.
 */
import { useEffect, useMemo, useState } from 'react';
import type { StressScene } from '../content/types';
import * as T from '../engine/tensor';
import { fmt } from '../engine/tensor';
import { T_PRESETS, principalStress, tauMax, traction } from '../engine/tensione';
import { Tex } from '../ui/components/Tex';
import { StressRenderer, type StressConfig } from './stressRenderer';
import { Chips, Range, Stage, matTex, vecTex } from './Stage';

const MODE_LABEL = { taglio: 'Piano di taglio e vettore tensione (§3.2–3.3)', tetraedro: 'Tetraedro di Cauchy (§3.7.1)', parallelepipedo: 'Reciprocità delle tangenziali (§3.7.3)', principali: 'Direzioni principali e τ_max (§3.11–3.13)' };

function configOf(s: StressScene): StressConfig {
  const key = s.preset ?? s.presets?.[0] ?? 'esercizio';
  return { mode: s.mode, T: T_PRESETS[key].T, dir: s.dir ?? [-40, -50] };
}

export function Tensione3D({ scene, height = 440 }: { scene: StressScene; height?: number }) {
  const base = useMemo(() => configOf(scene), [scene]);
  const [cfg, setCfg] = useState<StressConfig>(base);
  const [view, setView] = useState<string>(scene.view ?? 'prospettiva');
  useEffect(() => setCfg(base), [base]);
  const set = <K extends keyof StressConfig>(k: K, v: StressConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const show = new Set(scene.controls ?? []);
  const keys = scene.presets ?? Object.keys(T_PRESETS);
  const cur = Object.keys(T_PRESETS).find((k) => T_PRESETS[k].T === cfg.T) ?? keys[0];
  return (
    <div className="p3 lab3d" data-mode={cfg.mode}>
      <Stage
        make={(h, c: StressConfig) => new StressRenderer(h, c)}
        cfg={cfg}
        chip={MODE_LABEL[cfg.mode]}
        views={[
          { id: 'prospettiva', label: 'prospettiva' },
          { id: 'alto', label: 'dall’alto' },
          { id: 'normale', label: 'lungo n̂' },
        ]}
        view={view}
        onView={setView}
        height={height}
      />
      <div className="p3-controls">
        {show.has('preset') && <Chips label="Stato di tensione" items={keys.map((k) => ({ id: k, label: T_PRESETS[k].label }))} value={cur} onChange={(k) => set('T', T_PRESETS[k].T)} />}
        {show.has('dir') && (
          <div className="p3-sliders">
            <Range id="st-incl" label="n̂: inclinazione" unit="°" min={-90} max={90} step={1} value={cfg.dir[0]} onChange={(v) => set('dir', [v, cfg.dir[1]])} />
            <Range id="st-az" label="azimut" unit="°" min={-180} max={180} step={1} value={cfg.dir[1]} onChange={(v) => set('dir', [cfg.dir[0], v])} />
          </div>
        )}
        <p className="small muted">{T_PRESETS[cur].note} Le frecce sono in scala: la tensione principale più grande in modulo ha lunghezza fissa.</p>
        <StressNumbers cfg={cfg} />
      </div>
    </div>
  );
}

function StressNumbers({ cfg }: { cfg: StressConfig }) {
  const p = principalStress(cfg.T);
  const n = T.dirVec(cfg.dir[0], cfg.dir[1]);
  const tr = traction(cfg.T, cfg.mode === 'tetraedro' ? T.unit(n.map((x) => Math.max(0.12, Math.abs(x))) as T.Vec) : n);
  const tm = tauMax(cfg.T);
  const sum = [0, 1, 2].reduce((acc, i) => T.addv(acc, T.scalev(T.apply(cfg.T, T.basis(i)), tr.n[i])), [0, 0, 0] as T.Vec);
  return (
    <div className="lab-numbers">
      <div className="lab-row">
        <Tex tex={`[\\tens T]=${matTex(cfg.T)}`} />
        <table className="readout">
          <tbody>
            <tr>
              <td>
                <Tex tex="\hat n" />
              </td>
              <td>
                <Tex tex={vecTex(tr.n)} />
              </td>
            </tr>
            <tr>
              <td>
                <Tex tex="\vet t_n=\tens T\hat n" />
              </td>
              <td>
                <Tex tex={vecTex(tr.t)} />
              </td>
            </tr>
            <tr>
              <td>
                <Tex tex="\sigma_n,\ \tau_n" /> <span className="small muted">(§3.10)</span>
              </td>
              <td>
                {fmt(tr.sigma, 4)} ; {fmt(tr.tau, 4)}
              </td>
            </tr>
            {cfg.mode === 'tetraedro' && (
              <tr>
                <td>
                  <Tex tex="\textstyle\sum_i\vet t_{e_i}n_i" />
                </td>
                <td>
                  <Tex tex={vecTex(sum)} /> <span className="small muted">= t_n (§3.7.1)</span>
                </td>
              </tr>
            )}
            <tr>
              <td>
                <Tex tex="s_1\ge s_2\ge s_3" />
              </td>
              <td>
                {p.s.map((x) => fmt(Math.abs(x) < 1e-12 ? 0 : x, 4)).join(' ; ')} → {p.stato}
              </td>
            </tr>
            <tr>
              <td>
                <Tex tex="\tau_{\max}=\tfrac{s_1-s_3}2" />
              </td>
              <td>
                {fmt(tm.value, 4)} <span className="small muted">con σ = {fmt(tm.sigmaOn, 4)} (Prop 3.13.2)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
