/**
 * Guscio comune dei modelli 3D dei moduli M2–M8: tela, etichetta della modalità, inquadrature, fallback senza WebGL e
 * pulsante «non vedi il modello?» (materiali semplici). Il renderer si crea una volta; la configurazione passa da setConfig.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { webglAvailable, type BaseRenderer } from './base';
import { fmt } from '../engine/tensor';

const SAFE_KEY = 'sdc.3d.simple';

export interface Viewable {
  setConfig(c: unknown): void;
  setView(v: string): void;
  forceSafe(): void;
  resize(): void;
  dispose(): void;
}

export function Stage<C>({
  make,
  cfg,
  chip,
  views,
  view,
  onView,
  height = 440,
  children,
}: {
  make: (host: HTMLElement, cfg: C) => BaseRenderer<C> & { setView(v: string): void };
  cfg: C;
  chip: string;
  views: { id: string; label: string }[];
  view: string;
  onView: (v: string) => void;
  height?: number;
  children?: ReactNode;
}) {
  const host = useRef<HTMLDivElement>(null);
  const r = useRef<(BaseRenderer<C> & { setView(v: string): void }) | null>(null);
  const [ok] = useState(() => typeof window !== 'undefined' && webglAvailable());
  const [simple, setSimple] = useState(() => {
    try {
      return localStorage.getItem(SAFE_KEY) === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!ok || !host.current) return;
    let tr: (BaseRenderer<C> & { setView(v: string): void }) | null = null;
    try {
      tr = make(host.current, cfg);
      if (simple) tr.forceSafe();
      tr.setView(view);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);
  useEffect(() => r.current?.setConfig(cfg), [cfg]);
  useEffect(() => r.current?.setView(view), [view]);
  const goSimple = () => {
    setSimple(true);
    r.current?.forceSafe();
    try {
      localStorage.setItem(SAFE_KEY, '1');
    } catch {
      /* solo una comodità */
    }
  };
  return (
    <div className="p3-stage" style={{ height }}>
      <div ref={host} className="p3-canvas" />
      {!ok && <div className="p3-fallback">Il tuo browser non ha WebGL attivo: il modello 3D non si può mostrare. I numeri qui sotto restano validi.</div>}
      <div className="p3-hud">
        <span className="p3-chip">{chip}</span>
      </div>
      <div className="p3-views" role="group" aria-label="Inquadratura">
        {views.map((v) => (
          <button key={v.id} className={view === v.id ? 'on' : ''} onClick={() => onView(v.id)}>
            {v.label}
          </button>
        ))}
        {ok && !simple && (
          <button onClick={goSimple} title="Se il modello ti appare scuro o non lo vedi, usa materiali più semplici">
            non vedi il modello?
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export function Range({ id, label, unit, min, max, step, value, onChange }: { id: string; label: string; unit?: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
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

export function Chips<K extends string>({ items, value, onChange, label }: { items: { id: K; label: string }[]; value: K; onChange: (k: K) => void; label: string }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} className={`chip ${value === it.id ? 'on' : ''}`} onClick={() => onChange(it.id)}>
          {it.label}
        </button>
      ))}
    </div>
  );
}

export const matTex = (A: number[], d = 3) => `\\begin{bmatrix}${[0, 1, 2].map((i) => [0, 1, 2].map((j) => fmt(A[3 * i + j], d)).join(' & ')).join(' \\\\ ')}\\end{bmatrix}`;
export const vecTex = (v: number[], d = 3) => `(${v.map((x) => fmt(x, d)).join(';\\ ')})`;
