/**
 * Cerchio di Mohr (§3.15–3.16): costruzione con il polo P(σ1, −τ12), punto Q_m della giacitura m̂ inclinata di α,
 * faccia ortogonale (punto diametralmente opposto), tensioni principali S1, S2 e tangenziali estreme.
 * Convenzione della dispensa: asse σ concorde a ê1, asse τ opposto a ê2 (τ positive verso il basso).
 * Tutti i numeri vengono da engine/tensione.ts (mohr).
 */
import { useState } from 'react';
import { mohr, ES_3172, type MohrInput } from '../engine/tensione';
import { fmt } from '../engine/tensor';
import { Arrow, C1, C2, C3, INK, Lbl, MUTED, OUT, Slider, TAN, Toggle } from './svgkit';

const PRESETS: Record<string, { label: string; v: MohrInput; unit: string }> = {
  esempio: { label: 'esempio §3.17.2', v: ES_3172, unit: 'MPa' },
  scorrimento: { label: 'scorrimento semplice', v: { s1: 0, s2: 0, t12: 10 }, unit: '' },
  trazione: { label: 'trazione semplice', v: { s1: 10, s2: 0, t12: 0 }, unit: '' },
  generico: { label: 'biassiale generico', v: { s1: 40, s2: -20, t12: 25 }, unit: '' },
};

export function Mohr({ params }: { params?: Record<string, number | string | boolean> }) {
  const [key, setKey] = useState<string>(typeof params?.preset === 'string' && PRESETS[params.preset] ? params.preset : 'esempio');
  const [alphaDeg, setAlpha] = useState<number>(typeof params?.alpha === 'number' ? params.alpha : 30);
  const [princ, setPrinc] = useState<boolean>(params?.principali !== false);
  const [tmax, setTmax] = useState<boolean>(!!params?.tmax);
  const v = PRESETS[key].v;
  const M = mohr(v);
  const a = (alphaDeg * Math.PI) / 180;
  const q = M.at(a);
  const qo = M.at(a + Math.PI / 2);
  // scala: il cerchio e l'origine devono entrare
  const W = 520;
  const H = 400;
  const lo = Math.min(0, M.C - M.R) - 0.15 * (M.R || 1);
  const hi = Math.max(0, M.C + M.R) + 0.15 * (M.R || 1);
  const k = Math.min((W - 60) / (hi - lo), (H - 60) / (2.3 * (M.R || 1)));
  const X = (s: number) => 30 + (s - lo) * k;
  const Y = (t: number) => H / 2 + t * k; // τ positive verso il basso
  const P = { x: X(M.pole[0]), y: Y(M.pole[1]) };
  // traccia del piano di giacitura m̂ per il polo: direzione di ν̂ = (−sin α, cos α) → schermo (−sin α, −cos α)
  const dx = -Math.sin(a);
  const dy = -Math.cos(a);
  const L = 3 * M.R * k + 40;
  const u = PRESETS[key].unit;
  return (
    <div className="card soft diagram mohr">
      <div className="chips" role="group" aria-label="Stato di tensione">
        {Object.entries(PRESETS).map(([k2, p]) => (
          <button key={k2} className={`chip ${key === k2 ? 'on' : ''}`} onClick={() => setKey(k2)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Cerchio di Mohr">
          <Arrow x1={10} y1={H / 2} x2={W - 8} y2={H / 2} color={MUTED} w={1.2} />
          <Lbl x={W - 14} y={H / 2 - 8} anchor="end" color={MUTED}>σ</Lbl>
          <Arrow x1={X(0)} y1={16} x2={X(0)} y2={H - 8} color={MUTED} w={1.2} />
          <Lbl x={X(0) + 6} y={H - 12} color={MUTED}>τ (verso il basso)</Lbl>
          <circle cx={X(M.C)} cy={Y(0)} r={M.R * k} fill="rgba(37,99,235,0.07)" stroke={C3} strokeWidth={1.8} />
          {/* costruzione: A, B, C, polo */}
          <circle cx={X(v.s1)} cy={Y(0)} r={3.5} fill={INK} />
          <Lbl x={X(v.s1) + 5} y={Y(0) + 16}>A</Lbl>
          <circle cx={X(v.s2)} cy={Y(0)} r={3.5} fill={INK} />
          <Lbl x={X(v.s2) - 5} y={Y(0) + 16} anchor="end">B</Lbl>
          <circle cx={X(M.C)} cy={Y(0)} r={3} fill={MUTED} />
          <Lbl x={X(M.C)} y={Y(0) - 8} anchor="middle" color={MUTED}>C</Lbl>
          <line x1={X(v.s1)} y1={Y(-v.t12)} x2={X(v.s1)} y2={Y(v.t12)} stroke={MUTED} strokeDasharray="3 3" />
          <circle cx={P.x} cy={P.y} r={5} fill={OUT} />
          <Lbl x={P.x - 8} y={P.y - 8} color={OUT} anchor="end">P (polo)</Lbl>
          <circle cx={X(v.s1)} cy={Y(v.t12)} r={3.5} fill={MUTED} />
          <Lbl x={X(v.s1) + 6} y={Y(v.t12) + 14} color={MUTED}>Q₀</Lbl>
          {/* traccia del piano per il polo e punto Q_m */}
          <line x1={P.x - dx * L} y1={P.y - dy * L} x2={P.x + dx * L} y2={P.y + dy * L} stroke={C2} strokeWidth={1.3} strokeDasharray="6 4" />
          <circle cx={X(q.sigma)} cy={Y(q.tau)} r={6} fill={C2} />
          <Lbl x={X(q.sigma) + 8} y={Y(q.tau) + 4} color={C2}>Qₘ (σₘ, τₘᵥ)</Lbl>
          <circle cx={X(qo.sigma)} cy={Y(qo.tau)} r={4.5} fill="none" stroke={C2} strokeWidth={2} />
          <Lbl x={X(qo.sigma) + 8} y={Y(qo.tau) + 4} color={C2}>Q′ₘ (faccia ν̂)</Lbl>
          <line x1={X(q.sigma)} y1={Y(q.tau)} x2={X(qo.sigma)} y2={Y(qo.tau)} stroke={C2} strokeWidth={0.8} opacity={0.6} />
          {princ && (
            <g>
              <circle cx={X(M.sMax)} cy={Y(0)} r={5} fill={C1} />
              <Lbl x={X(M.sMax) + 6} y={Y(0) - 8} color={C1}>S₁</Lbl>
              <circle cx={X(M.sMin)} cy={Y(0)} r={5} fill={C1} />
              <Lbl x={X(M.sMin) - 6} y={Y(0) - 8} color={C1} anchor="end">S₂</Lbl>
              <line x1={P.x} y1={P.y} x2={X(M.sMax)} y2={Y(0)} stroke={C1} strokeWidth={1.2} />
              <line x1={P.x} y1={P.y} x2={X(M.sMin)} y2={Y(0)} stroke={C1} strokeWidth={1.2} />
              <Lbl x={(P.x + X(M.sMax)) / 2 + 4} y={(P.y + Y(0)) / 2} color={C1}>η</Lbl>
              <Lbl x={(P.x + X(M.sMin)) / 2 - 4} y={(P.y + Y(0)) / 2} color={C1} anchor="end">ξ</Lbl>
            </g>
          )}
          {tmax && (
            <g>
              <circle cx={X(M.C)} cy={Y(M.R)} r={5} fill={TAN} />
              <circle cx={X(M.C)} cy={Y(-M.R)} r={5} fill={TAN} />
              <line x1={P.x} y1={P.y} x2={X(M.C)} y2={Y(M.R)} stroke={TAN} strokeWidth={1.2} />
              <line x1={P.x} y1={P.y} x2={X(M.C)} y2={Y(-M.R)} stroke={TAN} strokeWidth={1.2} />
              <Lbl x={X(M.C) + 8} y={Y(M.R) + 4} color={TAN}>+τmax = R</Lbl>
              <Lbl x={X(M.C) + 8} y={Y(-M.R) + 4} color={TAN}>−τmax</Lbl>
            </g>
          )}
        </svg>
      </div>
      <Slider id="mohr-alpha" label="α (inclinazione di m̂ su ê₁)" unit="°" min={-90} max={90} step={1} value={alphaDeg} onChange={setAlpha} />
      <div className="p3-sliders">
        <Toggle checked={princ} onChange={setPrinc}>
          tensioni principali S₁, S₂ e assi η, ξ
        </Toggle>
        <Toggle checked={tmax} onChange={setTmax}>
          tangenziali estreme (piani α, β)
        </Toggle>
      </div>
      <table className="readout">
        <tbody>
          <tr>
            <td>σ₁, σ₂, τ₁₂</td>
            <td>
              {fmt(v.s1, 4)} ; {fmt(v.s2, 4)} ; {fmt(v.t12, 4)} {u}
            </td>
            <td>C, R</td>
            <td>
              {fmt(M.C, 4)} ; {fmt(M.R, 5)} {u}
            </td>
          </tr>
          <tr>
            <td>σₘ, τₘᵥ (α = {alphaDeg}°)</td>
            <td>
              {fmt(q.sigma, 5)} ; {fmt(q.tau, 5)} {u}
            </td>
            <td>σᵥ (faccia ortogonale)</td>
            <td>
              {fmt(qo.sigma, 5)} {u}
            </td>
          </tr>
          <tr>
            <td>s₁, s₂ = C ± R</td>
            <td>
              {fmt(M.sMax, 5)} ; {fmt(M.sMin, 5)} {u}
            </td>
            <td>γ (tan 2γ = 2τ₁₂/(σ₁ − σ₂))</td>
            <td>{fmt((M.gamma * 180) / Math.PI, 4)}°</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">La retta verde tratteggiata passa per il polo ed è parallela a ν̂, cioè alla traccia del piano di giacitura m̂: incontra il cerchio in Qₘ (Prop 3.15.1). Facce ortogonali sono punti diametralmente opposti.</p>
    </div>
  );
}
