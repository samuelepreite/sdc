/**
 * Simmetrie dei tensori del IV ordine (§1.7.3): le 81 componenti 𝔸_ijhk in una griglia 9 × 9 (righe = coppia ij,
 * colonne = coppia hk). Le componenti costrette a essere uguali dalle simmetrie scelte hanno lo stesso colore;
 * il numero di componenti distinte è contato dal motore per classi di equivalenza (src/engine/tensor.ts).
 */
import { useMemo, useState } from 'react';
import { componentClasses, i4, type Sym4 } from '../engine/tensor';

const PAIRS = [0, 1, 2].flatMap((a) => [0, 1, 2].map((b) => [a, b] as const));

export function Simmetrie4({ params }: { params?: Record<string, number | string | boolean> }) {
  const [s, setS] = useState<Sym4>({ minor1: !!params?.minor1, minor2: !!params?.minor2, major: !!params?.major });
  const [hover, setHover] = useState<number | null>(null);
  const { cls, count } = useMemo(() => componentClasses(s), [s]);
  const toggle = (k: keyof Sym4) => setS((x) => ({ ...x, [k]: !x[k] }));
  const cell = 22;
  const pad = 30;
  const size = pad + 9 * cell;
  return (
    <div className="sym4 card soft">
      <div className="sym4-head">
        <div className="sym4-count" aria-live="polite">
          <b>{count}</b>
          <span className="small muted">componenti distinte</span>
        </div>
        <div className="sym4-toggles">
          <label className="p3-check">
            <input type="checkbox" checked={!!s.minor1} onChange={() => toggle('minor1')} /> prima minore <span className="small muted">𝔸ijhk = 𝔸jihk</span>
          </label>
          <label className="p3-check">
            <input type="checkbox" checked={!!s.minor2} onChange={() => toggle('minor2')} /> seconda minore <span className="small muted">𝔸ijhk = 𝔸ijkh</span>
          </label>
          <label className="p3-check">
            <input type="checkbox" checked={!!s.major} onChange={() => toggle('major')} /> maggiore <span className="small muted">𝔸ijhk = 𝔸hkij</span>
          </label>
        </div>
      </div>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${size + 4} ${size + 4}`} width="100%" style={{ maxWidth: 360 }} role="img" aria-label={`Griglia 9 per 9 delle componenti: ${count} distinte`}>
          {PAIRS.map(([a, b], k) => (
            <g key={k}>
              <text x={pad + k * cell + cell / 2} y={pad - 8} className="sym4-lab" textAnchor="middle">
                {a + 1}
                {b + 1}
              </text>
              <text x={pad - 6} y={pad + k * cell + cell / 2 + 4} className="sym4-lab" textAnchor="end">
                {a + 1}
                {b + 1}
              </text>
            </g>
          ))}
          {PAIRS.map(([i, j], r) =>
            PAIRS.map(([h, k], c) => {
              const id = cls[i4(i, j, h, k)];
              const on = hover === null || hover === id;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={pad + c * cell + 1}
                  y={pad + r * cell + 1}
                  width={cell - 2}
                  height={cell - 2}
                  rx={3}
                  fill={`hsl(${(id * 137.508) % 360} 62% 55%)`}
                  opacity={on ? 0.9 : 0.15}
                  onMouseEnter={() => setHover(id)}
                  onMouseLeave={() => setHover(null)}
                >
                  <title>{`𝔸${i + 1}${j + 1}${h + 1}${k + 1}`}</title>
                </rect>
              );
            }),
          )}
        </svg>
      </div>
      <p className="small muted">Righe: coppia (i j); colonne: coppia (h k). Passa sopra una casella: si accendono tutte le componenti che devono valere uguale.</p>
    </div>
  );
}
