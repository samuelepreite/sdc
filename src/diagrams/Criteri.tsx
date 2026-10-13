/**
 * Criteri di resistenza (Cap. 6). Schede: «verifica» (stato monoassiale: dominio di resistenza e di sicurezza,
 * §6.2), «piano» (domini dei criteri nel piano s3 = 0 con un punto di lavoro e le tensioni ideali, §6.4–6.5),
 * «mohr» (Mohr–Coulomb nel piano di Mohr con i tre cerchi e il cerchio massimo, §6.6). Numeri da engine/criteri.
 */
import { useState } from 'react';
import * as C from '../engine/criteri';
import { fmt } from '../engine/tensor';
import { C1, C2, C3, Lbl, MUTED, OUT, Slider, TAN } from './svgkit';

type Tab = 'verifica' | 'piano' | 'mohr';
const MAG = '#c026d3';

export function Criteri({ params }: { params?: Record<string, number | string | boolean> }) {
  const [tab, setTab] = useState<Tab>(params?.tab === 'piano' || params?.tab === 'mohr' ? (params.tab as Tab) : 'verifica');
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Vista">
        {(
          [
            ['verifica', 'verifica monoassiale'],
            ['piano', 'domini nel piano s₃ = 0'],
            ['mohr', 'Mohr–Coulomb'],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'verifica' && <Verifica />}
      {tab === 'piano' && <Piano />}
      {tab === 'mohr' && <Mohr />}
    </div>
  );
}

function Verifica() {
  const [mat, setMat] = useState<'acciaio' | 'calcestruzzo'>('acciaio');
  const [s, setS] = useState(150);
  const L = mat === 'acciaio' ? { t: 235, c: -235, nu: 1.75 } : { t: 3, c: -30, nu: 3 };
  const span = mat === 'acciaio' ? 300 : 40;
  const X = (v: number) => 280 + (v / span) * 240;
  const val = Math.max(-span, Math.min(span, s));
  const res = val >= L.c && val <= L.t;
  const sic = val >= L.c / L.nu && val <= L.t / L.nu;
  return (
    <>
      <div className="chips" role="group" aria-label="Materiale">
        {(['acciaio', 'calcestruzzo'] as const).map((m) => (
          <button key={m} className={`chip ${mat === m ? 'on' : ''}`} onClick={() => { setMat(m); setS(m === 'acciaio' ? 150 : -8); }}>
            {m}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 170" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Dominio di resistenza monoassiale">
          <line x1={30} y1={90} x2={530} y2={90} stroke={MUTED} />
          <rect x={X(L.c)} y={70} width={X(L.t) - X(L.c)} height={40} fill="rgba(37,99,235,0.12)" stroke={C3} />
          <rect x={X(L.c / L.nu)} y={78} width={X(L.t / L.nu) - X(L.c / L.nu)} height={24} fill="rgba(22,163,74,0.22)" stroke={C2} />
          <line x1={X(0)} y1={60} x2={X(0)} y2={120} stroke={MUTED} />
          <circle cx={X(val)} cy={90} r={6} fill={sic ? C2 : res ? TAN : C1} />
          <Lbl x={X(L.c)} y={132} anchor="middle" size={12} color={C3}>
            σ_L^c = {L.c}
          </Lbl>
          <Lbl x={X(L.t)} y={132} anchor="middle" size={12} color={C3}>
            σ_L^t = {L.t}
          </Lbl>
          <Lbl x={X(L.c / L.nu)} y={58} anchor="middle" size={12} color={C2}>
            σ_adm^c
          </Lbl>
          <Lbl x={X(L.t / L.nu)} y={58} anchor="middle" size={12} color={C2}>
            σ_adm^t
          </Lbl>
          <Lbl x={X(val)} y={152} anchor="middle" size={12} color={OUT}>
            σ_es = {fmt(val, 3)} MPa
          </Lbl>
        </svg>
      </div>
      <Slider id="cr-s" label="σ di esercizio" unit="MPa" min={-span} max={span} step={mat === 'acciaio' ? 1 : 0.1} value={s} onChange={setS} />
      <table className="readout">
        <tbody>
          <tr>
            <td>verifica di resistenza σ_L^c ≤ σ_es ≤ σ_L^t</td>
            <td>{res ? 'soddisfatta' : 'non soddisfatta'}</td>
          </tr>
          <tr>
            <td>verifica di sicurezza (ν = {fmt(L.nu, 3)})</td>
            <td>{sic ? 'soddisfatta' : 'non soddisfatta'}</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">Valori di esempio: acciaio duttile con σ_y = 235 MPa uguale in trazione e compressione; calcestruzzo fragile con resistenza a compressione dieci volte quella a trazione. Coefficienti di sicurezza indicativi della dispensa: {C.NU_SICUREZZA.map((r) => `${r.materiale} ${r.nu}`).join(', ')}.</p>
    </>
  );
}

function Piano() {
  const [s1, setS1] = useState(0.6);
  const [s2, setS2] = useState(-0.4);
  const nu = 0.3;
  const sL = 1;
  const k = 120;
  const cx = 200,
    cy = 165;
  const X = (a: number) => cx + a * k;
  const Y = (b: number) => cy - b * k;
  const ideal = (a: number, b: number) => {
    const s = C.sortS([a, b, 0]);
    const g = C.grashof(s, nu);
    return { galileo: Math.max(s[0], -s[2]), tresca: C.tresca(s), grashof: Math.max(g.t, -g.c), beltrami: C.beltrami(s, nu), vonMises: C.vonMises(s) };
  };
  const curves: { key: keyof ReturnType<typeof ideal>; label: string; color: string }[] = [
    { key: 'galileo', label: 'Galileo', color: MUTED },
    { key: 'tresca', label: 'Tresca', color: C1 },
    { key: 'vonMises', label: 'von Mises', color: C3 },
    { key: 'beltrami', label: 'Beltrami', color: C2 },
    { key: 'grashof', label: 'Grashof', color: MAG },
  ];
  const path = (key: keyof ReturnType<typeof ideal>) =>
    Array.from({ length: 361 }, (_, i) => {
      const th = (i * Math.PI) / 180;
      const d = ideal(Math.cos(th), Math.sin(th))[key];
      const r = sL / d;
      return `${i ? 'L' : 'M'}${X(r * Math.cos(th)).toFixed(1)},${Y(r * Math.sin(th)).toFixed(1)}`;
    }).join(' ');
  const id = ideal(s1, s2);
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 330" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Domini dei criteri nel piano">
          <line x1={X(-1.35)} y1={cy} x2={X(1.35)} y2={cy} stroke={MUTED} />
          <line x1={cx} y1={Y(-1.3)} x2={cx} y2={Y(1.3)} stroke={MUTED} />
          <line x1={X(-1.2)} y1={Y(-1.2)} x2={X(1.2)} y2={Y(1.2)} stroke={MUTED} strokeDasharray="3 3" />
          <Lbl x={X(1.36)} y={cy + 14} size={12} color={MUTED}>
            σ_a/σ_L
          </Lbl>
          <Lbl x={cx + 6} y={Y(1.3)} size={12} color={MUTED}>
            σ_b/σ_L
          </Lbl>
          {curves.map((c) => (
            <path key={c.key} d={path(c.key)} fill="none" stroke={c.color} strokeWidth={c.key === 'vonMises' || c.key === 'tresca' ? 2.2 : 1.6} />
          ))}
          <circle cx={X(s1)} cy={Y(s2)} r={6} fill={OUT} />
          {curves.map((c, i) => (
            <g key={c.key}>
              <line x1={420} y1={40 + i * 22} x2={444} y2={40 + i * 22} stroke={c.color} strokeWidth={2.4} />
              <Lbl x={450} y={44 + i * 22} size={12} color={c.color}>
                {c.label}
              </Lbl>
            </g>
          ))}
          <Lbl x={420} y={170} size={11} color={MUTED}>
            stato piano: terza principale 0
          </Lbl>
          <Lbl x={420} y={186} size={11} color={MUTED}>
            ν = 0,3; σ_L uguale t/c
          </Lbl>
        </svg>
      </div>
      <div className="p3-sliders">
        <Slider id="cr-s1" label="σ_a / σ_L" unit="" min={-1.3} max={1.3} step={0.01} value={s1} onChange={setS1} />
        <Slider id="cr-s2" label="σ_b / σ_L" unit="" min={-1.3} max={1.3} step={0.01} value={s2} onChange={setS2} />
      </div>
      <table className="readout">
        <tbody>
          {curves.map((c) => (
            <tr key={c.key}>
              <td style={{ color: c.color }}>σ_id {c.label}</td>
              <td>
                {fmt(id[c.key], 4)} σ_L {id[c.key] <= 1 ? '✓' : '✗ crisi'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">Ogni curva è il luogo σ_id = σ_L: dentro, nessuna crisi. Tresca (esagono) è inscritto in von Mises (ellisse). Grashof e Galileo sono disegnati con σ_L uguale in trazione e compressione per confrontarli; la dispensa li usa anche con resistenze diverse. Rappresentazione utile ma non indispensabile (§6.4.4).</p>
    </>
  );
}

function Mohr() {
  const [s1, setS1] = useState(1.2);
  const [s2, setS2] = useState(0.2);
  const [s3, setS3] = useState(-2.4);
  const [c, setC] = useState(1);
  const [phiDeg, setPhi] = useState(30);
  const phi = (phiDeg * Math.PI) / 180;
  const s = C.sortS([s1, s2, s3]);
  const mc = C.mohrCoulomb(s, c, phi);
  const k = 52;
  const cx = 330,
    cy = 165;
  const X = (sg: number) => cx + sg * k;
  const Y = (t: number) => cy - t * k; // τ positivo verso l'alto in questo schema
  const vert = c / Math.tan(phi);
  const lineEnd = -6;
  const circle = (a: number, b: number, col: string, w: number) => <circle cx={X((a + b) / 2)} cy={cy} r={(Math.abs(a - b) / 2) * k} fill="none" stroke={col} strokeWidth={w} />;
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox="0 0 560 330" width="100%" style={{ maxWidth: 600 }} role="img" aria-label="Criterio di Mohr–Coulomb">
          <line x1={20} y1={cy} x2={540} y2={cy} stroke={MUTED} />
          <line x1={X(0)} y1={20} x2={X(0)} y2={310} stroke={MUTED} />
          <Lbl x={540} y={cy + 16} size={12} color={MUTED} anchor="end">
            σ
          </Lbl>
          <Lbl x={X(0) + 6} y={28} size={12} color={MUTED}>
            τ
          </Lbl>
          <polygon points={`${X(vert)},${cy} ${X(lineEnd)},${Y(c - lineEnd * Math.tan(phi))} ${X(lineEnd)},${Y(-(c - lineEnd * Math.tan(phi)))}`} fill="rgba(37,99,235,0.10)" stroke="none" />
          <line x1={X(vert)} y1={cy} x2={X(lineEnd)} y2={Y(c - lineEnd * Math.tan(phi))} stroke={C3} strokeWidth={2} />
          <line x1={X(vert)} y1={cy} x2={X(lineEnd)} y2={Y(-(c - lineEnd * Math.tan(phi)))} stroke={C3} strokeWidth={2} />
          <circle cx={X(0)} cy={Y(c)} r={3} fill={C3} />
          <Lbl x={X(0) + 6} y={Y(c) - 6} size={12} color={C3}>
            c
          </Lbl>
          <Lbl x={X(vert) + 4} y={cy - 6} size={12} color={C3}>
            c/tanφ
          </Lbl>
          {circle(s[1], s[2], MUTED, 1.2)}
          {circle(s[0], s[1], MUTED, 1.2)}
          {circle(s[0], s[2], mc.ok ? C2 : C1, 2.4)}
          {s.map((v, i) => (
            <Lbl key={i} x={X(v)} y={cy + 16} size={11} anchor="middle" color={OUT}>
              s{i + 1}
            </Lbl>
          ))}
        </svg>
      </div>
      <div className="p3-sliders">
        <Slider id="mc-s1" label="σ_a" unit="" min={-4} max={2} step={0.05} value={s1} onChange={setS1} />
        <Slider id="mc-s2" label="σ_b" unit="" min={-4} max={2} step={0.05} value={s2} onChange={setS2} />
        <Slider id="mc-s3" label="σ_c" unit="" min={-4} max={2} step={0.05} value={s3} onChange={setS3} />
        <Slider id="mc-c" label="coesione c" unit="" min={0.2} max={2} step={0.05} value={c} onChange={setC} />
        <Slider id="mc-phi" label="angolo d’attrito φ" unit="°" min={5} max={50} step={1} value={phiDeg} onChange={setPhi} />
      </div>
      <table className="readout">
        <tbody>
          <tr>
            <td>F = max{'{'}|s_i − s_j| + (s_i + s_j) sin φ{'}'}</td>
            <td>
              {fmt(mc.F, 4)} {mc.ok ? '≤' : '>'} 2c cos φ = {fmt(mc.lim, 4)}
            </td>
          </tr>
          <tr>
            <td>cerchio massimo</td>
            <td>{mc.ok ? (C.mcMargin(s, c, phi) < 0.02 ? 'tangente: crisi imminente' : 'interno: nessuna crisi') : 'esce dal dominio: stato incompatibile'}</td>
          </tr>
        </tbody>
      </table>
      <p className="small muted">Valori adimensionali di esempio. Tutti gli stati del punto stanno nell’arbelo (i tre cerchi); il più gravoso è sul cerchio massimo, di diametro s₁ − s₃. In questo schema τ è disegnato verso l’alto.</p>
    </>
  );
}
