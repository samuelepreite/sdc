/**
 * Arbelo di Mohr (§3.17.1, Teo 3.17.1): i tre cerchi costruiti sulle tensioni principali e, come verifica, i punti
 * (σ_m, τ_m) di 300 giaciture casuali calcolati dal motore (engine/tensione): cadono tutti nella regione grigia.
 */
import { useMemo, useState } from 'react';
import * as T from '../engine/tensor';
import { arbelo, traction } from '../engine/tensione';
import { fmt } from '../engine/tensor';
import { C1, C3, INK, Lbl, MUTED, TAN, Toggle } from './svgkit';

const CASI: Record<string, { label: string; s: [number, number, number] }> = {
  generico: { label: 'triassiale', s: [8, 2, -4] },
  esempio: { label: 'esempio §3.17.2 (MPa)', s: [102.96, 9.04, 0] },
  trazione: { label: 'trazione semplice', s: [10, 0, 0] },
};

export function Arbelo({ params }: { params?: Record<string, number | string | boolean> }) {
  const [key, setKey] = useState<string>(typeof params?.caso === 'string' && CASI[params.caso] ? params.caso : 'generico');
  const [cloud, setCloud] = useState(true);
  const s = CASI[key].s;
  const cs = arbelo(s);
  const pts = useMemo(() => {
    const r = T.mulberry32(17);
    const D: T.Mat = [s[0], 0, 0, 0, s[1], 0, 0, 0, s[2]];
    return Array.from({ length: 300 }, () => {
      const tr = traction(D, T.randVec(r));
      return [tr.sigma, tr.tau] as const;
    });
  }, [s]);
  const W = 520;
  const H = 300;
  const big = cs[1];
  const lo = Math.min(0, s[2]) - 0.1 * big.R;
  const hi = Math.max(0, s[0]) + 0.1 * big.R;
  const k = Math.min((W - 40) / (hi - lo), (H - 50) / (1.15 * big.R || 1));
  const X = (x: number) => 20 + (x - lo) * k;
  const Y = (t: number) => H - 24 - t * k; // qui τ_m ≥ 0 (modulo) verso l'alto: metà superiore dell'arbelo
  const arc = (c: { C: number; R: number }) => `M ${X(c.C - c.R)} ${Y(0)} A ${c.R * k} ${c.R * k} 0 0 1 ${X(c.C + c.R)} ${Y(0)}`;
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Stato di tensione">
        {Object.entries(CASI).map(([k2, c]) => (
          <button key={k2} className={`chip ${key === k2 ? 'on' : ''}`} onClick={() => setKey(k2)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Arbelo di Mohr">
          <path d={`${arc(big)} Z`} fill="rgba(100,116,139,0.18)" />
          <path d={`${arc(cs[0])} Z`} fill="var(--card, #fff)" />
          <path d={`${arc(cs[2])} Z`} fill="var(--card, #fff)" />
          {cs.map((c, i) => (
            <path key={i} d={arc(c)} fill="none" stroke={i === 1 ? C3 : C1} strokeWidth={i === 1 ? 2 : 1.5} />
          ))}
          <line x1={10} y1={Y(0)} x2={W - 10} y2={Y(0)} stroke={MUTED} />
          <Lbl x={W - 14} y={Y(0) - 6} anchor="end" color={MUTED}>σ</Lbl>
          <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={14} stroke={MUTED} strokeDasharray="3 3" />
          <Lbl x={X(0) + 4} y={20} color={MUTED}>|τ|</Lbl>
          {s.map((x, i) => (
            <g key={i}>
              <circle cx={X(x)} cy={Y(0)} r={3.5} fill={INK} />
              <Lbl x={X(x)} y={Y(0) + 16} anchor="middle">{`s${i + 1}`}</Lbl>
            </g>
          ))}
          <line x1={X(big.C)} y1={Y(0)} x2={X(big.C)} y2={Y(big.R)} stroke={TAN} strokeDasharray="4 3" />
          <Lbl x={X(big.C) + 6} y={Y(big.R) - 4} color={TAN}>τmax = (s₁ − s₃)/2 = {fmt(big.R, 4)}</Lbl>
          {cloud && pts.map(([a, b], i) => <circle key={i} cx={X(a)} cy={Y(b)} r={1.8} fill={C3} opacity={0.7} />)}
        </svg>
      </div>
      <Toggle checked={cloud} onChange={setCloud}>
        mostra 300 giaciture casuali calcolate dal motore
      </Toggle>
      <p className="small muted">Ogni punto blu è (σₘ, |τₘ|) per una giacitura presa a caso: cadono tutti tra il cerchio massimo e i due minori, bordi compresi (Teo 3.17.1, enunciato senza dimostrazione nella dispensa). Si rileggono s₃ ≤ σₘ ≤ s₁ e τmax = raggio del cerchio massimo.</p>
    </div>
  );
}
