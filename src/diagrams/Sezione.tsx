/**
 * La sezione del solido di Saint-Venant (§5.5–5.6), disegnata come nella dispensa: x verso sinistra, y verso il basso
 * (figure di pp. 117 e 121). Schede: «ecdi» (assi principali centrali ed ellisse centrale d'inerzia, §5.5.1),
 * «deviata» (M, s, n, f, angoli e diagramma a farfalla di σ_z; teoremi della flessione, §5.5.5), «nocciolo»
 * (sforzo normale eccentrico, nocciolo, asse neutro antipolare, regola delle 3u; facoltativo, §5.6). Numeri da engine/sezioni.
 */
import { useMemo, useState } from 'react';
import * as S from '../engine/sezioni';
import { fmt } from '../engine/tensor';
import { Arrow, C1, C2, C3, Lbl, MUTED, OUT, Slider, TAN, Toggle } from './svgkit';

type Tab = 'ecdi' | 'deviata' | 'nocciolo';
const MAG = '#c026d3';

export function Sezione({ params }: { params?: Record<string, number | string | boolean> }) {
  const [tab, setTab] = useState<Tab>(params?.tab === 'deviata' || params?.tab === 'nocciolo' ? (params.tab as Tab) : 'ecdi');
  const [sec, setSec] = useState<string>(typeof params?.section === 'string' ? params.section : 'rettangolo');
  const [alpha, setAlpha] = useState<number>(typeof params?.alpha === 'number' ? params.alpha : 30);
  const [xc, setXc] = useState<number>(0);
  const [yc, setYc] = useState<number>(typeof params?.yc === 'number' ? params.yc : 10);
  const [noT, setNoT] = useState<boolean>(params?.nontrazione === true);
  const pr = useMemo(() => S.principal(S.SEZIONI[sec].poly), [sec]);
  const R = Math.max(...pr.poly.map(([x, y]) => Math.hypot(x, y)));
  const k = 120 / R;
  const cx = 170,
    cy = 160;
  const X = (x: number) => cx - x * k;
  const Y = (y: number) => cy + y * k;
  const path = (p: S.Poly) => p.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ') + 'Z';
  const axis = (th: number, len: number, color: string, label: string, dash = '6 4') => {
    const c = Math.cos(th),
      s = Math.sin(th);
    return (
      <g>
        <line x1={X(-len * c)} y1={Y(-len * s)} x2={X(len * c)} y2={Y(len * s)} stroke={color} strokeWidth={1.8} strokeDasharray={dash} />
        <Lbl x={X(len * 1.06 * c)} y={Y(len * 1.06 * s) + 4} color={color} anchor="middle">
          {label}
        </Lbl>
      </g>
    );
  };
  const rx = Math.sqrt(pr.rx2),
    ry = Math.sqrt(pr.ry2);
  const a = (alpha * Math.PI) / 180;
  const g = S.bendingAngles(a, pr.rx2, pr.ry2);
  const deg = (x: number) => `${fmt((x * 180) / Math.PI, 4)}°`;

  // deviata: diagramma di σ_z lungo f (M = 100 kN·m, MPa)
  const M = 10000;
  const ld = { N: 0, Mx: M * Math.cos(a), My: M * Math.sin(a) };
  const fs = pr.poly.map(([x, y]) => -x * Math.sin(g.beta) + y * Math.cos(g.beta));
  const [f0, f1] = [Math.min(...fs), Math.max(...fs)];
  const mono = (f: number) => (S.monomia(M, a, pr, 0, 0).Mn / S.monomia(M, a, pr, 0, 0).Jn) * f * 10;
  const smax = Math.max(Math.abs(mono(f0)), Math.abs(mono(f1)), 1e-9);

  // nocciolo
  const noc = useMemo(() => S.nocciolo(pr), [pr]);
  const c: S.Pt = [xc, yc];
  const inNoc = S.inside(noc, c);
  const inSec = S.inside(pr.poly, c);
  const isRect = sec === 'rettangolo' && Math.abs(xc) < 1e-9;
  const rect = S.SEZIONI.rettangolo.rect!;
  const tu = isRect ? S.treU(1, rect.B, rect.H, Math.abs(yc)) : null;

  const neutral = () => {
    // 1 + x xc/ρy² + y yc/ρx² = 0
    const A = xc / pr.ry2,
      B = yc / pr.rx2;
    if (Math.hypot(A, B) < 1e-9) return null;
    const p0: S.Pt = [-A / (A * A + B * B), -B / (A * A + B * B)];
    const d: S.Pt = [-B, A];
    const nd = Math.hypot(...d);
    const L = 2.5 * R;
    return <line x1={X(p0[0] - (d[0] / nd) * L)} y1={Y(p0[1] - (d[1] / nd) * L)} x2={X(p0[0] + (d[0] / nd) * L)} y2={Y(p0[1] + (d[1] / nd) * L)} stroke={C3} strokeWidth={2} strokeDasharray="6 4" />;
  };

  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Vista">
        {(
          [
            ['ecdi', 'assi ed ellisse d’inerzia'],
            ['deviata', 'flessione deviata'],
            ['nocciolo', 'nocciolo (facoltativo)'],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {l}
          </button>
        ))}
      </div>
      <div className="chips" role="group" aria-label="Sezione">
        {Object.keys(S.SEZIONI).map((s) => (
          <button key={s} className={`chip ${sec === s ? 'on' : ''}`} onClick={() => setSec(s)}>
            {S.SEZIONI[s].label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 330" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Sezione del solido di Saint-Venant">
          <path d={path(pr.poly)} fill="rgba(100,116,139,0.16)" stroke="var(--ink, #1e293b)" strokeWidth={1.6} />
          {tab === 'nocciolo' && noT && tu?.parzializzata && tu.reag > 0 && (
            <rect x={X(rect.B / 2)} y={yc > 0 ? Y(rect.H / 2 - tu.reag) : Y(-rect.H / 2)} width={rect.B * k} height={tu.reag * k} fill="rgba(37,99,235,0.22)" />
          )}
          {/* assi principali */}
          <Arrow x1={cx + 1.25 * R * k} y1={cy} x2={cx - 1.3 * R * k} y2={cy} color={MUTED} w={1.2} />
          <Lbl x={cx - 1.34 * R * k} y={cy - 6} color={MUTED} anchor="end">
            x
          </Lbl>
          <Arrow x1={cx} y1={cy - 1.25 * R * k} x2={cx} y2={cy + 1.28 * R * k} color={MUTED} w={1.2} />
          <Lbl x={cx + 6} y={cy + 1.28 * R * k} color={MUTED}>
            y
          </Lbl>
          <circle cx={cx} cy={cy} r={3} fill="var(--ink, #1e293b)" />
          <Lbl x={cx + 5} y={cy - 5} size={12}>
            G
          </Lbl>
          {tab !== 'nocciolo' && <ellipse cx={cx} cy={cy} rx={ry * k} ry={rx * k} fill="none" stroke={TAN} strokeWidth={1.8} />}
          {tab === 'ecdi' && (
            <>
              <Lbl x={cx - ry * k - 4} y={cy + 16} color={TAN} anchor="end" size={12}>
                ρ_y
              </Lbl>
              <Lbl x={cx + 6} y={cy + rx * k + 14} color={TAN} size={12}>
                ρ_x
              </Lbl>
            </>
          )}
          {tab === 'deviata' && (
            <>
              {axis(g.gamma, 1.2 * R, MAG, 's')}
              {axis(g.beta, 1.2 * R, C3, 'n')}
              {axis(g.theta, 1.05 * R, C2, 'f', '2 3')}
              <Arrow x1={cx} y1={cy} x2={X(0.75 * R * Math.cos(a))} y2={Y(0.75 * R * Math.sin(a))} color={OUT} w={2.6} />
              <Arrow x1={cx} y1={cy} x2={X(0.62 * R * Math.cos(a))} y2={Y(0.62 * R * Math.sin(a))} color={OUT} w={2.6} />
              <Lbl x={X(0.82 * R * Math.cos(a))} y={Y(0.82 * R * Math.sin(a))} color={OUT}>
                M
              </Lbl>
              {/* diagramma a farfalla lungo f */}
              <g>
                <line x1={430} y1={30} x2={430} y2={300} stroke={MUTED} />
                {(() => {
                  const fy = (f: number) => 165 + (f / Math.max(Math.abs(f0), Math.abs(f1))) * 120;
                  const sx = (s: number) => 430 + (s / smax) * 90;
                  return (
                    <>
                      <polygon points={`430,${fy(f0)} ${sx(mono(f0))},${fy(f0)} ${sx(mono(f1))},${fy(f1)} 430,${fy(f1)}`} fill="rgba(234,88,12,0.12)" stroke={OUT} />
                      <line x1={420} y1={fy(0)} x2={540} y2={fy(0)} stroke={C3} strokeDasharray="5 3" />
                      <Lbl x={545} y={fy(0) + 4} color={C3} size={12} anchor="end">
                        n
                      </Lbl>
                      <Lbl x={sx(mono(f1)) + (mono(f1) >= 0 ? 4 : -4)} y={fy(f1) + 14} size={12} anchor={mono(f1) >= 0 ? 'start' : 'end'} color={mono(f1) >= 0 ? C1 : C3}>
                        {fmt(mono(f1), 3)}
                      </Lbl>
                      <Lbl x={sx(mono(f0)) + (mono(f0) >= 0 ? 4 : -4)} y={fy(f0) - 6} size={12} anchor={mono(f0) >= 0 ? 'start' : 'end'} color={mono(f0) >= 0 ? C1 : C3}>
                        {fmt(mono(f0), 3)}
                      </Lbl>
                      <Lbl x={432} y={22} size={12} color={MUTED}>
                        σ_z lungo f (MPa)
                      </Lbl>
                    </>
                  );
                })()}
              </g>
            </>
          )}
          {tab === 'nocciolo' && (
            <>
              <path d={path(noc)} fill="rgba(202,138,4,0.22)" stroke={TAN} strokeWidth={1.6} />
              {neutral()}
              <circle cx={X(c[0])} cy={Y(c[1])} r={5} fill={OUT} />
              <Lbl x={X(c[0]) + 8} y={Y(c[1]) - 6} color={OUT}>
                c
              </Lbl>
              <Lbl x={340} y={40} size={12} color={TAN}>
                nocciolo centrale d’inerzia
              </Lbl>
              <Lbl x={340} y={58} size={12} color={C3}>
                asse neutro (antipolare di c)
              </Lbl>
            </>
          )}
        </svg>
      </div>
      {tab === 'deviata' && <Slider id="sz-alpha" label="α (inclinazione di M su x)" unit="°" min={-180} max={180} step={1} value={alpha} onChange={setAlpha} />}
      {tab === 'nocciolo' && (
        <div className="p3-sliders">
          <Slider id="sz-xc" label="x_c" unit="cm" min={-R} max={R} step={0.5} value={xc} onChange={setXc} />
          <Slider id="sz-yc" label="y_c" unit="cm" min={-R} max={R} step={0.5} value={yc} onChange={setYc} />
          {isRect && <Toggle checked={noT} onChange={setNoT}>materiale non reagente a trazione (compressione)</Toggle>}
        </div>
      )}
      <table className="readout">
        <tbody>
          <tr>
            <td>A ; J_x ; J_y</td>
            <td>
              {fmt(pr.A, 4)} cm² ; {fmt(pr.Jx, 5)} cm⁴ ; {fmt(pr.Jy, 5)} cm⁴
            </td>
          </tr>
          <tr>
            <td>ρ_x ; ρ_y (raggi d’inerzia)</td>
            <td>
              {fmt(rx, 4)} ; {fmt(ry, 4)} cm
            </td>
          </tr>
          {tab === 'deviata' && (
            <>
              <tr>
                <td>β (n) ; γ (s) ; θ (f) ; δ</td>
                <td>
                  {deg(g.beta)} ; {deg(g.gamma)} ; {deg(g.theta)} ; {deg(g.delta)}
                </td>
              </tr>
              <tr>
                <td>I teorema: tanβ·tanγ e −ρ_x²/ρ_y²</td>
                <td>{Math.abs(Math.sin(2 * a)) < 1e-9 ? 'flessione retta: n e s sono APCdI' : `${fmt(Math.tan(g.beta) * Math.tan(g.gamma), 5)} ; ${fmt(-pr.rx2 / pr.ry2, 5)}`}</td>
              </tr>
              <tr>
                <td>M_x ; M_y (|M| = 100 kN·m, esempio)</td>
                <td>
                  {fmt(ld.Mx / 100, 4)} ; {fmt(ld.My / 100, 4)} kN·m
                </td>
              </tr>
            </>
          )}
          {tab === 'nocciolo' && (
            <tr>
              <td>centro di sollecitazione c</td>
              <td>
                {!inSec
                  ? noT
                    ? 'fuori dalla sezione: equilibrio impossibile (ribaltamento)'
                    : 'fuori dalla sezione: diagramma a farfalla'
                  : inNoc
                    ? 'dentro il nocciolo: sezione tutta compressa (o tutta tesa)'
                    : noT && isRect
                      ? `fuori dal nocciolo: parzializzata, parte reagente 3u = ${fmt(tu!.reag, 3)} cm`
                      : 'fuori dal nocciolo: l’asse neutro taglia la sezione'}
              </td>
            </tr>
          )}
          {tab === 'nocciolo' && isRect && tu && (
            <tr>
              <td>rettangolo, N di compressione: σ_max / (N/A)</td>
              <td>{!noT ? `${fmt(1 + (6 * Math.abs(yc)) / rect.H, 4)} (trinomia: 1 + 6e/H)` : Number.isFinite(tu.sMax) ? `${fmt(tu.sMax * rect.B * rect.H, 4)}${tu.parzializzata ? ' (2N/(3uB))' : ''}` : '∞ (c sul contorno)'}</td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="small muted">{S.SEZIONI[sec].note} Disegno come nella dispensa: x verso sinistra, y verso il basso; l’ellisse riporta ρ_x lungo y e ρ_y lungo x.</p>
    </div>
  );
}
