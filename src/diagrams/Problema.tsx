/**
 * Problema elastico (§4.16, figure di pp. 94–95): il corpo con la frontiera vincolata ∂B_v (spostamenti assegnati) e
 * libera ∂B_ℓ (forze ŝ), le forze di volume b; accanto l'analogia con la trave incastrata. Schema, nessun numero.
 */
import { useState } from 'react';
import { Arrow, C1, C3, Lbl, MUTED, OUT } from './svgkit';

export function Problema() {
  const [tipo, setTipo] = useState<'misto' | 'spostamenti' | 'forze'>('misto');
  const vinc = tipo !== 'forze';
  const libera = tipo !== 'spostamenti';
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Tipo di problema">
        {(
          [
            ['misto', 'misto'],
            ['spostamenti', 'negli spostamenti'],
            ['forze', 'nelle forze'],
          ] as const
        ).map(([k, l]) => (
          <button key={k} className={`chip ${tipo === k ? 'on' : ''}`} onClick={() => setTipo(k)}>
            {l}
          </button>
        ))}
      </div>
      <div className="svg-scroll">
        <svg viewBox="0 0 520 230" width="100%" style={{ maxWidth: 540 }} role="img" aria-label="Problema elastico">
          <path d="M60,170 C40,110 80,40 150,45 C220,50 250,30 290,70 C330,110 300,180 230,190 C170,198 90,200 60,170 Z" fill="rgba(37,99,235,0.1)" stroke={C3} strokeWidth={2} />
          {vinc && (
            <g>
              <path d="M60,170 C90,200 170,198 230,190" fill="none" stroke={C1} strokeWidth={5} />
              {[70, 100, 130, 160, 190, 220].map((x) => (
                <line key={x} x1={x} y1={196} x2={x - 10} y2={210} stroke={C1} strokeWidth={1.5} />
              ))}
              <Lbl x={150} y={224} anchor="middle" color={C1}>{tipo === 'spostamenti' ? '∂B_v ≡ ∂B: u = û' : '∂B_v: u = û'}</Lbl>
            </g>
          )}
          {libera &&
            [
              [150, 45, 0, -1],
              [255, 50, 0.6, -0.8],
              [305, 120, 1, 0],
            ].map(([x, y, dx, dy], i) => <Arrow key={i} x1={x + dx * 40} y1={y + dy * 40} x2={x} y2={y} color={OUT} />)}
          {libera && <Lbl x={320} y={60} color={OUT}>{tipo === 'forze' ? 'ŝ su tutto ∂B' : '∂B_ℓ: Tn̂ = ŝ'}</Lbl>}
          <Arrow x1={180} y1={100} x2={180} y2={135} color={MUTED} />
          <Lbl x={186} y={124} color={MUTED}>b</Lbl>
          <Lbl x={120} y={115} color={C3}>B</Lbl>
          {/* trave */}
          <line x1={370} y1={120} x2={500} y2={120} stroke={C3} strokeWidth={4} />
          <line x1={370} y1={95} x2={370} y2={145} stroke={C1} strokeWidth={4} />
          {[100, 112, 124, 136].map((y) => (
            <line key={y} x1={370} y1={y} x2={360} y2={y + 10} stroke={C1} strokeWidth={1.5} />
          ))}
          <Arrow x1={470} y1={120} x2={505} y2={120} color={OUT} />
          <Lbl x={372} y={160} color={C1} size={12}>A: w = 0</Lbl>
          <Lbl x={440} y={150} color={OUT} size={12}>B: N = F</Lbl>
          <Lbl x={372} y={190} color={MUTED} size={12}>ε = w′, N = EAε, N′ = −p</Lbl>
        </svg>
      </div>
      <p className="small">
        {tipo === 'misto' && 'Problema misto: una parte della frontiera è vincolata (spostamenti assegnati), il resto è libera (forze assegnate).'}
        {tipo === 'spostamenti' && 'Problema negli spostamenti: tutta la frontiera è vincolata (per esempio una trave a doppio incastro con un cedimento imposto).'}
        {tipo === 'forze' && 'Problema nelle forze: nessun vincolo, solo carichi (un aereo in volo). Lo spostamento si trova a meno di un moto rigido.'} A destra la trave dell’analogia (§4.16.2): A è la frontiera vincolata, B quella libera.
      </p>
    </div>
  );
}
