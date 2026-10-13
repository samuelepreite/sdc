/**
 * Caratteristiche della sollecitazione lungo il solido di Saint-Venant (Teo 5.2.3): assegnati i carichi sulla base di
 * destra, tagli, sforzo normale e torcente sono costanti e i flettenti al più lineari, M_x(z) = M_x − T_y(L − z).
 * Disegno di lato con z verso destra e y verso il basso; numeri da engine/sezioni.
 */
import { useState } from 'react';
import { cds } from '../engine/sezioni';
import { fmt } from '../engine/tensor';
import { Arrow, C1, C2, C3, Lbl, MUTED, OUT, Slider } from './svgkit';

export function Cds({ params }: { params?: Record<string, number | string | boolean> }) {
  const [Ty, setTy] = useState<number>(typeof params?.Ty === 'number' ? params.Ty : 20);
  const [N, setN] = useState<number>(typeof params?.N === 'number' ? params.N : 50);
  const [Mx, setMx] = useState<number>(typeof params?.Mx === 'number' ? params.Mx : 0);
  const L = 4; // m
  const b = { Tx: 0, Ty, N, Mx, My: 0, Mz: 0 };
  const x0 = 70,
    x1 = 470;
  const plots: { key: 'N' | 'Ty' | 'Mx'; label: string; unit: string; color: string; y: number }[] = [
    { key: 'N', label: 'N(z)', unit: 'kN', color: OUT, y: 150 },
    { key: 'Ty', label: 'T_y(z)', unit: 'kN', color: C2, y: 230 },
    { key: 'Mx', label: 'M_x(z)', unit: 'kN·m', color: C3, y: 320 },
  ];
  const val = (k: 'N' | 'Ty' | 'Mx', z: number) => cds(z, L, b)[k];
  const maxAbs = (k: 'N' | 'Ty' | 'Mx') => Math.max(1e-9, Math.abs(val(k, 0)), Math.abs(val(k, L)));
  return (
    <div className="card soft diagram">
      <div className="svg-scroll">
        <svg viewBox="0 0 560 370" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Caratteristiche della sollecitazione lungo il solido">
          <rect x={x0} y={50} width={x1 - x0} height={40} fill="rgba(100,116,139,0.16)" stroke="var(--ink, #1e293b)" />
          <Lbl x={x0 - 6} y={44} color={MUTED} size={12} anchor="end">
            z = 0
          </Lbl>
          <Lbl x={x1 + 4} y={44} color={MUTED} size={12}>
            z = L
          </Lbl>
          <Arrow x1={x0 - 50} y1={70} x2={x0 - 18} y2={70} color={MUTED} w={1.2} />
          <Lbl x={x0 - 22} y={64} size={12} color={MUTED} anchor="end">
            z
          </Lbl>
          {N !== 0 && <Arrow x1={x1} y1={70} x2={x1 + (N > 0 ? 40 : -40)} y2={70} color={OUT} w={2.4} />}
          {N !== 0 && <Arrow x1={x0} y1={70} x2={x0 - (N > 0 ? 40 : -40)} y2={70} color={OUT} w={2.4} />}
          {Ty !== 0 && <Arrow x1={x1 + 8} y1={70} x2={x1 + 8} y2={70 + (Ty > 0 ? 34 : -34)} color={C2} w={2.4} />}
          <Lbl x={x1 + 14} y={Ty >= 0 ? 104 : 40} size={12} color={C2}>
            T_y
          </Lbl>
          {plots.map((p) => {
            const s = 32 / maxAbs(p.key);
            const ys = (v: number) => p.y - v * s;
            return (
              <g key={p.key}>
                <line x1={x0} y1={p.y} x2={x1} y2={p.y} stroke={MUTED} />
                <polygon points={`${x0},${p.y} ${x0},${ys(val(p.key, 0))} ${x1},${ys(val(p.key, L))} ${x1},${p.y}`} fill={p.color} fillOpacity={0.15} stroke={p.color} />
                <Lbl x={20} y={p.y + 4} color={p.color} size={12}>
                  {p.label}
                </Lbl>
                <Lbl x={x0 + 4} y={ys(val(p.key, 0)) + (val(p.key, 0) >= 0 ? -4 : 14)} size={12} color={p.color}>
                  {fmt(val(p.key, 0), 3)}
                </Lbl>
                <Lbl x={x1 - 4} y={ys(val(p.key, L)) + (val(p.key, L) >= 0 ? -4 : 14)} size={12} color={p.color} anchor="end">
                  {fmt(val(p.key, L), 3)} {p.unit}
                </Lbl>
              </g>
            );
          })}
          <Lbl x={x0} y={360} size={12} color={MUTED}>
            positivi concordi agli assi sulla base di destra; asse dei diagrammi verso l’alto
          </Lbl>
        </svg>
      </div>
      <div className="p3-sliders">
        <Slider id="cds-N" label="N̂ sulla base di destra" unit="kN" min={-100} max={100} step={5} value={N} onChange={setN} />
        <Slider id="cds-Ty" label="T̂_y" unit="kN" min={-50} max={50} step={1} value={Ty} onChange={setTy} />
        <Slider id="cds-Mx" label="M̂_x" unit="kN·m" min={-100} max={100} step={5} value={Mx} onChange={setMx} />
      </div>
      <p className="small muted">
        Teo 5.2.3 con L = {L} m (valori di esempio): N e T<sub>y</sub> costanti, <span style={{ color: C1 }}>M<sub>x</sub>(z) = M̂<sub>x</sub> − T̂<sub>y</sub>(L − z)</span> lineare.
      </p>
    </div>
  );
}
