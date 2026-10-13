/**
 * Laboratorio delle matrici (§1.3, §1.6): A = sym A + skw A (Teo 1.3.3), traccia, prodotto scalare e ortogonalità
 * Sym ⊥ Skw (Prop 1.6.3). Lo studente cambia le componenti; tutti i numeri vengono da src/engine/tensor.ts.
 */
import { useState } from 'react';
import * as T from '../engine/tensor';
import { fmt } from '../engine/tensor';
import { Tex } from '../ui/components/Tex';

const START: T.Mat = [1.2, 0.5, -0.4, -0.3, 0.8, 1.0, 0.6, 0.2, -0.5];

function Grid({ A, title, edit, onEdit }: { A: T.Mat; title: string; edit?: boolean; onEdit?: (k: number, v: number) => void }) {
  const max = Math.max(1, ...A.map(Math.abs));
  return (
    <figure className="mgrid">
      <figcaption>
        <Tex tex={title} />
      </figcaption>
      <div className="mgrid-cells">
        {A.map((a, k) => {
          const diag = k % 4 === 0;
          const s = Math.min(1, Math.abs(a) / max);
          return (
            <div key={k} className={`mcell ${a > 1e-12 ? 'pos' : a < -1e-12 ? 'neg' : 'zero'} ${diag ? 'diag' : ''}`} style={{ ['--s' as string]: s }}>
              {edit ? (
                <input
                  id={`mat-${k}`}
                  aria-label={`A${Math.floor(k / 3) + 1}${(k % 3) + 1}`}
                  type="number"
                  step={0.1}
                  value={Number(a.toFixed(3))}
                  onChange={(e) => onEdit?.(k, Number(e.target.value) || 0)}
                />
              ) : (
                <span>{fmt(a, 3)}</span>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

export function MatrixLab({ params }: { params?: Record<string, number | string | boolean> }) {
  const [A, setA] = useState<T.Mat>(START);
  const focus = (params?.focus as string) ?? 'decomposizione';
  const E = T.sym(A);
  const W = T.skw(A);
  const edit = (k: number, v: number) => setA((M) => M.map((x, j) => (j === k ? v : x)));
  return (
    <div className="mlab card soft">
      <div className="mlab-row">
        <Grid A={A} title="[\tens A]" edit onEdit={edit} />
        <span className="mlab-op">=</span>
        <Grid A={E} title="\operatorname{sym}\tens A = \tfrac12(\tens A+\tens A^T)" />
        <span className="mlab-op">+</span>
        <Grid A={W} title="\operatorname{skw}\tens A = \tfrac12(\tens A-\tens A^T)" />
      </div>
      <div className="chips" role="group" aria-label="Esempi">
        <button className="chip" onClick={() => setA(START)}>
          generico
        </button>
        <button className="chip" onClick={() => setA([2, 0.7, 0, 0.7, 1, -0.3, 0, -0.3, 0.5])}>
          simmetrico
        </button>
        <button className="chip" onClick={() => setA(T.skewOf([0.4, -0.8, 1.1]))}>
          antisimmetrico
        </button>
        <button className="chip" onClick={() => setA(T.scale(T.I3, 1.5))}>
          sferico
        </button>
      </div>
      <table className="readout">
        <tbody>
          {focus === 'traccia' ? (
            <>
              <tr>
                <td>
                  <Tex tex="\operatorname{tr}\tens A = A_{11}+A_{22}+A_{33}" /> <span className="small muted">(Def 1.6.1)</span>
                </td>
                <td>{fmt(T.trace(A), 4)}</td>
                <td>
                  <Tex tex="\operatorname{tr}\tens W" />
                </td>
                <td>{fmt(T.trace(W), 4)}</td>
              </tr>
              <tr>
                <td>
                  <Tex tex="\tens E\cdot\tens W=\textstyle\sum_{ij}E_{ij}W_{ij}" /> <span className="small muted">(Prop 1.6.3)</span>
                </td>
                <td>{fmt(T.ddot(E, W), 4)}</td>
                <td>
                  <Tex tex="\|\tens A\|^2 = \|\tens E\|^2+\|\tens W\|^2" />
                </td>
                <td>
                  {fmt(T.ddot(A, A), 4)} = {fmt(T.ddot(E, E), 4)} + {fmt(T.ddot(W, W), 4)}
                </td>
              </tr>
            </>
          ) : (
            <>
              <tr>
                <td>componenti indipendenti</td>
                <td>9 = 6 + 3</td>
                <td>
                  diagonale di <Tex tex="\tens W" />
                </td>
                <td>
                  {fmt(W[0], 3)}, {fmt(W[4], 3)}, {fmt(W[8], 3)}
                </td>
              </tr>
              <tr>
                <td>
                  vettore assiale di <Tex tex="\tens W" /> <span className="small muted">(Teo 1.3.4)</span>
                </td>
                <td>
                  <Tex tex={`(${T.axialOf(W).map((x) => fmt(x, 3)).join(';\\ ')})`} />
                </td>
                <td>
                  <Tex tex="\tens E\cdot\tens W" />
                </td>
                <td>{fmt(T.ddot(E, W), 4)}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p className="small muted">Cambia le componenti di [A]: le due parti si aggiornano. Verde positivo, rosso negativo; più intenso = più grande.</p>
    </div>
  );
}
