/**
 * Prove di laboratorio e comportamenti (§4.4–4.7), modello V5: diagramma F–ΔL dell'acciaio con i suoi tratti, scarico
 * elastico e deformazione residua; calcestruzzo a controllo di carico e di deformazione (softening); curve qualitative
 * di creep e rilassamento. Le curve sono forme qualitative fatte dal motore (engine/elastico): nessun valore numerico reale.
 */
import { useState } from 'react';
import { concreteCurve, steelCurve } from '../engine/elastico';
import { Arrow, C1, C2, C3, Lbl, MUTED, OUT, Slider, TAN, Toggle } from './svgkit';

type Tab = 'acciaio' | 'calcestruzzo' | 'tempo';
const W = 520;
const H = 300;

function path(f: (x: number) => number, x0: number, x1: number, X: (x: number) => number, Y: (y: number) => number, n = 300) {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    const y = f(x);
    if (!Number.isFinite(y)) break;
    d += `${d ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)} `;
  }
  return d;
}

export function Prove({ params }: { params?: Record<string, number | string | boolean> }) {
  const [tab, setTab] = useState<Tab>(params?.tab === 'calcestruzzo' ? 'calcestruzzo' : params?.tab === 'tempo' ? 'tempo' : 'acciaio');
  const [unload, setUnload] = useState<number>(typeof params?.scarico === 'number' ? params.scarico : 8);
  const [reale, setReale] = useState<boolean>(!!params?.reale);
  const [ctrlDef, setCtrlDef] = useState<boolean>(params?.controllo !== 'carico');
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Prova">
        {(
          [
            ['acciaio', 'trazione sull’acciaio'],
            ['calcestruzzo', 'compressione sul calcestruzzo'],
            ['tempo', 'creep e rilassamento'],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button key={k} className={`chip ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'acciaio' && <Steel unload={unload} reale={reale} />}
      {tab === 'calcestruzzo' && <Concrete ctrlDef={ctrlDef} />}
      {tab === 'tempo' && <Time />}
      {tab === 'acciaio' && (
        <>
          <Slider id="prova-scarico" label="punto da cui si scarica (ΔL)" min={0.5} max={17} step={0.5} value={unload} onChange={setUnload} />
          <Toggle checked={reale} onChange={setReale}>
            curva «reale» σ = F/A (sezione che si restringe): hardening
          </Toggle>
        </>
      )}
      {tab === 'calcestruzzo' && (
        <Toggle checked={ctrlDef} onChange={setCtrlDef}>
          prova a controllo di deformazione (torchio a vite)
        </Toggle>
      )}
    </div>
  );
}

function Steel({ unload, reale }: { unload: number; reale: boolean }) {
  const X = (x: number) => 50 + x * 25;
  const Y = (y: number) => H - 40 - y * 140;
  const Fu = steelCurve(unload);
  const res = Math.max(0, unload - Fu); // scarico con la pendenza del tratto elastico (= 1)
  const plastic = res > 0.02;
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Diagramma carico–allungamento dell'acciaio">
          <Arrow x1={40} y1={H - 40} x2={W - 10} y2={H - 40} color={MUTED} w={1.2} />
          <Arrow x1={50} y1={H - 30} x2={50} y2={14} color={MUTED} w={1.2} />
          <Lbl x={W - 14} y={H - 46} anchor="end" color={MUTED}>ΔL</Lbl>
          <Lbl x={56} y={22} color={MUTED}>F</Lbl>
          {[
            [0.5, 'elastico'],
            [2.5, 'snervamento'],
            [9, 'incrudimento'],
            [16, 'strizione'],
          ].map(([x, l]) => (
            <Lbl key={l as string} x={X(x as number)} y={H - 18} anchor="middle" color={MUTED} size={12}>
              {l as string}
            </Lbl>
          ))}
          <path d={path(steelCurve, 0, 18, X, Y)} fill="none" stroke={C3} strokeWidth={2.2} />
          {reale && <path d={path((x) => steelCurve(Math.min(x, 14)) * (1 + 0.035 * x) + (x > 14 ? (x - 14) * 0.06 : 0), 0, 18, X, Y)} fill="none" stroke={OUT} strokeWidth={1.8} strokeDasharray="6 4" />}
          {[
            [1, 1, 'Fp'],
            [1.15, 1.09, 'Fy'],
            [14, 1.54, 'Ft'],
          ].map(([x, y, l]) => (
            <g key={l as string}>
              <circle cx={X(x as number)} cy={Y(y as number)} r={3.5} fill={C1} />
              <Lbl x={X(x as number) + 4} y={Y(y as number) - 6} color={C1} size={12}>
                {l as string}
              </Lbl>
            </g>
          ))}
          <line x1={X(unload)} y1={Y(Fu)} x2={X(res)} y2={Y(0)} stroke={C2} strokeWidth={2} strokeDasharray="5 3" />
          <circle cx={X(unload)} cy={Y(Fu)} r={5} fill={C2} />
          {plastic && <Lbl x={X(res)} y={Y(0) - 8} anchor="middle" color={C2} size={12}>ΔL residuo</Lbl>}
        </svg>
      </div>
      <p className="small">
        {plastic ? (
          <>Scarico dal punto verde: la curva scende parallela al tratto elastico e resta un <b>allungamento residuo</b> (comportamento plastico). Ricaricando, il materiale snerva di nuovo solo al carico massimo già raggiunto.</>
        ) : (
          <>Scarico dal tratto elastico: la curva di scarico si sovrappone a quella di carico e la deformazione si recupera tutta.</>
        )}{' '}
        {reale && 'Tratteggio arancio: con la sezione reale A < A₀ la tensione cresce sempre (hardening); la norma usa F/A₀ per avere parametri confrontabili tra laboratori.'}
      </p>
      <p className="small muted">Forma qualitativa: le proporzioni tra i tratti non sono quelle di un acciaio reale (lo snervamento e l’incrudimento sono molto più lunghi del tratto elastico).</p>
    </>
  );
}

function Concrete({ ctrlDef }: { ctrlDef: boolean }) {
  const X = (x: number) => 50 + x * 120;
  const Y = (y: number) => H - 40 - y * 200;
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Calcestruzzo in compressione">
          <Arrow x1={40} y1={H - 40} x2={W - 10} y2={H - 40} color={MUTED} w={1.2} />
          <Arrow x1={50} y1={H - 30} x2={50} y2={14} color={MUTED} w={1.2} />
          <Lbl x={W - 14} y={H - 46} anchor="end" color={MUTED}>|ε|</Lbl>
          <Lbl x={56} y={22} color={MUTED}>|σ|</Lbl>
          <path d={path((x) => concreteCurve(x, ctrlDef), 0, 3.6, X, Y)} fill="none" stroke={ctrlDef ? C3 : C1} strokeWidth={2.2} />
          {!ctrlDef && (
            <g>
              <Lbl x={X(2) + 8} y={Y(1) - 6} color={C1}>× rottura precipitosa</Lbl>
            </g>
          )}
          {ctrlDef && <Lbl x={X(2.9)} y={Y(0.75) - 10} color={C3}>softening</Lbl>}
          <circle cx={X(2)} cy={Y(1)} r={4} fill={TAN} />
          <Lbl x={X(2)} y={Y(1) - 14} anchor="middle" color={TAN} size={12}>picco</Lbl>
        </svg>
      </div>
      <p className="small">
        {ctrlDef
          ? 'A deformazione controllata, oltre il picco il materiale continua a deformarsi cedendo carico (softening). In una struttura il carico ceduto passa ai punti vicini, che a loro volta entrano in crisi: rottura fragile, senza segnali premonitori.'
          : 'A carico controllato (acqua versata in un contenitore, macchina idraulica) al picco il materiale non riesce più a equilibrare la forza: l’energia fornita diventa cinetica e il provino esplode.'}
      </p>
    </>
  );
}

function Time() {
  const w = 240;
  const h = 130;
  const box = (ox: number, oy: number, title: string, f: (t: number) => number, color: string, ylab: string) => {
    const X = (t: number) => ox + 20 + t * (w - 40);
    const Y = (y: number) => oy + h - 20 - y * (h - 40);
    let d = '';
    for (let i = 0; i <= 100; i++) d += `${i ? 'L' : 'M'}${X(i / 100).toFixed(1)},${Y(f(i / 100)).toFixed(1)} `;
    return (
      <g>
        <line x1={ox + 20} y1={oy + h - 20} x2={ox + w - 10} y2={oy + h - 20} stroke={MUTED} />
        <line x1={ox + 20} y1={oy + h - 20} x2={ox + 20} y2={oy + 14} stroke={MUTED} />
        <Lbl x={ox + w - 12} y={oy + h - 6} anchor="end" color={MUTED} size={11}>t</Lbl>
        <Lbl x={ox + 24} y={oy + 14} color={MUTED} size={11}>{ylab}</Lbl>
        <Lbl x={ox + w / 2} y={oy + 4} anchor="middle" size={12}>{title}</Lbl>
        <path d={d} fill="none" stroke={color} strokeWidth={2} />
      </g>
    );
  };
  return (
    <>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${2 * w + 20} ${2 * h + 20}`} width="100%" style={{ maxWidth: 560 }} role="img" aria-label="Creep e rilassamento">
          {box(0, 10, 'forza imposta…', (t) => (t > 0.05 ? 0.8 : 0), C3, 'F')}
          {box(w + 20, 10, '…deformazione che cresce: creep', (t) => (t > 0.05 ? 0.35 + 0.55 * (1 - Math.exp(-(t - 0.05) * 4)) : 0), OUT, 'ΔL')}
          {box(0, h + 20, 'deformazione imposta…', (t) => (t > 0.05 ? 0.8 : 0), C3, 'ΔL')}
          {box(w + 20, h + 20, '…forza che cala: rilassamento', (t) => (t > 0.05 ? 0.3 + 0.55 * Math.exp(-(t - 0.05) * 4) : 0), OUT, 'F')}
        </svg>
      </div>
      <p className="small">Comportamento viscoso (§4.4.2): a forza imposta si osserva il creep (il cavo polimerico che si allunga), a deformazione imposta il rilassamento (le corde della chitarra che si scordano). Entrambi vengono dalla dissipazione interna. Curve qualitative.</p>
    </>
  );
}
