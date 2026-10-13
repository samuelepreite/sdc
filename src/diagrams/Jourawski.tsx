/**
 * Flessione composta (§5.7): formula di Jourawski sulla corda orizzontale a quota ȳ (area sottesa A_r, corda b_r,
 * momento statico S_x) con il diagramma di τ̄_zy lungo l'altezza, e regola delle tangenti per τ_zx agli estremi della
 * corda. Disegno come nella dispensa: x verso sinistra, y verso il basso. Numeri da engine/taglio.
 */
import { useMemo, useState } from 'react';
import * as J from '../engine/taglio';
import { fmt } from '../engine/tensor';
import { Arrow, C1, C2, C3, Lbl, MUTED, OUT, Slider, TAN } from './svgkit';

export function Jourawski({ params }: { params?: Record<string, number | string | boolean> }) {
  const [sec, setSec] = useState<string>(typeof params?.section === 'string' ? params.section : 'rettangolo');
  const [t, setT] = useState<number>(typeof params?.corda === 'number' ? params.corda : 0.5);
  const Ty = 100; // kN
  const d = useMemo(() => J.shearDiagram(sec, Ty, 160), [sec]);
  const { pr, y0, y1 } = d;
  const R = Math.max(...pr.poly.map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))));
  const k = 125 / R;
  const cx = 170,
    cy = 165;
  const X = (x: number) => cx - x * k;
  const Y = (y: number) => cy + y * k;
  const path = (p: [number, number][]) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ') + 'Z';
  const yb = y0 + (y1 - y0) * Math.min(0.995, Math.max(0.005, t));
  const ch = J.jourawski(pr.poly, Ty, yb, pr.Jx);
  const seg = J.chordSegments(pr.poly, yb);
  const below = J.clipBelow(pr.poly, yb);
  const tr = J.tangentRule(pr.poly, yb, ch.tau);
  const tmax = Math.max(...d.pts.map((p) => p.tau));
  const top = d.pts.reduce((a, b) => (b.tau > a.tau ? b : a));
  const DX = 400; // asse del diagramma
  const sx = (v: number) => DX + (v / tmax) * 120;
  const MPa = (v: number) => v * 10; // kN/cm² → MPa
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Sezione">
        {Object.keys(J.SEZ_TAGLIO).map((s) => (
          <button key={s} className={`chip ${sec === s ? 'on' : ''}`} onClick={() => setSec(s)}>
            {J.SEZ_TAGLIO[s].label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 580 330" width="100%" style={{ maxWidth: 620 }} role="img" aria-label="Formula di Jourawski">
          <path d={path(pr.poly)} fill="rgba(100,116,139,0.14)" stroke="var(--ink, #1e293b)" strokeWidth={1.6} />
          {below.length >= 3 && <path d={path(below)} fill="rgba(202,138,4,0.28)" stroke="none" />}
          <line x1={cx + 1.3 * R * k} y1={cy} x2={cx - 1.3 * R * k} y2={cy} stroke={MUTED} strokeDasharray="4 3" />
          <Lbl x={cx - 1.28 * R * k} y={cy - 8} color={MUTED}>
            x ≡ n
          </Lbl>
          <Arrow x1={cx} y1={cy - 1.2 * R * k} x2={cx} y2={cy + 1.25 * R * k} color={MUTED} w={1.2} />
          <Lbl x={cx + 6} y={cy + 1.25 * R * k} color={MUTED}>
            y
          </Lbl>
          {seg.map(([a, b], i) => (
            <line key={i} x1={X(a)} y1={Y(yb)} x2={X(b)} y2={Y(yb)} stroke={OUT} strokeWidth={3} />
          ))}
          <Lbl x={X(seg.length ? seg[0][0] : 0) + 8} y={Y(yb) - 6} color={OUT} size={12}>
            b_r
          </Lbl>
          <Lbl x={cx + 6} y={Math.min(Y(y1) - 6, Y(yb) + 22)} color={TAN} size={12}>
            A_r
          </Lbl>
          <Arrow x1={cx - 30} y1={cy + 0.9 * R * k} x2={cx - 30} y2={cy + 0.9 * R * k + 30} color={C2} w={2.4} />
          <Lbl x={cx - 36} y={cy + 0.9 * R * k + 26} color={C2} anchor="end" size={12}>
            T_y
          </Lbl>
          {tr && tr.tauB !== 0 && (
            <>
              {[1, -1].map((sg) => {
                const xe = sg * tr.xB;
                const tzx = tr.at(xe);
                const L = 34;
                const n = Math.hypot(tzx, ch.tau) || 1;
                return <Arrow key={sg} x1={X(xe)} y1={Y(yb)} x2={X(xe) - (tzx / n) * L} y2={Y(yb) + (ch.tau / n) * L} color={C1} w={2} />;
              })}
              <Lbl x={X(-tr.xB) + 10} y={Y(yb) + 30} color={C1} size={12}>
                τ_z tangente al bordo
              </Lbl>
            </>
          )}
          {/* diagramma di τ̄ lungo y */}
          <line x1={DX} y1={Y(y0) - 8} x2={DX} y2={Y(y1) + 8} stroke={MUTED} />
          <polyline points={d.pts.map((p) => `${sx(p.tau).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ')} fill="none" stroke={C3} strokeWidth={2} />
          <line x1={DX} y1={Y(yb)} x2={sx(ch.tau)} y2={Y(yb)} stroke={OUT} strokeWidth={2} />
          <circle cx={sx(top.tau)} cy={Y(top.y)} r={3.5} fill={C3} />
          <Lbl x={sx(top.tau) + 6} y={Y(top.y) + 4} size={12} color={C3}>
            max {fmt(MPa(top.tau), 3)} MPa
          </Lbl>
          <Lbl x={DX} y={Y(y0) - 14} size={12} color={MUTED}>
            τ̄_zy(y)
          </Lbl>
        </svg>
      </div>
      <Slider id="jw-corda" label="quota della corda (dal lembo superiore)" unit="" min={0} max={1} step={0.005} value={t} onChange={setT} />
      <table className="readout">
        <tbody>
          <tr>
            <td>ȳ ; b_r ; A_r</td>
            <td>
              {fmt(yb, 3)} cm ; {fmt(ch.b, 4)} cm ; {fmt(ch.Ar, 4)} cm²
            </td>
          </tr>
          <tr>
            <td>S_x = A_r·y_Gr ; J_x</td>
            <td>
              {fmt(ch.Sx, 4)} cm³ ; {fmt(pr.Jx, 5)} cm⁴
            </td>
          </tr>
          <tr>
            <td>τ̄_zy = T_y S_x/(J_x b_r)</td>
            <td>{fmt(MPa(ch.tau), 4)} MPa (T_y = 100 kN, esempio)</td>
          </tr>
          {tr && (
            <tr>
              <td>τ_zx agli estremi (regola delle tangenti)</td>
              <td>±{fmt(MPa(Math.abs(tr.tauB)), 4)} MPa</td>
            </tr>
          )}
          <tr>
            <td>massimo di τ̄ sulla corda baricentrica?</td>
            <td>{Math.abs(top.y) < (y1 - y0) * 0.02 ? 'sì: corda baricentrica massima, minima o stazionaria (Prop 5.7.3)' : `no: massimo a ȳ = ${fmt(top.y, 3)} cm`}</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">{J.SEZ_TAGLIO[sec].note} Area sottesa in giallo (la parte sotto la corda); τ̄ è la media sulla corda, rappresentativa se τ_zy varia poco lungo di essa.</p>
    </div>
  );
}
