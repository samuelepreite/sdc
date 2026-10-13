/**
 * Elasticità isotropa (§4.13–4.15): il provino in trazione con dilatazione assiale σ/E e contrazione trasversale −νσ/E
 * (Poisson), la dilatazione volumica Θ = (1−2ν)σ/E e i moduli di Lamé corrispondenti; poi il campo ammesso per ν
 * (−1 < ν < ½ teorico, 0 < ν ≤ ½ pratico) con K/E = 1/(3(1−2ν)). Numeri da engine/elastico.
 */
import { useState } from 'react';
import { lameFromTech, techFromLame } from '../engine/elastico';
import { fmt } from '../engine/tensor';
import { C1, C2, C3, Lbl, MUTED, OUT, Slider, TAN } from './svgkit';

export function Isotropia({ params }: { params?: Record<string, number | string | boolean> }) {
  const [tab, setTab] = useState<'provino' | 'nu'>(params?.tab === 'nu' ? 'nu' : 'provino');
  const [nu, setNu] = useState<number>(typeof params?.nu === 'number' ? params.nu : 0.3);
  const [E, setE] = useState<number>(typeof params?.E === 'number' ? params.E : 205000);
  const sigma = 200; // MPa
  const e1 = sigma / E;
  const e2 = -nu * e1;
  const theta = ((1 - 2 * nu) * sigma) / E;
  const l = lameFromTech(E, nu);
  const t = techFromLame(l.mu, l.lambda);
  const k = 0.25 / Math.max(Math.abs(e1), 1e-12); // amplificazione: la dilatazione assiale disegnata è il 25%
  const W0 = 200;
  const H0 = 80;
  const Wd = W0 * (1 + k * e1);
  const Hd = H0 * (1 + k * e2);
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Vista">
        <button className={`chip ${tab === 'provino' ? 'on' : ''}`} onClick={() => setTab('provino')}>
          provino in trazione
        </button>
        <button className={`chip ${tab === 'nu' ? 'on' : ''}`} onClick={() => setTab('nu')}>
          campo di ν
        </button>
      </div>
      {tab === 'provino' ? (
        <>
          <div className="svg-scroll">
            <svg viewBox="0 0 520 220" width="100%" style={{ maxWidth: 540 }} role="img" aria-label="Provino in trazione">
              <rect x={260 - W0 / 2} y={110 - H0 / 2} width={W0} height={H0} fill="none" stroke={MUTED} strokeDasharray="5 4" />
              <rect x={260 - Wd / 2} y={110 - Hd / 2} width={Wd} height={Hd} fill="rgba(37,99,235,0.18)" stroke={C3} strokeWidth={2} />
              <Lbl x={260 - Wd / 2 - 8} y={114} anchor="end" color={OUT}>
                ← σ
              </Lbl>
              <Lbl x={260 + Wd / 2 + 8} y={114} color={OUT}>
                σ →
              </Lbl>
              <Lbl x={260} y={110 - Math.max(H0, Hd) / 2 - 10} anchor="middle" color={MUTED} size={12}>
                tratteggio: prima; azzurro: dopo (spostamenti amplificati)
              </Lbl>
            </svg>
          </div>
          <div className="p3-sliders">
            <Slider id="iso-nu" label="ν (Poisson)" min={-0.9} max={0.5} step={0.01} value={nu} onChange={setNu} />
            <Slider id="iso-E" label="E" unit="MPa" min={1000} max={250000} step={1000} value={E} onChange={setE} />
          </div>
          <table className="readout">
            <tbody>
              <tr>
                <td>σ (trazione)</td>
                <td>{sigma} MPa</td>
                <td>ε₁ = σ/E</td>
                <td>{fmt(e1, 4)}</td>
              </tr>
              <tr>
                <td>ε₂ = ε₃ = −νσ/E</td>
                <td>{fmt(e2, 4)}</td>
                <td>Θ = (1−2ν)σ/E</td>
                <td style={{ color: Math.abs(theta) < 1e-12 ? C2 : theta > 0 ? C3 : C1 }}>{fmt(Math.abs(theta) < 1e-14 ? 0 : theta, 4)}</td>
              </tr>
              <tr>
                <td>G = μ = E/(2(1+ν))</td>
                <td>{fmt(t.G, 4)} MPa</td>
                <td>λ = νE/((1+ν)(1−2ν))</td>
                <td>{nu >= 0.4999 ? '→ ∞' : `${fmt(l.lambda, 4)} MPa`}</td>
              </tr>
            </tbody>
          </table>
          <p className="small">{nu < 0 ? 'ν < 0: in trazione il provino si allarga anche di lato (materiali auxetici, artificiali).' : nu >= 0.4999 ? 'ν = ½: Θ = 0 per ogni carico, materiale incomprimibile (gomme, biotessuti); caso limite, λ → ∞.' : 'In trazione si allunga e si contrae di lato, ma il volume aumenta (Θ > 0 con ν < ½).'}</p>
        </>
      ) : (
        <NuChart nu={nu} />
      )}
    </div>
  );
}

function NuChart({ nu }: { nu: number }) {
  const X = (v: number) => 40 + (v + 1.1) * 260;
  const Y = (k: number) => 230 - Math.min(k, 6) * 32;
  let d = '';
  for (let i = 0; i <= 200; i++) {
    const v = -0.99 + (1.48 * i) / 200;
    const k = 1 / (3 * (1 - 2 * v));
    d += `${i ? 'L' : 'M'}${X(v).toFixed(1)},${Y(k).toFixed(1)} `;
  }
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox="0 0 520 270" width="100%" style={{ maxWidth: 540 }} role="img" aria-label="Campo di variazione di ν">
          <rect x={X(-1)} y={20} width={X(0.5) - X(-1)} height={210} fill="rgba(37,99,235,0.07)" />
          <rect x={X(0)} y={20} width={X(0.5) - X(0)} height={210} fill="rgba(22,163,74,0.12)" />
          <line x1={X(-1.1)} y1={230} x2={X(0.6)} y2={230} stroke={MUTED} />
          {[-1, -0.5, 0, 0.5].map((v) => (
            <g key={v}>
              <line x1={X(v)} y1={230} x2={X(v)} y2={236} stroke={MUTED} />
              <Lbl x={X(v)} y={250} anchor="middle" color={MUTED} size={12}>
                {fmt(v, 2)}
              </Lbl>
            </g>
          ))}
          <line x1={X(0.5)} y1={20} x2={X(0.5)} y2={230} stroke={C1} strokeDasharray="4 3" />
          <path d={d} fill="none" stroke={C3} strokeWidth={2} />
          <Lbl x={X(-0.95)} y={36} color={C3} size={12}>K/E = 1/(3(1−2ν))</Lbl>
          <Lbl x={X(0.02)} y={52} color={C2} size={12}>pratico: 0 &lt; ν ≤ ½</Lbl>
          <Lbl x={X(-0.95)} y={210} color={MUTED} size={12}>teorico (𝔸 ∈ Pos⁺): −1 &lt; ν &lt; ½</Lbl>
          <Lbl x={X(0.5) - 4} y={30} anchor="end" color={C1} size={12}>ν = ½: incomprimibile</Lbl>
          <circle cx={X(0.3)} cy={Y(1 / (3 * 0.4))} r={4} fill={TAN} />
          <Lbl x={X(0.3) + 6} y={Y(1 / 1.2) + 16} color={TAN} size={12}>acciaio ≈ 0,3</Lbl>
          <circle cx={X(nu)} cy={Y(1 / (3 * Math.max(1e-6, 1 - 2 * nu)))} r={5} fill={OUT} />
          <Lbl x={X(-0.6)} y={140} color={MUTED} size={12}>ν &lt; 0: auxetici</Lbl>
          <Lbl x={X(0.55)} y={246} anchor="end" color={MUTED} size={12}>ν</Lbl>
        </svg>
      </div>
      <p className="small">La definita positività di 𝔸 dà E &gt; 0, G &gt; 0 e −1 &lt; ν &lt; ½ (§4.15.3). I materiali naturali hanno ν ≥ 0; i metamateriali auxetici, progettati geometricamente, arrivano a ν &lt; 0. Per ν → ½ il modulo di comprimibilità K diverge: il volume non può cambiare (punto arancio: il ν scelto nell’altra vista).</p>
    </>
  );
}
