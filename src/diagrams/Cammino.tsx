/**
 * Lavoro di deformazione lungo cammini diversi (§4.9.1, Teo 4.9.2): nel piano di due stati di deformazione E_a, E_b si
 * va da O a E* per tre strade. Con un materiale iperelastico (𝔸 = 𝔸ᵀ) il lavoro è lo stesso e vale φ(E*) = ½𝔸E*·E*;
 * con un tensore che ha solo le simmetrie minori cambia, e sul giro chiuso non è nullo. Numeri da engine/elastico.
 */
import { useMemo, useState } from 'react';
import * as T from '../engine/tensor';
import { energy, pathWork, symmetrize4 } from '../engine/elastico';
import { fmt } from '../engine/tensor';
import { C1, C2, C3, Lbl, MUTED } from './svgkit';

const r = T.mulberry32(9);
const RAW = Array.from({ length: 81 }, () => 2 * r() - 1);
const EA: T.Mat = [1, 0.3, 0, 0.3, -0.4, 0.2, 0, 0.2, 0.5];
const EB: T.Mat = [-0.2, 0.6, 0.4, 0.6, 0.8, 0, 0.4, 0, -0.3];
const at = (p: [number, number]) => T.add(T.scale(EA, p[0]), T.scale(EB, p[1]));
const PATHS: { nome: string; color: string; f: (a: number) => [number, number] }[] = [
  { nome: 'retta', color: C3, f: (a) => [a, a] },
  { nome: 'prima E_a poi E_b', color: C2, f: (a) => (a < 0.5 ? [2 * a, 0] : [1, 2 * a - 1]) },
  { nome: 'arco', color: C1, f: (a) => [a * a, Math.sin((Math.PI * a) / 2)] },
];

export function Cammino() {
  const [iper, setIper] = useState(true);
  const A = useMemo(() => symmetrize4(RAW, iper), [iper]);
  const works = useMemo(() => PATHS.map((p) => pathWork(A, (a) => at(p.f(Math.min(1, Math.max(0, a)))), 200)), [A]);
  const loop = useMemo(() => pathWork(A, (a) => at([Math.sin(2 * Math.PI * a), 1 - Math.cos(2 * Math.PI * a)]), 300), [A]);
  const phi = energy(A, at([1, 1]));
  const S = 200;
  const X = (x: number) => 40 + x * S;
  const Y = (y: number) => 250 - y * S;
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Materiale">
        <button className={`chip ${iper ? 'on' : ''}`} onClick={() => setIper(true)}>
          iperelastico: 𝔸 = 𝔸ᵀ
        </button>
        <button className={`chip ${!iper ? 'on' : ''}`} onClick={() => setIper(false)}>
          solo simmetrie minori
        </button>
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 300 280" width="100%" style={{ maxWidth: 320 }} role="img" aria-label="Tre cammini di deformazione">
          <line x1={X(0)} y1={Y(0)} x2={X(1.2)} y2={Y(0)} stroke={MUTED} />
          <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(1.15)} stroke={MUTED} />
          <Lbl x={X(1.18)} y={Y(0) + 16} anchor="end" color={MUTED}>coefficiente di E_a</Lbl>
          <Lbl x={X(0) + 6} y={Y(1.12)} color={MUTED}>di E_b</Lbl>
          {PATHS.map((p) => {
            let d = '';
            for (let i = 0; i <= 60; i++) {
              const q = p.f(i / 60);
              d += `${i ? 'L' : 'M'}${X(q[0]).toFixed(1)},${Y(q[1]).toFixed(1)} `;
            }
            return <path key={p.nome} d={d} fill="none" stroke={p.color} strokeWidth={2.4} />;
          })}
          <circle cx={X(0)} cy={Y(0)} r={4} fill="var(--ink, #111)" />
          <Lbl x={X(0) - 6} y={Y(0) + 16} anchor="end">O</Lbl>
          <circle cx={X(1)} cy={Y(1)} r={4} fill="var(--ink, #111)" />
          <Lbl x={X(1) + 6} y={Y(1) - 6}>E*</Lbl>
        </svg>
      </div>
      <table className="readout">
        <tbody>
          {PATHS.map((p, i) => (
            <tr key={p.nome}>
              <td style={{ color: p.color }}>lavoro lungo «{p.nome}»</td>
              <td>{fmt(works[i], 4)}</td>
            </tr>
          ))}
          <tr>
            <td>½ 𝔸E*·E*</td>
            <td>{fmt(phi, 4)}</td>
          </tr>
          <tr>
            <td>lavoro su un giro chiuso</td>
            <td>{fmt(Math.abs(loop) < 1e-9 ? 0 : loop, 4)}</td>
          </tr>
        </tbody>
      </table>
      <p className="small">{iper ? 'Con la simmetria maggiore i tre lavori coincidono con φ(E*): la deformazione è un processo conservativo, e il giro chiuso restituisce tutto (Teo 4.9.2).' : 'Senza la simmetria maggiore il lavoro dipende dal cammino e un giro chiuso non dà zero: non esiste l’energia specifica φ.'} Tensore elastico casuale (adimensionale), stesso per i tre cammini.</p>
    </div>
  );
}
