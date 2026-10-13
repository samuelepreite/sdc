/** Piccoli strumenti comuni ai diagrammi SVG: scala lineare, frecce, etichette, cursori. Colori dalle variabili CSS. */
import type { ReactNode } from 'react';
import { fmt } from '../engine/tensor';

export const INK = 'var(--ink, #1e293b)';
export const MUTED = 'var(--muted, #64748b)';
export const C1 = '#dc2626';
export const C2 = '#16a34a';
export const C3 = '#2563eb';
export const OUT = '#ea580c';
export const TAN = '#ca8a04';

/** scala lineare da [d0, d1] a [r0, r1] */
export const lin = (d0: number, d1: number, r0: number, r1: number) => (x: number) => r0 + ((x - d0) * (r1 - r0)) / (d1 - d0 || 1);

export function Arrow({ x1, y1, x2, y2, color, w = 2, dash }: { x1: number; y1: number; x2: number; y2: number; color: string; w?: number; dash?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return null;
  const p = (s: number) => `${x2 - h * Math.cos(a + s)},${y2 - h * Math.sin(a + s)}`;
  return (
    <g stroke={color} fill={color}>
      <line x1={x1} y1={y1} x2={x2 - 0.7 * h * Math.cos(a)} y2={y2 - 0.7 * h * Math.sin(a)} strokeWidth={w} strokeDasharray={dash} />
      <polygon points={`${x2},${y2} ${p(0.4)} ${p(-0.4)}`} stroke="none" />
    </g>
  );
}

export function Lbl({ x, y, children, color = INK, anchor = 'start', size = 13 }: { x: number; y: number; children: ReactNode; color?: string; anchor?: 'start' | 'middle' | 'end'; size?: number }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} textAnchor={anchor} className="svg-lbl" paintOrder="stroke" stroke="var(--card, #fff)" strokeWidth={3} strokeLinejoin="round">
      {children}
    </text>
  );
}

export function Slider({ id, label, unit, min, max, step, value, onChange }: { id: string; label: string; unit?: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
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

export function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="p3-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /> {children}
    </label>
  );
}
