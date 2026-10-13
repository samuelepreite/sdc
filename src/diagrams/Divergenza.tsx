/**
 * Teorema della divergenza (Teo 1.8.4) su un quadrato: campo vettoriale piano, divergenza punto per punto (sfondo),
 * flusso uscente lato per lato (contorno) e confronto tra flusso totale e integrale della divergenza.
 * Il campo non dipende da z e non ha componente z: sul cubo il flusso dalle facce z = cost. è nullo e il teorema
 * si riduce a quello sul quadrato (src/engine/campi.ts).
 */
import { useState } from 'react';
import { FIELD_PRESETS, divAt, divIntegral, fieldAt, fluxBySide, totalFlux } from '../engine/campi';
import { fmt } from '../engine/tensor';
import { Tex } from '../ui/components/Tex';

export function Divergenza({ params }: { params?: Record<string, number | string | boolean> }) {
  const [key, setKey] = useState<string>((params?.preset as string) ?? 'sorgente');
  const f = FIELD_PRESETS[key].f;
  const L = 1;
  const S = 260;
  const P = 34;
  const sc = S / L;
  const X = (x: number) => P + x * sc;
  const Y = (y: number) => P + S - y * sc;
  const n = 7;
  const pts = Array.from({ length: n }, (_, i) => (i + 0.5) / n);
  const maxU = Math.max(1e-9, ...pts.flatMap((x) => pts.map((y) => Math.hypot(...fieldAt(f, x, y)))));
  const maxDiv = Math.max(1e-9, ...pts.flatMap((x) => pts.map((y) => Math.abs(divAt(f, x, y)))));
  const side = fluxBySide(f, L);
  const sideCol = (v: number) => (v > 1e-9 ? 'var(--flux-out)' : v < -1e-9 ? 'var(--flux-in)' : 'var(--muted)');
  return (
    <div className="divlab card soft">
      <div className="chips" role="group" aria-label="Campo">
        {Object.entries(FIELD_PRESETS).map(([k, p]) => (
          <button key={k} className={`chip ${k === key ? 'on' : ''}`} onClick={() => setKey(k)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${S + 2 * P} ${S + 2 * P}`} width="100%" style={{ maxWidth: 380 }} role="img" aria-label="Campo vettoriale sul quadrato con il flusso uscente da ogni lato">
          <defs>
            <marker id="dv-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--ink)" />
            </marker>
          </defs>
          {pts.map((x) =>
            pts.map((y) => {
              const d = divAt(f, x, y) / maxDiv;
              return <rect key={`${x}-${y}`} x={X(x - 0.5 / n)} y={Y(y + 0.5 / n)} width={sc / n} height={sc / n} fill={d >= 0 ? 'var(--flux-out)' : 'var(--flux-in)'} opacity={Math.abs(d) * 0.28} />;
            }),
          )}
          <line x1={X(0)} y1={Y(0)} x2={X(L)} y2={Y(0)} stroke={sideCol(side.basso)} strokeWidth={5} />
          <line x1={X(L)} y1={Y(0)} x2={X(L)} y2={Y(L)} stroke={sideCol(side.destra)} strokeWidth={5} />
          <line x1={X(L)} y1={Y(L)} x2={X(0)} y2={Y(L)} stroke={sideCol(side.alto)} strokeWidth={5} />
          <line x1={X(0)} y1={Y(L)} x2={X(0)} y2={Y(0)} stroke={sideCol(side.sinistra)} strokeWidth={5} />
          {pts.map((x) =>
            pts.map((y) => {
              const [u, v] = fieldAt(f, x, y);
              const k = (0.42 / n / maxU) * sc;
              return <line key={`a${x}-${y}`} x1={X(x)} y1={Y(y)} x2={X(x) + u * k} y2={Y(y) - v * k} stroke="var(--ink)" strokeWidth={1.4} markerEnd="url(#dv-head)" />;
            }),
          )}
          <text x={X(L) + 6} y={Y(L / 2)} className="dv-lab">
            {fmt(side.destra, 3)}
          </text>
          <text x={X(L / 2)} y={Y(L) - 8} className="dv-lab" textAnchor="middle">
            {fmt(side.alto, 3)}
          </text>
          <text x={X(0) - 6} y={Y(L / 2)} className="dv-lab" textAnchor="end">
            {fmt(side.sinistra, 3)}
          </text>
          <text x={X(L / 2)} y={Y(0) + 18} className="dv-lab" textAnchor="middle">
            {fmt(side.basso, 3)}
          </text>
        </svg>
      </div>
      <table className="readout">
        <tbody>
          <tr>
            <td>
              <Tex tex="\oint_{\partial D}\vet u\cdot\hat n\,ds" /> (flusso uscente)
            </td>
            <td>{fmt(totalFlux(f, L), 5)}</td>
            <td>
              <Tex tex="\int_D\operatorname{div}\vet u\,dA" />
            </td>
            <td>{fmt(divIntegral(f, L), 5)}</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">
        Lati: <span className="sw-out" /> flusso uscente, <span className="sw-in" /> entrante (numeri = flusso del lato). Sfondo: divergenza nel punto. Lato del quadrato 1; il campo non dipende da z, quindi sulle facce z = cost. del cubo il flusso è nullo.
      </p>
    </div>
  );
}
