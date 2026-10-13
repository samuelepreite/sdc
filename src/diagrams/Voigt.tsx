/**
 * Notazione di Voigt e classi di simmetria (§4.10–4.11): la matrice 6×6 del tensore elastico divisa nei blocchi NW, NE,
 * SW, SE. Per ogni classe le caselle con lo stesso colore sono la stessa costante; le caselle vuote sono nulle.
 * Il conteggio delle costanti (36/21, 12/9, 6/5, 2/2) è quello della tabella di p. 84.
 */
import { useState } from 'react';
import { MUTED } from './svgkit';

type Cls = 'anisotropo' | 'ortotropo' | 'trasversale' | 'isotropo';
const LAB = ['σ₁', 'σ₂', 'σ₃', 'τ₂₃', 'τ₃₁', 'τ₁₂'];
const LABE = ['ε₁', 'ε₂', 'ε₃', 'γ₂₃', 'γ₃₁', 'γ₁₂'];

/** etichetta di ogni casella (stessa etichetta = stessa costante; '' = zero) */
function cells(c: Cls, iper: boolean): string[][] {
  const M: string[][] = Array.from({ length: 6 }, () => Array(6).fill(''));
  const sym = (i: number, j: number) => (iper ? `C${Math.min(i, j) + 1}${Math.max(i, j) + 1}` : `C${i + 1}${j + 1}`);
  if (c === 'anisotropo') {
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) M[i][j] = sym(i, j);
  } else if (c === 'ortotropo') {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] = sym(i, j);
    for (let i = 3; i < 6; i++) M[i][i] = `C${i + 1}${i + 1}`;
  } else if (c === 'trasversale') {
    M[0][0] = M[1][1] = 'C11';
    M[0][1] = M[1][0] = 'C12';
    M[0][2] = M[1][2] = 'C13';
    M[2][0] = M[2][1] = iper ? 'C13' : 'C31';
    M[2][2] = 'C33';
    M[3][3] = M[4][4] = 'C44';
    M[5][5] = '(C11−C12)/2';
  } else {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] = i === j ? 'λ+2μ' : 'λ';
    for (let i = 3; i < 6; i++) M[i][i] = 'μ';
  }
  return M;
}
const COUNT: Record<Cls, [number, number]> = { anisotropo: [36, 21], ortotropo: [12, 9], trasversale: [6, 5], isotropo: [2, 2] };
const NOTE: Record<Cls, string> = {
  anisotropo: 'Nessuna simmetria materiale: ogni direzione è una storia a sé.',
  ortotropo: 'Riflessioni rispetto a tre piani ortogonali (CFRP 0/90, muratura), nel riferimento principale di ortotropia: NE e SW vuoti, SE diagonale.',
  trasversale: 'Rotazioni attorno all’asse ê₃ (legno, compositi unidirezionali): C₆₆ = (C₁₁ − C₁₂)/2 non è una costante nuova.',
  isotropo: 'Ogni ortogonale è di simmetria (acciaio): due costanti, λ e μ, in qualunque riferimento. Elastico e iperelastico coincidono.',
};

export function Voigt({ params }: { params?: Record<string, number | string | boolean> }) {
  const [c, setC] = useState<Cls>((['anisotropo', 'ortotropo', 'trasversale', 'isotropo'] as Cls[]).find((k) => k === params?.classe) ?? 'ortotropo');
  const [iper, setIper] = useState<boolean>(params?.iper !== false);
  const M = cells(c, iper);
  const names = [...new Set(M.flat().filter(Boolean))];
  const color = (s: string) => (s ? `hsl(${(names.indexOf(s) * 137.5) % 360} 60% ${55}%)` : 'transparent');
  const sz = 54;
  const pad = 46;
  return (
    <div className="card soft diagram">
      <div className="chips" role="group" aria-label="Classe di simmetria">
        {(['anisotropo', 'ortotropo', 'trasversale', 'isotropo'] as Cls[]).map((k) => (
          <button key={k} className={`chip ${c === k ? 'on' : ''}`} onClick={() => setC(k)}>
            {k === 'trasversale' ? 'trasv. isotropo' : k}
          </button>
        ))}
      </div>
      <label className="p3-check">
        <input type="checkbox" checked={iper} onChange={(e) => setIper(e.target.checked)} /> iperelastico (simmetria maggiore: [C] simmetrica)
      </label>
      <div className="svg-scroll">
        <svg viewBox={`0 0 ${pad + 6 * sz + 8} ${pad + 6 * sz + 8}`} width="100%" style={{ maxWidth: 400 }} role="img" aria-label={`Matrice di Voigt, classe ${c}`}>
          {LABE.map((l, j) => (
            <text key={l} x={pad + j * sz + sz / 2} y={pad - 12} textAnchor="middle" fontSize={13} fill={MUTED}>
              {l}
            </text>
          ))}
          {LAB.map((l, i) => (
            <text key={l} x={pad - 8} y={pad + i * sz + sz / 2 + 4} textAnchor="end" fontSize={13} fill={MUTED}>
              {l}
            </text>
          ))}
          {M.map((row, i) =>
            row.map((s, j) => (
              <g key={`${i}${j}`}>
                <rect x={pad + j * sz + 2} y={pad + i * sz + 2} width={sz - 4} height={sz - 4} rx={4} fill={color(s)} opacity={s ? 0.75 : 1} stroke={s ? 'none' : 'var(--line, #cbd5e1)'} strokeDasharray={s ? undefined : '3 3'} />
                {s && (
                  <text x={pad + j * sz + sz / 2} y={pad + i * sz + sz / 2 + 4} textAnchor="middle" fontSize={s.length > 6 ? 8 : 11} fill="#0f172a">
                    {s}
                  </text>
                )}
              </g>
            )),
          )}
          <line x1={pad + 3 * sz} y1={pad - 4} x2={pad + 3 * sz} y2={pad + 6 * sz + 4} stroke={MUTED} strokeWidth={2} />
          <line x1={pad - 4} y1={pad + 3 * sz} x2={pad + 6 * sz + 4} y2={pad + 3 * sz} stroke={MUTED} strokeWidth={2} />
        </svg>
      </div>
      <p className="small">
        <b>
          {COUNT[c][iper ? 1 : 0]} costanti {iper ? '(iperelastico)' : '(elastico)'}
        </b>{' '}
        — {NOTE[c]} Blocchi: NW σᵢ↔εₕ, NE σᵢ↔γₕₖ, SW τᵢⱼ↔εₕ, SE τᵢⱼ↔γₕₖ.
      </p>
    </div>
  );
}
