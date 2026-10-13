/**
 * Torsione (§5.8): scheda «flusso» con la funzione di Prandtl calcolata dal motore (∇²F = 2, F = 0 sul contorno):
 * linee di tensione (curve di livello di F, come le linee di flusso dell'analogia idrodinamica) e intensità di |τ_z|;
 * scheda «sottili» con il tubolare quadrato chiuso e tagliato (Bredt e rettangoli allungati). x verso sinistra, y in basso.
 */
import { useMemo, useState } from 'react';
import * as Tor from '../engine/torsione';
import { fmt } from '../engine/tensor';
import { C1, C3, Lbl, MUTED, OUT, Slider } from './svgkit';

function heat(t: number) {
  const c = Math.max(0, Math.min(1, t));
  const r = Math.round(248 - c * (248 - 220)),
    g = Math.round(250 - c * (250 - 38)),
    b = Math.round(252 - c * (252 - 38));
  return `rgb(${r},${g},${b})`;
}

export function Torsione({ params }: { params?: Record<string, number | string | boolean> }) {
  const [tab, setTab] = useState<'flusso' | 'sottili'>(params?.tab === 'sottili' ? 'sottili' : 'flusso');
  const [sec, setSec] = useState<string>(typeof params?.section === 'string' ? params.section : 'quadrato');
  const [t, setT] = useState<number>(2);
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Vista">
        <button className={`chip ${tab === 'flusso' ? 'on' : ''}`} onClick={() => setTab('flusso')}>
          linee di tensione
        </button>
        <button className={`chip ${tab === 'sottili' ? 'on' : ''}`} onClick={() => setTab('sottili')}>
          sottile chiusa e aperta
        </button>
      </div>
      {tab === 'flusso' ? <Flusso sec={sec} setSec={setSec} /> : <Sottili t={t} setT={setT} />}
    </div>
  );
}

function Flusso({ sec, setSec }: { sec: string; setSec: (s: string) => void }) {
  const s = Tor.SEZ_TORSIONE[sec];
  const g = useMemo(() => Tor.prandtl(s.poly, 56), [s]);
  const Mz = 100; // kN·cm → per mostrare MPa: τ in kN/cm² ×10
  const fmin = Math.min(...Array.from(g.F));
  const W = (g.nx - 1) * g.h,
    H = (g.ny - 1) * g.h;
  const k = Math.min(300 / W, 260 / H);
  const cx = 190,
    cy = 160;
  const xm = g.x0 + W / 2,
    ym = g.y0 + H / 2;
  const X = (x: number) => cx - (x - xm) * k;
  const Y = (y: number) => cy + (y - ym) * k;
  const taus: number[] = [];
  for (let j = 0; j < g.ny; j++)
    for (let i = 0; i < g.nx; i++) {
      const x = g.x0 + i * g.h,
        y = g.y0 + j * g.h;
      taus.push(g.mask[j * g.nx + i] ? Math.hypot(...Tor.tauAt(g, Mz, x, y)) : 0);
    }
  const tmaxGrid = Math.max(...taus);
  const tauMax = (Mz / g.I) * g.gmax;
  const levels = [0.15, 0.35, 0.55, 0.75, 0.92].map((f) => f * fmin);
  const segs = useMemo(() => levels.flatMap((c) => Tor.contours(g, c)), [g]); // eslint-disable-line react-hooks/exhaustive-deps
  let exact = '';
  if (sec === 'cerchio') exact = `esatto 2M_z/(πR³) = ${fmt(Tor.circle(12, Mz).tauMax * 10, 4)} MPa`;
  if (sec === 'quadrato') exact = `tabella M_z/(α a³), α = 0,208: ${fmt((Mz / (0.208 * 24 ** 3)) * 10, 4)} MPa`;
  if (sec === 'rettangolo') exact = `tabella M_z/(α b² h), α = 0,267: ${fmt((Mz / (0.267 * 12 ** 2 * 36)) * 10, 4)} MPa`;
  if (sec === 'triangolo') exact = `esatto 20 M_z/a³ = ${fmt(Tor.triangle(24, Mz).tauMax * 10, 4)} MPa`;
  return (
    <>
      <div className="chips" role="group" aria-label="Sezione">
        {Object.keys(Tor.SEZ_TORSIONE).map((q) => (
          <button key={q} className={`chip ${sec === q ? 'on' : ''}`} onClick={() => setSec(q)}>
            {Tor.SEZ_TORSIONE[q].label}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 330" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Linee di tensione nella torsione">
          {taus.map((v, idx) => {
            if (v <= 0) return null;
            const i = idx % g.nx,
              j = Math.floor(idx / g.nx);
            const x = g.x0 + i * g.h,
              y = g.y0 + j * g.h;
            return <rect key={idx} x={X(x) - (g.h * k) / 2} y={Y(y) - (g.h * k) / 2} width={g.h * k + 0.6} height={g.h * k + 0.6} fill={heat(v / tmaxGrid)} />;
          })}
          {segs.map(([a, b, c, d], i) => (
            <line key={i} x1={X(a)} y1={Y(b)} x2={X(c)} y2={Y(d)} stroke={C3} strokeWidth={1.3} />
          ))}
          <Outline g={g} X={X} Y={Y} />
          <circle cx={X(g.at[0])} cy={Y(g.at[1])} r={5} fill="none" stroke={OUT} strokeWidth={2.2} />
          <Lbl x={X(g.at[0]) + 8} y={Y(g.at[1]) - 6} color={OUT} size={12}>
            τ max
          </Lbl>
          <Lbl x={400} y={40} size={12} color={C3}>
            linee di tensione (F = cost)
          </Lbl>
          <Lbl x={400} y={58} size={12} color={C1}>
            colore: |τ_z|
          </Lbl>
          <Lbl x={400} y={76} size={12} color={MUTED}>
            x ← , y ↓
          </Lbl>
        </svg>
      </div>
      <table className="readout">
        <tbody>
          <tr>
            <td>∫(−2F) dA ; J₀ ; q = J₀/∫(−2F)</td>
            <td>
              {fmt(g.I, 5)} cm⁴ ; {fmt(g.J0, 5)} cm⁴ ; {fmt(g.q, 4)}
            </td>
          </tr>
          <tr>
            <td>τ_max (M_z = 1 kN·m, griglia {g.nx}×{g.ny})</td>
            <td>
              {fmt(tauMax * 10, 4)} MPa{exact ? ` — ${exact}` : ''}
            </td>
          </tr>
          <tr>
            <td>angolo unitario γ = q M_z/(G J₀)</td>
            <td>{((g.q * Mz) / (8077 * g.J0)).toExponential(3).replace('.', ',')} rad/cm (acciaio, G = 80 770 MPa, esempio)</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">{Tor.SEZ_TORSIONE[sec].note} F calcolata dal motore alle differenze finite: i valori sono approssimati di qualche per cento.</p>
    </>
  );
}

/** contorno della sezione negli assi principali (ricavato dalla maschera della griglia) */
function Outline({ g, X, Y }: { g: Tor.PrandtlGrid; X: (x: number) => number; Y: (y: number) => number }) {
  const segs = Tor.contours(g, -1e-9);
  return (
    <>
      {segs.map(([a, b, c, d], i) => (
        <line key={i} x1={X(a)} y1={Y(b)} x2={X(c)} y2={Y(d)} stroke="var(--ink, #1e293b)" strokeWidth={1.6} />
      ))}
    </>
  );
}

function Sottili({ t, setT }: { t: number; setT: (v: number) => void }) {
  const B = 100; // mm
  const Mz = 1; // kN·m
  const c = Tor.tubeCompare(B / 10, t / 10, Mz * 100); // cm, kN·cm
  const s = 2.2;
  const box = (x: number, cut: boolean) => (
    <g>
      <rect x={x} y={60} width={B * s * 0.5} height={B * s * 0.5} fill="none" stroke="var(--ink, #1e293b)" strokeWidth={Math.max(1.5, t)} />
      {cut && <rect x={x + B * s * 0.25 - 4} y={60 - 4} width={8} height={8 + Math.max(1.5, t)} fill="var(--card, #fff)" />}
    </g>
  );
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 230" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Sezione sottile chiusa e aperta">
          {box(60, false)}
          {box(320, true)}
          <Lbl x={115} y={200} anchor="middle">
            chiusa: τ costante nello spessore
          </Lbl>
          <Lbl x={375} y={200} anchor="middle">
            aperta (tagliata): τ lineare nello spessore
          </Lbl>
          <Lbl x={115} y={50} anchor="middle" color={C3} size={12}>
            Bredt: τ = M_z/(2Ωt)
          </Lbl>
          <Lbl x={375} y={50} anchor="middle" color={C1} size={12}>
            τ_max = 3M_z t/(t³·4(B−t))
          </Lbl>
        </svg>
      </div>
      <Slider id="tor-t" label="spessore t (B = 100 mm)" unit="mm" min={1} max={10} step={0.5} value={t} onChange={setT} />
      <table className="readout">
        <tbody>
          <tr>
            <td>chiusa (Bredt, Ω = (B−t)²)</td>
            <td>{fmt(c.closed * 10, 4)} MPa</td>
          </tr>
          <tr>
            <td>aperta (rettangolo allungato, §5.8.9)</td>
            <td>{fmt(c.open * 10, 4)} MPa</td>
          </tr>
          <tr>
            <td>rapporto aperta/chiusa</td>
            <td>
              motore {fmt(c.ratio, 4)} = 3(B−t)/(2t); dispensa (calcolo qualitativo) 3(B−t)/t = {fmt(c.dispensa, 4)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">M_z = 1 kN·m, valori di esempio. Il rapporto della dispensa (≈150 con t = 2 mm) viene da un confronto qualitativo; combinando le sue stesse formule globali il motore trova la metà (NF-14). Il messaggio non cambia: le sezioni chiuse resistono molto meglio a torsione.</p>
    </>
  );
}
