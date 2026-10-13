/**
 * Interpretazione meccanica della compatibilità (§2.8, figura p. 29): il corpo diviso in tessere, ciascuna deformata in
 * modo omogeneo secondo E(X) nel suo centro (deformazione omogenea tangente). Campo compatibile: le tessere seguono lo
 * spostamento u e si ricompongono. Campo non compatibile: messe in fila una accanto all'altra, righe diverse hanno
 * lunghezze che nessun moto rigido riconcilia. Il residuo di Saint-Venant è calcolato dal motore (engine/deformazione).
 */
import { useState } from 'react';
import { COMPAT_FIELDS, saintVenantResidual } from '../engine/deformazione';
import { fmt } from '../engine/tensor';

type P = [number, number];
const N = 5;
const S = 1; // lato della tessera (adimensionale)

export function Compatibilita({ params }: { params?: Record<string, number | string | boolean> }) {
  const [which, setWhich] = useState<'compatibile' | 'incompatibile'>(params?.campo === 'incompatibile' ? 'incompatibile' : 'compatibile');
  const c = 0.12;
  const tiles: { pts: P[]; key: string }[] = [];
  const x0 = -N / 2;
  const y0 = -N / 2;
  if (which === 'compatibile') {
    const f = COMPAT_FIELDS.compatibile.u;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        const xc = x0 + (i + 0.5) * S;
        const yc = y0 + (j + 0.5) * S;
        const [ux, uy] = f(xc, yc, c);
        // gradiente di spostamento nel centro: H = [[c y, c x], [−c x, 0]] (deformazione omogenea tangente, eq. (2.1))
        const H = [c * yc, c * xc, -c * xc, 0];
        const corners: P[] = [
          [-0.5, -0.5],
          [0.5, -0.5],
          [0.5, 0.5],
          [-0.5, 0.5],
        ];
        tiles.push({ key: `${i}-${j}`, pts: corners.map(([a, b]) => [xc + ux + a * S + H[0] * a + H[1] * b, yc + uy + b * S + H[2] * a + H[3] * b]) });
      }
  } else {
    const E = COMPAT_FIELDS.incompatibile.E(c);
    for (let j = 0; j < N; j++) {
      let xl = x0;
      for (let i = 0; i < N; i++) {
        const yc = y0 + (j + 0.5) * S;
        const w = S * (1 + E(0, yc)[0]);
        tiles.push({ key: `${i}-${j}`, pts: [[xl, yc - 0.5], [xl + w, yc - 0.5], [xl + w, yc + 0.5], [xl, yc + 0.5]] });
        xl += w;
      }
    }
  }
  const field = which === 'compatibile' ? COMPAT_FIELDS.compatibile.E(c) : COMPAT_FIELDS.incompatibile.E(c);
  const res = saintVenantResidual(field, 0.3, 0.7);
  const sc = 46;
  const tx = (p: P) => `${(p[0] + 3.6) * sc},${(3.6 - p[1]) * sc}`;
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Campo di deformazione">
        {(['compatibile', 'incompatibile'] as const).map((k) => (
          <button key={k} className={`chip ${which === k ? 'on' : ''}`} onClick={() => setWhich(k)}>
            {COMPAT_FIELDS[k].label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${7.4 * sc} ${7.2 * sc}`} width="100%" style={{ maxWidth: 420 }} role="img" aria-label={`Tessere di un campo ${COMPAT_FIELDS[which].label}`}>
          {Array.from({ length: N + 1 }, (_, k) => (
            <g key={k} stroke="var(--muted, #94a3b8)" strokeDasharray="3 3" strokeWidth={1} opacity={0.5}>
              <line x1={(x0 + k + 3.6) * sc} y1={(3.6 - y0) * sc} x2={(x0 + k + 3.6) * sc} y2={(3.6 - y0 - N) * sc} />
              <line x1={(x0 + 3.6) * sc} y1={(3.6 - y0 - k) * sc} x2={(x0 + N + 3.6) * sc} y2={(3.6 - y0 - k) * sc} />
            </g>
          ))}
          {tiles.map((t) => (
            <polygon key={t.key} points={t.pts.map(tx).join(' ')} fill={which === 'compatibile' ? 'rgba(37,99,235,0.22)' : 'rgba(234,88,12,0.22)'} stroke={which === 'compatibile' ? '#1d4ed8' : '#c2410c'} strokeWidth={1.2} />
          ))}
        </svg>
      </div>
      <p className="small">
        {which === 'compatibile' ? (
          <>
            <b>Compatibile:</b> <i>E</i><sub>11</sub> = c·y viene dallo spostamento u = (c x y, −c x²/2). Ogni tessera si deforma e ruota come vuole il suo centro, e le tessere si richiudono senza vuoti né sovrapposizioni.
          </>
        ) : (
          <>
            <b>Non compatibile:</b> <i>E</i><sub>11</sub> = c·y² (le altre componenti nulle). Le tessere di una riga si mettono in fila, ma righe diverse si allungano di quantità che non variano linearmente con y: nessun moto rigido le fa combaciare.
          </>
        )}{' '}
        Residuo di Saint-Venant <span className="mono">∂²E₁₁/∂y² + ∂²E₂₂/∂x² − 2∂²E₁₂/∂x∂y</span> = <b>{fmt(Math.abs(res) < 1e-6 ? 0 : res, 3)}</b> (deve essere 0, eq. (2.3)). Spostamenti amplificati, c = {fmt(c, 2)}.
      </p>
    </div>
  );
}
