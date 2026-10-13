/**
 * Laboratorio dei tensori 3D (React + three.js), guidato dalla lezione tramite `scene`: ogni passo la reimposta,
 * lo studente poi la muove con i comandi. Il pannello numeri viene dal motore (src/engine/lab.ts) con i riferimenti
 * della dispensa.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TensorScene } from '../content/types';
import { PRESETS, axialNumbers, eulerNumbers, projectorNumbers, transformNumbers } from '../engine/lab';
import * as T from '../engine/tensor';
import { fmt } from '../engine/tensor';
import { Tex } from '../ui/components/Tex';
import { webglAvailable } from './base';
import { DEFAULT_TENSOR, TensorRenderer, type TensorConfig } from './tensorRenderer';

const SAFE_KEY = 'sdc.3d.simple';
const v3 = (v: number[]) => `(${v.map((x) => fmt(x, 3)).join(';\\ ')})`;
const matTex = (A: number[]) => `\\begin{bmatrix}${[0, 1, 2].map((i) => [0, 1, 2].map((j) => fmt(A[3 * i + j], 3)).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;

export function configOf(scene?: TensorScene): TensorConfig {
  const s = scene ?? { mode: 'trasforma' as const };
  return {
    ...DEFAULT_TENSOR,
    mode: s.mode,
    A: s.A ?? (s.presets?.[0] ? PRESETS[s.presets[0]].A : DEFAULT_TENSOR.A),
    dir: s.dir ?? DEFAULT_TENSOR.dir,
    u: s.u ?? DEFAULT_TENSOR.u,
    angle: s.angle ?? DEFAULT_TENSOR.angle,
    tangent: s.tangent ?? DEFAULT_TENSOR.tangent,
    cube: s.cube ?? DEFAULT_TENSOR.cube,
    view: s.view ?? 'prospettiva',
    wLen: s.wLen ?? DEFAULT_TENSOR.wLen,
  };
}

export function Tensori3D({ scene, height = 440 }: { scene?: TensorScene; height?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const r = useRef<TensorRenderer | null>(null);
  const [ok] = useState(() => typeof window !== 'undefined' && webglAvailable());
  const base = useMemo(() => configOf(scene), [scene]);
  const [cfg, setCfg] = useState<TensorConfig>(base);
  const [simple, setSimple] = useState(() => {
    try {
      return localStorage.getItem(SAFE_KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => setCfg(base), [base]);
  useEffect(() => {
    if (!ok || !host.current) return;
    let tr: TensorRenderer | null = null;
    try {
      tr = new TensorRenderer(host.current, cfg);
      if (simple) tr.forceSafe();
      r.current = tr;
    } catch {
      r.current = null;
    }
    const ro = new ResizeObserver(() => tr?.resize());
    ro.observe(host.current);
    return () => {
      ro.disconnect();
      tr?.dispose();
      r.current = null;
    };
    // il renderer si crea una volta sola; la configurazione passa da setConfig
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);
  useEffect(() => r.current?.setConfig(cfg), [cfg]);
  const goSimple = () => {
    setSimple(true);
    r.current?.forceSafe();
    try {
      localStorage.setItem(SAFE_KEY, '1');
    } catch {
      /* solo una comodità */
    }
  };
  const set = <K extends keyof TensorConfig>(k: K, v: TensorConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));
  const show = new Set(scene?.controls ?? []);
  const views = cfg.mode === 'eulero' ? (['prospettiva', 'asse', 'alto'] as const) : (['prospettiva', 'alto', 'fronte'] as const);

  return (
    <div className="p3 lab3d" data-mode={cfg.mode}>
      <div className="p3-stage" style={{ height }}>
        <div ref={host} className="p3-canvas" />
        {!ok && <div className="p3-fallback">Il tuo browser non ha WebGL attivo: il modello 3D non si può mostrare. I numeri qui sotto restano validi.</div>}
        <div className="p3-hud">
          <span className="p3-chip">{{ trasforma: 'Tensore come trasformazione', proiettori: 'Proiettori (Def 1.2.5)', assiale: 'Vettore assiale (Teo 1.3.4)', eulero: 'Rotazione: formula di Eulero (1.1)' }[cfg.mode]}</span>
        </div>
        <div className="p3-views" role="group" aria-label="Inquadratura">
          {views.map((v) => (
            <button key={v} className={cfg.view === v ? 'on' : ''} onClick={() => set('view', v)}>
              {v === 'asse' ? 'lungo l’asse' : v === 'alto' ? 'dall’alto' : v}
            </button>
          ))}
          {ok && !simple && (
            <button onClick={goSimple} title="Se il modello ti appare scuro o non lo vedi, usa materiali più semplici">
              non vedi il modello?
            </button>
          )}
        </div>
      </div>
      <div className="p3-controls">
        {show.has('preset') && cfg.mode === 'trasforma' && (
          <div className="chips" role="group" aria-label="Tensore">
            {(scene?.presets ?? Object.keys(PRESETS)).map((k) => (
              <button key={k} className={`chip ${cfg.A === PRESETS[k].A ? 'on' : ''}`} onClick={() => set('A', PRESETS[k].A)}>
                {PRESETS[k].label}
              </button>
            ))}
          </div>
        )}
        <div className="p3-sliders">
          {show.has('dir') && (
            <>
              <Range id="lab-incl" label={cfg.mode === 'eulero' ? 'asse: inclinazione' : cfg.mode === 'assiale' ? 'w: inclinazione' : 'ê: inclinazione'} unit="°" min={-90} max={90} step={1} value={cfg.dir[0]} onChange={(v) => set('dir', [v, cfg.dir[1]])} />
              <Range id="lab-az" label="azimut" unit="°" min={-180} max={180} step={1} value={cfg.dir[1]} onChange={(v) => set('dir', [cfg.dir[0], v])} />
            </>
          )}
          {show.has('wLen') && <Range id="lab-w" label="|w|" min={0} max={1.6} step={0.05} value={cfg.wLen} onChange={(v) => set('wLen', v)} />}
          {show.has('angle') && <Range id="lab-phi" label="φ" unit="°" min={0} max={180} step={1} value={cfg.angle} onChange={(v) => set('angle', v)} />}
          {show.has('u') && (
            <>
              {(['x', 'y', 'z'] as const).map((n, k) => (
                <Range key={n} id={`lab-u${k}`} label={`${cfg.mode === 'eulero' ? 'v' : 'u'}: componente ${n}`} min={-1.5} max={1.5} step={0.05} value={cfg.u[k]} onChange={(v) => set('u', cfg.u.map((x, j) => (j === k ? v : x)) as [number, number, number])} />
              ))}
            </>
          )}
          {show.has('tangent') && (
            <label className="p3-check">
              <input type="checkbox" checked={cfg.tangent} onChange={(e) => set('tangent', e.target.checked)} /> mostra l’approssimazione infinitesima v + φ ê∧v
            </label>
          )}
          {show.has('cube') && (
            <label className="p3-check">
              <input type="checkbox" checked={cfg.cube} onChange={(e) => set('cube', e.target.checked)} /> mostra il cubo unitario trasformato
            </label>
          )}
        </div>
        <Numbers cfg={cfg} />
        <p className="small muted p3-legend">
          <span className="sw e1" /> ê₁ / x · <span className="sw e2" /> ê₂ / y · <span className="sw e3" /> ê₃ / z · trascina per ruotare, rotella per lo zoom
        </p>
      </div>
    </div>
  );
}

function Numbers({ cfg }: { cfg: TensorConfig }) {
  if (cfg.mode === 'trasforma') {
    const n = transformNumbers(cfg.A);
    const preset = Object.values(PRESETS).find((p) => p.A === cfg.A);
    return (
      <div className="lab-numbers">
        <div className="lab-row">
          <Tex tex={`[A] = ${matTex(cfg.A)}`} />
          <div className="small">
            Colonna <i>j</i> = immagine <Tex tex="A\hat e_j" /> (Def 1.2.2)
            {preset && <p className="muted">{preset.note}</p>}
          </div>
        </div>
        <table className="readout">
          <tbody>
            <tr>
              <td>
                <Tex tex="\det A" /> <span className="small muted">(Def 1.4.1)</span>
              </td>
              <td>{fmt(n.det, 4)}</td>
              <td>volume del cubo trasformato</td>
              <td>{fmt(n.volume, 4)}</td>
            </tr>
            <tr>
              <td>
                <Tex tex="\operatorname{tr} A" />
              </td>
              <td>{fmt(n.trace, 4)}</td>
              <td>simmetrico / ortogonale</td>
              <td>
                {n.symmetric ? 'sì' : 'no'} / {n.orthogonal ? 'sì' : 'no'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  if (cfg.mode === 'proiettori') {
    const p = projectorNumbers(T.dirVec(cfg.dir[0], cfg.dir[1]), cfg.u as T.Vec);
    return (
      <table className="readout lab-numbers">
        <tbody>
          <tr>
            <td>
              <Tex tex="\hat e" />
            </td>
            <td>
              <Tex tex={v3(p.e)} />
            </td>
            <td>
              <Tex tex="\hat e\cdot\vet u" />
            </td>
            <td>{fmt(p.comp, 4)}</td>
          </tr>
          <tr>
            <td>
              <Tex tex="(\hat e\otimes\hat e)\vet u" />
            </td>
            <td>
              <Tex tex={v3(p.along)} />
            </td>
            <td>
              <Tex tex="(\tens I-\hat e\otimes\hat e)\vet u" />
            </td>
            <td>
              <Tex tex={v3(p.ortho)} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
  if (cfg.mode === 'assiale') {
    const a = axialNumbers(T.scalev(T.dirVec(cfg.dir[0], cfg.dir[1]), cfg.wLen), cfg.u as T.Vec);
    return (
      <div className="lab-numbers">
        <div className="lab-row">
          <Tex tex={`[\\tens W] = ${matTex(a.W)}`} />
          <table className="readout">
            <tbody>
              <tr>
                <td>
                  <Tex tex="\vet w" />
                </td>
                <td>
                  <Tex tex={v3(a.w)} />
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens W\vet u = \vet w\wedge\vet u" />
                </td>
                <td>
                  <Tex tex={v3(a.Wu)} />
                </td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens W\vet u\cdot\vet u,\ \ \tens W\vet u\cdot\vet w" />
                </td>
                <td>
                  {fmt(T.dotv(a.Wu, a.u), 3)}, {fmt(T.dotv(a.Wu, a.w), 3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  const n = eulerNumbers(T.dirVec(cfg.dir[0], cfg.dir[1]), cfg.u as T.Vec, (cfg.angle * Math.PI) / 180);
  return (
    <table className="readout lab-numbers">
      <tbody>
        <tr>
          <td>
            <Tex tex="|\vet v|,\ |\tens R\vet v|" />
          </td>
          <td>
            {fmt(n.lenV, 4)}, {fmt(n.lenRv, 4)}
          </td>
          <td>
            <Tex tex="\det\tens R" />, <Tex tex="|\tens R\hat e-\hat e|" />
          </td>
          <td>
            {fmt(n.det, 4)}, {fmt(n.axisResidual, 2)}
          </td>
        </tr>
        <tr>
          <td>
            <Tex tex="|\vet v+\varphi\,\hat e\wedge\vet v|" />
          </td>
          <td>{fmt(n.lenTangent, 4)}</td>
          <td>
            errore <Tex tex="|\tens R\vet v-(\vet v+\varphi\,\hat e\wedge\vet v)|" />
          </td>
          <td>{fmt(n.error, 3)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function Range({ id, label, unit, min, max, step, value, onChange }: { id: string; label: string; unit?: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <label className="slider" htmlFor={id}>
      <span>
        {label} = <b>{fmt(value, 3)}</b>
        {unit ? ` ${unit}` : ''}
      </span>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
